# FanHub 26 — Vercel Deployment Guide

## 🚀 Quick Deploy

### Option 1: Deploy with Mock Provider (Default, Works Immediately)

This is the **easiest option** — no API keys required!

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Environment Variables** (leave empty or skip)
   - No environment variables needed for mock provider
   - Mock provider is the default fallback

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live! ✅

**The app will work immediately with realistic mock AI responses.**

---

### Option 2: Deploy with Google Gemini (Real AI)

For production use with actual Gemini API responses:

1. **Get Gemini API Key**
   - Go to [Google AI Studio](https://aistudio.google.com)
   - Create a new API key (free tier available)
   - Copy the key

2. **Set Environment Variables in Vercel**
   - In Vercel project settings → "Environment Variables"
   - Add two variables:
     ```
     GENAI_PROVIDER = gemini
     GEMINI_API_KEY = <your-api-key-here>
     ```
   - Select "Production" scope
   - Save

3. **Redeploy**
   - Any commit will trigger a new deploy with Gemini enabled
   - Or manually trigger from Vercel dashboard

**The app will now use real Google Gemini for all AI responses.**

---

## ✅ Deployment Checklist

- [ ] Code committed to GitHub
- [ ] Repository connected to Vercel
- [ ] Build succeeds (visible in Vercel logs)
- [ ] No "500 error" on chat endpoint
- [ ] Can ask questions in /fan or /staff
- [ ] (Optional) Gemini API key configured if using real provider

---

## 🐛 Troubleshooting

### Issue: 500 Error on `/api/chat`

**Solution:**
The app defaults to using the **mock provider** which requires no configuration. If you see a 500 error, it means the provider factory isn't handling the error gracefully.

**Fix:**
Ensure `GENAI_PROVIDER` environment variable is **not** set to `gemini` without a valid `GEMINI_API_KEY`.

**Verify:**
1. In Vercel → Settings → Environment Variables
2. Check that `GENAI_PROVIDER` is either:
   - Not set (defaults to `mock` ✅)
   - Set to `gemini` AND `GEMINI_API_KEY` is provided ✅

### Issue: "Gemini provider is not configured"

**This is expected!** It means:
- `GENAI_PROVIDER=gemini` is set
- `GEMINI_API_KEY` is missing or empty

**Solution:**
1. Remove `GENAI_PROVIDER=gemini` from environment variables, OR
2. Add a valid `GEMINI_API_KEY`

The app will automatically fall back to the mock provider.

### Issue: Build fails with TypeScript errors

**Solution:**
Run locally to verify:
```bash
npm install
npm run build
npm test
```

If build succeeds locally but fails on Vercel, check:
- Node version (Vercel uses v20 by default, which is compatible)
- All environment variables are set correctly
- No circular dependencies in imports

---

## 📊 Monitoring

### View Logs
1. Vercel Dashboard → Select Project
2. Click "Deployments"
3. Select latest deployment
4. Click "Logs" tab
5. Search for error messages

### Common Log Messages (Normal)
```
[GeminiProvider] GEMINI_API_KEY not configured. Provider will not function.
[Provider Factory] Gemini not configured, using mock provider
```
These are **warnings**, not errors. The app falls back to mock successfully.

### Actual Error (Fix Required)
```
Error: Cannot find module '@/lib/genai/types'
```
This indicates a build/compilation error. Check TypeScript config and imports.

---

## 🔒 Security Notes

### API Keys
- **Never commit API keys to GitHub**
- Use Vercel's Environment Variables feature
- For development: use `.env.local` (already in `.gitignore`)

### CORS & Rate Limiting
- All requests go through Next.js middleware
- Rate limiting enabled (10 requests per 10 seconds per IP)
- CORS headers applied to all responses
- XSS protection via Content Security Policy

---

## 🎯 What Works Out of the Box

✅ Fan Portal (`/fan`)
- AI concierge chat
- Stadium selector
- Language selector (8 languages)
- Green sustainability score
- Interactive stadium map
- AI reasoning display

✅ Staff Dashboard (`/staff`)
- Operational AI assistant
- Real-time crowd pulse
- Alert feed
- Stadium selector
- AI reasoning display

✅ Landing Page (`/`)
- Role selector (Fan / Staff)
- Stadium quick-select

✅ API Endpoints
- `/api/chat` — GenAI chat endpoint
- `/api/crowd` — Crowd density data

---

## 📈 Next Steps

1. **Monitor Performance**
   - Check Vercel Analytics
   - Track API response times
   - Monitor error rates

2. **Gather Feedback**
   - Let users test the demo
   - Collect usage metrics
   - Iterate based on feedback

3. **Scale**
   - Consider caching responses
   - Add WebSocket for real-time updates
   - Optimize images with next/image

4. **Integrate Real Data**
   - Connect to actual crowd sensors
   - Live match data from FIFA API
   - Real-time transit information

---

## 🎓 Testing the Deployment

### 1. Test Basic Functionality
```bash
# Visit the deployed URL
https://your-project.vercel.app

# Test Fan Portal
1. Click "⚽ I'm a Fan"
2. Select a stadium
3. Ask "Where's the food?"
4. Verify response appears

# Test Staff Dashboard
1. Click "👥 I'm Staff"
2. Select a stadium
3. Ask "Gate flow analysis?"
4. Verify operational response
```

### 2. Test AI Reasoning (Jury Feature)
```bash
1. On /fan or /staff page
2. Click "🧠 Show Reasoning"
3. Ask a question
4. Observe:
   - Detected category (navigation, food, etc.)
   - AI reasoning explaining the choice
   - Structured JSON data
```

### 3. Test Multi-Language
```bash
1. Go to /fan
2. Select "Español" from language dropdown
3. Ask in Spanish: "¿Dónde está la comida?"
4. Verify response is in Spanish
```

---

## 📞 Support

If deployment fails:

1. **Check Vercel Logs** — most errors are logged there
2. **Verify Environment Variables** — common issue
3. **Run Local Build** — reproduce the issue locally
4. **Check Browser Console** — frontend errors visible there
5. **Review Code Changes** — any recent changes to error handling?

---

## 🎉 Success!

Once deployed, your FanHub 26 app will be:
- ✅ Accessible to the jury 24/7
- ✅ Running on a global CDN
- ✅ With automatic HTTPS
- ✅ Zero-downtime deployments
- ✅ Production-grade scalability

**Everything works out of the box — no additional setup required!**
