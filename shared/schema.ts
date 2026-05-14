import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User Role Enum
export const userRoleEnum = pgEnum('user_role', ['student', 'lecturer', 'admin']);

// Department Enum
export const departmentEnum = pgEnum('department', ['SET', 'SOBE', 'SEM']); 

// User Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull(),
  department: departmentEnum("department"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Venue Table
export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  capacity: integer("capacity").notNull(),
  location: text("location").notNull(),
  facilities: text("facilities"),
  building: text("building").notNull(),
  floor: text("floor").notNull(),
  roomNumber: text("room_number").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Course Table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  department: departmentEnum("department").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Class Table (for individual class sessions)
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  venueId: integer("venue_id").references(() => venues.id).notNull(),
  lecturerId: integer("lecturer_id").references(() => users.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday to Saturday)
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  term: text("term").notNull(), // e.g., "Fall 2023"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Check-in Table
export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  venueId: integer("venue_id").references(() => venues.id).notNull(),
  checkInTime: timestamp("check_in_time").defaultNow().notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  status: text("status").notNull(), // "on-time", "late", etc.
});

// Notification Table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // "venue_change", "schedule_update", "check_in", etc.
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Venue Change Table
export const venueChanges = pgTable("venue_changes", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  originalVenueId: integer("original_venue_id").references(() => venues.id).notNull(),
  newVenueId: integer("new_venue_id").references(() => venues.id).notNull(),
  reason: text("reason").notNull(),
  aiSuggestion: json("ai_suggestion"),
  timeAdjustment: integer("time_adjustment"), // in minutes (can be negative)
  date: text("date").notNull(), // YYYY-MM-DD
  status: text("status").notNull(), // "pending", "accepted", "rejected"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Student-Course Enrollment Relation
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  term: text("term").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assignment Table
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  lecturerId: integer("lecturer_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date").notNull(), // YYYY-MM-DD
  dueTime: text("due_time"), // HH:MM
  maxScore: integer("max_score").default(100).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Assignment Submission Table
export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").references(() => assignments.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  submissionText: text("submission_text"),
  fileUrl: text("file_url"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  grade: integer("grade"),
  feedback: text("feedback"),
  gradedBy: integer("graded_by").references(() => users.id),
  gradedAt: timestamp("graded_at"),
  isLate: boolean("is_late").default(false).notNull(),
});

// Grade Table (for overall course grades)
export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").references(() => enrollments.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  lecturerId: integer("lecturer_id").references(() => users.id).notNull(),
  midtermGrade: integer("midterm_grade"),
  finalGrade: integer("final_grade"),
  overallGrade: integer("overall_grade"),
  letterGrade: text("letter_grade"), // A, B+, B, etc.
  gpa: numeric("gpa"),
  comments: text("comments"),
  term: text("term").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Announcement/Discussion Post Table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").default("announcement").notNull(), // announcement, discussion
  isPinned: boolean("is_pinned").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Announcement Reply Table
export const announcementReplies = pgTable("announcement_replies", {
  id: serial("id").primaryKey(),
  announcementId: integer("announcement_id").references(() => announcements.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// QR Code Session Table (for attendance)
export const qrCodeSessions = pgTable("qr_code_sessions", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  lecturerId: integer("lecturer_id").references(() => users.id).notNull(),
  qrCodeData: text("qr_code_data").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  notifications: many(notifications),
  lecturerClasses: many(classes, { relationName: "lecturer" }),
  checkIns: many(checkIns),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  classes: many(classes),
  enrollments: many(enrollments),
}));

export const venuesRelations = relations(venues, ({ many }) => ({
  classes: many(classes),
  checkIns: many(checkIns),
  originalVenueChanges: many(venueChanges, { relationName: "originalVenue" }),
  newVenueChanges: many(venueChanges, { relationName: "newVenue" }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  course: one(courses, { fields: [classes.courseId], references: [courses.id] }),
  venue: one(venues, { fields: [classes.venueId], references: [venues.id] }),
  lecturer: one(users, { fields: [classes.lecturerId], references: [users.id] }),
  checkIns: many(checkIns),
  venueChanges: many(venueChanges),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  class: one(classes, { fields: [checkIns.classId], references: [classes.id] }),
  user: one(users, { fields: [checkIns.userId], references: [users.id] }),
  venue: one(venues, { fields: [checkIns.venueId], references: [venues.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const venueChangesRelations = relations(venueChanges, ({ one }) => ({
  class: one(classes, { fields: [venueChanges.classId], references: [classes.id] }),
  originalVenue: one(venues, { fields: [venueChanges.originalVenueId], references: [venues.id] }),
  newVenue: one(venues, { fields: [venueChanges.newVenueId], references: [venues.id] }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(users, { fields: [enrollments.studentId], references: [users.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));

// New Relations for Added Tables
export const coursesRelationsWithAssignments = relations(courses, ({ many }) => ({
  assignments: many(assignments),
  grades: many(grades),
  announcements: many(announcements),
}));

export const usersRelationsExtended = relations(users, ({ many }) => ({
  assignmentsCreated: many(assignments),
  gradedSubmissions: many(assignmentSubmissions, { relationName: "grader" }),
  submissions: many(assignmentSubmissions, { relationName: "student" }),
  gradesGiven: many(grades, { relationName: "lecturer" }),
  gradesReceived: many(grades, { relationName: "student" }),
  announcements: many(announcements),
  announcementReplies: many(announcementReplies),
  qrCodeSessions: many(qrCodeSessions),
}));

export const classesRelationsWithQR = relations(classes, ({ many }) => ({
  qrCodeSessions: many(qrCodeSessions),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  course: one(courses, { fields: [assignments.courseId], references: [courses.id] }),
  lecturer: one(users, { fields: [assignments.lecturerId], references: [users.id] }),
  submissions: many(assignmentSubmissions),
}));

export const assignmentSubmissionsRelations = relations(assignmentSubmissions, ({ one }) => ({
  assignment: one(assignments, { fields: [assignmentSubmissions.assignmentId], references: [assignments.id] }),
  student: one(users, { fields: [assignmentSubmissions.studentId], references: [users.id], relationName: "student" }),
  grader: one(users, { fields: [assignmentSubmissions.gradedBy], references: [users.id], relationName: "grader" }),
}));

export const gradesRelations = relations(grades, ({ one }) => ({
  enrollment: one(enrollments, { fields: [grades.enrollmentId], references: [enrollments.id] }),
  student: one(users, { fields: [grades.studentId], references: [users.id], relationName: "student" }),
  course: one(courses, { fields: [grades.courseId], references: [courses.id] }),
  lecturer: one(users, { fields: [grades.lecturerId], references: [users.id], relationName: "lecturer" }),
}));

export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  course: one(courses, { fields: [announcements.courseId], references: [courses.id] }),
  author: one(users, { fields: [announcements.userId], references: [users.id] }),
  replies: many(announcementReplies),
}));

export const announcementRepliesRelations = relations(announcementReplies, ({ one }) => ({
  announcement: one(announcements, { fields: [announcementReplies.announcementId], references: [announcements.id] }),
  author: one(users, { fields: [announcementReplies.userId], references: [users.id] }),
}));

export const qrCodeSessionsRelations = relations(qrCodeSessions, ({ one }) => ({
  class: one(classes, { fields: [qrCodeSessions.classId], references: [classes.id] }),
  lecturer: one(users, { fields: [qrCodeSessions.lecturerId], references: [users.id] }),
}));

// Validation Schemas
export const insertUserSchema = createInsertSchema(users, {
  firstName: (schema) => schema.min(2, "First name must be at least 2 characters"),
  lastName: (schema) => schema.min(2, "Last name must be at least 2 characters"),
  email: (schema) => schema.email("Please enter a valid email"),
  password: (schema) => schema
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const insertVenueSchema = createInsertSchema(venues, {
  name: (schema) => schema.min(3, "Venue name must be at least 3 characters"),
  capacity: (schema) => schema.min(1, "Capacity must be at least 1"),
});

export const insertCourseSchema = createInsertSchema(courses, {
  name: (schema) => schema.min(3, "Course name must be at least 3 characters"),
  code: (schema) => schema.min(2, "Course code must be at least 2 characters"),
});

export const insertClassSchema = createInsertSchema(classes, {
  dayOfWeek: (schema) => schema.min(0, "Day must be between 0-6").max(6, "Day must be between 0-6"),
});

export const insertCheckInSchema = createInsertSchema(checkIns);
export const insertNotificationSchema = createInsertSchema(notifications);
export const insertVenueChangeSchema = createInsertSchema(venueChanges);
export const insertEnrollmentSchema = createInsertSchema(enrollments);
export const insertAssignmentSchema = createInsertSchema(assignments, {
  title: (schema) => schema.min(3, "Assignment title must be at least 3 characters"),
  dueDate: (schema) => schema.regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format"),
});
export const insertAssignmentSubmissionSchema = createInsertSchema(assignmentSubmissions);
export const insertGradeSchema = createInsertSchema(grades);
export const insertAnnouncementSchema = createInsertSchema(announcements, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  content: (schema) => schema.min(10, "Content must be at least 10 characters"),
});
export const insertAnnouncementReplySchema = createInsertSchema(announcementReplies, {
  content: (schema) => schema.min(1, "Reply content cannot be empty"),
});
export const insertQrCodeSessionSchema = createInsertSchema(qrCodeSessions);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type VenueChange = typeof venueChanges.$inferSelect;
export type InsertVenueChange = z.infer<typeof insertVenueChangeSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type AssignmentSubmission = typeof assignmentSubmissions.$inferSelect;
export type InsertAssignmentSubmission = z.infer<typeof insertAssignmentSubmissionSchema>;
export type Grade = typeof grades.$inferSelect;
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type AnnouncementReply = typeof announcementReplies.$inferSelect;
export type InsertAnnouncementReply = z.infer<typeof insertAnnouncementReplySchema>;
export type QrCodeSession = typeof qrCodeSessions.$inferSelect;
export type InsertQrCodeSession = z.infer<typeof insertQrCodeSessionSchema>;

// Login Schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["student", "lecturer", "admin"]),
});

export type LoginData = z.infer<typeof loginSchema>;
