const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkRLS() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log("Checking RLS for 'profiles' and 'crews'...");

    // Check if we can see ANY data with anon key (might be empty if no rows, but shouldn't error)
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id').limit(1);
    console.log("Profiles Select:", pError ? `Error: ${pError.message}` : "Success (Data visible or empty)");

    const { data: crews, error: cError } = await supabase.from('crews').select('id').limit(1);
    console.log("Crews Select:", cError ? `Error: ${cError.message}` : "Success (Data visible or empty)");
    
    // Check table info via rpc if possible or just describe
    // Actually, let's just try a join query with an arbitrary ID (likely null)
    const { data: joinData, error: jError } = await supabase
        .from('profiles')
        .select('id, crews!inner(user_id)')
        .limit(1);
    console.log("Join Query:", jError ? `Error: ${jError.message}` : "Success");
}

checkRLS();
