const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function deploySql() {
    console.log('Deploying SQL updates...');

    // 1. Add batch column to profiles
    const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS batch TEXT;`
    });
    
    // If rpc('exec_sql') is not available, we have to do it differently.
    // Let's assume for now I should use a migration-like approach or hope for the best.
    // Actually, I can use the SQL editor in my mind, but here I'll use a script.
    
    if (alterError) {
        console.warn('exec_sql failed, trying direct query if possible or documenting failure:', alterError);
    } else {
        console.log('Batch column added successfully.');
    }

    // Since I don't know if rpc('exec_sql') exists, I'll try to update profiles directly
    // and see if it fails. If it fails, I'll know the column is missing.
    // But wait, I have a better way. I can use the 'supabase' client to upsert.
}

// Better approach: Use a script that uses the postgres connection if possible, 
// but I only have the service role key.
// I'll use a simpler approach: I'll try to update a record with 'batch' field.
// If it fails, I'll know I need to ask the user to run SQL or find another way.

async function updateSchema() {
    console.log('Updating is_admin function and Batch column...');
    
    // Query to update is_admin and add column
    const sql = `
    -- 1. Add batch column
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS batch TEXT;

    -- 2. Update is_admin function
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS BOOLEAN AS $$
    BEGIN
      RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' 
             OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'root@tourlive.co.kr';
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 3. Set default batch for existing records
    UPDATE public.profiles SET batch = '14기' WHERE batch IS NULL;
    `;

    // I'll use a hack: I'll create a temporary function that executes text and then drop it.
    // Or I'll just try to run it via a simple RPC if the user has one.
    // Alternatively, I'll just proceed with the code changes and tell the user to run the SQL if I can't.
    
    // Wait, I can use the 'supabase' client to perform the UPDATE for batch.
    const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id, batch');
    
    if (fetchError) {
        console.error('Error fetching profiles:', fetchError);
        return;
    }

    console.log(`Found ${profiles.length} profiles.`);
    
    // If 'batch' is missing in the select, it will error or be undefined.
    // I'll try to update one record to see if the column exists.
    if (profiles.length > 0) {
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ batch: '14기' })
            .eq('id', profiles[0].id);
        
        if (updateError && updateError.message.includes('column "batch" of relation "profiles" does not exist')) {
            console.error('CRITICAL: Batch column is missing. Please run the following SQL in your Supabase SQL Editor:\n');
            console.log(sql);
        } else if (updateError) {
            console.error('Update error:', updateError);
        } else {
            console.log('Batch column confirmed. Updating all records to 14기...');
            const { error: bulkError } = await supabase
                .from('profiles')
                .update({ batch: '14기' })
                .is('batch', null);
            if (bulkError) console.error('Bulk update error:', bulkError);
            else console.log('All existing profiles updated to 14기.');
        }
    }
}

updateSchema();
