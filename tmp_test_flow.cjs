const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkRedirection(supabase, user) {
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, selected_activity')
        .eq('id', user.id)
        .maybeSingle();
    
    const isProfileComplete = !!(profile?.full_name && profile?.selected_activity);
    return isProfileComplete ? "/dashboard" : "/onboarding";
}

async function simulateLoginFlow() {
    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const testEmail = `test_${Date.now()}@tourlive.co.kr`;
    const testPassword = 'TestPassword123!';

    try {
        console.log(`[TEST] Creating test user: ${testEmail}`);
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
            email: testEmail,
            password: testPassword,
            email_confirm: true
        });

        if (authError) throw authError;
        const user = authData.user;
        console.log(`[TEST] User created with ID: ${user.id}`);

        // Phase 1: Test BEFORE Onboarding
        console.log("\n--- Phase 1: Before Onboarding ---");
        const decision1 = await checkRedirection(adminSupabase, user);
        console.log(`Decision: ${decision1} (Expected: /onboarding)`);

        // Phase 2: Perform Onboarding (Sync ID)
        console.log("\n--- Phase 2: Performing Onboarding (Sync ID) ---");
        const { data: batch } = await adminSupabase.from('batches').select('id').limit(1).single();
        
        const { data: crew } = await adminSupabase.from('crews').insert({
            user_id: user.id,
            batch_id: batch.id,
            name: 'Test Poster'
        }).select('id').single();

        const { error: pErr } = await adminSupabase.from('profiles').insert({
            id: user.id, // THE SYNC FIX
            crew_id: crew.id,
            full_name: 'Test Poster',
            tourlive_email: testEmail,
            selected_activity: 'naver_cafe',
            nickname: `tester_${Date.now()}`,
            phone_number: '01012345678',
            contact_email: testEmail,
            role: 'crew'
        });
        if (pErr) throw pErr;
        console.log("Profile created with synced ID.");

        // Phase 3: Test AFTER Onboarding
        console.log("\n--- Phase 3: After Onboarding ---");
        const decision3 = await checkRedirection(adminSupabase, user);
        console.log(`Decision: ${decision3} (Expected: /dashboard)`);

        // Clean up
        console.log("\nCleaning up test user...");
        await adminSupabase.auth.admin.deleteUser(user.id);
        console.log("Done.");

    } catch (err) {
        console.error("Test failed:", err.message);
    }
}

simulateLoginFlow();
