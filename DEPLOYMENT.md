# VaultX Deployment Guide

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **GitHub Repository** - Code pushed to https://github.com/Paintbydre/vaultx
3. **Supabase Database** - PostgreSQL database ready
4. **Cloudflare R2** - Bucket created and credentials ready
5. **Whop App** - App created on Whop dashboard

## Environment Variables Required

Set these in Vercel Project Settings → Environment Variables:

### Database
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
```

### Whop Credentials
```
WHOP_API_KEY=your_api_key
WHOP_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_WHOP_APP_ID=app_xxx
NEXT_PUBLIC_WHOP_AGENT_USER_ID=user_xxx
NEXT_PUBLIC_WHOP_COMPANY_ID=biz_xxx
```

### Cloudflare R2
```
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=vaultx-files
```

### App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Deployment Steps

### 1. Connect to Vercel

1. Go to https://vercel.com/new
2. Import your repository: `Paintbydre/vaultx`
3. Select the repository and click Import

### 2. Configure Build Settings

Vercel should auto-detect Next.js. Verify:
- **Framework Preset:** Next.js
- **Build Command:** `prisma generate && next build`
- **Output Directory:** `.next`
- **Install Command:** `pnpm install`

### 3. Add Environment Variables

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables listed above
3. Select environments: Production, Preview, Development

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Vercel will run:
   - `pnpm install` (installs dependencies)
   - `prisma generate` (generates Prisma Client)
   - `next build` (builds Next.js app)

### 5. Run Database Migration

After first deployment, run migration in Vercel:
1. Go to Project Settings → Functions
2. Or use Vercel CLI:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

## Post-Deployment

### Update Whop App Settings

Go to your Whop App dashboard and update:
- **Base URL:** `https://your-domain.vercel.app`
- **Webhook URL:** `https://your-domain.vercel.app/api/webhooks`

### Update NEXT_PUBLIC_APP_URL

In Vercel environment variables, set:
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

Redeploy after updating.

## Troubleshooting

### Build Fails - Prisma Error
**Solution:** Ensure `postinstall` script is in package.json:
```json
"postinstall": "prisma generate"
```

### Database Connection Error
**Solution:** 
- Verify `DATABASE_URL` is set in Vercel
- Check Supabase connection pooling settings
- Try direct connection string (not pooler)

### R2 Upload Fails
**Solution:**
- Verify all Cloudflare R2 credentials are set
- Check bucket exists and is accessible
- Verify CORS settings on R2 bucket

### Share Links Don't Work
**Solution:**
- Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
- Redeploy after updating

### Missing Dependencies
**Solution:**
- Run `pnpm install` locally
- Commit updated `pnpm-lock.yaml`
- Push to GitHub and redeploy

## Vercel CLI Deployment

Alternatively, deploy using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd /Users/brassfieldventuresllc/WHOP/vaultx
vercel

# Or deploy to production directly
vercel --prod
```

## Health Check

After deployment, test these endpoints:
- `https://your-domain.vercel.app/api/test` - Should return database connection status
- `https://your-domain.vercel.app/dashboard` - Should load dashboard
- `https://your-domain.vercel.app/upload-test.html` - Should show upload form

## Support

If deployment continues to fail, check:
1. Vercel deployment logs
2. Function logs in Vercel dashboard
3. Browser console for errors
4. Network tab for failed API calls

Common fixes:
- Clear build cache in Vercel
- Redeploy with fresh build
- Check all environment variables are set
- Verify database is accessible from Vercel's region

