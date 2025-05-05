import { Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertVenueSchema } from "@shared/schema";

export async function getAllVenues(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get all active venues
    const venues = await storage.getActiveVenues();
    
    // Get unique buildings
    const buildings = await storage.getVenueBuildings();
    
    res.json({
      user,
      venues,
      buildings
    });
  } catch (error) {
    console.error("Error fetching venues:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAdminVenues(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get all venues (including inactive)
    const venues = await storage.getAllVenues();
    
    // Get unique buildings
    const buildings = await storage.getVenueBuildings();
    
    res.json({
      user,
      venues,
      buildings
    });
  } catch (error) {
    console.error("Error fetching admin venues:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createVenue(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Validate request body
    const validatedData = insertVenueSchema.parse(req.body);
    
    // Check if venue with same name already exists
    const venues = await storage.getAllVenues();
    const existingVenue = venues.find(v => v.name.toLowerCase() === validatedData.name.toLowerCase());
    
    if (existingVenue) {
      return res.status(400).json({ message: "Venue with this name already exists" });
    }
    
    // Create new venue
    const venue = await storage.createVenue(validatedData);
    
    res.status(201).json({ 
      message: "Venue created successfully",
      venue 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    
    console.error("Venue creation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateVenue(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const venueId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (isNaN(venueId)) {
      return res.status(400).json({ message: "Invalid venue ID" });
    }
    
    // Check if venue exists
    const existingVenue = await storage.getVenueById(venueId);
    if (!existingVenue) {
      return res.status(404).json({ message: "Venue not found" });
    }
    
    // Validate request body
    // Allow partial updates
    const validatedData = req.body;
    
    // If name is being changed, check if it's unique
    if (validatedData.name && validatedData.name !== existingVenue.name) {
      const venues = await storage.getAllVenues();
      const venueWithSameName = venues.find(v => 
        v.id !== venueId && v.name.toLowerCase() === validatedData.name.toLowerCase()
      );
      
      if (venueWithSameName) {
        return res.status(400).json({ message: "Venue with this name already exists" });
      }
    }
    
    // Update venue
    const updatedVenue = await storage.updateVenue(venueId, validatedData);
    
    res.json({ 
      message: "Venue updated successfully",
      venue: updatedVenue 
    });
  } catch (error) {
    console.error("Venue update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteVenue(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const venueId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (isNaN(venueId)) {
      return res.status(400).json({ message: "Invalid venue ID" });
    }
    
    // Check if venue exists
    const existingVenue = await storage.getVenueById(venueId);
    if (!existingVenue) {
      return res.status(404).json({ message: "Venue not found" });
    }
    
    // Delete venue
    await storage.deleteVenue(venueId);
    
    res.json({ 
      message: "Venue deleted successfully" 
    });
  } catch (error) {
    console.error("Venue deletion error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
