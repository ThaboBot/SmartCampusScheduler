import { Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertCheckInSchema } from "@shared/schema";

export async function checkInToClass(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { classId, date } = req.body;
    
    if (!classId || !date) {
      return res.status(400).json({ message: "Class ID and date are required" });
    }
    
    // Check if user exists
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if class exists
    const cls = await storage.getClassById(classId);
    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }
    
    // Check if venue is valid
    const venue = await storage.getVenueById(cls.venueId);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }
    
    // Check if there's a venue change for this class and date
    const venueChange = await storage.getPendingVenueChangeForClass(classId, date);
    const actualVenueId = venueChange?.status === "accepted" ? venueChange.newVenueId : cls.venueId;
    
    // Check if user has already checked in
    const checkIns = await storage.getCheckInsForUser(userId);
    const alreadyCheckedIn = checkIns.some(c => 
      c.classId === classId && c.date === date
    );
    
    if (alreadyCheckedIn) {
      return res.status(400).json({ message: "You have already checked in to this class" });
    }
    
    // Determine check-in status based on current time
    const now = new Date();
    const [classHour, classMinute] = cls.startTime.split(':').map(Number);
    const classStartTime = new Date(date);
    classStartTime.setHours(classHour, classMinute);
    
    const minutesLate = Math.floor((now.getTime() - classStartTime.getTime()) / 60000);
    let status = "on-time";
    
    if (minutesLate > 15) {
      status = "late";
    }
    
    // Create check-in record
    const checkIn = await storage.createCheckIn({
      classId,
      userId,
      venueId: actualVenueId,
      checkInTime: now,
      date,
      status
    });
    
    // Create notification
    await storage.createNotification({
      userId,
      title: "Check-in Successful",
      message: `You have successfully checked in to ${venue.name}.`,
      type: "check_in",
      isRead: false
    });
    
    res.status(201).json({ 
      message: "Check-in successful",
      checkIn 
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUserCheckInHistory(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get user check-ins
    const checkIns = await storage.getCheckInsForUser(userId);
    
    // Get terms from check-ins
    const terms = await storage.getUserCheckInTerms(userId);
    
    // Get courses
    const courses = await storage.getUserEnrolledCourses(userId);
    
    res.json({
      user,
      checkIns,
      terms,
      courses
    });
  } catch (error) {
    console.error("Error fetching check-in history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
