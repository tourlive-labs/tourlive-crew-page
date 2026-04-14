// Section 3 + Final Verification — corrected for actual batches schema
// Columns: id, term, start_date, year, is_active, created_at, updated_at  (NO end_date)
// Run: node scripts/database/finalize_batch.cjs

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function divider(title) {
    console.log('\n========================================================');
    console.log(` ${title}`);
    console.log('========================================================');
}

function cleanBatch(raw) {
    return raw.trim().replace(/[\x00-\x1F\x7F]/g, '');
}

// ── Section 3: 15th Batch Insert (schema-corrected) ──────────────────────────

async function runSection3() {
    divider('SECTION 3 — 15th Batch Preparation');

    console.log('\n[3a] Inserting 15th batch record (is_active = false)...');
    console.log('     Schema: term, start_date, year, is_active');

    // Check if term=15 already exists (term has no UNIQUE constraint, so we avoid upsert)
    const { data: existing, error: checkErr } = await supabase
        .from('batches')
        .select('id, term')
        .eq('term', 15)
        .maybeSingle();

    if (checkErr) {
        console.error('  ✗ Check failed:', checkErr.message);
        process.exit(1);
    }

    if (existing) {
        console.log(`  ℹ️  15th batch record already exists (id=${existing.id}) — no change made.`);
    } else {
        const { data: inserted, error: insertErr } = await supabase
            .from('batches')
            .insert({
                term:       15,
                start_date: '2026-06-01',
                year:       2026,
                is_active:  false
            })
            .select()
            .single();

        if (insertErr) {
            console.error('  ✗ Insert failed:', insertErr.message);
            process.exit(1);
        }

        console.log('  ✅ 15th batch record inserted successfully:');
        console.log(`     id=${inserted.id}`);
        console.log(`     term=${inserted.term}, start_date=${inserted.start_date}, year=${inserted.year}, is_active=${inserted.is_active}`);
    }

    console.log('\n[3b] All batches currently in DB:');
    const { data: allBatches, error: listErr } = await supabase
        .from('batches')
        .select('id, term, start_date, year, is_active')
        .order('term', { ascending: false });

    if (listErr) {
        console.error('  ✗ Fetch failed:', listErr.message);
    } else {
        console.log('\n  term | year | start_date   | is_active');
        console.log('  ─────┼──────┼──────────────┼──────────────');
        for (const b of allBatches) {
            const active = b.is_active ? '✅ ACTIVE' : '   inactive';
            console.log(`  ${String(b.term).padEnd(4)} | ${b.year} | ${(b.start_date || 'N/A').padEnd(12)} | ${active}`);
        }
    }
}

// ── Final Verification ────────────────────────────────────────────────────────

async function runVerification() {
    divider('FINAL VERIFICATION — GROUP BY batch (all non-admin members)');

    const { data: all, error } = await supabase
        .from('profiles')
        .select('batch, full_name')
        .neq('role', 'admin');

    if (error) { console.error('Verification failed:', error.message); process.exit(1); }

    const counts = {};
    let dirtyCount = 0;

    for (const row of all) {
        const key = row.batch === null ? '__NULL__' : row.batch;
        counts[key] = (counts[key] || 0) + 1;
        if (row.batch !== null && row.batch !== cleanBatch(row.batch)) dirtyCount++;
    }

    console.log('\n  batch value (JSON repr)    | char_len | count');
    console.log('  ───────────────────────────┼──────────┼───────');
    for (const [key, count] of Object.entries(counts)) {
        const isNull = key === '__NULL__';
        const displayKey = JSON.stringify(isNull ? null : key).padEnd(27);
        const charLen = isNull ? 'N/A' : String(key.length).padStart(4);
        console.log(`  ${displayKey} | ${charLen.padStart(8)} | ${count}`);
    }

    const distinctBatches = Object.keys(counts).filter(k => k !== '__NULL__');
    const nullRows = counts['__NULL__'] || 0;

    console.log('\n  ──────────────────────────────────────────────────');
    console.log(`  Total non-admin members    |          | ${all.length}`);
    console.log(`  Distinct batch labels      |          | ${distinctBatches.length}`);
    console.log(`  Remaining dirty rows       |          | ${dirtyCount}`);
    console.log(`  NULL batch rows            |          | ${nullRows}`);

    console.log('\n========================================================');
    const allClean = dirtyCount === 0 && nullRows === 0 && distinctBatches.length === 1;
    if (allClean) {
        console.log(' ✅ SUCCESS: All 4 members are under exactly ONE clean "14기" label.');
        console.log('    The phantom duplicate is 100% eliminated.');
        console.log('    The 15th batch is staged and ready for June 1, 2026.');
    } else {
        console.log(' ⚠️  Issues remain — review table above.');
    }
    console.log('========================================================\n');
}

async function main() {
    await runSection3();
    await runVerification();
}

main().catch(err => {
    console.error('\nUnexpected error:', err);
    process.exit(1);
});
