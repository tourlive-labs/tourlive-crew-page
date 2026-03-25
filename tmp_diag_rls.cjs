const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function diagnose() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const testEmail = `test_${Date.now()}@tourlive.co.kr`;
    const password = 'TestPassword123!';

    try {
        const { data: { user } } = await admin.auth.admin.createUser({ email: testEmail, password, email_confirm: true });
        const { data: batch } = await admin.from('batches').select('id').limit(1).single();
        
        const { data: crew } = await admin.from('crews').insert({ user_id: user.id, batch_id: batch.id, name: 'Diag' }).select('id').single();
        console.log(`[DIAG] Created Crew ID: ${crew.id} for User: ${user.id}`);

        // Try to fetch with Admin
        const { data: adminCrew } = await admin.from('crews').select('*').eq('id', crew.id).single();
        console.log(`[DIAG] Admin verify: ${adminCrew ? 'Found' : 'Not Found'}`);

        // Try to fetch with Anon
        const { data: anonCrew, error: anonError } = await supabase.from('crews').select('*').eq('id', crew.id).maybeSingle();
        console.log(`[DIAG] Anon verify: ${anonCrew ? 'Found' : 'Not Found'}`);
        if (anonError) console.log(`[DIAG] Anon error: ${anonError.message}`);

        // CLEAN UP
        await admin.auth.admin.deleteUser(user.id);
    } catch (e) {
        console.error(e);
    }
}

diagnose();
