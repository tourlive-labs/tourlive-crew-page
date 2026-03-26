const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkActivities() {
    const { data, error } = await supabase
        .from('profiles')
        .select('full_name, selected_activity')
        .limit(20);
    
    if (error) {
        console.error(error);
        return;
    }

    console.log('--- Profile Activity Dump ---');
    data.forEach(p => {
        console.log(`${p.full_name}: "${p.selected_activity}"`);
    });
    
    const uniqueActivities = Array.from(new Set(data.map(p => p.selected_activity)));
    console.log('\nUnique Activities:', uniqueActivities);
}

checkActivities();
