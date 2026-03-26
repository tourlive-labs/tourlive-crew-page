const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('Creating point_settlements table...');
    const sql = `
    CREATE TABLE IF NOT EXISTS public.point_settlements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      mission_id UUID,
      amount INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    `;
    
    // Attempt exec_sql
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
        console.error('exec_sql failed:', error.message);
        // Attempt run_sql
        const { error: e2 } = await supabase.rpc('run_sql', { sql });
        if (e2) {
            console.error('run_sql also failed:', e2.message);
            console.log('CRITICAL: Manual SQL execution required in Supabase Editor.');
            console.log(sql);
        } else {
            console.log('Table created via run_sql.');
        }
    } else {
        console.log('Table created via exec_sql.');
    }
}

run();
