// Batch Diagnostic Script — Section 1
// Mirrors normalize_batch.sql Section 1 queries via the Supabase JS client.
// Run: node scripts/database/diagnose_batch.cjs

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    console.log('\n========================================================');
    console.log(' BATCH DIAGNOSTIC — Section 1');
    console.log('========================================================\n');

    // ── Query 1a: All distinct batch values with char length ──────────────
    console.log('── 1a. All distinct batch values (incl. char length) ──');
    const { data: allBatches, error: e1 } = await supabase
        .from('profiles')
        .select('batch')
        .neq('role', 'admin');

    if (e1) { console.error('Error:', e1.message); process.exit(1); }

    // Group client-side since the JS client can't run raw SQL GROUP BY
    const grouped = {};
    let dirtyCount = 0;
    let nullCount = 0;

    for (const row of allBatches) {
        const raw = row.batch;

        if (raw === null || raw === undefined) {
            nullCount++;
            const key = '__NULL__';
            grouped[key] = grouped[key] || { batch: 'NULL', charLen: 0, members: 0, dirty: 0 };
            grouped[key].members++;
            continue;
        }

        const isDirty = raw !== raw.trim();
        if (isDirty) dirtyCount++;

        const displayKey = JSON.stringify(raw); // shows hidden spaces
        grouped[displayKey] = grouped[displayKey] || {
            batch: raw,
            charLen: raw.length,
            members: 0,
            dirty: 0
        };
        grouped[displayKey].members++;
        if (isDirty) grouped[displayKey].dirty++;
    }

    console.log('\n  batch value (JSON)       | charLen | members | has_whitespace');
    console.log('  ─────────────────────────┼─────────┼─────────┼───────────────');
    for (const [key, val] of Object.entries(grouped)) {
        const label = key.padEnd(25);
        console.log(`  ${label} |   ${String(val.charLen).padStart(3)}   |   ${String(val.members).padStart(3)}   | ${val.dirty > 0 ? '⚠️  YES' : '   no'}`);
    }

    // ── Query 1b: Summary — NULL vs DIRTY vs CLEAN ────────────────────────
    console.log('\n── 1b. Summary by row status ──');

    let clean = 0;
    let dirty = 0;
    let nullRows = 0;

    for (const row of allBatches) {
        const raw = row.batch;
        if (raw === null || raw === undefined) { nullRows++; }
        else if (raw !== raw.trim()) { dirty++; }
        else { clean++; }
    }

    console.log('\n  Status                        | Count');
    console.log('  ──────────────────────────────┼───────');
    console.log(`  ① NULL (no batch set)         |  ${String(nullRows).padStart(4)}`);
    console.log(`  ② DIRTY (has whitespace)      |  ${String(dirty).padStart(4)}`);
    console.log(`  ③ CLEAN                       |  ${String(clean).padStart(4)}`);
    console.log(`  ─────────────────────────────────────`);
    console.log(`  TOTAL (non-admin profiles)    |  ${String(allBatches.length).padStart(4)}`);

    console.log('\n========================================================');
    if (dirty === 0 && nullRows === 0) {
        console.log(' ✅ RESULT: No dirty or NULL rows found.');
        console.log('    The database is already clean.');
        console.log('    → Section 2 UPDATE will be a safe no-op.');
    } else {
        if (dirty > 0) {
            console.log(` ⚠️  DIRTY ROWS: ${dirty} row(s) have whitespace in the batch column.`);
            console.log('    → Section 2a (TRIM update) is needed.');
        }
        if (nullRows > 0) {
            console.log(` ⚠️  NULL ROWS: ${nullRows} row(s) have no batch set.`);
            console.log('    → Section 2b (NULL backfill) is needed.');
        }
        console.log('\n  Awaiting user confirmation before running Section 2.');
    }
    console.log('========================================================\n');
}

run().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
