const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns() {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'missions' });
    
    if (error) {
        // Fallback: try an ordinary query to see what keys come back
        const { data: row } = await supabase.from('missions').select('*').limit(1).maybeSingle();
        if (row) {
            console.log('Columns found in row:', Object.keys(row));
            return;
        }
        console.error(error);
        return;
    }

    console.log('Columns in missions table:', data);
}

checkColumns();
