# CampusScheduler Frontend

Modern, responsive React frontend for the CampusScheduler Learning Management System.

## 🚀 Features

- **Modern Stack**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Zustand + React Query (TanStack Query)
- **Routing**: React Router v6 with protected routes
- **UI Components**: Radix UI primitives + Framer Motion animations
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Testing**: Vitest + React Testing Library

## 📦 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18.2 |
| Language | TypeScript 5.3 |
| Build Tool | Vite 5.0 |
| Styling | Tailwind CSS 3.4 |
| State | Zustand 4.4 |
| Data Fetching | TanStack Query 5.17 |
| Routing | React Router 6.21 |
| Forms | React Hook Form 7.49 |
| Validation | Zod 3.22 |
| Animations | Framer Motion 10.18 |
| Icons | Lucide React |
| Testing | Vitest + Testing Library |

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 8000

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Access the app at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── frontend/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── store/          # State management (Zustand)
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── tests/              # Test setup and specs
│   ├── assets/             # Static assets
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Public assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.js      # Tailwind config
├── vite.config.ts          # Vite config
└── .env.example            # Environment template
```

## 🎨 Available Pages

- **Login/Register** - Authentication pages
- **Dashboard** - Overview with stats and quick access
- **Courses** - Course listing and management
- **Timetable** - Weekly class schedule view
- **Assignments** - Assignment tracking and submission
- **Grades** - Academic performance and GPA
- **Announcements** - News and notifications
- **Profile** - User settings and preferences

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## 🌐 API Integration

The frontend connects to the backend API via Axios with automatic token injection:

```typescript
// Example service
import { get, post } from './api'

export const coursesApi = {
  getAll: () => get<Course[]>('/courses'),
  getById: (id: string) => get<Course>(`/courses/${id}`),
  create: (data: Course) => post<Course>('/courses', data),
}
```

Authentication tokens are automatically attached to requests via interceptors.

## 🎯 Key Features

### Dark Mode
Toggle between light and dark themes with persistent storage.

### Responsive Design
Mobile-first design that works on all screen sizes.

### Protected Routes
Automatic redirect to login for unauthenticated users.

### Real-time Updates
React Query handles caching and background updates.

### Form Validation
Zod schemas ensure data integrity before submission.

### Toast Notifications
User-friendly feedback for all actions.

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage report
npm run test:coverage
```

## 📦 Building for Production

```bash
# Create optimized build
npm run build

# Preview locally
npm run preview
```

Output is in the `dist/` directory, ready for deployment.

## 🚀 Deployment

### Static Hosting
Deploy the `dist/` folder to any static host:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting

### Docker
```bash
docker build -t campus-scheduler-frontend .
docker run -p 3000:80 campus-scheduler-frontend
```

## 🔒 Security

- XSS protection via React's built-in escaping
- CSRF tokens for state-changing operations
- Secure token storage (consider httpOnly cookies for production)
- Input validation on both client and server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- GitHub Issues
- Documentation: `/docs`
- API Docs: `http://localhost:8000/docs`

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
