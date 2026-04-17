# 🚀 Vercel Deployment Guide for BCA Project (FarmTrade)

## ✅ Pre-Deployment Checklist

Your project is READY for deployment! Follow these steps carefully.

---

## 📦 Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)
```bash
cd "V:\Documents\VS Code\bca-project"
git init
```

### 1.2 Add All Files
```bash
git add .
```

### 1.3 Commit Your Code
```bash
git commit -m "Initial commit - Ready for Vercel deployment"
```

### 1.4 Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository named `bca-project` or `farmtrade`
3. **DO NOT** initialize with README (you already have code)

### 1.5 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## 🔐 Step 2: Secure Your Environment Variables

### ⚠️ IMPORTANT: Update Your JWT Secret

Before deploying, generate a strong JWT secret:

**Option 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Using PowerShell**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

Save this secret - you'll need it for Vercel!

---

## 🌐 Step 3: Deploy to Vercel

### Method 1: Using Vercel Dashboard (RECOMMENDED)

#### 3.1 Sign Up / Login
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)

#### 3.2 Import Your Project
1. Click **"Add New Project"**
2. Click **"Import Git Repository"**
3. Select your `bca-project` repository
4. Click **"Import"**

#### 3.3 Configure Project Settings

**Framework Preset**: Other

**Root Directory**: `./` (leave as root)

**Build Settings**:
- Build Command: `npm run build`
- Output Directory: `frontend/build`
- Install Command: `npm install`

#### 3.4 Add Environment Variables (CRITICAL!)

Click **"Environment Variables"** and add these:

**For Production:**
```
MONGODB_URI = mongodb+srv://vaibhavgalat123_db_user:vaibhav123@cluster0.qktfjzs.mongodb.net/farmtrade?retryWrites=true&w=1

JWT_SECRET = [PASTE YOUR GENERATED SECRET HERE]

NODE_ENV = production

REACT_APP_API_URL = /api
```

**⚠️ SECURITY NOTE**: 
- Change your MongoDB password after deployment
- Use a strong JWT secret (generated in Step 2)
- Never share these values publicly

#### 3.5 Deploy
1. Click **"Deploy"**
2. Wait 2-5 minutes for deployment
3. You'll get a URL like: `https://your-project.vercel.app`

---

### Method 2: Using Vercel CLI

#### 3.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 3.2 Login
```bash
vercel login
```

#### 3.3 Deploy
```bash
cd "V:\Documents\VS Code\bca-project"
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **bca-project**
- In which directory is your code? **.**

#### 3.4 Add Environment Variables
```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add NODE_ENV
vercel env add REACT_APP_API_URL
```

#### 3.5 Deploy to Production
```bash
vercel --prod
```

---

## 🔧 Step 4: Post-Deployment Configuration

### 4.1 Update CORS in Backend (if needed)

If you face CORS errors, update `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-project.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

### 4.2 Test Your Deployment

1. **Frontend**: Visit `https://your-project.vercel.app`
2. **Backend API**: Visit `https://your-project.vercel.app/api`
3. **Test Login/Signup**: Create a test account
4. **Test Product Listing**: Try adding a product

---

## 🎯 Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain
1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your domain (e.g., `farmtrade.com`)
4. Follow DNS configuration instructions

### 5.2 Update Environment Variables
Add your custom domain to CORS settings

---

## 🐛 Troubleshooting

### Issue 1: "Cannot connect to server"
**Solution**: Check if environment variables are set correctly in Vercel dashboard

### Issue 2: "Database connection failed"
**Solution**: 
- Verify MongoDB URI is correct
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Go to MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere

### Issue 3: "Invalid token" errors
**Solution**: Make sure JWT_SECRET is the same in Vercel environment variables

### Issue 4: CORS errors
**Solution**: Update CORS configuration in `backend/server.js` to include your Vercel URL

### Issue 5: Build fails
**Solution**: 
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Try building locally first: `cd frontend && npm run build`

---

## 📊 Monitoring Your Deployment

### Vercel Dashboard
- **Analytics**: View traffic and performance
- **Logs**: Check function logs for errors
- **Deployments**: View deployment history

### MongoDB Atlas
- **Metrics**: Monitor database usage
- **Alerts**: Set up alerts for issues

---

## 🔄 Updating Your Deployment

### Automatic Deployments
Every time you push to GitHub, Vercel will automatically deploy:

```bash
git add .
git commit -m "Update: description of changes"
git push
```

### Manual Deployment
```bash
vercel --prod
```

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Login/Signup works
- [ ] Product listing works
- [ ] MongoDB connection successful

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables
4. Check MongoDB Atlas connection

---

## 🔒 Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use strong JWT secrets (32+ characters)
3. ✅ Change default MongoDB password
4. ✅ Enable MongoDB IP whitelist
5. ✅ Use HTTPS only (Vercel provides this automatically)
6. ✅ Regularly update dependencies

---

## 📝 Important URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **GitHub Repository**: https://github.com/YOUR_USERNAME/YOUR_REPO_NAME
- **Your Deployed App**: https://your-project.vercel.app

---

## 🎓 Next Steps After Deployment

1. Test all features thoroughly
2. Share the URL with users
3. Monitor performance and errors
4. Set up custom domain (optional)
5. Add analytics (Google Analytics, etc.)
6. Set up error tracking (Sentry, etc.)

---

**Good Luck with Your Deployment! 🚀**
