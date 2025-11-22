# MongoDB Compass Connection Guide

## Quick Connection String
```
mongodb://admin:admin123@localhost:27017/school_db?authSource=admin
```

## Connection Details

### Method 1: Connection String (Recommended)
1. Open MongoDB Compass
2. Paste the connection string above
3. Click **Connect**

### Method 2: Fill Form Manually
- **Hostname**: `localhost`
- **Port**: `27017`
- **Authentication**: `Username / Password`
- **Username**: `admin`
- **Password**: `admin123`
- **Authentication Database**: `admin`
- **Default Database**: `school_db` (optional)

## Verify MongoDB is Running

Check if the container is running:
```bash
docker-compose ps mongodb
```

If not running, start it:
```bash
docker-compose up -d mongodb
```

## Expected Collections

After connecting, you should see these collections in the `school_db` database:
- **Teachers** - Teacher information
- **Classes** - Class details
- **Students** - Student records
- **LibraryBooks** - Library book management
- **Events** - School events

## Troubleshooting

### Connection Refused
- Make sure MongoDB container is running: `docker-compose ps`
- Check if port 27017 is available: `lsof -i :27017`
- Restart MongoDB: `docker-compose restart mongodb`

### Authentication Failed
- Verify username is `admin` and password is `admin123`
- Make sure `authSource=admin` is in the connection string
- Check MongoDB logs: `docker-compose logs mongodb`

### Can't See Collections
- The collections are created in the `school_db` database
- Make sure you're viewing the correct database
- If collections are empty, check initialization logs: `docker-compose logs mongodb`

