# Deployment Guide

This guide covers deploying Grocito to production using free tier services.

## Architecture Overview

| Component | Platform | URL Pattern |
|-----------|----------|-------------|
| User Frontend | Vercel | grocito.vercel.app |
| Admin Frontend | Vercel | grocito-admin.vercel.app |
| Delivery Frontend | Vercel | grocito-delivery.vercel.app |
| Backend API | Render | grocito-api.onrender.com |
| Database | TiDB Cloud | (connection string) |

## Prerequisites

- GitHub account (for CI/CD)
- Vercel account (free)
- Render account (free)
- TiDB Cloud account (free)
- MySQL client installed locally (for migration)

## Step 1: Database Setup (TiDB Cloud)

### 1.1 Create TiDB Cloud Account

1. Go to [tidbcloud.com](https://tidbcloud.com)
2. Sign up with GitHub or email
3. Verify your email

### 1.2 Create Serverless Cluster

1. Click "Create Cluster"
2. Select "Serverless" (free tier)
3. Choose a region close to your users
4. Name it "grocito-db"
5. Set a secure password
6. Click "Create Cluster"
7. Wait for cluster to be ready (~2 minutes)

### 1.3 Get Connection Details

1. Click "Connect" on your cluster
2. Select "General" connection type
3. Note down:
   - Host: `gateway01.us-east-1.prod.aws.tidbcloud.com`
   - Port: `4000`
   - Username: `xxxxxxxx.root`
   - Password: (your password)

### 1.4 Migrate Data from Local MySQL

Export your local database:
```bash
mysqldump -h localhost -u root -p --single-transaction grocito_db > grocito_backup.sql
```

Import to TiDB:
```bash
mysql -h gateway01.us-east-1.prod.aws.tidbcloud.com -P 4000 -u xxxxxxxx.root -p < grocito_backup.sql
```

## Step 2: Backend Deployment (Render)

### 2.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 2.2 Deploy Backend

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `grocito-api`
   - Root Directory: `backend`
   - Environment: `Docker`
   - Branch: `main`

### 2.3 Set Environment Variables

In Render dashboard, add these environment variables:

| Variable | Value |
|----------|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://gateway01.us-east-1.prod.aws.tidbcloud.com:4000/grocito_db?sslMode=VERIFY_IDENTITY` |
| `SPRING_DATASOURCE_USERNAME` | `xxxxxxxx.root` |
| `SPRING_DATASOURCE_PASSWORD` | `(your TiDB password)` |
| `JWT_SECRET` | `(generate a random 32+ char string)` |
| `CORS_ALLOWED_ORIGINS` | `https://grocito.vercel.app,https://grocito-admin.vercel.app,https://grocito-delivery.vercel.app` |

### 2.4 Deploy

Click "Create Web Service" and wait for deployment.

Your backend will be available at: `https://grocito-api.onrender.com`

## Step 3: Frontend Deployment (Vercel)

### 3.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 3.2 Deploy User Frontend

1. Click "Add New" → "Project"
2. Import your GitHub repository
3. Configure:
   - Framework Preset: `Create React App`
   - Root Directory: `frontend/user`
4. Add Environment Variable:
   - `REACT_APP_API_URL` = `https://grocito-api.onrender.com`
5. Click "Deploy"

### 3.3 Deploy Admin Frontend

Repeat the process:
1. Click "Add New" → "Project"
2. Same repository, Root Directory: `frontend/admin`
3. Environment: `REACT_APP_API_URL` = `https://grocito-api.onrender.com`
4. Deploy

### 3.4 Deploy Delivery Partner Frontend

Repeat the process:
1. Click "Add New" → "Project"
2. Same repository, Root Directory: `frontend/delivery-partner`
3. Environment: `REACT_APP_API_URL` = `https://grocito-api.onrender.com`
4. Deploy

## Step 4: Update CORS (After Frontend Deployment)

After all frontends are deployed, update the `CORS_ALLOWED_ORIGINS` in Render with actual Vercel URLs.

## Step 5: Custom Domains (Optional)

### Vercel Custom Domains

1. Go to your Vercel project
2. Settings → Domains
3. Add your domain (e.g., `grocito.com`)
4. Update DNS records as instructed

### Render Custom Domain

1. Go to your Render service
2. Settings → Custom Domain
3. Add domain (e.g., `api.grocito.com`)
4. Update DNS records

## Troubleshooting

### Backend not connecting to database

- Check TiDB Cloud connection string
- Ensure SSL mode is set correctly
- Verify username/password

### Frontend API calls failing

- Check CORS origins in backend
- Verify API URL in frontend environment
- Check browser console for errors

### Build failures

- Check build logs in Vercel/Render
- Ensure all dependencies are in package.json/pom.xml

## Monitoring

### Render

- View logs in Render dashboard
- Set up health check alerts

### Vercel

- View deployment logs
- Check Analytics tab

### TiDB Cloud

- Monitor storage usage
- View slow query logs

## Cost Summary

| Service | Free Tier Limit | Cost After |
|---------|-----------------|------------|
| Vercel | 100GB bandwidth/month | $20/month |
| Render | 750 hours/month, sleeps after 15min | $7/month |
| TiDB Cloud | 5GB storage, 50M requests | ~$0.30/GB |

Total starting cost: **$0/month**
