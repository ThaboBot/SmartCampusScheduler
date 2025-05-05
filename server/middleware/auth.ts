import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

// JWT Secret should be in environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN format

  // Check if token exists in header or in cookie
  if (!token) {
    // Try to get token from cookie as fallback
    const tokenFromCookie = req.cookies?.token;
    
    if (!tokenFromCookie) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
    
    // Check if user exists in database
    const user = await storage.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token. User not found." });
    }
    
    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error("JWT validation error:", error);
    return res.status(401).json({ message: "Invalid token." });
  }
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin role required." });
  }
  
  next();
};

/**
 * Middleware to check if user is authenticated
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  next();
};

/**
 * Middleware to check if user is lecturer
 */
export const isLecturer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user.role !== "lecturer" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Lecturer role required." });
  }
  
  next();
};

/**
 * Middleware to check if user is student
 */
export const isStudent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Access denied. Student role required." });
  }
  
  next();
};
