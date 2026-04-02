# Supabase Setup Instructions

## Step 1: Run the Database Schema

1. Go to your Supabase project: https://kplozjfgkuirepsoibwk.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase_schema.sql`
5. Click **Run** or press `Cmd+Enter`

This will create:
- ✅ `issues` table (gazette metadata)
- ✅ `blocks` table (text blocks with embeddings)
- ✅ Indexes for fast search
- ✅ Full-text search support
- ✅ Row Level Security policies

## Step 2: Get Your Service Role Key

The service role key is needed for data migration (it bypasses RLS).

1. In Supabase, go to **Settings** → **API**
2. Find **Project API keys**
3. Copy the `service_role` key (secret)
4. Add it to `backend/.env`:
   ```
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   ```

⚠️ **Important**: Never commit the service role key to Git!

## Step 3: Verify Setup

Run this query in the SQL Editor to verify:

```sql
SELECT 
  tablename,
  schemaname
FROM pg_tables
WHERE tablename IN ('issues', 'blocks');
```

You should see both tables listed.

## Step 4: Test Connection

Once the schema is created, we'll test the connection with a Python script.

## Next Steps

After setup is complete:
1. Wait for Year 2025 OCR processing to finish
2. Run the migration script to import JSON → Supabase
3. Generate Cohere embeddings
4. Test search queries

## Troubleshooting

**Error: "extension vector does not exist"**
- Go to **Database** → **Extensions**
- Search for "vector"
- Enable the extension

**Error: "permission denied"**
- Make sure you're using the service role key for migrations
- Check RLS policies are correctly set
