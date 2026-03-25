const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function simulateLoginFlow() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
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
        const decision1 = await checkRedirection(supabase, user);
        console.log(`Decision: ${decision1}`);

        // Phase 2: Perform Onboarding
        console.log("\n--- Phase 2: Performing Onboarding ---");
        const { data: batch } = await supabase.from('batches').select('id').limit(1).single();
        if (!batch) throw new Error("No batch found");
        
        const { data: crew, error: cErr } = await adminSupabase.from('crews').insert({
            user_id: user.id,
            batch_id: batch.id,
            name: 'Test Poster'
        }).select('id').single();
        if (cErr) throw cErr;
        console.log(`Crew created: ${crew.id}`);

        const { error: pErr } = await adminSupabase.from('profiles').insert({
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
        console.log("Profile created.");

        // Phase 3: Test AFTER Onboarding
        console.log("\n--- Phase 3: After Onboarding ---");
        const decision3 = await checkRedirection(supabase, user);
        console.log(`Decision: ${decision3}`);

        // Clean up
        console.log("\nCleaning up test user...");
        await adminSupabase.auth.admin.deleteUser(user.id);
        console.log("Done.");

    } catch (err) {
        console.error("Test failed:", err.message);
    }
}

async function checkRedirection(supabase, user) {
    console.log(`Checking for user: ${user.id}`);
    const { data: crew, error: crewError } = await supabase.from('crews').select('id').eq('user_id', user.id).maybeSingle();
    
    if (crewError) console.error("Crew lookup error:", crewError.message);
    console.log(`Crew lookup result: ${JSON.stringify(crew)}`);
    
    let profile = null;
    if (crew) {
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('crew_id', crew.id).maybeSingle();
        if (profileError) console.error("Profile lookup error:", profileError.message);
        profile = profileData;
    }
    
    console.log(`Profile lookup result: ${JSON.stringify(profile)}`);
    
    const isProfileComplete = !!(profile?.full_name && profile?.selected_activity);
    const isAdmin = profile?.role === 'admin' || user.email === "root@tourlive.co.kr";
    
    console.log(`isProfileComplete: ${isProfileComplete}, isAdmin: ${isAdmin}`);
    
    if (!isProfileComplete) return "/onboarding";
    return isAdmin ? "/admin" : "/dashboard";
}

simulateLoginFlow();
