-- =============================================================================
-- BATCH NORMALIZATION SCRIPT
-- Run each section in order in the Supabase Studio SQL Editor.
-- =============================================================================


-- =============================================================================
-- SECTION 1: DIAGNOSTIC — Run this first. Review the output before any writes.
-- =============================================================================

-- 1a. Show all distinct batch values and how many members have each.
--     Look for duplicate labels (e.g. "14기" and "14기 " side-by-side).
SELECT
    batch,
    LENGTH(batch)       AS char_len,     -- reveals hidden spaces/chars
    COUNT(*)            AS member_count,
    COUNT(*) FILTER (WHERE batch != TRIM(batch)) AS has_whitespace
FROM public.profiles
WHERE role != 'admin'
GROUP BY batch
ORDER BY batch NULLS LAST;

-- 1b. Count dirty rows (whitespace mismatch) vs clean vs null.
SELECT
    CASE
        WHEN batch IS NULL                          THEN '① NULL (no batch set)'
        WHEN batch != TRIM(batch)                   THEN '② DIRTY (has whitespace)'
        WHEN batch = TRIM(batch)                    THEN '③ CLEAN'
    END AS status,
    COUNT(*) AS member_count
FROM public.profiles
WHERE role != 'admin'
GROUP BY 1
ORDER BY 1;


-- =============================================================================
-- SECTION 2: FIX — Run only after reviewing Section 1 output.
-- =============================================================================

-- 2a. Strip leading/trailing whitespace from all batch values.
--     Safe to run even if no dirty rows exist (no-op for clean rows).
UPDATE public.profiles
SET    batch = TRIM(batch)
WHERE  batch IS NOT NULL
  AND  batch != TRIM(batch);

-- 2b. Backfill NULL batch values for profiles that are already linked to a batch
--     via crews.batch_id → batches.term.
--     Formula: "{term}기"  e.g. term=14 → "14기"
UPDATE public.profiles p
SET    batch = CAST(b.term AS TEXT) || '기'
FROM   public.crews c
JOIN   public.batches b ON b.id = c.batch_id
WHERE  p.crew_id = c.id
  AND  p.batch IS NULL
  AND  p.role != 'admin';

-- 2c. Post-fix verification — should now show exactly one "14기" row, 0 dirty rows.
SELECT
    batch,
    LENGTH(batch) AS char_len,
    COUNT(*)      AS member_count
FROM public.profiles
WHERE role != 'admin'
GROUP BY batch
ORDER BY batch NULLS LAST;


-- =============================================================================
-- SECTION 3: 15th CREW PREPARATION
-- Run Section 3a now to pre-create the record.
-- Run Section 3b on June 1, 2026 to activate it.
-- =============================================================================

-- 3a. Insert 15th batch record (inactive — safe to run now).
--     Adjust start_date / end_date if the schedule changes.
INSERT INTO public.batches (term, start_date, end_date, is_active)
VALUES (15, '2026-06-01', '2026-08-31', false)
ON CONFLICT (term) DO NOTHING;  -- idempotent: safe to re-run

-- 3b. Activate 15th batch on June 1, 2026 (run manually on that date).
--     The onboarding form uses is_active=true to route new registrants.
-- UPDATE public.batches SET is_active = false WHERE term = 14;
-- UPDATE public.batches SET is_active = true  WHERE term = 15;

-- 3c. Verify batches table after insert.
SELECT id, term, start_date, end_date, is_active
FROM   public.batches
ORDER  BY term DESC;
