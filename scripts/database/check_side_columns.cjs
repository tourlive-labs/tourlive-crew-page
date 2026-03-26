const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns() {
    const { data: row } = await supabase.from('side_missions').select('*').limit(1).maybeSingle();
    if (row) {
        console.log('Columns found in side_missions:', Object.keys(row));
    } else {
        console.log('No side_missions found or table empty.');
    }
}

checkColumns();
