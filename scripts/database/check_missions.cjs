const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkMissionStatuses() {
    const { data, error } = await supabase
        .from('missions')
        .select('status, admin_feedback')
        .limit(10);
    
    if (error) {
        console.error(error);
        return;
    }

    console.log('--- Mission Status Dump ---');
    data.forEach((m, i) => {
        console.log(`Mission ${i}: status="${m.status}", feedback="${m.admin_feedback || 'null'}"`);
    });
}

checkMissionStatuses();
