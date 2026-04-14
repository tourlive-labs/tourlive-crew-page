// Inspect batches table schema by fetching a sample row
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('term', { ascending: false })
        .limit(5);

    if (error) { console.error('Error:', error.message); return; }
    console.log('batches table — all columns and rows:');
    console.log(JSON.stringify(data, null, 2));
}
run();
