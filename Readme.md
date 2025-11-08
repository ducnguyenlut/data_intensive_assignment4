# Data Intensive Assignment 4

This project demonstrates a multi-database setup using MongoDB with Docker Compose. It includes basic operations for accessing, updating, and managing multiple databases. Make sure you have [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your system.

To get started, clone the repository:

``` bash
git clone https://github.com/ducnguyenlut/data_intensive_assignment4.git
cd data_intensive_assignment4
```

Then build and run the project using Docker Compose:
``` bash
docker-compose up --build
```

Using http://localhost:1000 to access database through web-browser

When you are done, stop and remove all running containers using:
``` bash
docker-compose down
```

The project structure is as follows:
``` bash
data_intensive_assignment4/
│
├─ backend/          # Node.js/Express backend
├─ frontend/         # React frontend (if any)
├─ docker-compose.yml
└─ README.md
```