// Batch Normalization + 15th Batch Prep — Sections 2 & 3
// Reads dirty rows, cleans them in JS (.trim() strips \r\n + spaces),
// writes them back one-by-one, inserts 15th batch record, then verifies.
// Run: node scripts/database/fix_batch.cjs

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function divider(title) {
    console.log('\n========================================================');
    console.log(` ${title}`);
    console.log('========================================================');
}

function cleanBatch(raw) {
    // JS .trim() removes: spaces, \r, \n, \t, and other whitespace chars
    // Then we also strip any remaining control characters for safety
    return raw.trim().replace(/[\x00-\x1F\x7F]/g, '');
}

// ── Section 2: Normalization ─────────────────────────────────────────────────

async function runSection2() {
    divider('SECTION 2 — Normalization');

    // 2a. Fetch all non-admin profiles with a batch value
    console.log('\n[2a] Fetching all non-admin profiles with batch values...');
    const { data: profiles, error: fetchErr } = await supabase
        .from('profiles')
        .select('id, full_name, batch')
        .neq('role', 'admin')
        .not('batch', 'is', null);

    if (fetchErr) {
        console.error('  ✗ Fetch failed:', fetchErr.message);
        process.exit(1);
    }
    console.log(`  Found ${profiles.length} non-admin profiles with a batch value.`);

    // 2b. Identify dirty rows
    const dirtyProfiles = profiles.filter(p => p.batch !== cleanBatch(p.batch));

    if (dirtyProfiles.length === 0) {
        console.log('  ✅ No dirty rows found — database was already clean.');
    } else {
        console.log(`\n[2b] Found ${dirtyProfiles.length} dirty row(s). Cleaning now...\n`);
        console.log('  Name                    | Raw (JSON repr)         | → Cleaned');
        console.log('  ────────────────────────┼─────────────────────────┼──────────────');

        for (const profile of dirtyProfiles) {
            const cleaned = cleanBatch(profile.batch);
            const rawRepr = JSON.stringify(profile.batch).padEnd(25);
            const nameLabel = (profile.full_name || profile.id).substring(0, 22).padEnd(22);

            const { error: updateErr } = await supabase
                .from('profiles')
                .update({ batch: cleaned })
                .eq('id', profile.id);

            if (updateErr) {
                console.error(`  ✗ Failed to update ${profile.id}: ${updateErr.message}`);
                process.exit(1);
            }

            console.log(`  ${nameLabel} | ${rawRepr} | "${cleaned}"`);
        }
        console.log(`\n  ✅ ${dirtyProfiles.length} row(s) cleaned successfully.`);
    }

    // 2c. Handle NULL rows (backfill via crews join — fetch and resolve)
    console.log('\n[2c] Checking for NULL batch rows to backfill...');
    const { data: nullProfiles, error: nullErr } = await supabase
        .from('profiles')
        .select('id, full_name, crew_id')
        .neq('role', 'admin')
        .is('batch', null);

    if (nullErr) {
        console.error('  ✗ NULL check failed:', nullErr.message);
        process.exit(1);
    }

    if (nullProfiles.length === 0) {
        console.log('  ✅ No NULL batch rows — nothing to backfill.');
    } else {
        console.log(`  Found ${nullProfiles.length} NULL batch row(s). Backfilling via crews → batches...\n`);

        for (const profile of nullProfiles) {
            if (!profile.crew_id) {
                console.warn(`  ⚠️  Profile ${profile.id} has no crew_id — skipping.`);
                continue;
            }

            // Look up their batch term via crews → batches
            const { data: crew, error: crewErr } = await supabase
                .from('crews')
                .select('batch_id, batches(term)')
                .eq('id', profile.crew_id)
                .maybeSingle();

            if (crewErr || !crew?.batches) {
                console.warn(`  ⚠️  Could not resolve batch for profile ${profile.id} — skipping.`);
                continue;
            }

            const term = crew.batches.term;
            const canonicalBatch = `${term}기`;

            const { error: backfillErr } = await supabase
                .from('profiles')
                .update({ batch: canonicalBatch })
                .eq('id', profile.id);

            if (backfillErr) {
                console.error(`  ✗ Backfill failed for ${profile.id}: ${backfillErr.message}`);
                process.exit(1);
            }

            console.log(`  Backfilled: ${profile.full_name || profile.id} → "${canonicalBatch}"`);
        }
        console.log(`\n  ✅ NULL backfill complete.`);
    }
}

// ── Section 3: 15th Batch Insert ─────────────────────────────────────────────

async function runSection3() {
    divider('SECTION 3 — 15th Batch Preparation');

    console.log('\n[3a] Inserting 15th batch record (is_active = false)...');
    const { data: inserted, error: insertErr } = await supabase
        .from('batches')
        .upsert(
            { term: 15, start_date: '2026-06-01', end_date: '2026-08-31', is_active: false },
            { onConflict: 'term', ignoreDuplicates: true }
        )
        .select();

    if (insertErr) {
        console.error('  ✗ Insert failed:', insertErr.message);
        process.exit(1);
    }

    if (!inserted || inserted.length === 0) {
        console.log('  ℹ️  15th batch record already exists — no change made (idempotent).');
    } else {
        console.log('  ✅ 15th batch record inserted:');
        console.log(`     term=${inserted[0].term}, start=${inserted[0].start_date}, end=${inserted[0].end_date}, is_active=${inserted[0].is_active}`);
    }

    console.log('\n[3b] All batches in DB:');
    const { data: allBatches, error: listErr } = await supabase
        .from('batches')
        .select('id, term, start_date, end_date, is_active')
        .order('term', { ascending: false });

    if (listErr) {
        console.error('  ✗ Fetch failed:', listErr.message);
    } else {
        console.log('\n  term | start_date   | end_date     | is_active');
        console.log('  ──────┼──────────────┼──────────────┼───────────');
        for (const b of allBatches) {
            const active = b.is_active ? '✅ ACTIVE' : '   inactive';
            console.log(`  ${String(b.term).padEnd(4)} | ${b.start_date || 'N/A'.padEnd(12)} | ${b.end_date || 'N/A'.padEnd(12)} | ${active}`);
        }
    }
}

// ── Final Verification ────────────────────────────────────────────────────────

async function runVerification() {
    divider('FINAL VERIFICATION — GROUP BY batch');

    const { data: all, error } = await supabase
        .from('profiles')
        .select('batch')
        .neq('role', 'admin');

    if (error) { console.error('Verification failed:', error.message); process.exit(1); }

    const counts = {};
    let failCount = 0;

    for (const row of all) {
        const key = row.batch === null ? '__NULL__' : row.batch;
        counts[key] = (counts[key] || 0) + 1;
        if (row.batch !== cleanBatch(row.batch ?? '')) failCount++;
    }

    console.log('\n  batch value (JSON repr)  | count');
    console.log('  ─────────────────────────┼───────');
    for (const [key, count] of Object.entries(counts)) {
        const label = JSON.stringify(key === '__NULL__' ? null : key).padEnd(25);
        console.log(`  ${label} |  ${count}`);
    }

    console.log('\n  ─────────────────────────────────────');
    console.log(`  Total non-admin members  |  ${all.length}`);
    console.log(`  Remaining dirty rows     |  ${failCount}`);

    console.log('\n========================================================');
    if (failCount === 0 && !counts['__NULL__'] && Object.keys(counts).length === 1) {
        console.log(' ✅ PERFECT: All members are under a single clean batch label.');
        console.log('    The "14기" duplication is 100% resolved.');
    } else if (failCount === 0) {
        console.log(' ✅ CLEAN: No dirty rows remain.');
        console.log(`    ${Object.keys(counts).length} distinct batch(es) present.`);
    } else {
        console.log(` ✗ ${failCount} dirty row(s) still remain — investigate above.`);
    }
    console.log('========================================================\n');
}

// ── Entry Point ───────────────────────────────────────────────────────────────

async function main() {
    await runSection2();
    await runSection3();
    await runVerification();
}

main().catch(err => {
    console.error('\nUnexpected error:', err);
    process.exit(1);
});
