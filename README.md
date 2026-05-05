# Mini Team Task Manager

A clean full-stack Team Task Manager assignment project. Admins can create projects, add members, assign tasks, and track status. Members can see their assigned tasks and update status.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB
- Auth: JWT
- Deployment: Railway

## Features

- Signup and login with Admin or Member role
- JWT authentication
- Role-based access control
- Admin project creation and team member assignment
- Admin task creation and assignment
- Member task view and status updates
- Dashboard stats: total, completed, pending, overdue
- Validations and MongoDB relationships

## Local Setup

```bash
npm run install:all
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/team_task_manager
JWT_SECRET=change_this_secret
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run both apps:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Routes

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Public | Create account |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/projects` | Auth | List visible projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/tasks` | Auth | List visible tasks |
| POST | `/api/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | Auth | Update task status |
| GET | `/api/dashboard` | Auth | Dashboard stats |

## Railway Deployment

1. Push this repo to GitHub.
2. Create a Railway project.
3. Add MongoDB Atlas connection string in Railway variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=https://your-railway-domain.up.railway.app
NODE_ENV=production
```

4. Railway will run:

```bash
npm run build
npm start
```

The Express server serves the React production build in production.

## Demo Video Flow

1. Signup as Admin.
2. Signup as Member in another browser/incognito.
3. Admin creates a project and adds the member.
4. Admin creates a task and assigns it to the member.
5. Member logs in, sees assigned task, and updates status.
6. Admin dashboard shows task counts and progress.

