# 🚀 Deployment Guide

Complete guide to deploy Streamify to production.

## 📋 Prerequisites

- Node.js 18+ installed
- Git repository
- GitHub account (for CI/CD)
- Domain name (optional)
- MongoDB Atlas account OR PostgreSQL database (for production persistence)

---

## 🎯 Deployment Options

### Option 1: Quick Deploy (Recommended for Testing)

**Frontend:** Vercel  
**Backend:** Railway  
**Database:** MongoDB Atlas Free Tier  
**Cost:** $0/month

### Option 2: Production Deploy

**Frontend:** Vercel/Netlify  
**Backend:** AWS/DigitalOcean/Heroku  
**Database:** MongoDB Atlas/PostgreSQL  
**CDN:** Cloudflare  
**Cost:** $10-50/month

---

## 🔧 Environment Setup

### Backend Environment Variables

Create `.env` file in `src/backend/`:

```env
# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-too

# Database (choose one)
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/streamify

# OR PostgreSQL
DATABASE_URL=postgresql://username:password@host:5432/streamify

# CORS (your frontend URL)
FRONTEND_URL=https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cache
CACHE_TTL_SECONDS=3600

# Optional: Analytics
SENTRY_DSN=your-sentry-dsn
```

### Frontend Environment Variables

Create `.env` file in root:

```env
VITE_API_URL=https://your-backend.railway.app
VITE_APP_NAME=Streamify
```

---

## 🚂 Railway Deployment (Backend)

### Step 1: Prepare Backend

```bash
cd src/backend

# Create railway.json
cat > railway.json << EOF
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# Update package.json scripts
```

Add to `package.json`:
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "tsx watch server.ts"
  }
}
```

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select `src/backend` as root directory
6. Add environment variables from `.env`
7. Click "Deploy"

Railway will automatically:
- Install dependencies
- Build TypeScript
- Start the server
- Provide a public URL

### Step 3: Configure Domain (Optional)

1. Go to project settings
2. Click "Add Custom Domain"
3. Add your domain: `api.yourdomain.com`
4. Update DNS records as shown

---

## 🔷 Vercel Deployment (Frontend)

### Step 1: Prepare Frontend

```bash
# In project root
npm install

# Update vite.config.ts
```

Ensure `vite.config.ts` has:
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

### Step 2: Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: Vite
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables:
   - `VITE_API_URL`: Your Railway backend URL
6. Click "Deploy"

### Step 3: Configure Domain (Optional)

1. Go to project settings
2. Click "Domains"
3. Add your domain: `yourdomain.com`
4. Update DNS records

---

## 🍃 MongoDB Atlas Setup

### Step 1: Create Cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create free cluster (M0)
4. Choose closest region

### Step 2: Configure Access

1. **Database Access:**
   - Create user with password
   - Grant "Read and write to any database"

2. **Network Access:**
   - Add IP: `0.0.0.0/0` (allow all) for Railway
   - Or add Railway's static IP

3. **Get Connection String:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/streamify?retryWrites=true&w=majority
   ```

### Step 3: Update Backend

Add to Railway environment variables:
```
MONGODB_URI=mongodb+srv://...
```

---

## 🐳 Docker Deployment

### Backend Dockerfile

Create `src/backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### Frontend Dockerfile

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./src/backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - JWT_SECRET=${JWT_SECRET}
      - MONGODB_URI=${MONGODB_URI}
    depends_on:
      - mongo

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

volumes:
  mongo-data:
```

**Deploy:**
```bash
docker-compose up -d
```

---

## ⚙️ CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Setup Secrets:**
1. Go to GitHub repo → Settings → Secrets
2. Add:
   - `RAILWAY_TOKEN`: From Railway dashboard
   - `VERCEL_TOKEN`: From Vercel settings
   - `VERCEL_ORG_ID`: From Vercel project settings
   - `VERCEL_PROJECT_ID`: From Vercel project settings

---

## 🔒 Security Checklist

### Before Production

- [ ] Change all default secrets/passwords
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set up CORS properly (whitelist only your frontend)
- [ ] Enable rate limiting
- [ ] Set up error tracking (Sentry)
- [ ] Enable database backups
- [ ] Add security headers
- [ ] Implement CSP (Content Security Policy)
- [ ] Set up monitoring/alerts
- [ ] Review all API endpoints for auth
- [ ] Test with realistic data volumes

### Recommended Headers

Add to backend `server.ts`:
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));
```

---

## 📊 Monitoring

### Sentry Setup

```bash
npm install @sentry/node @sentry/tracing
```

Add to `server.ts`:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### LogDNA/Datadog

Add logging:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## 🧪 Testing Before Deploy

```bash
# Backend
cd src/backend
npm run build
npm start

# Frontend
npm run build
npm run preview

# Load testing
npm install -g artillery
artillery quick --count 10 --num 50 http://localhost:3001/api/music/trending
```

---

## 🚀 Production Checklist

### Pre-Deploy
- [ ] All tests passing
- [ ] Build succeeds without errors
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] Frontend connects to backend
- [ ] CORS configured correctly

### Post-Deploy
- [ ] Health check endpoint working
- [ ] Database connected
- [ ] Authentication working
- [ ] API requests succeeding
- [ ] Frontend assets loading
- [ ] Error tracking configured
- [ ] Monitoring active
- [ ] Backups scheduled

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check logs
railway logs

# Verify environment variables
railway variables

# Check build
railway run npm run build
```

### Frontend Build Fails
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build

# Check environment variables
vercel env ls
```

### Database Connection Failed
- Verify connection string
- Check IP whitelist (0.0.0.0/0 for Railway)
- Ensure database user has correct permissions

### CORS Errors
Update backend CORS config:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

## 📈 Scaling

### Horizontal Scaling (Multiple Instances)

**Railway:**
- Go to Settings → Deployments
- Increase replicas to 2-5

**Load Balancer:**
- Railway provides automatic load balancing

### Caching

Add Redis for caching:
```bash
npm install redis
```

```typescript
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

await redis.connect();
```

### CDN for Assets

Use Cloudflare:
1. Add site to Cloudflare
2. Update nameservers
3. Enable caching rules
4. Enable Brotli compression

---

## 💰 Cost Estimation

### Free Tier (MVP)
- Vercel: Free (Hobby)
- Railway: $5/month ($500 free credits)
- MongoDB Atlas: Free (M0)
- **Total: $0-5/month**

### Production (10K users)
- Vercel: $20/month (Pro)
- Railway: $20/month
- MongoDB Atlas: $57/month (M10)
- Cloudflare: Free
- Sentry: $26/month
- **Total: $123/month**

### Enterprise (100K+ users)
- Vercel: $150/month (Enterprise)
- AWS/DO: $100-500/month
- MongoDB Atlas: $300/month
- Cloudflare: $20/month
- Monitoring: $50/month
- **Total: $620-1020/month**

---

## 🎉 Launch Day

1. **Soft Launch:**
   - Deploy to production
   - Share with small group (10-50 users)
   - Monitor for issues
   - Fix critical bugs

2. **Public Launch:**
   - Ensure all systems stable
   - Prepare support channels
   - Monitor traffic/errors closely
   - Be ready to scale

3. **Post-Launch:**
   - Gather user feedback
   - Monitor performance metrics
   - Plan feature updates
   - Optimize based on data

---

## 📞 Support

Need help deploying? Check:
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)

---

**🎵 Your music streaming app is now ready for the world! 🚀**
