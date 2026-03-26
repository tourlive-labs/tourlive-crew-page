const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function finalAudit() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log("Final Audit: Profiles Visibility...");

    // Create a temporary profile linked to an existing crew (or a new one)
    const { data: batch } = await admin.from('batches').select('id').limit(1).single();
    const { data: crew } = await admin.from('crews').insert({ user_id: '00000000-0000-0000-0000-000000000000', batch_id: batch.id, name: 'Audit' }).select('id').single();
    
    await admin.from('profiles').insert({
        crew_id: crew.id,
        full_name: 'Audit User',
        tourlive_email: 'audit@test.com',
        selected_activity: 'none',
        nickname: 'audit' + Date.now(),
        phone_number: '000',
        contact_email: 'audit@test.com'
    });

    const { data: anonProfile } = await supabase.from('profiles').select('*').eq('crew_id', crew.id).maybeSingle();
    console.log(`Profiles visibility (Anon): ${anonProfile ? 'Visible' : 'HIDDEN'}`);

    // Cleanup
    await admin.from('profiles').delete().eq('crew_id', crew.id);
    await admin.from('crews').delete().eq('id', crew.id);
}

finalAudit();
