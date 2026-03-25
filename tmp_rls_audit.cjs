const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function inspectPolicies() {
    // We use the service role to inspect system catalogs
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log("Inspecting RLS Policies in the DB...");

    const { data: policies, error } = await admin.rpc('get_policies_via_sql', { });
    
    // If we don't have an RPC, we can try to join with pg_catalog (usually not exposed via PostgREST)
    // Actually, I'll try to use a simple 'select' on an existing table that might store this.
    
    // Better: I'll use a hack to see if RLS is ENABLED or DISABLED on these tables.
    const { data: crews, error: cError } = await admin.from('crews').select('*').limit(1);
    console.log(`Crews row count (Admin): ${crews?.length || 0}`);
}

async function verifyWithAnon() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data, error } = await supabase.from('crews').select('id').limit(1);
    console.log(`Crews row count (Anon): ${data?.length || 0}`);
    if (error) console.log(`Anon Select Error: ${error.message}`);
}

inspectPolicies();
verifyWithAnon();
