CREATE OR REPLACE VIEW vw_clickpad_feeling_record AS
WITH result_hp_group AS (
    SELECT
    DISTINCT
    record_id,
    value_p1_result,
    value_s1_result,
    value_cr_result
    FROM vw_clickpad_feeling_quality
)
, test_result_hp AS (
    SELECT
    record_id,
    CASE WHEN COUNT(record_id) = 1 AND SUM(value_p1_result + value_s1_result + value_cr_result) = 3 THEN 1 ELSE 0 END AS test_result_hp
    FROM result_hp_group
    GROUP BY record_id
)
, base AS (
    SELECT
    t1.record_id,
    t1.odm_label,
    t1.time,
    CASE UPPER(t1.test_result) WHEN 'PASS' THEN 1 ELSE 0 END AS test_result_vendor,
    t1.date_code,
    t1.vendor_code,
    t1.assemblycode,
    t1.date_of_update,
    t2.spec_fid,
    t2.file_name,
    t2.assembly_code,
    t2.vendor,
    t2.phase,
    t2.file_date,
    r.test_result_hp,
    m1.date, m1.iso_week as week, m1.iso_year as year
    FROM clickpad_click_feeling_record t1
    INNER JOIN clickpad_click_feeling_file t2
    USING(raw_fid)
    LEFT JOIN test_result_hp r
    ON t1.record_id = r.record_id
    LEFT JOIN me_map_code_ymd m1
    ON t1.date_code = m1.code
)
SELECT * from base
;