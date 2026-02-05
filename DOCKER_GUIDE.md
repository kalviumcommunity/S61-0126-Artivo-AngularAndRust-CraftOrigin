# Docker Deployment Guide for CraftOrigin (Angular + Rust)

## 📋 What You'll Accomplish
- Containerize your Angular frontend
- Containerize your Rust backend
- Set up PostgreSQL database
- Run everything with one command
- Access your app at http://localhost:4200

---

## ✅ Step 1: Prerequisites Check

Open PowerShell and verify these are installed:

```powershell
# Check Node.js (should be v18 or higher)
node --version

# Check npm
npm --version

# Check Docker
docker --version

# Check Docker Compose
docker compose version
```

If anything is missing, install it first.

---

## ✅ Step 2: Verify Your Angular App Works Locally

```powershell
# Navigate to Angular project
cd C:\Users\srike\S61-0126-Artivo-AngularAndRust-CraftOrigin\CraftOrigin

# Install dependencies (if not already done)
npm install

# Start the development server
npm start
```

Open http://localhost:4200 in your browser. If it works, press `Ctrl+C` to stop it.

---

## ✅ Step 3: Test Angular Production Build

```powershell
# Still in CraftOrigin folder
npm run build -- --configuration=production
```

This creates a `dist/` folder. Check that it exists:

```powershell
dir dist\CraftOrigin\browser
```

You should see files like `index.html`, JavaScript bundles, and CSS files.

---

## ✅ Step 4: Docker Files Created ✓

I've already created these files for you:

**Frontend Files (in CraftOrigin/):**
- ✓ `Dockerfile` - Multi-stage build for Angular
- ✓ `nginx.conf` - Nginx configuration with API proxy
- ✓ `.dockerignore` - Excludes unnecessary files

**Root Level:**
- ✓ `docker-compose.yml` - Orchestrates all services

**Backend Files (already exist in backend/):**
- ✓ `Dockerfile`
- ✓ `docker-compose.yml`

---

## ✅ Step 5: Build Docker Images

```powershell
# Go to project root
cd C:\Users\srike\S61-0126-Artivo-AngularAndRust-CraftOrigin

# Build all images (this takes 5-10 minutes the first time)
docker compose build
```

**What's happening:**
- Building Node.js build environment for Angular
- Compiling Angular to static files
- Creating Nginx image with your app
- Building Rust backend
- Pulling PostgreSQL image

---

## ✅ Step 6: Start All Services

```powershell
# Start everything in detached mode
docker compose up -d
```

**What's running:**
- PostgreSQL on port 5433
- Rust Backend on port 8080
- Angular Frontend on port 4200

---

## ✅ Step 7: Check Container Status

```powershell
# View running containers
docker compose ps
```

You should see:
- `craftorigin_postgres` - running
- `craftorigin_backend` - running
- `craftorigin_frontend` - running

---

## ✅ Step 8: View Logs (Optional)

```powershell
# View all logs
docker compose logs

# View specific service logs
docker compose logs frontend
docker compose logs backend
docker compose logs postgres

# Follow logs in real-time
docker compose logs -f backend
```

---

## ✅ Step 9: Access Your Application

Open your browser and go to:

**Frontend:** http://localhost:4200  
**Backend API:** http://localhost:8080/api/health  
**Database:** localhost:5433 (use pgAdmin or DBeaver)

---

## ✅ Step 10: Test the Admin Login

1. Go to http://localhost:4200
2. Click "Sign In"
3. Use these credentials:
   - **Email:** admin@example.com
   - **Password:** password

---

## 🔧 Common Commands

### Stop All Containers
```powershell
docker compose down
```

### Stop and Remove Volumes (Fresh Start)
```powershell
docker compose down -v
```

### Restart a Specific Service
```powershell
docker compose restart backend
docker compose restart frontend
```

### Rebuild After Code Changes
```powershell
# Rebuild only changed services
docker compose up -d --build

# Force rebuild everything
docker compose build --no-cache
docker compose up -d
```

### View Resource Usage
```powershell
docker stats
```

---

## 🐛 Troubleshooting

### Frontend Not Loading
```powershell
# Check frontend logs
docker compose logs frontend

# Restart frontend
docker compose restart frontend
```

### Backend Connection Error
```powershell
# Check if backend is running
docker compose ps backend

# View backend logs
docker compose logs backend

# Check database connection
docker compose logs postgres
```

### Port Already in Use
```powershell
# Find what's using port 4200
netstat -ano | findstr :4200

# Kill the process (replace PID with actual number)
Stop-Process -Id <PID> -Force
```

### Database Issues
```powershell
# Recreate database with fresh data
docker compose down -v
docker compose up -d
```

---

## 📦 How the Docker Setup Works

### Multi-Stage Build (Frontend)
1. **Stage 1 (Build):** Uses Node.js to compile Angular
2. **Stage 2 (Runtime):** Uses Nginx to serve static files
3. **Result:** Small image (50MB vs 1GB+)

### Container Communication
- Frontend → Backend: `http://backend:8080/api/`
- Backend → Database: `postgres://postgres@postgres:5432/my_app_db`
- Docker network handles internal DNS

### Data Persistence
- `db_data` volume: PostgreSQL data survives container restarts
- `uploads_data` volume: User uploaded files persist

---

## 🚀 Production Deployment Tips

### Don't Do This in Production:
- ❌ Use `password` as JWT secret
- ❌ Use `postgres:postgres` credentials
- ❌ Expose database port publicly
- ❌ Run on `localhost`

### Do This Instead:
- ✅ Use environment variables from secret store
- ✅ Use strong passwords and JWT secrets
- ✅ Remove database port exposure (only backend needs it)
- ✅ Use reverse proxy (Nginx/Traefik)
- ✅ Enable HTTPS with SSL certificates
- ✅ Set up health checks and monitoring

---

## 📝 Environment Configuration

### Option 1: Change docker-compose.yml
Edit environment variables directly in the compose file.

### Option 2: Use .env File (Recommended)
Create `.env` in project root:

```env
# Database
POSTGRES_DB=my_app_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# Backend
JWT_SECRET=your-super-secret-key
DATABASE_URL=postgres://postgres:your-secure-password@postgres:5432/my_app_db

# Ports
FRONTEND_PORT=4200
BACKEND_PORT=8080
DB_PORT=5433
```

Then reference in docker-compose.yml:
```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

---

## 🎯 Next Steps

1. **Add SSL/HTTPS:** Use Nginx as reverse proxy with Let's Encrypt
2. **Set Up CI/CD:** Auto-build and deploy on git push
3. **Monitor Logs:** Use tools like Grafana + Loki
4. **Scale Services:** Use Docker Swarm or Kubernetes
5. **Backup Database:** Schedule automated PostgreSQL backups

---

## 📚 Quick Reference

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start all services |
| `docker compose down` | Stop all services |
| `docker compose logs -f` | Follow logs |
| `docker compose ps` | Show running containers |
| `docker compose restart <service>` | Restart specific service |
| `docker compose build --no-cache` | Force rebuild images |
| `docker system prune -a` | Clean up unused images/containers |

---

## ✅ Success Checklist

- [ ] All prerequisites installed
- [ ] Angular builds successfully
- [ ] Docker images built without errors
- [ ] All containers running (`docker compose ps`)
- [ ] Frontend accessible at http://localhost:4200
- [ ] Backend API responding at http://localhost:8080/api/health
- [ ] Admin login works
- [ ] Database persists data after restart

---

**Your application is now fully containerized and production-ready!** 🎉
