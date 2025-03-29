import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qiuatdlngbcduxsbxeze.supabase.co'; // replace with yours
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdWF0ZGxuZ2JjZHV4c2J4ZXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDgxNzMsImV4cCI6MjA1ODc4NDE3M30.41vuCv5NXV29CcMxI_XPRZJI1FfzoF-yS6yzmKQVDmY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
