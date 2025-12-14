# Netlify Deployment Guide

This guide explains how to deploy the ThatThing Brand Generator to Netlify.

## Prerequisites

- GitHub repository: `justinhartfield/thatthing-on-a-stick`
- Netlify account (free tier works)
- Database (Turso or Neon recommended for serverless)

## Environment Variables

Configure these in Netlify dashboard under **Site settings → Environment variables**:

### Required Variables

```
# Database
DATABASE_URL=your_database_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=your_owner_open_id
OWNER_NAME=Your Name

# AI Services (Manus Forge API)
BUILT_IN_FORGE_API_KEY=your_forge_api_key
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge

# Frontend Variables
VITE_APP_ID=your_app_id
VITE_APP_TITLE=ThatThing Brand Generator
VITE_APP_LOGO=/logo.png
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_OAUTH_PORTAL_URL=https://api.manus.im/oauth
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_analytics_id
```

## Deployment Steps

### 1. Connect Repository to Netlify

1. Log in to [Netlify](https://netlify.com)
2. Click **Add new site → Import an existing project**
3. Choose **GitHub** and authorize Netlify
4. Select repository: `justinhartfield/thatthing-on-a-stick`

### 2. Configure Build Settings

Netlify will auto-detect settings from `netlify.toml`, but verify:

- **Build command**: `pnpm install && pnpm build`
- **Publish directory**: `dist/public`
- **Node version**: 22.13.0

### 3. Add Environment Variables

1. Go to **Site settings → Environment variables**
2. Add all variables listed above
3. For secrets, use Netlify's encrypted storage

### 4. Deploy

1. Click **Deploy site**
2. Wait for build to complete (~3-5 minutes)
3. Your site will be live at `https://[random-name].netlify.app`

### 5. Custom Domain (Optional)

1. Go to **Domain settings**
2. Add your custom domain
3. Follow DNS configuration instructions

## Database Setup

### Option 1: Turso (Recommended)

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create thatthing-brands

# Get connection string
turso db show thatthing-brands --url

# Add to Netlify env vars
DATABASE_URL=libsql://[your-db].turso.io?authToken=[token]
```

### Option 2: Neon

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy connection string
4. Add to Netlify as `DATABASE_URL`

## Post-Deployment

### Run Migrations

After first deployment, run database migrations:

```bash
# Clone repo locally
git clone https://github.com/justinhartfield/thatthing-on-a-stick.git
cd thatthing-on-a-stick

# Install dependencies
pnpm install

# Set DATABASE_URL locally
export DATABASE_URL=your_database_url

# Run migrations
pnpm db:push
```

### Test the Application

1. Visit your Netlify URL
2. Create a test project
3. Verify chat functionality
4. Check concept generation
5. Test PDF export

## Troubleshooting

### Build Fails

- Check Node version is 22.13.0
- Verify all environment variables are set
- Check build logs for specific errors

### Database Connection Errors

- Verify `DATABASE_URL` is correct
- Check database is accessible from Netlify
- Ensure migrations have been run

### LLM/Image Generation Errors

- Verify Forge API keys are set correctly
- Check API quotas and limits
- Review server logs in Netlify Functions

## Continuous Deployment

Netlify automatically deploys when you push to `main` branch:

```bash
git add .
git commit -m "Your changes"
git push github main
```

## Support

For issues, check:
- [Netlify Documentation](https://docs.netlify.com)
- [Project GitHub Issues](https://github.com/justinhartfield/thatthing-on-a-stick/issues)
