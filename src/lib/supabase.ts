import { createClient } from '@supabase/supabase-js'

// Supabase-Projekt von BrainFit Kids. Project URL und anon-Schlüssel sind öffentlich (stehen in jeder Web-App);
// geschützt wird über Row Level Security in supabase/schema.sql. Der geheime service_role-Schlüssel gehört nie hierher.
const URL = 'https://zqskietwmexfrwisgrft.supabase.co'
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxc2tpZXR3bWV4ZnJ3aXNncmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzODQxMzYsImV4cCI6MjEwODk2MDEzNn0.uLR_tvZLJw01G8Bpg_dxajikFQ5rlsidegMOOZGXrbI'

export const supabase = createClient(URL, ANON, { auth: { persistSession: true, autoRefreshToken: true } })
