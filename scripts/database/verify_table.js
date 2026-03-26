const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('Checking point_settlements table...');
    const { data, error } = await supabase
        .from('point_settlements')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error selecting from point_settlements:', error.message);
        if (error.message.includes('does not exist')) {
            console.log('CRITICAL: The point_settlements table DOES NOT EXIST.');
        }
    } else {
        console.log('Success: point_settlements table exists.');
        console.log('Data sample:', data);
    }
}

run();
