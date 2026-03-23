import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, or, ne, like, desc, asc, isNull, sql } from "drizzle-orm";
import { hash, compare } from "bcrypt";
import { InsertUser, User, Venue, Course, Class, CheckIn, Notification, VenueChange, Enrollment } from "@shared/schema";

// User operations
export const storage = {
  // User methods
  async getUserById(id: number): Promise<User | null> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return users.length > 0 ? users[0] : null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return users.length > 0 ? users[0] : null;
  },

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await hash(userData.password, 10);
    const [user] = await db
      .insert(schema.users)
      .values({ ...userData, password: hashedPassword })
      .returning();
    return user;
  },

  async validateUserPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isPasswordValid = await compare(password, user.password);
    return isPasswordValid ? user : null;
  },

  async updateUser(userId: number, userData: Partial<User>): Promise<User | null> {
    if (userData.password) {
      userData.password = await hash(userData.password, 10);
    }

    const [updatedUser] = await db
      .update(schema.users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();

    return updatedUser || null;
  },

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users).orderBy(asc(schema.users.lastName));
  },

  async countUsersByRole(): Promise<{ role: string; count: number }[]> {
    const results = await db
      .select({
        role: schema.users.role,
        count: sql<number>`count(*)`,
      })
      .from(schema.users)
      .groupBy(schema.users.role);

    return results;
  },

  // Venue methods
  async getVenueById(id: number): Promise<Venue | null> {
    const venues = await db.select().from(schema.venues).where(eq(schema.venues.id, id)).limit(1);
    return venues.length > 0 ? venues[0] : null;
  },

  async getAllVenues(): Promise<Venue[]> {
    return await db.select().from(schema.venues).orderBy(asc(schema.venues.name));
  },

  async getActiveVenues(): Promise<Venue[]> {
    return await db
      .select()
      .from(schema.venues)
      .where(eq(schema.venues.isActive, true))
      .orderBy(asc(schema.venues.name));
  },

  async createVenue(venueData: schema.InsertVenue): Promise<Venue> {
    const [venue] = await db.insert(schema.venues).values(venueData).returning();
    return venue;
  },

  async updateVenue(venueId: number, venueData: Partial<Venue>): Promise<Venue | null> {
    const [updatedVenue] = await db
      .update(schema.venues)
      .set({ ...venueData, updatedAt: new Date() })
      .where(eq(schema.venues.id, venueId))
      .returning();

    return updatedVenue || null;
  },

  async deleteVenue(venueId: number): Promise<boolean> {
    await db.delete(schema.venues).where(eq(schema.venues.id, venueId));
    return true;
  },

  async getVenueBuildings(): Promise<string[]> {
    const results = await db
      .select({ building: schema.venues.building })
      .from(schema.venues)
      .groupBy(schema.venues.building)
      .orderBy(asc(schema.venues.building));

    return results.map(result => result.building);
  },

  async getAvailableVenuesForDate(date: string, startTime: string, endTime: string, capacity: number): Promise<Venue[]> {
    // Subquery to get class IDs happening on the given date and time
    const classesHappeningSubquery = db
      .select({ classId: schema.classes.id })
      .from(schema.classes)
      .innerJoin(
        schema.venueChanges,
        and(
          eq(schema.venueChanges.classId, schema.classes.id),
          eq(schema.venueChanges.date, date),
          eq(schema.venueChanges.status, "accepted")
        )
      )
      .where(
        and(
          eq(schema.classes.isActive, true),
          // Time overlap check
          or(
            and(
              sql`${schema.classes.startTime} <= ${endTime}`,
              sql`${schema.classes.endTime} >= ${startTime}`
            )
          )
        )
      );

    // Get venues that are active, have enough capacity, and are not booked
    const availableVenues = await db
      .select()
      .from(schema.venues)
      .where(
        and(
          eq(schema.venues.isActive, true),
          sql`${schema.venues.capacity} >= ${capacity}`,
          // Not in use by any class
          sql`NOT EXISTS (
            SELECT 1 FROM ${schema.classes} c
            WHERE c.venue_id = ${schema.venues.id}
            AND c.id IN (${classesHappeningSubquery})
          )`
        )
      )
      .orderBy(asc(schema.venues.capacity));

    return availableVenues;
  },

  // Course methods
  async getCourseById(id: number): Promise<Course | null> {
    const courses = await db.select().from(schema.courses).where(eq(schema.courses.id, id)).limit(1);
    return courses.length > 0 ? courses[0] : null;
  },

  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(schema.courses).orderBy(asc(schema.courses.name));
  },

  async getDepartments(): Promise<string[]> {
    const results = await db
      .select({ department: schema.courses.department })
      .from(schema.courses)
      .groupBy(schema.courses.department)
      .orderBy(asc(schema.courses.department));

    return results.map(result => result.department);
  },

  // Class methods
  async getClassById(id: number): Promise<Class | null> {
    const classes = await db.select().from(schema.classes).where(eq(schema.classes.id, id)).limit(1);
    return classes.length > 0 ? classes[0] : null;
  },

  async getClassesForUser(userId: number, term: string): Promise<any[]> {
    // For students - get classes from enrolled courses
    if ((await this.getUserById(userId))?.role === "student") {
      return await db
        .select({
          id: schema.classes.id,
          dayOfWeek: schema.classes.dayOfWeek,
          startTime: schema.classes.startTime,
          endTime: schema.classes.endTime,
          term: schema.classes.term,
          courseName: schema.courses.name,
          courseCode: schema.courses.code,
          department: schema.courses.department,
          venueName: schema.venues.name,
          lecturerName: sql<string>`concat(${schema.users.firstName}, ' ', ${schema.users.lastName})`,
        })
        .from(schema.classes)
        .innerJoin(schema.courses, eq(schema.classes.courseId, schema.courses.id))
        .innerJoin(schema.venues, eq(schema.classes.venueId, schema.venues.id))
        .innerJoin(schema.users, eq(schema.classes.lecturerId, schema.users.id))
        .innerJoin(schema.enrollments, 
          and(
            eq(schema.enrollments.courseId, schema.courses.id),
            eq(schema.enrollments.studentId, userId)
          )
        )
        .where(
          and(
            eq(schema.classes.isActive, true),
            eq(schema.classes.term, term)
          )
        )
        .orderBy(asc(schema.classes.dayOfWeek), asc(schema.classes.startTime));
    }
    
    // For lecturers - get classes they teach
    return await db
      .select({
        id: schema.classes.id,
        dayOfWeek: schema.classes.dayOfWeek,
        startTime: schema.classes.startTime,
        endTime: schema.classes.endTime,
        term: schema.classes.term,
        courseName: schema.courses.name,
        courseCode: schema.courses.code,
        department: schema.courses.department,
        venueName: schema.venues.name,
        lecturerName: sql<string>`concat(${schema.users.firstName}, ' ', ${schema.users.lastName})`,
      })
      .from(schema.classes)
      .innerJoin(schema.courses, eq(schema.classes.courseId, schema.courses.id))
      .innerJoin(schema.venues, eq(schema.classes.venueId, schema.venues.id))
      .innerJoin(schema.users, eq(schema.classes.lecturerId, schema.users.id))
      .where(
        and(
          eq(schema.classes.isActive, true),
          eq(schema.classes.lecturerId, userId),
          eq(schema.classes.term, term)
        )
      )
      .orderBy(asc(schema.classes.dayOfWeek), asc(schema.classes.startTime));
  },

  async getClassesForDate(userId: number, date: string): Promise<any[]> {
    const dayOfWeek = new Date(date).getDay(); // 0-6, where 0 is Sunday
    const user = await this.getUserById(userId);
    
    if (!user) return [];

    // For students - get classes from enrolled courses
    if (user.role === "student") {
      return await db
        .select({
          id: schema.classes.id,
          startTime: schema.classes.startTime,
          endTime: schema.classes.endTime,
          courseName: schema.courses.name,
          courseCode: schema.courses.code,
          department: schema.courses.department,
          venueName: schema.venues.name,
        })
        .from(schema.classes)
        .innerJoin(schema.courses, eq(schema.classes.courseId, schema.courses.id))
        .innerJoin(schema.venues, eq(schema.classes.venueId, schema.venues.id))
        .innerJoin(schema.enrollments, 
          and(
            eq(schema.enrollments.courseId, schema.courses.id),
            eq(schema.enrollments.studentId, userId)
          )
        )
        .leftJoin(
          schema.checkIns,
          and(
            eq(schema.checkIns.classId, schema.classes.id),
            eq(schema.checkIns.userId, userId),
            eq(schema.checkIns.date, date)
          )
        )
        .leftJoin(
          schema.venueChanges,
          and(
            eq(schema.venueChanges.classId, schema.classes.id),
            eq(schema.venueChanges.date, date),
            eq(schema.venueChanges.status, "pending")
          )
        )
        .where(
          and(
            eq(schema.classes.isActive, true),
            eq(schema.classes.dayOfWeek, dayOfWeek)
          )
        )
        .orderBy(asc(schema.classes.startTime));
    }
    
    // For lecturers - get classes they teach
    return await db
      .select({
        id: schema.classes.id,
        startTime: schema.classes.startTime,
        endTime: schema.classes.endTime,
        courseName: schema.courses.name,
        courseCode: schema.courses.code,
        department: schema.courses.department,
        venueName: schema.venues.name,
      })
      .from(schema.classes)
      .innerJoin(schema.courses, eq(schema.classes.courseId, schema.courses.id))
      .innerJoin(schema.venues, eq(schema.classes.venueId, schema.venues.id))
      .leftJoin(
        schema.venueChanges,
        and(
          eq(schema.venueChanges.classId, schema.classes.id),
          eq(schema.venueChanges.date, date),
          eq(schema.venueChanges.status, "pending")
        )
      )
      .where(
        and(
          eq(schema.classes.isActive, true),
          eq(schema.classes.lecturerId, userId),
          eq(schema.classes.dayOfWeek, dayOfWeek)
        )
      )
      .orderBy(asc(schema.classes.startTime));
  },

  // Check-in methods
  async createCheckIn(checkInData: schema.InsertCheckIn): Promise<CheckIn> {
    const [checkIn] = await db.insert(schema.checkIns).values(checkInData).returning();
    return checkIn;
  },

  async getCheckInsForUser(userId: number): Promise<any[]> {
    return await db
      .select({
        id: schema.checkIns.id,
        date: schema.checkIns.date,
        checkInTime: schema.checkIns.checkInTime,
        status: schema.checkIns.status,
        courseName: schema.courses.name,
        courseCode: schema.courses.code,
        venueName: schema.venues.name,
      })
      .from(schema.checkIns)
      .innerJoin(schema.classes, eq(schema.checkIns.classId, schema.classes.id))
      .innerJoin(schema.courses, eq(schema.classes.courseId, schema.courses.id))
      .innerJoin(schema.venues, eq(schema.checkIns.venueId, schema.venues.id))
      .where(eq(schema.checkIns.userId, userId))
      .orderBy(desc(schema.checkIns.checkInTime));
  },

  async getUserCheckInTerms(userId: number): Promise<string[]> {
    const results = await db
      .select({ term: schema.classes.term })
      .from(schema.checkIns)
      .innerJoin(schema.classes, eq(schema.checkIns.classId, schema.classes.id))
      .where(eq(schema.checkIns.userId, userId))
      .groupBy(schema.classes.term)
      .orderBy(desc(schema.classes.term));

    return results.map(result => result.term);
  },

  async getUserEnrolledCourses(userId: number): Promise<any[]> {
    return await db
      .select({
        id: schema.courses.id,
        name: schema.courses.name,
        code: schema.courses.code,
      })
      .from(schema.courses)
      .innerJoin(
        schema.enrollments,
        and(
          eq(schema.enrollments.courseId, schema.courses.id),
          eq(schema.enrollments.studentId, userId)
        )
      )
      .orderBy(asc(schema.courses.code));
  },

  // Notification methods
  async createNotification(notificationData: schema.InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(schema.notifications).values(notificationData).returning();
    return notification;
  },

  async getNotificationsForUser(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .orderBy(desc(schema.notifications.createdAt));
  },

  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    await db
      .update(schema.notifications)
      .set({ isRead: true })
      .where(eq(schema.notifications.id, notificationId));
    return true;
  },

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    await db
      .update(schema.notifications)
      .set({ isRead: true })
      .where(eq(schema.notifications.userId, userId));
    return true;
  },

  // Venue change methods
  async createVenueChange(venueChangeData: schema.InsertVenueChange): Promise<VenueChange> {
    const [venueChange] = await db.insert(schema.venueChanges).values(venueChangeData).returning();
    return venueChange;
  },

  async getPendingVenueChangeForClass(classId: number, date: string): Promise<VenueChange | null> {
    const venueChanges = await db
      .select()
      .from(schema.venueChanges)
      .where(
        and(
          eq(schema.venueChanges.classId, classId),
          eq(schema.venueChanges.date, date),
          eq(schema.venueChanges.status, "pending")
        )
      )
      .limit(1);
    
    return venueChanges.length > 0 ? venueChanges[0] : null;
  },

  async updateVenueChange(venueChangeId: number, venueChangeData: Partial<VenueChange>): Promise<VenueChange | null> {
    const [updatedVenueChange] = await db
      .update(schema.venueChanges)
      .set({ ...venueChangeData, updatedAt: new Date() })
      .where(eq(schema.venueChanges.id, venueChangeId))
      .returning();

    return updatedVenueChange || null;
  },

  // Enrollment methods
  async enrollStudentInCourse(studentId: number, courseId: number, term: string): Promise<Enrollment> {
    const [enrollment] = await db
      .insert(schema.enrollments)
      .values({ studentId, courseId, term })
      .returning();
    return enrollment;
  },

  async getStudentEnrollments(studentId: number): Promise<any[]> {
    return await db
      .select({
        id: schema.enrollments.id,
        courseId: schema.courses.id,
        courseName: schema.courses.name,
        courseCode: schema.courses.code,
        department: schema.courses.department,
        term: schema.enrollments.term,
        createdAt: schema.enrollments.createdAt,
      })
      .from(schema.enrollments)
      .innerJoin(schema.courses, eq(schema.enrollments.courseId, schema.courses.id))
      .where(eq(schema.enrollments.studentId, studentId))
      .orderBy(desc(schema.enrollments.createdAt));
  },

  async deleteEnrollment(enrollmentId: number, userId: number): Promise<boolean> {
    // Verify the enrollment belongs to the user
    const enrollment = await db
      .select()
      .from(schema.enrollments)
      .where(eq(schema.enrollments.id, enrollmentId))
      .limit(1);

    if (enrollment.length === 0 || enrollment[0].studentId !== userId) {
      throw new Error("Enrollment not found or unauthorized");
    }

    await db.delete(schema.enrollments).where(eq(schema.enrollments.id, enrollmentId));
    return true;
  },

  async getAttendanceStats(userId: number): Promise<any> {
    // Get total check-ins
    const totalCheckInsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.checkIns)
      .where(eq(schema.checkIns.userId, userId));

    const totalCheckIns = totalCheckInsResult[0]?.count || 0;

    // Get on-time check-ins
    const onTimeCheckInsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.checkIns)
      .where(
        and(
          eq(schema.checkIns.userId, userId),
          eq(schema.checkIns.status, "on-time")
        )
      );

    const onTimeCheckIns = onTimeCheckInsResult[0]?.count || 0;

    // Calculate attendance rate
    const attendanceRate = totalCheckIns > 0 
      ? Math.round((onTimeCheckIns / totalCheckIns) * 100) 
      : 0;

    // Get recent check-ins (last 5)
    const recentCheckIns = await db
      .select({
        id: schema.checkIns.id,
        date: schema.checkIns.date,
        checkInTime: schema.checkIns.checkInTime,
        status: schema.checkIns.status,
        courseName: schema.courses.name,
        courseCode: schema.courses.code,
        venueName: schema.venues.name,
      })
      .from(schema.checkIns)
      .innerJoin(schema.classes, eq(schema.checkIns.classId, schema.classes.id))
      .innerJoin(schema.courses, eq(schema.classes.courseId, schema.courses.id))
      .innerJoin(schema.venues, eq(schema.checkIns.venueId, schema.venues.id))
      .where(eq(schema.checkIns.userId, userId))
      .orderBy(desc(schema.checkIns.checkInTime))
      .limit(5);

    return {
      totalCheckIns,
      onTimeCheckIns,
      lateCheckIns: totalCheckIns - onTimeCheckIns,
      attendanceRate,
      recentCheckIns,
    };
  },

  // Terms methods
  async getAvailableTerms(): Promise<string[]> {
    const results = await db
      .select({ term: schema.classes.term })
      .from(schema.classes)
      .groupBy(schema.classes.term)
      .orderBy(desc(schema.classes.term));

    return results.map(result => result.term);
  },

  // Timetable upload methods (simplified version)
  async saveTimetableUpload(
    department: string,
    term: string,
    fileName: string,
    uploadedById: number
  ): Promise<any> {
    // This is just a mock implementation since we don't have a timetable uploads table
    // In a real implementation, you would save this to a dedicated table
    return {
      id: Math.floor(Math.random() * 1000),
      department,
      term,
      fileName,
      uploadedById,
      uploadDate: new Date().toISOString(),
      status: "processing",
    };
  },
};
