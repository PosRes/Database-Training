-- =====================================================
-- SMART DEDUPLICATION SCRIPT
-- =====================================================
-- Rules:
--   1. Two rows are "duplicates" if they share the same nama_institusi (case-insensitive)
--      AND one of these is true:
--        a) Both have the SAME cp + no_telepon
--        b) One or both have NULL/empty cp AND no_telepon
--   2. If nama_institusi AND cp+telepon are different → NOT a duplicate (different contacts)
--   3. Among duplicates, KEEP the most complete row (most filled fields)
--   4. If tied, keep the oldest (lowest ID)
-- =====================================================

-- =====================================================
-- STEP 1: PREVIEW — See all duplicate groups (SAFE, no deletions)
-- =====================================================
WITH completeness AS (
  SELECT
    id,
    nama_institusi,
    kota,
    provinsi,
    cp,
    no_telepon,
    e_mail,
    categories_1,
    categories_2,
    -- Score: count how many fields are meaningfully filled
    (CASE WHEN COALESCE(NULLIF(TRIM(nama_institusi), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(alamat), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(kota), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(provinsi), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(cp), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(no_telepon), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(e_mail), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(categories_1), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(categories_2), ''), '-') != '-' THEN 1 ELSE 0 END
    ) AS filled_fields
  FROM clients
),
duplicates AS (
  SELECT a.id
  FROM completeness a
  JOIN completeness b
    ON a.id != b.id
    -- Same institution name (case-insensitive, trimmed)
    AND LOWER(TRIM(COALESCE(NULLIF(a.nama_institusi, ''), '~empty~')))
      = LOWER(TRIM(COALESCE(NULLIF(b.nama_institusi, ''), '~empty~')))
    -- AND same contact OR one/both contacts are null/empty
    AND (
      -- Both CP are null/empty/dash
      (COALESCE(NULLIF(TRIM(a.cp), ''), '-') = '-' OR COALESCE(NULLIF(TRIM(b.cp), ''), '-') = '-')
      OR
      -- Same CP
      LOWER(TRIM(a.cp)) = LOWER(TRIM(b.cp))
    )
    AND (
      -- Both phone are null/empty/dash
      (COALESCE(NULLIF(TRIM(a.no_telepon), ''), '-') = '-' OR COALESCE(NULLIF(TRIM(b.no_telepon), ''), '-') = '-')
      OR
      -- Same phone
      LOWER(TRIM(a.no_telepon)) = LOWER(TRIM(b.no_telepon))
    )
)
SELECT
  c.id,
  c.nama_institusi,
  c.kota,
  c.provinsi,
  c.cp,
  c.no_telepon,
  c.filled_fields,
  CASE WHEN c.id IN (SELECT id FROM duplicates) THEN '⚠ DUPLICATE' ELSE '' END AS status
FROM completeness c
WHERE c.id IN (SELECT id FROM duplicates)
ORDER BY LOWER(TRIM(COALESCE(c.nama_institusi, ''))), c.filled_fields DESC, c.id;


-- =====================================================
-- STEP 2: DELETE DUPLICATES
-- Keeps the most complete row per group. If tied, keeps oldest (lowest ID).
-- ⚠ UNCOMMENT THE BLOCK BELOW AFTER REVIEWING STEP 1
-- =====================================================

/*
DELETE FROM clients
WHERE id NOT IN (
  SELECT DISTINCT ON (
    LOWER(TRIM(COALESCE(NULLIF(nama_institusi, ''), '~empty~'))),
    -- Group by contact: use a normalized key
    LOWER(TRIM(COALESCE(NULLIF(cp, ''), '~nocp~'))),
    LOWER(TRIM(COALESCE(NULLIF(no_telepon, ''), '~nophone~')))
  )
    id
  FROM clients
  ORDER BY
    LOWER(TRIM(COALESCE(NULLIF(nama_institusi, ''), '~empty~'))),
    LOWER(TRIM(COALESCE(NULLIF(cp, ''), '~nocp~'))),
    LOWER(TRIM(COALESCE(NULLIF(no_telepon, ''), '~nophone~'))),
    -- Most complete first
    (CASE WHEN COALESCE(NULLIF(TRIM(nama_institusi), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(alamat), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(kota), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(provinsi), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(cp), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(no_telepon), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(e_mail), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(categories_1), ''), '-') != '-' THEN 1 ELSE 0 END +
     CASE WHEN COALESCE(NULLIF(TRIM(categories_2), ''), '-') != '-' THEN 1 ELSE 0 END
    ) DESC,
    -- Oldest first (tiebreaker)
    id ASC
);
*/
