import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { authenticateJWT, isAdmin, isAuthenticated } from "./middleware/auth";
import * as authController from "./controllers/auth";
import * as timetableController from "./controllers/timetable";
import * as venueController from "./controllers/venue";
import * as checkInController from "./controllers/check-in";
import * as notificationController from "./controllers/notification";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients with their user IDs
  const clients = new Map<number, WebSocket>();
  
  wss.on('connection', (ws: WebSocket, req) => {
    // Extract user ID from query parameters
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = parseInt(url.searchParams.get('userId') || '0', 10);
    
    if (userId > 0) {
      clients.set(userId, ws);
      
      ws.on('close', () => {
        clients.delete(userId);
      });
    }
  });
  
  // Create a function to send notifications to specific users
  const sendNotification = (userId: number, notification: any) => {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  };

  // Authentication routes
  app.post('/api/auth/register', authController.register);
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/logout', authController.logout);
  app.get('/api/auth/me', authenticateJWT, authController.getCurrentUser);

  // Dashboard routes
  app.get('/api/dashboard', authenticateJWT, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get today's date and classes
      const today = new Date().toISOString().split('T')[0];
      const todayClasses = await storage.getClassesForDate(userId, today);

      // Check if there's a pending venue change
      let pendingVenueChange = null;
      for (const cls of todayClasses) {
        if (cls.venueChange) {
          const venueChange = await storage.getPendingVenueChangeForClass(cls.id, today);
          if (venueChange) {
            const originalVenue = await storage.getVenueById(venueChange.originalVenueId);
            const newVenue = await storage.getVenueById(venueChange.newVenueId);
            const classDetails = await storage.getClassById(venueChange.classId);
            const course = classDetails ? await storage.getCourseById(classDetails.courseId) : null;
            
            pendingVenueChange = {
              ...venueChange,
              className: course?.name || "Class",
              originalVenue: originalVenue ? {
                id: originalVenue.id,
                name: originalVenue.name,
                capacity: originalVenue.capacity,
                location: originalVenue.location,
                facilities: originalVenue.facilities,
              } : null,
              newVenue: newVenue ? {
                id: newVenue.id,
                name: newVenue.name,
                capacity: newVenue.capacity,
                location: newVenue.location,
                facilities: newVenue.facilities,
              } : null,
            };
            break;
          }
        }
      }

      // Format the classes for the response
      const formattedClasses = todayClasses.map(cls => {
        // Calculate time until class
        const now = new Date();
        const [hour, minute] = cls.startTime.split(':');
        const startDateTime = new Date(today);
        startDateTime.setHours(parseInt(hour, 10), parseInt(minute, 10));
        
        const minutesUntil = Math.floor((startDateTime.getTime() - now.getTime()) / 60000);
        
        let timeStatus;
        if (cls.venueChange) {
          timeStatus = 'venue_change';
        } else if (minutesUntil > 0 && minutesUntil <= 30) {
          timeStatus = 'upcoming';
        } else if (minutesUntil <= 0) {
          // Check if class is ongoing
          const [endHour, endMinute] = cls.endTime.split(':');
          const endDateTime = new Date(today);
          endDateTime.setHours(parseInt(endHour, 10), parseInt(endMinute, 10));
          
          if (now.getTime() <= endDateTime.getTime()) {
            timeStatus = 'ongoing';
          } else {
            timeStatus = 'completed';
          }
        } else {
          timeStatus = 'later';
        }
        
        return {
          id: cls.id,
          name: cls.courseName,
          department: `${cls.department} - ${cls.courseCode}`,
          venue: cls.venueName,
          startTime: cls.startTime,
          endTime: cls.endTime,
          timeUntil: `${minutesUntil} minutes`,
          timeStatus,
          venueChange: cls.venueChange,
        };
      });

      res.json({
        user,
        todayClasses: formattedClasses,
        pendingVenueChange,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Timetable routes
  app.get('/api/timetable', authenticateJWT, timetableController.getUserTimetable);
  app.post('/api/admin/upload-timetable', authenticateJWT, isAdmin, timetableController.uploadTimetable);
  app.get('/api/admin/timetables', authenticateJWT, isAdmin, timetableController.getAdminTimetables);
  app.delete('/api/admin/timetables/:id', authenticateJWT, isAdmin, timetableController.deleteTimetable);

  // Venue routes
  app.get('/api/venues', authenticateJWT, venueController.getAllVenues);
  app.get('/api/admin/venues', authenticateJWT, isAdmin, venueController.getAdminVenues);
  app.post('/api/admin/venues', authenticateJWT, isAdmin, venueController.createVenue);
  app.patch('/api/admin/venues/:id', authenticateJWT, isAdmin, venueController.updateVenue);
  app.delete('/api/admin/venues/:id', authenticateJWT, isAdmin, venueController.deleteVenue);

  // Course routes
  app.get('/api/courses', authenticateJWT, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all courses
      const courses = await storage.getAllCourses();
      
      // Get enrolled courses for the student
      const enrollments = user.role === 'student' 
        ? await storage.getStudentEnrollments(userId)
        : [];
      
      const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));
      
      // Format courses with enrollment status
      const formattedCourses = courses.map(course => {
        // For simplicity, mock the lecturer info
        const isEnrolled = enrolledCourseIds.has(course.id);
        return {
          id: course.id,
          name: course.name,
          code: course.code,
          department: course.department,
          description: course.description,
          enrolledStudents: isEnrolled ? 1 : 0,
          lecturer: {
            name: "John Smith", // In a real app, you'd fetch the actual lecturer
            email: "john.smith@example.com"
          }
        };
      });

      // Get all departments
      const departments = await storage.getDepartments();

      res.json({
        user,
        courses: formattedCourses,
        departments
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check-in routes
  app.post('/api/check-in', authenticateJWT, checkInController.checkInToClass);
  app.get('/api/check-ins/history', authenticateJWT, checkInController.getUserCheckInHistory);

  // Notification routes
  app.get('/api/notifications', authenticateJWT, notificationController.getUserNotifications);
  app.patch('/api/notifications/:id/read', authenticateJWT, notificationController.markNotificationAsRead);
  app.patch('/api/notifications/read-all', authenticateJWT, notificationController.markAllNotificationsAsRead);

  // Venue conflict resolution with AI
  app.post('/api/ai/resolve-venue-conflict', authenticateJWT, async (req, res) => {
    try {
      const { classId, venueId, occupiedVenueId, date } = req.body;
      
      if (!classId || !venueId || !occupiedVenueId || !date) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Import OpenAI service
      const aiService = await import('./services/openai');
      
      // Get class details
      const cls = await storage.getClassById(classId);
      if (!cls) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      // Get current venue details
      const venue = await storage.getVenueById(venueId);
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      
      // Call AI service to resolve conflict
      const result = await aiService.resolveVenueConflict(cls, venue, date);
      
      if (!result.success) {
        return res.status(500).json({ message: result.message || "Failed to resolve venue conflict" });
      }
      
      // Create venue change record
      const venueChange = await storage.createVenueChange({
        classId,
        originalVenueId: venueId,
        newVenueId: result.suggestedVenue!.id,
        reason: "Venue conflict detected",
        aiSuggestion: result,
        timeAdjustment: result.timeAdjustment || 0,
        date,
        status: "pending"
      });
      
      // Create notifications for affected users
      // First for the lecturer
      await storage.createNotification({
        userId: cls.lecturerId,
        title: "Venue Change Required",
        message: `Your class has a venue conflict on ${date}. A new venue has been suggested.`,
        type: "venue_change",
        isRead: false
      });
      
      // Notify connected users via WebSocket
      sendNotification(cls.lecturerId, {
        type: "venue_change",
        title: "Venue Change Required",
        message: `Your class has a venue conflict on ${date}. A new venue has been suggested.`,
        venueChangeId: venueChange.id
      });
      
      // Then for enrolled students (in a real implementation)
      // For now, just return the result
      
      res.json({
        success: true,
        venueChangeId: venueChange.id,
        suggestedVenue: result.suggestedVenue,
        timeAdjustment: result.timeAdjustment,
        message: "Venue conflict resolved successfully"
      });
    } catch (error) {
      console.error('Error resolving venue conflict:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/ai/analyze-venue-usage/:venueId', authenticateJWT, isAdmin, async (req, res) => {
    try {
      const venueId = parseInt(req.params.venueId, 10);
      
      if (isNaN(venueId)) {
        return res.status(400).json({ message: "Invalid venue ID" });
      }
      
      // Get venue details
      const venue = await storage.getVenueById(venueId);
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      
      // Import OpenAI service
      const aiService = await import('./services/openai');
      
      // Analyze venue usage
      const result = await aiService.analyzeVenueUsage(venue);
      
      if (!result.success) {
        return res.status(500).json({ message: result.message || "Failed to analyze venue usage" });
      }
      
      res.json({
        success: true,
        patterns: result.patterns,
        message: "Venue usage analyzed successfully"
      });
    } catch (error) {
      console.error('Error analyzing venue usage:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Venue change routes
  app.post('/api/venue-changes/accept', authenticateJWT, async (req, res) => {
    try {
      const { classId, newVenueId, date, timeAdjustment } = req.body;
      const userId = req.user?.id;
      
      if (!userId || !classId || !newVenueId || !date) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Get class details
      const cls = await storage.getClassById(classId);
      if (!cls) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      // Check if user is authorized (lecturer of the class or admin)
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role !== 'admin' && cls.lecturerId !== userId) {
        return res.status(403).json({ message: "Not authorized to accept venue change" });
      }
      
      // Get pending venue change
      const venueChange = await storage.getPendingVenueChangeForClass(classId, date);
      if (!venueChange) {
        return res.status(404).json({ message: "No pending venue change found" });
      }
      
      // Update venue change status
      await storage.updateVenueChange(venueChange.id, {
        status: "accepted",
        newVenueId,
        timeAdjustment: timeAdjustment || venueChange.timeAdjustment
      });
      
      // Create notification for the lecturer
      await storage.createNotification({
        userId: cls.lecturerId,
        title: "Venue Change Accepted",
        message: `The venue change for your class on ${date} has been accepted.`,
        type: "venue_change",
        isRead: false
      });
      
      // Notify connected users via WebSocket
      sendNotification(cls.lecturerId, {
        type: "venue_change_accepted",
        title: "Venue Change Accepted",
        message: `The venue change for your class on ${date} has been accepted.`,
        venueChangeId: venueChange.id,
        date
      });
      
      // In a real implementation, you'd also notify enrolled students
      
      res.json({
        success: true,
        message: "Venue change accepted successfully"
      });
    } catch (error) {
      console.error('Error accepting venue change:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User management routes (admin only)
  app.get('/api/admin/users', authenticateJWT, isAdmin, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const currentUser = await storage.getUserById(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all users
      const users = await storage.getAllUsers();
      
      // Get user counts by role
      const roleCounts = await storage.countUsersByRole();
      
      const studentCount = roleCounts.find(r => r.role === 'student')?.count || 0;
      const lecturerCount = roleCounts.find(r => r.role === 'lecturer')?.count || 0;
      const adminCount = roleCounts.find(r => r.role === 'admin')?.count || 0;
      
      // Get all departments
      const departments = await storage.getDepartments();

      res.json({
        user: currentUser,
        users,
        departments,
        totalUsers: users.length,
        studentCount,
        lecturerCount,
        adminCount
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Profile routes
  app.patch('/api/user/profile', authenticateJWT, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { firstName, lastName, email, department } = req.body;

      // Validate input
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "First name, last name, and email are required" });
      }

      // Check if email is already taken by another user
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Email is already in use" });
      }

      // Update user profile
      const updatedUser = await storage.updateUser(userId, {
        firstName,
        lastName,
        email,
        department: department || null,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Enrollment routes
  app.post('/api/enrollments', authenticateJWT, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { courseId } = req.body;

      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }

      // Verify user is a student
      const user = await storage.getUserById(userId);
      if (!user || user.role !== 'student') {
        return res.status(403).json({ message: "Only students can enroll in courses" });
      }

      // Verify course exists
      const course = await storage.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if already enrolled
      const enrollments = await storage.getStudentEnrollments(userId);
      const alreadyEnrolled = enrollments.some(e => e.courseId === courseId);
      if (alreadyEnrolled) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }

      // Get current term (in a real app, this would be more sophisticated)
      const currentTerm = "Fall 2024";

      // Enroll student
      const enrollment = await storage.enrollStudentInCourse(userId, courseId, currentTerm);

      res.json({
        success: true,
        enrollment,
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete('/api/enrollments/:enrollmentId', authenticateJWT, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const enrollmentId = parseInt(req.params.enrollmentId, 10);

      if (isNaN(enrollmentId)) {
        return res.status(400).json({ message: "Invalid enrollment ID" });
      }

      // Verify user is a student
      const user = await storage.getUserById(userId);
      if (!user || user.role !== 'student') {
        return res.status(403).json({ message: "Only students can withdraw from courses" });
      }

      // Delete enrollment
      await storage.deleteEnrollment(enrollmentId, userId);

      res.json({
        success: true,
      });
    } catch (error) {
      console.error('Error withdrawing from course:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Attendance statistics route
  app.get('/api/attendance/stats', authenticateJWT, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get attendance statistics
      const stats = await storage.getAttendanceStats(userId);

      res.json(stats);
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
