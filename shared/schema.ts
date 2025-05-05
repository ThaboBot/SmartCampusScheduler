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

// Validation Schemas
export const insertUserSchema = createInsertSchema(users, {
  firstName: (schema) => schema.min(2, "First name must be at least 2 characters"),
  lastName: (schema) => schema.min(2, "Last name must be at least 2 characters"),
  email: (schema) => schema.email("Please enter a valid email"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
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

// Login Schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["student", "lecturer", "admin"]),
});

export type LoginData = z.infer<typeof loginSchema>;
