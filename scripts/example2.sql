CREATE OR REPLACE VIEW vw_chassis_deformation_quality
AS
WITH uni_odm_label AS(
    SELECT t1.odm_label, ballmark, MAX(t1.time) AS time
    FROM chassis_deformation_raw t1
    GROUP BY 1,2
)
, base AS (
	SELECT odm_label, time, ballmark
        , r.raw_fid, r.record_id, c.component, f.phase
	    , s.item, s.formula_name, s.position, s.type, s.max_val, s.m_val, s.spec_fid
        , CASE WHEN ballmark IN ('LA','LB','LC','LD','LE','LF','LG') THEN 'Left'
            WHEN ballmark IN ('RA','RB','RC','RD','RE','RF','RG') THEN 'Right'
            WHEN ballmark IN ('TA','TB','TC','TD','TE','TF','TG') THEN 'Top'
            WHEN ballmark IN ('BA','BB','BC','BD','BE','BF','BG') THEN 'Bottom'
            WHEN ballmark IN ('A1','A2','A3','A4','A5','A6','A7') THEN 'A side'
            WHEN ballmark IN ('B1','B2','B3','B4','B5','B6','B7') THEN 'B side'
            ELSE 'NDF' END AS ballmark_cate
        , r.value
        , r.date_of_update
	FROM chassis_deformation_raw r
    INNER JOIN uni_odm_label u
        USING(odm_label, ballmark, time)
	INNER JOIN chassis_deformation_file f
		ON r.raw_fid = f.raw_fid
    INNER JOIN common_assembly_code c
        ON SUBSTR(odm_label, 1, 5) = c.assembly_code
	INNER JOIN chassis_spec_deformation s
		ON f.spec_fid = s.spec_fid
		AND ballmark = s.point
)
, agg AS (
	SELECT b.odm_label, b.time, b.item, b.formula_name, b.type, b.ballmark_cate
        , b.raw_fid, b.record_id, b.component, b.phase
		, MAX(CASE b.type WHEN 'Core' THEN -1 WHEN 'Cavity' THEN 1 ELSE 1 END) AS val_sign
		, MAX(CASE WHEN b.position = 'Point 1' THEN b.ballmark ELSE NULL END) AS bm1    
		, MAX(CASE WHEN b.position = 'Point 1' THEN b.value ELSE NULL END) 
			* MAX(CASE b.type WHEN 'Core' THEN -1 WHEN 'Cavity' THEN 1 ELSE 1 END) AS p1
		, MAX(CASE WHEN b.position = 'Point 2' AND b.formula_name IN ('D7m', 'D7') THEN b.ballmark ELSE NULL END) AS bm2
		, MAX(CASE WHEN b.position = 'Point 2' AND b.formula_name IN ('D7m', 'D7') THEN b.value ELSE NULL END)
			* MAX(CASE b.type WHEN 'Core' THEN -1 WHEN 'Cavity' THEN 1 ELSE 1 END) AS p2
		, MAX(CASE WHEN b.position = 'Point 3' THEN b.ballmark ELSE NULL END) AS bm3
		, MAX(CASE WHEN b.position = 'Point 3' THEN b.value ELSE NULL END)
			* MAX(CASE b.type WHEN 'Core' THEN -1 WHEN 'Cavity' THEN 1 ELSE 1 END) AS p3
		, MAX(CASE WHEN b.position = 'Point 4' THEN b.ballmark ELSE NULL END) AS bm4
		, MAX(CASE WHEN b.position = 'Point 4' THEN b.value ELSE NULL END)
			* MAX(CASE b.type WHEN 'Core' THEN -1 WHEN 'Cavity' THEN 1 ELSE 1 END) AS p4
		, MAX(CASE WHEN b.position = 'Point 5' THEN b.ballmark ELSE NULL END) AS bm5
		, MAX(CASE WHEN b.position = 'Point 5' THEN b.value ELSE NULL END)
			* MAX(CASE b.type WHEN 'Core' THEN -1 WHEN 'Cavity' THEN 1 ELSE 1 END) AS p5
		, MAX(CASE WHEN b.position = 'Point 6' AND b.formula_name IN ('D7m', 'D7') THEN b.ballmark ELSE NULL END) AS bm6
		, MAX(CASE WHEN b.position = 'Point 6' AND b.formula_name IN ('D7m', 'D7') THEN b.value ELSE NULL END)
			* MAX(CASE b.type WHEN 'Core' THEN -1 WHEN 'Cavity' THEN 1 ELSE 1 END) AS p6
		, MAX(CASE WHEN b.position = 'Point 7' THEN b.ballmark ELSE NULL END) AS bm7
		, MAX(CASE WHEN b.position = 'Point 7' THEN b.value ELSE NULL END)
			* MAX(CASE b.type WHEN 'Core' THEN -1 WHEN 'Cavity' THEN 1 ELSE 1 END) AS p7
		, MAX(max_val) AS max_val
		, MAX(m_val) AS m_val
		, MAX(max_val) AS point_max
		, MAX(spec_fid) AS spec_fid
        , MAX(CASE WHEN b.formula_name IN ('S5', 'D5m') THEN b.m_val ELSE 0 END) AS m_val_d5s5
		, MAX(CASE WHEN b.formula_name IN ('D7m', 'S5') THEN b.m_val ELSE NULL END) AS point_mid
		, COUNT(1) AS cnt_all
        , MAX(date_of_update) AS date_of_update
	FROM base b
	GROUP BY b.odm_label, b.time, b.item, b.formula_name, b.type, b.ballmark_cate
        , b.raw_fid, b.record_id, b.component, b.phase
)
, others_result AS(
    SELECT *
        , CASE WHEN type IN ('Core', 'Cavity') AND (p1<0 OR p3<0 OR p4<0 OR p5<0 OR p7<0 OR COALESCE(p2,0)<0 OR COALESCE(p6,0)<0) 
        THEN 'fail all' 
            WHEN formula_name IN ('D7') THEN
                CASE WHEN LEAST(p3,p4,p5)<GREATEST(p2,p6) THEN 'fail D7-1'
                    WHEN LEAST(p2,p6)<GREATEST(p1,p7) THEN 'fail D7-2'
                    WHEN p3>GREATEST(p4,p5) AND p4>=p5 AND p3<=max_val THEN 'pass D7-3'
                    WHEN p5>GREATEST(p4,p3) AND p4>=p3 AND p5<=max_val THEN 'pass D7-4'
                    WHEN p4>=GREATEST(p3,p5) AND p4<=max_val THEN 'pass D7-5'
                    ELSE 'fail D7-6' END
            WHEN formula_name IN ('D7m') THEN
                CASE WHEN LEAST(p3,p4,p5)<GREATEST(p2,p6) THEN 'fail D7m-1'
                    WHEN p2=p3 AND p2>COALESCE(point_mid,0) THEN 'fail D7m-2'
                    WHEN p5=p6 AND p6>COALESCE(point_mid,0) THEN 'fail D7m-3'
                    WHEN LEAST(p2,p6)<GREATEST(p1,p7) THEN 'fail D7m-4'
                    WHEN p3>GREATEST(p4,p5) AND p4>=p5 AND p3<=max_val THEN 'pass D7m-5'
                    WHEN p5>GREATEST(p4,p3) AND p4>=p3 AND p5<=max_val THEN 'pass D7m-6'
                    WHEN p4>=GREATEST(p3,p5) AND p4<=max_val THEN 'pass D7m-7'
                    ELSE 'fail D7m-8' END
            ELSE 'NDF' END AS result
            --ELSE 'fail' END AS result
    FROM agg
    WHERE formula_name IN ('D7','D7m')
    ORDER BY odm_label, formula_name, item
)
, s5 AS (
    SELECT *
        , CASE
            WHEN GREATEST(p1,p3,p4,p5,p7)-LEAST(p1,p3,p4,p5,p7)>max_val THEN 'fail S5-all'
            WHEN GREATEST(p1,p3,p4,p5,p7)>max_val THEN 'fail S5-1'
            WHEN GREATEST(p3,p4,p5)<GREATEST(p1,p7) THEN 'fail S5-2'
            WHEN p3<p1-m_val_d5s5 OR p5<p7-m_val_d5s5 THEN 'fail S5-3'
            WHEN p3>GREATEST(p4,p5) AND p4>=p5-m_val_d5s5 THEN 'pass S5-p3'
            WHEN p5>GREATEST(p3,p4) AND p4>=p3-m_val_d5s5 THEN 'pass S5-p5'
            WHEN p4>=GREATEST(p3,p5) THEN 'pass S5-p4'
            ELSE (CASE WHEN p4>=p3-m_val_d5s5 THEN 'pass S5-else' ELSE 'fail S5-else' END)
            END AS result
    FROM agg
    WHERE formula_name IN ('S5')
    ORDER BY odm_label, formula_name, item
)
, d5 AS (
    SELECT *
        , CASE
            WHEN GREATEST(p1,p3,p4,p5,p7)-LEAST(p1,p3,p4,p5,p7)>max_val THEN 'fail D5-all'
            WHEN GREATEST(p1,p3,p4,p5,p7)>max_val THEN 'fail D5-1'
            WHEN GREATEST(p3,p4,p5)<GREATEST(p1,p7) THEN 'fail D5-2'
            WHEN p3<p1 OR p5<p7 THEN 'fail D5-3'
            WHEN p3>GREATEST(p4,p5) AND p4>=p5 THEN 'pass D5-p3'
            WHEN p5>GREATEST(p3,p4) AND p4>=p3 THEN 'pass D5-p5'
            WHEN p4>=GREATEST(p3,p5) THEN 'pass D5-p4'
            ELSE 'fail D5-else'
            END AS result
    FROM agg
    WHERE formula_name IN ('D5')
    ORDER BY odm_label, formula_name, item
)
, d5m AS (
    SELECT *
        , CASE
            WHEN GREATEST(p1,p3,p4,p5,p7)-LEAST(p1,p3,p4,p5,p7)>max_val THEN 'fail D5m-all'
            WHEN GREATEST(p3,p4,p5)-LEAST(p3,p4,p5)>m_val_d5s5 THEN 'fail D5m'
            WHEN GREATEST(p1,p3,p4,p5,p7)>max_val THEN 'fail D5m-1'
            WHEN GREATEST(p3,p4,p5)<GREATEST(p1,p7) THEN 'fail D5m-2'
            WHEN p3<p1 OR p5<p7 THEN 'fail D5m-3'
            WHEN p3>GREATEST(p4,p5) AND p4>=p5 THEN 'pass D5m-p3'
            WHEN p5>GREATEST(p3,p4) AND p4>=p3 THEN 'pass D5m-p5'
            WHEN p4>=GREATEST(p3,p5) THEN 'pass D5m-p4'
            ELSE 'fail D5m-else'
            END AS result
    FROM agg
    WHERE formula_name IN ('D5m')
    ORDER BY odm_label, formula_name, item
)
, d3 AS (
    SELECT *
        , CASE
            WHEN GREATEST(p1,p4,p7)-LEAST(p1,p4,p7)>max_val THEN 'fail D3-all'
            WHEN GREATEST(p1,p4,p7)>max_val THEN 'fail D3-1'
            WHEN p4<GREATEST(p1,p7) THEN 'fail D3-2'
            ELSE 'pass D3'
            END AS result
    FROM agg
    WHERE formula_name IN ('D3')
    ORDER BY odm_label, formula_name, item
)
, all_result AS (
    SELECT * FROM s5
    UNION ALL
    SELECT * FROM d5
    UNION ALL
    SELECT * FROM d5m
    UNION ALL
    SELECT * FROM d3
    UNION ALL
    SELECT * FROM others_result
)
SELECT SUBSTR(a.odm_label, 1, 5) AS assembly_code
    , SUBSTR(a.odm_label, 9, 2) AS vendor_code
    , SUBSTR(a.odm_label, 11, 3) AS odm_label_date_code
    , a.*
FROM all_result a
;
