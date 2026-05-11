# CampusScheduler - New Features Upgrade Documentation

## Overview
This document outlines the major upgrade to the CampusScheduler application, adding essential features for modern learning management including assignments, grades, announcements, and QR-code based attendance.

## New Database Tables Added

### 1. Assignments Table
**Purpose**: Manage course assignments and homework

**Schema**:
- `id`: Primary key
- `courseId`: Foreign key to courses
- `lecturerId`: Foreign key to users (lecturer who created)
- `title`: Assignment title
- `description`: Detailed description
- `dueDate`: Due date (YYYY-MM-DD)
- `dueTime`: Due time (HH:MM)
- `maxScore`: Maximum possible score (default: 100)
- `isActive`: Whether assignment is active
- `createdAt`, `updatedAt`: Timestamps

### 2. Assignment Submissions Table
**Purpose**: Track student submissions for assignments

**Schema**:
- `id`: Primary key
- `assignmentId`: Foreign key to assignments
- `studentId`: Foreign key to users (student)
- `submissionText`: Text submission content
- `fileUrl`: URL to uploaded file (if any)
- `submittedAt`: Submission timestamp
- `grade`: Assigned grade
- `feedback`: Lecturer feedback
- `gradedBy`: Foreign key to users (grader)
- `gradedAt`: Grading timestamp
- `isLate`: Whether submission was late

### 3. Grades Table
**Purpose**: Store overall course grades for students

**Schema**:
- `id`: Primary key
- `enrollmentId`: Foreign key to enrollments
- `studentId`: Foreign key to users
- `courseId`: Foreign key to courses
- `lecturerId`: Foreign key to users (lecturer)
- `midtermGrade`: Midterm exam grade
- `finalGrade`: Final exam grade
- `overallGrade`: Overall course grade
- `letterGrade`: Letter grade (A, B+, B, etc.)
- `gpa`: GPA points
- `comments`: Additional comments
- `term`: Academic term
- `isPublished`: Whether grade is published to student
- `createdAt`, `updatedAt`: Timestamps

### 4. Announcements Table
**Purpose**: Course announcements and discussion posts

**Schema**:
- `id`: Primary key
- `courseId`: Foreign key to courses (nullable for general announcements)
- `userId`: Foreign key to users (author)
- `title`: Announcement title
- `content`: Announcement content
- `type`: Type (announcement/discussion)
- `isPinned`: Whether pinned to top
- `isLocked`: Whether replies are locked
- `createdAt`, `updatedAt`: Timestamps

### 5. Announcement Replies Table
**Purpose**: Allow replies to announcements

**Schema**:
- `id`: Primary key
- `announcementId`: Foreign key to announcements
- `userId`: Foreign key to users (author)
- `content`: Reply content
- `createdAt`, `updatedAt`: Timestamps

### 6. QR Code Sessions Table
**Purpose**: Enable QR code-based attendance checking

**Schema**:
- `id`: Primary key
- `classId`: Foreign key to classes
- `lecturerId`: Foreign key to users (lecturer)
- `qrCodeData`: Unique QR code data
- `expiresAt`: Session expiration time
- `isActive`: Whether session is active
- `createdAt`: Creation timestamp

## New Storage Methods

### Assignment Methods
- `createAssignment(assignmentData)` - Create new assignment
- `getAssignmentsByCourse(courseId)` - Get all assignments for a course
- `getAssignmentById(id)` - Get assignment by ID
- `updateAssignment(assignmentId, assignmentData)` - Update assignment
- `deleteAssignment(assignmentId)` - Delete assignment

### Assignment Submission Methods
- `submitAssignment(submissionData)` - Submit assignment
- `getSubmissionByStudentAndAssignment(studentId, assignmentId)` - Check submission status
- `gradeAssignment(submissionId, grade, feedback, gradedBy)` - Grade submission
- `getSubmissionsForAssignment(assignmentId)` - Get all submissions for grading

### Grade Methods
- `saveGrade(gradeData)` - Save/update grade
- `getGradesForStudent(studentId, term?)` - Get student's grades
- `publishGrade(gradeId)` - Publish grade to student

### Announcement Methods
- `createAnnouncement(announcementData)` - Create announcement
- `getAnnouncementsByCourse(courseId)` - Get course announcements
- `getAnnouncementById(id)` - Get announcement by ID
- `updateAnnouncement(announcementId, announcementData)` - Update announcement
- `deleteAnnouncement(announcementId)` - Delete announcement

### Announcement Reply Methods
- `createAnnouncementReply(replyData)` - Post reply
- `getRepliesForAnnouncement(announcementId)` - Get all replies

### QR Code Session Methods
- `createQrCodeSession(sessionData)` - Create QR session
- `getActiveQrCodeSession(classId)` - Get active session for class
- `validateQrCode(qrCodeData)` - Validate scanned QR code
- `deactivateQrCodeSession(sessionId)` - End QR session

## Recommended API Endpoints to Implement

### Assignment Endpoints
```
POST   /api/assignments              - Create assignment (lecturer)
GET    /api/courses/:courseId/assignments - Get course assignments
GET    /api/assignments/:id          - Get assignment details
PUT    /api/assignments/:id          - Update assignment (lecturer)
DELETE /api/assignments/:id          - Delete assignment (lecturer)
POST   /api/assignments/:id/submit   - Submit assignment (student)
GET    /api/assignments/:id/submissions - Get submissions (lecturer)
POST   /api/submissions/:id/grade    - Grade submission (lecturer)
```

### Grade Endpoints
```
POST   /api/grades                   - Save grade (lecturer/admin)
GET    /api/students/:id/grades      - Get student grades
PUT    /api/grades/:id/publish       - Publish grade (lecturer)
```

### Announcement Endpoints
```
POST   /api/announcements            - Create announcement
GET    /api/courses/:courseId/announcements - Get course announcements
PUT    /api/announcements/:id        - Update announcement
DELETE /api/announcements/:id        - Delete announcement
POST   /api/announcements/:id/replies - Post reply
GET    /api/announcements/:id/replies - Get replies
```

### QR Code Attendance Endpoints
```
POST   /api/classes/:classId/qr-session     - Create QR session (lecturer)
GET    /api/classes/:classId/qr-session     - Get active QR session
POST   /api/check-in/qr                     - Check in via QR code
DELETE /api/qr-sessions/:id                 - End QR session
```

## Frontend Components to Create

### Assignment Components
1. **AssignmentList.tsx** - Display all assignments for a course
2. **AssignmentDetail.tsx** - Show assignment details and submission
3. **AssignmentForm.tsx** - Create/edit assignment form (lecturer)
4. **SubmissionModal.tsx** - Submit assignment modal
5. **GradingInterface.tsx** - Grade submissions interface (lecturer)

### Grade Components
1. **Gradebook.tsx** - Lecturer gradebook interface
2. **MyGrades.tsx** - Student view of their grades
3. **GradeDistribution.tsx** - Chart showing grade distribution

### Announcement Components
1. **AnnouncementBoard.tsx** - Display announcements with threading
2. **AnnouncementForm.tsx** - Create/edit announcement
3. **ReplyComponent.tsx** - Post and display replies

### QR Code Components
1. **QRCodeGenerator.tsx** - Generate and display QR code (lecturer)
2. **QRCodeScanner.tsx** - Scan QR code for attendance (student)
3. **AttendanceSessionManager.tsx** - Manage active sessions

## Suggested Routes (Frontend)

```typescript
// App.tsx additions
<Route path="/courses/:courseId/assignments" component={AssignmentListPage} />
<Route path="/courses/:courseId/grades" component={GradesPage} />
<Route path="/courses/:courseId/announcements" component={AnnouncementsPage} />
<Route path="/my-grades" component={MyGradesPage} />
```

## Integration Points

### With Existing Features

1. **Courses Page Enhancement**
   - Add tabs for Assignments, Announcements, Grades
   - Show assignment count and upcoming due dates

2. **Dashboard Enhancement**
   - Show upcoming assignment due dates
   - Display recent announcements from enrolled courses
   - Show pending submissions

3. **Check-in System Enhancement**
   - Add QR code check-in option alongside existing manual check-in
   - Lecturers can generate time-limited QR codes for class sessions

4. **Notifications Enhancement**
   - Notify students of new assignments
   - Notify when assignments are graded
   - Notify about new announcements
   - Remind about upcoming due dates

## Security Considerations

1. **Authorization Checks**
   - Only lecturers can create/modify assignments and grades
   - Students can only view their own grades and submissions
   - Only enrolled students can access course materials

2. **Data Validation**
   - Validate grade ranges (0-100 or custom maxScore)
   - Ensure due dates are in the future for new assignments
   - Prevent duplicate submissions

3. **QR Code Security**
   - Use cryptographically secure random data for QR codes
   - Set reasonable expiration times (5-15 minutes)
   - Invalidate QR codes after use or expiration

## Benefits of These Features

1. **Complete Learning Management**
   - Full assignment lifecycle from creation to grading
   - Transparent grade tracking for students
   - Enhanced communication through announcements

2. **Modern Attendance Tracking**
   - Contactless QR code check-in
   - Reduced buddy-checking fraud
   - Real-time attendance monitoring

3. **Improved Engagement**
   - Discussion-style announcements encourage interaction
   - Timely notifications keep students informed
   - Easy access to course materials and deadlines

## Migration Steps

1. Run database migration to add new tables:
   ```bash
   npm run db:push
   ```

2. Update seed data to include sample assignments and announcements

3. Implement backend API endpoints in `server/routes.ts`

4. Create frontend components and pages

5. Add navigation links to course pages and dashboard

6. Test with different user roles (student, lecturer, admin)

## Future Enhancement Ideas

1. **File Upload Integration**
   - Support for assignment file submissions
   - Cloud storage integration (AWS S3, etc.)

2. **Advanced Grading**
   - Rubric-based grading
   - Peer review functionality
   - Grade appeals process

3. **Analytics Dashboard**
   - Assignment completion rates
   - Grade trends over time
   - Student performance analytics

4. **Mobile App Integration**
   - Native mobile app for QR scanning
   - Push notifications for deadlines
   - Offline assignment viewing

5. **Collaboration Features**
   - Group assignments
   - Team formation tools
   - Collaborative documents

## Conclusion

This upgrade transforms CampusScheduler from a basic timetable and venue management system into a comprehensive learning management platform. The new features address critical needs for assignment management, grade tracking, course communication, and modern attendance verification.

The modular design allows for incremental implementation, starting with the most critical features (assignments and grades) and expanding to include announcements and QR-based attendance as resources permit.
