import { db } from "./index";
import * as schema from "@shared/schema";
import { hash } from "bcrypt";

async function seed() {
  try {
    // Seed Users
    const hashedPassword = await hash("password123", 10);

    // Admin user
    const [admin] = await db.insert(schema.users).values({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      department: null,
    }).returning();

    // Lecturer users
    const [lecturer1] = await db.insert(schema.users).values({
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      password: hashedPassword,
      role: "lecturer",
      department: "SET",
    }).returning();

    const [lecturer2] = await db.insert(schema.users).values({
      firstName: "Emma",
      lastName: "Johnson",
      email: "emma.johnson@example.com",
      password: hashedPassword,
      role: "lecturer",
      department: "SOBE",
    }).returning();

    const [lecturer3] = await db.insert(schema.users).values({
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@example.com",
      password: hashedPassword,
      role: "lecturer",
      department: "SEM",
    }).returning();

    // Student users
    const [student1] = await db.insert(schema.users).values({
      firstName: "Alice",
      lastName: "Williams",
      email: "alice.williams@example.com",
      password: hashedPassword,
      role: "student",
      department: "SET",
    }).returning();

    const [student2] = await db.insert(schema.users).values({
      firstName: "Robert",
      lastName: "Davis",
      email: "robert.davis@example.com",
      password: hashedPassword,
      role: "student",
      department: "SOBE",
    }).returning();

    // Venues
    const [venue1] = await db.insert(schema.venues).values({
      name: "Engineering Block, Room E202",
      capacity: 50,
      location: "Engineering Building",
      facilities: "Projector, Whiteboard, Air conditioning",
      building: "Engineering Block",
      floor: "2",
      roomNumber: "E202",
      isActive: true,
    }).returning();

    const [venue2] = await db.insert(schema.venues).values({
      name: "Business School, Room B105",
      capacity: 40,
      location: "Business Building",
      facilities: "Projector, Whiteboard, Air conditioning",
      building: "Business School",
      floor: "1",
      roomNumber: "B105",
      isActive: true,
    }).returning();

    const [venue3] = await db.insert(schema.venues).values({
      name: "Science Block, Room S301",
      capacity: 60,
      location: "Science Building",
      facilities: "Projector, Whiteboard, Computer Lab",
      building: "Science Block",
      floor: "3",
      roomNumber: "S301",
      isActive: true,
    }).returning();

    const [venue4] = await db.insert(schema.venues).values({
      name: "Engineering Block, Room E205",
      capacity: 45,
      location: "Engineering Building",
      facilities: "Projector, Whiteboard, Air conditioning",
      building: "Engineering Block",
      floor: "2",
      roomNumber: "E205",
      isActive: true,
    }).returning();

    // Courses
    const [course1] = await db.insert(schema.courses).values({
      name: "Data Structures & Algorithms",
      code: "CS202",
      department: "SET",
      description: "Introduction to data structures and algorithms",
    }).returning();

    const [course2] = await db.insert(schema.courses).values({
      name: "Business Communication",
      code: "BC101",
      department: "SOBE",
      description: "Effective communication in business environments",
    }).returning();

    const [course3] = await db.insert(schema.courses).values({
      name: "Project Management",
      code: "PM301",
      department: "SEM",
      description: "Principles of project management",
    }).returning();

    // Classes
    const currentTerm = "Fall 2023";
    
    const [class1] = await db.insert(schema.classes).values({
      courseId: course1.id,
      venueId: venue1.id,
      lecturerId: lecturer1.id,
      dayOfWeek: 1, // Monday
      startTime: "10:00",
      endTime: "12:00",
      term: currentTerm,
      isActive: true,
    }).returning();

    const [class2] = await db.insert(schema.classes).values({
      courseId: course2.id,
      venueId: venue2.id,
      lecturerId: lecturer2.id,
      dayOfWeek: 1, // Monday
      startTime: "14:00",
      endTime: "16:00",
      term: currentTerm,
      isActive: true,
    }).returning();

    const [class3] = await db.insert(schema.classes).values({
      courseId: course3.id,
      venueId: venue3.id,
      lecturerId: lecturer3.id,
      dayOfWeek: 1, // Monday
      startTime: "16:30",
      endTime: "18:30",
      term: currentTerm,
      isActive: true,
    }).returning();

    // Enrollments
    await db.insert(schema.enrollments).values({
      studentId: student1.id,
      courseId: course1.id,
      term: currentTerm,
    });

    await db.insert(schema.enrollments).values({
      studentId: student1.id,
      courseId: course3.id,
      term: currentTerm,
    });

    await db.insert(schema.enrollments).values({
      studentId: student2.id,
      courseId: course2.id,
      term: currentTerm,
    });

    // Notifications
    await db.insert(schema.notifications).values({
      userId: student1.id,
      title: "Venue Change Alert",
      message: "Your Project Management class has been moved to Science Block, Room S305 due to capacity issues.",
      type: "venue_change",
      isRead: false,
      createdAt: new Date(),
    });

    await db.insert(schema.notifications).values({
      userId: student1.id,
      title: "Schedule Update",
      message: "The Software Engineering lecture on Friday has been rescheduled to 3:00 PM due to faculty meeting.",
      type: "schedule_update",
      isRead: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
    });

    await db.insert(schema.notifications).values({
      userId: student1.id,
      title: "Check-in Successful",
      message: "You have successfully checked in to Database Systems class at Engineering Block, Room E101.",
      type: "check_in",
      isRead: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
