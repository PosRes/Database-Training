-- DEDUPLICATE CLIENTS TABLE
-- Rules:
-- 1. Duplicates are identified by matching 'nama_institusi' (case-insensitive, trimmed)
-- 2. Keep the row with the MOST filled-in columns (most complete data)
-- 3. If both are equally complete, keep the one with the lowest ID (oldest entry)

-- Step 1: Preview duplicates that WILL be deleted (run this first to check!)
SELECT 
  id,
  nama_institusi,
  kota,
  provinsi,
  cp,
  no_telepon,
  -- Count how many fields are filled in
  (CASE WHEN nama_institusi IS NOT NULL AND nama_institusi != '' AND nama_institusi != '-' THEN 1 ELSE 0 END +
   CASE WHEN alamat IS NOT NULL AND alamat != '' AND alamat != '-' THEN 1 ELSE 0 END +
   CASE WHEN kota IS NOT NULL AND kota != '' AND kota != '-' THEN 1 ELSE 0 END +
   CASE WHEN provinsi IS NOT NULL AND provinsi != '' AND provinsi != '-' THEN 1 ELSE 0 END +
   CASE WHEN cp IS NOT NULL AND cp != '' AND cp != '-' THEN 1 ELSE 0 END +
   CASE WHEN no_telepon IS NOT NULL AND no_telepon != '' AND no_telepon != '-' THEN 1 ELSE 0 END +
   CASE WHEN e_mail IS NOT NULL AND e_mail != '' AND e_mail != '-' THEN 1 ELSE 0 END +
   CASE WHEN categories_1 IS NOT NULL AND categories_1 != '' AND categories_1 != '-' THEN 1 ELSE 0 END +
   CASE WHEN categories_2 IS NOT NULL AND categories_2 != '' AND categories_2 != '-' THEN 1 ELSE 0 END
  ) AS filled_fields
FROM clients
WHERE id IN (
  SELECT id FROM clients c1
  WHERE EXISTS (
    SELECT 1 FROM clients c2
    WHERE LOWER(TRIM(COALESCE(c2.nama_institusi, ''))) = LOWER(TRIM(COALESCE(c1.nama_institusi, '')))
      AND c2.id != c1.id
  )
)
ORDER BY LOWER(TRIM(COALESCE(nama_institusi, ''))), filled_fields DESC, id;

-- Step 2: DELETE duplicates (keeping the most complete / oldest)
-- UNCOMMENT THE LINES BELOW AFTER YOU VERIFY STEP 1 LOOKS CORRECT

/*
DELETE FROM clients
WHERE id NOT IN (
  SELECT DISTINCT ON (LOWER(TRIM(COALESCE(nama_institusi, ''))))
    id
  FROM clients
  ORDER BY
    LOWER(TRIM(COALESCE(nama_institusi, ''))),
    -- Prefer the row with the most filled-in fields
    (CASE WHEN nama_institusi IS NOT NULL AND nama_institusi != '' AND nama_institusi != '-' THEN 1 ELSE 0 END +
     CASE WHEN alamat IS NOT NULL AND alamat != '' AND alamat != '-' THEN 1 ELSE 0 END +
     CASE WHEN kota IS NOT NULL AND kota != '' AND kota != '-' THEN 1 ELSE 0 END +
     CASE WHEN provinsi IS NOT NULL AND provinsi != '' AND provinsi != '-' THEN 1 ELSE 0 END +
     CASE WHEN cp IS NOT NULL AND cp != '' AND cp != '-' THEN 1 ELSE 0 END +
     CASE WHEN no_telepon IS NOT NULL AND no_telepon != '' AND no_telepon != '-' THEN 1 ELSE 0 END +
     CASE WHEN e_mail IS NOT NULL AND e_mail != '' AND e_mail != '-' THEN 1 ELSE 0 END +
     CASE WHEN categories_1 IS NOT NULL AND categories_1 != '' AND categories_1 != '-' THEN 1 ELSE 0 END +
     CASE WHEN categories_2 IS NOT NULL AND categories_2 != '' AND categories_2 != '-' THEN 1 ELSE 0 END
    ) DESC,
    -- If tie, keep the oldest (lowest ID)
    id ASC
);
*/
