# FitQuest Deployment Guide 🚀

This guide provides step-by-step instructions for deploying FitQuest to various platforms and environments.

## 📋 Prerequisites

- Node.js 16+ installed
- MongoDB database (local or Atlas)
- Git repository access
- Domain name (for production)
- SSL certificate (for production)

---

## One-click Overview (Recommended)

- Frontend → Vercel (directory: `frontend/`, build: `npm run build`, output: `dist`)
- Backend → Render (blueprint: `render.yaml`, health check: `/health`)

Environment variables are managed per platform. See backend `env.example` and frontend `env.example`.

---

## Vercel (Frontend)

1) Create a new Vercel project
- Framework preset: Vite
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

2) Set environment variables
- `VITE_API_URL` → your Render backend URL

3) SPA routing and PWA
- `frontend/vercel.json` includes SPA rewrites to `index.html`
- PWA is enabled via `vite-plugin-pwa`

---

## Render (Backend)

1) Use Blueprint
- Connect GitHub repo and select `render.yaml` at repo root

2) Verify service config
- Root dir: `backend`
- Build command: `npm ci`
- Start command: `npm run start`
- Health check path: `/health`

3) Set environment variables
- `NODE_ENV=production`
- `MONGODB_URI` (Atlas connection string)
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `FRONTEND_URL` (your Vercel app URL)
- Optional: Cloudinary and Email creds
- Optional: `MONGODB_POOL_SIZE` (default 10)

4) Database indexes and seed
```bash
render ssh <service> --command "cd backend && npm run migrate:indexes && npm run seed:exercises"
```

---

## 🛠️ Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Nkosana1/-FitQuest---a-comprehensive-fitness-tracking-application..git
cd FitQuest
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3. Environment Variables

Create `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitquest

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=30d

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_FROM=noreply@yourdomain.com
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=https://yourdomain.com
```

---

## 🌐 Production Deployment Options

## Option 1: Traditional VPS/Server Deployment

### 1. Server Setup (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install MongoDB (if not using Atlas)
sudo apt install mongodb -y
```

### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/Nkosana1/-FitQuest---a-comprehensive-fitness-tracking-application..git
cd FitQuest

# Install backend dependencies
cd backend
npm ci --production

# Install frontend dependencies and build
cd ../frontend
npm ci
npm run build

# Start backend with PM2
cd ../backend
pm2 start server.js --name "fitquest-api"
pm2 startup
pm2 save
```

### 3. Nginx Configuration

Create `/etc/nginx/sites-available/fitquest`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    location / {
        root /path/to/FitQuest/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/fitquest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL Setup with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Option 2: Heroku Deployment

### 1. Backend Deployment

```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create fitquest-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... add all other environment variables

# Deploy
cd backend
git init
git add .
git commit -m "Deploy to Heroku"
heroku git:remote -a fitquest-api
git push heroku master
```

### 2. Frontend Deployment (Netlify/Vercel)

**Netlify:**
```bash
# Build frontend
cd frontend
npm run build

# Deploy to Netlify (drag and drop dist folder to netlify.com)
# Or use Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

---

## Option 3: Docker Deployment

### 1. Create Dockerfiles

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/fitquest
    depends_on:
      - mongo
    volumes:
      - ./backend:/app
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
      
  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

---

## Option 4: AWS Deployment

### 1. AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
cd backend
eb init fitquest-api

# Create environment and deploy
eb create production
eb deploy
```

### 2. AWS S3 + CloudFront (Frontend)

```bash
# Build frontend
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

---

## 📊 Database Setup

### MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string
6. Update `MONGODB_URI` in environment variables

### Local MongoDB

```bash
# Install MongoDB
sudo apt install mongodb -y

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongo
use fitquest
db.createUser({
  user: "fitquest_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

---

## 🔒 Security Checklist

### Backend Security
- [ ] Environment variables properly set
- [ ] JWT secret is strong and unique
- [ ] Rate limiting enabled
- [ ] CORS configured for production domains
- [ ] Helmet.js security headers
- [ ] Input validation on all endpoints
- [ ] MongoDB connection secured
- [ ] File upload restrictions

### Frontend Security
- [ ] API endpoints use HTTPS
- [ ] No sensitive data in client-side code
- [ ] Content Security Policy configured
- [ ] XSS protection enabled

### Server Security
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Non-root user for application
- [ ] Regular security updates
- [ ] Log monitoring setup

---

## 📈 Performance Optimization

### Backend Optimization
- [ ] Database indexes created
- [ ] Query optimization
- [ ] Caching implemented (Redis)
- [ ] Compression enabled
- [ ] CDN for file uploads

### Frontend Optimization
- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Bundle size minimized
- [ ] CDN for static assets
- [ ] Service worker for caching

---

## 🔍 Monitoring & Logging

### Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs fitquest-api

# Restart application
pm2 restart fitquest-api
```

### Health Checks

```bash
# Backend health check
curl https://api.yourdomain.com/health

# Frontend health check
curl https://yourdomain.com
```

### Log Management

```javascript
// In production, use structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## 🚨 Troubleshooting

### Common Issues

**Backend won't start:**
- Check environment variables
- Verify MongoDB connection
- Check port availability
- Review error logs

**Frontend build fails:**
- Clear node_modules and reinstall
- Check for TypeScript errors
- Verify environment variables
- Update dependencies

**Database connection issues:**
- Check MongoDB URI format
- Verify database user permissions
- Check network connectivity
- Review firewall settings

### Debug Commands

```bash
# Check application status
pm2 status

# View detailed logs
tail -f /var/log/nginx/error.log

# Test database connection
mongo "your_mongodb_uri"

# Check open ports
netstat -tulpn | grep :5000
```

---

## 📋 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates ready
- [ ] Domain DNS configured
- [ ] Backup strategy in place

### Post-deployment
- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] User registration/login working
- [ ] File uploads functioning
- [ ] Email notifications working
- [ ] Monitoring alerts configured

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend && npm ci
        cd ../frontend && npm ci
    
    - name: Run tests
      run: |
        cd backend && npm test
        cd ../frontend && npm test
    
    - name: Build frontend
      run: cd frontend && npm run build
    
    - name: Deploy to server
      run: |
        # Your deployment script here
```

---

**This deployment guide covers all major deployment scenarios for the FitQuest application. Choose the option that best fits your requirements and budget.**
