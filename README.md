# Multi-Database School Management System

A full-stack application that seamlessly manages data across both SQL (PostgreSQL) and NoSQL (MongoDB) databases, with a transparent abstraction layer that hides the database complexity from users.

## Features

- **Dual Database Support**: PostgreSQL (SQL) and MongoDB (NoSQL)
- **Transparent Database Operations**: Users don't need to know which database is being used
- **CRUD Operations**: Create, Read, Update, Delete operations across both databases
- **Data Viewing Options**: 
  - View data from PostgreSQL separately
  - View data from MongoDB separately
  - View combined/joined data from similar tables across both databases
- **Modern UI**: Beautiful, responsive React frontend
- **Dockerized**: Fully containerized with Docker Compose

## Database Structure

### PostgreSQL (SQL Database)
1. **Teachers** - Teacher information
2. **Classes** - Class details
3. **Subjects** - Subject information
4. **Students** - Student records
5. **Enrollments** - Student-subject enrollments

### MongoDB (NoSQL Database)
1. **Teachers** - Teacher information (similar to PostgreSQL)
2. **Classes** - Class details (similar to PostgreSQL)
3. **Students** - Student records (similar to PostgreSQL)
4. **LibraryBooks** - Library book management (MongoDB only)
5. **Events** - School events (MongoDB only)

**Note**: Teachers, Classes, and Students exist in both databases and can be joined. LibraryBooks and Events are MongoDB-specific collections.

## Project Structure

```
assignment4/
├── backend/                 # Node.js/Express backend
│   ├── config/            # Database configuration
│   ├── routes/            # API routes
│   ├── services/          # Database abstraction layer
│   ├── server.js          # Main server file
│   └── package.json
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API service layer
│   │   └── App.js
│   └── package.json
├── database/
│   ├── postgres/         # PostgreSQL initialization
│   └── mongodb/          # MongoDB initialization
└── docker-compose.yml     # Docker configuration
```

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB of free RAM
- Ports 3000, 3001, 5432, and 27017 available

## Getting Started

### 1. Clone or navigate to the project directory

```bash
cd assignment4
```

### 2. Start all services with Docker Compose

```bash
docker-compose up --build
```

This will:
- Start PostgreSQL database on port 5432
- Start MongoDB database on port 27017
- Start backend API on port 3001
- Start frontend application on port 3000

### 3. Access the application

- **Frontend**: Open your browser and navigate to `http://localhost:3000`
- **Backend API**: Available at `http://localhost:3001`
- **API Health Check**: `http://localhost:3001/health`

### 4. Stop the services

```bash
docker-compose down
```

To remove volumes (database data):

```bash
docker-compose down -v
```

## Usage

### Viewing Data

1. Click on **"View Data"** tab
2. Select an entity type from the dropdown (Teachers, Classes, Students, etc.)
3. Choose a view mode:
   - **All Views**: Shows data from both databases separately and combined
   - **PostgreSQL Only**: Shows only PostgreSQL data
   - **MongoDB Only**: Shows only MongoDB data
   - **Joined View**: Shows combined data from similar tables (available for Teachers, Classes, Students)

### Managing Data

1. Click on **"Manage Data"** tab
2. Select an entity type
3. Choose an action:
   - **Create New**: Add new records (automatically routed to appropriate database)
   - **Update Existing**: Modify existing records
   - **Delete**: Remove records

**Note**: The system automatically routes operations to the correct database:
- Teachers, Classes, Students, Subjects, Enrollments → PostgreSQL
- LibraryBooks, Events → MongoDB

Users don't need to know which database is being used!

## API Endpoints

### Get Data
- `GET /api/:entityType` - Get all entities (supports `?view=all|postgres|mongodb|combined`)
- `GET /api/:entityType/join` - Join similar entities from both databases

### Create Data
- `POST /api/:entityType` - Create new entity (automatically routes to appropriate database)

### Update Data
- `PUT /api/:entityType/:id` - Update entity (automatically routes to appropriate database)

### Delete Data
- `DELETE /api/:entityType/:id` - Delete entity (automatically routes to appropriate database)

## Database Abstraction Layer

The backend includes a `DatabaseService` that:
- Automatically routes CRUD operations to the appropriate database
- Handles schema differences between PostgreSQL and MongoDB
- Combines results from similar tables across databases
- Provides a unified API interface

## Technologies Used

- **Frontend**: React 18, Axios
- **Backend**: Node.js, Express
- **Databases**: PostgreSQL 15, MongoDB 7.0
- **Containerization**: Docker, Docker Compose

## Troubleshooting

### Port conflicts
If ports are already in use, modify the port mappings in `docker-compose.yml`

### Database connection issues
- Ensure all containers are running: `docker-compose ps`
- Check logs: `docker-compose logs backend`
- Restart services: `docker-compose restart`

### Frontend not loading
- Wait for the React development server to start (may take 30-60 seconds)
- Check browser console for errors
- Verify backend is running: `curl http://localhost:3001/health`

## Development

### Running without Docker

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Databases**: Start PostgreSQL and MongoDB separately

## License

This project is created for educational purposes.

