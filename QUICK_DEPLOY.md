# ⚡ Quick Deployment Checklist

## Before You Start
- [ ] MongoDB Atlas account created
- [ ] GitHub account created
- [ ] Vercel account created (sign up with GitHub)

## Step 1: Push to GitHub (5 minutes)
```bash
cd "V:\Documents\VS Code\bca-project"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 2: Generate JWT Secret (1 minute)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**Save this secret!** You'll need it in Step 3.

## Step 3: Deploy on Vercel (10 minutes)

### Go to: https://vercel.com
1. Click "Add New Project"
2. Import your GitHub repository
3. Configure:
   - Framework: **Other**
   - Build Command: `npm run build`
   - Output Directory: `frontend/build`

4. **Add Environment Variables:**
   ```
   MONGODB_URI = mongodb+srv://vaibhavgalat123_db_user:vaibhav123@cluster0.qktfjzs.mongodb.net/farmtrade?retryWrites=true&w=1
   JWT_SECRET = [YOUR_GENERATED_SECRET]
   NODE_ENV = production
   REACT_APP_API_URL = /api
   ```

5. Click **"Deploy"**

## Step 4: Configure MongoDB Atlas (5 minutes)
1. Go to: https://cloud.mongodb.com
2. Navigate to: **Network Access**
3. Click: **"Add IP Address"**
4. Select: **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click: **"Confirm"**

## Step 5: Test Your Deployment (5 minutes)
- [ ] Visit your Vercel URL
- [ ] Test signup/login
- [ ] Test product listing
- [ ] Test cart functionality

## 🎉 Done!

Your app is live at: `https://your-project.vercel.app`

---

## 🆘 Quick Fixes

**Can't connect to database?**
→ Check MongoDB Network Access allows 0.0.0.0/0

**CORS errors?**
→ Add your Vercel URL to CORS in backend/server.js

**Build fails?**
→ Check Vercel deployment logs for errors

---

## 📱 Share Your App
Once deployed, share this URL with users:
`https://your-project.vercel.app`

## 🔄 Update Your App
Just push to GitHub - Vercel auto-deploys:
```bash
git add .
git commit -m "Update"
git push
```
