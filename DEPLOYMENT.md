# Complete Deployment Guide

## Overview
This guide will help you deploy both the frontend and backend of your NeelState application to Render.

## Prerequisites
- Render account
- MongoDB Atlas database
- Stripe account
- Mapbox account
- Firebase project

## Step 1: Deploy Backend API

### 1.1 Create Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `neelstate-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `api`

### 1.2 Set Environment Variables
Add these environment variables in Render:
```
NODE_ENV=production
PORT=10000
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/neelstate?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

### 1.3 Deploy
Click "Create Web Service" and wait for deployment to complete.

### 1.4 Test API
Your API will be available at: `https://your-api-name.onrender.com`

Test the health endpoint:
```bash
curl https://your-api-name.onrender.com/api/health
```

## Step 2: Deploy Frontend

### 2.1 Create Static Site on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `neelstate-client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Root Directory**: `client`

### 2.2 Set Environment Variables
Add these environment variables in Render:
```
VITE_API_URL=https://your-api-name.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
```

### 2.3 Deploy
Click "Create Static Site" and wait for deployment to complete.

## Step 3: Environment Setup

### 3.1 MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Replace `username`, `password`, and `cluster` in the connection string

### 3.2 Stripe
1. Create a Stripe account
2. Get your API keys from Dashboard → Developers → API Keys
3. Use test keys for development

### 3.3 Mapbox
1. Create a Mapbox account
2. Get your access token from Account → Access Tokens

### 3.4 Firebase
1. Create a Firebase project
2. Get your API key from Project Settings → General

## Step 4: Testing

### 4.1 Test Backend
```bash
# Health check
curl https://your-api-name.onrender.com/api/health

# Test listings endpoint
curl https://your-api-name.onrender.com/api/listing/get
```

### 4.2 Test Frontend
1. Visit your frontend URL
2. Test user registration/login
3. Test listing creation
4. Test payment flow (with test cards)

## Troubleshooting

### Common Issues

1. **API 404 Errors**
   - Check if backend is deployed and running
   - Verify API URL in frontend environment variables
   - Check Render logs for backend errors

2. **Database Connection Issues**
   - Verify MongoDB URL is correct
   - Check if MongoDB Atlas IP whitelist includes Render IPs
   - Ensure database user has correct permissions

3. **Build Failures**
   - Check if all dependencies are in package.json
   - Verify Node.js version (use 16+)
   - Check build logs in Render

4. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Restart services after changing environment variables

### Useful Commands

Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Test MongoDB Connection:
```bash
mongosh "your_mongodb_connection_string"
```

## Final URLs

After deployment, you'll have:
- **Frontend**: `https://your-frontend-name.onrender.com`
- **Backend**: `https://your-backend-name.onrender.com`

## Support

If you encounter issues:
1. Check Render logs for both services
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check browser console for frontend errors 