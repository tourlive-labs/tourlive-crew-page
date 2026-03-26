const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('Checking missions table columns...');
    const { data, error } = await supabase
        .from('missions')
        .select('*')
        .limit(1);
    
    if (data && data.length > 0) {
        console.log('Columns in missions:', Object.keys(data[0]));
        if (!Object.keys(data[0]).includes('rejection_reason')) {
            console.log('MISSING: rejection_reason in missions');
        }
    }
    
    console.log('Checking side_missions table columns...');
    const { data: data2 } = await supabase
        .from('side_missions')
        .select('*')
        .limit(1);
    
    if (data2 && data2.length > 0) {
        console.log('Columns in side_missions:', Object.keys(data2[0]));
        if (!Object.keys(data2[0]).includes('rejection_reason')) {
            console.log('MISSING: rejection_reason in side_missions');
        }
    }
}

run();
