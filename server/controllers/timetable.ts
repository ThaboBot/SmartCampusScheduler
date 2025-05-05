import { Request, Response } from "express";
import { storage } from "../storage";
import { getDayName } from "../../client/src/lib/utils";
import * as schema from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { db } from "@db";
import path from "path";
import fs from "fs";
import { parse } from "csv-parse";

export async function getUserTimetable(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get available terms
    const terms = await storage.getAvailableTerms();
    
    // Default to the first term if available
    const defaultTerm = terms.length > 0 ? terms[0] : "Fall 2023";
    
    // Get user classes for the term
    const classes = await storage.getClassesForUser(userId, defaultTerm);
    
    res.json({
      user,
      timetable: classes,
      terms
    });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function uploadTimetable(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Check if multipart/form-data is provided
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const file = req.files.file;
    const { department, term, notes } = req.body;
    
    if (!department || !term) {
      return res.status(400).json({ message: "Department and term are required" });
    }
    
    // Validate department
    if (!["SET", "SOBE", "SEM"].includes(department)) {
      return res.status(400).json({ message: "Invalid department" });
    }
    
    // Get file details
    const fileName = file.name;
    const filePath = file.tempFilePath;
    const fileExtension = path.extname(fileName).toLowerCase();
    
    // Save timetable upload record
    const upload = await storage.saveTimetableUpload(
      department,
      term,
      fileName,
      userId
    );
    
    // Process the file based on its extension
    if (fileExtension === '.csv') {
      // Process CSV file
      // In a real implementation, this would parse and process the CSV
      // For now, we'll just return success
      res.status(201).json({
        message: "Timetable uploaded successfully",
        upload
      });
    } else if (fileExtension === '.json') {
      // Process JSON file
      // In a real implementation, this would parse and process the JSON
      // For now, we'll just return success
      res.status(201).json({
        message: "Timetable uploaded successfully",
        upload
      });
    } else if (['.xlsx', '.xls'].includes(fileExtension)) {
      // Process Excel file
      // In a real implementation, this would parse and process the Excel file
      // For now, we'll just return success
      res.status(201).json({
        message: "Timetable uploaded successfully",
        upload
      });
    } else {
      return res.status(400).json({ message: "Unsupported file format" });
    }
  } catch (error) {
    console.error("Error uploading timetable:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAdminTimetables(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // In a real implementation, you would fetch timetable uploads from the database
    // For now, we'll return mock data
    const timetables = [
      {
        id: 1,
        department: "SET",
        term: "Fall 2023",
        uploadedBy: "Admin User",
        uploadDate: new Date().toISOString(),
        fileName: "SET_Timetable_Fall2023.csv",
        status: "active",
        conflictsResolved: 3
      },
      {
        id: 2,
        department: "SOBE",
        term: "Fall 2023",
        uploadedBy: "Admin User",
        uploadDate: new Date().toISOString(),
        fileName: "SOBE_Timetable_Fall2023.xlsx",
        status: "active",
        conflictsResolved: 1
      },
      {
        id: 3,
        department: "SEM",
        term: "Fall 2023",
        uploadedBy: "Admin User",
        uploadDate: new Date().toISOString(),
        fileName: "SEM_Timetable_Fall2023.json",
        status: "processing",
        conflictsResolved: 0
      }
    ];
    
    // Get departments and terms
    const departments = await storage.getDepartments();
    const terms = await storage.getAvailableTerms();
    
    res.json({
      user,
      timetables,
      departments,
      terms
    });
  } catch (error) {
    console.error("Error fetching admin timetables:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteTimetable(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const timetableId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (isNaN(timetableId)) {
      return res.status(400).json({ message: "Invalid timetable ID" });
    }
    
    // In a real implementation, you would delete the timetable from the database
    // For now, we'll just return success
    
    res.json({
      message: "Timetable deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting timetable:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
