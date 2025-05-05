import { Request, Response } from "express";
import { storage } from "../storage";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { loginSchema, insertUserSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // In production, use environment variable

export async function register(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = insertUserSchema.parse(req.body);
    
    // Check if user with email already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    // Create new user
    const user = await storage.createUser(validatedData);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.status(201).json({ 
      message: "User registered successfully",
      user: userWithoutPassword 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    
    // Authenticate user
    const user = await storage.validateUserPassword(validatedData.email, validatedData.password);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Check if role matches
    if (user.role !== validatedData.role) {
      return res.status(401).json({ message: `You are not registered as a ${validatedData.role}` });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.json({ 
      message: "Login successful",
      user: userWithoutPassword,
      token 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export function logout(req: Request, res: Response) {
  // For JWT tokens, we don't need to do anything special on server-side
  // The client just needs to remove the token
  res.json({ message: "Logged out successfully" });
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
