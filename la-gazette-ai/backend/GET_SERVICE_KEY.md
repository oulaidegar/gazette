# How to Get the Correct Supabase Service Role Key

The service role key in your `.env` file appears incomplete. Here's how to get the correct one:

## Current Issue
Your `.env` has:
```
SUPABASE_SERVICE_KEY=sb_secret_pj1cJcanTYhITX8KIYq53Q_kDt6fz09
```

This is only 47 characters, but the real service role key should be **200+ characters** long.

## Steps to Get the Correct Key

1. **Go to Supabase Dashboard**
   - Visit: https://kplozjfgkuirepsoibwk.supabase.co
   - Click on **Settings** (gear icon in sidebar)
   - Click on **API**

2. **Find Project API Keys Section**
   - Scroll down to "Project API keys"
   - You'll see two keys:
     - `anon` / `public` - This is what you already have ✅
     - `service_role` - This is what you need ⚠️

3. **Copy the Service Role Key**
   - The `service_role` key is hidden by default
   - Click the **eye icon** 👁️ to reveal it
   - Click the **copy icon** 📋 to copy the ENTIRE key
   - The key should look like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwbG96amZna3VpcmVwc29pYndrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0MjU4NjQwMCwiZXhwIjoxOTU4MTYyNDAwfQ.VERY_LONG_STRING_HERE
```

4. **Update Your .env File**
   - Replace the entire `SUPABASE_SERVICE_KEY` line with the new key
   - Make sure there are NO spaces or line breaks in the key

## What the Key Should Look Like

✅ **Correct** (200+ characters, starts with `eyJ`):
```
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwbG96amZna3VpcmVwc29pYndrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0MjU4NjQwMCwiZXhwIjoxOTU4MTYyNDAwfQ.VERY_LONG_STRING_HERE
```

❌ **Incorrect** (too short, starts with `sb_secret`):
```
SUPABASE_SERVICE_KEY=sb_secret_pj1cJcanTYhITX8KIYq53Q_kDt6fz09
```

## After Updating

Once you paste the correct key, save the file and I'll run the test migration again!
