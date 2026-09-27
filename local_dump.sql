--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    user_id uuid,
    action character varying NOT NULL,
    entity character varying NOT NULL,
    entity_id character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: compliance_histories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compliance_histories (
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    owner_id uuid NOT NULL,
    action character varying NOT NULL,
    details character varying,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: ecommerce_monitors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ecommerce_monitors (
    id uuid NOT NULL,
    target_url character varying NOT NULL,
    status character varying,
    monitoring_frequency character varying,
    last_run_at timestamp with time zone,
    next_run_at timestamp with time zone,
    last_scan_result character varying,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: enforcement_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enforcement_cases (
    id uuid NOT NULL,
    reinspection_id uuid,
    original_inspection_id character varying,
    manufacturer_id uuid,
    assigned_officer_id uuid,
    status character varying,
    penalty_amount double precision,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    resolved_at timestamp with time zone
);


--
-- Name: improvement_notices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.improvement_notices (
    id uuid NOT NULL,
    inspection_id character varying,
    manufacturer_id uuid,
    status character varying,
    violations character varying,
    due_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: inspections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inspections (
    id character varying NOT NULL,
    product_id uuid,
    officer_id uuid,
    status character varying,
    risk_level character varying,
    result character varying,
    evidence_payload character varying,
    is_reinspection boolean,
    parent_inspection_id character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: manufacturer_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manufacturer_documents (
    id uuid NOT NULL,
    owner_id uuid NOT NULL,
    product_id uuid,
    title character varying NOT NULL,
    category character varying NOT NULL,
    file_path character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: manufacturers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manufacturers (
    id uuid NOT NULL,
    name character varying NOT NULL,
    location character varying,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    name character varying NOT NULL,
    category character varying,
    manufacturer_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    sku character varying,
    owner_id uuid,
    status character varying DEFAULT 'DRAFT'::character varying,
    net_quantity character varying,
    mrp character varying,
    generic_name character varying,
    manufacturer_name character varying,
    country_of_origin character varying,
    updated_at timestamp with time zone
);


--
-- Name: rectifications_mfg; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rectifications_mfg (
    id uuid NOT NULL,
    submission_id uuid,
    product_id uuid,
    owner_id uuid NOT NULL,
    issue character varying NOT NULL,
    required_action character varying NOT NULL,
    status character varying,
    due_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: reinspections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reinspections (
    id uuid NOT NULL,
    original_inspection_id character varying,
    notice_id uuid,
    assigned_officer_id uuid,
    status character varying,
    scheduled_date timestamp with time zone,
    new_inspection_id character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: rule_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rule_versions (
    id uuid NOT NULL,
    rule_id character varying,
    version_number integer NOT NULL,
    status character varying,
    logic_payload json,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rules (
    id character varying NOT NULL,
    name character varying NOT NULL,
    category character varying,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    owner_id uuid NOT NULL,
    status character varying,
    officer_comments text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying NOT NULL,
    hashed_password character varying NOT NULL,
    role character varying,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    status character varying DEFAULT 'APPROVED'::character varying
);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, action, entity, entity_id, created_at) FROM stdin;
\.


--
-- Data for Name: compliance_histories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.compliance_histories (id, product_id, owner_id, action, details, created_at) FROM stdin;
2214b7f2-030b-46ac-af56-407d7579cfd1	4c920caf-703b-473c-bf12-49efea847fed	e90ef710-69ab-4cb8-882f-a52a2d04216f	Product Created	Product 'PEARL MILLET & BLACK RICE MIX' registered.	2026-09-28 01:11:18.654284+05:30
096670d7-7b4b-4df5-9330-bcafdf98dd42	4c920caf-703b-473c-bf12-49efea847fed	e90ef710-69ab-4cb8-882f-a52a2d04216f	Submitted to Government	Submitted for pre-market review.	2026-09-28 01:11:18.701812+05:30
\.


--
-- Data for Name: ecommerce_monitors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ecommerce_monitors (id, target_url, status, monitoring_frequency, last_run_at, next_run_at, last_scan_result, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: enforcement_cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.enforcement_cases (id, reinspection_id, original_inspection_id, manufacturer_id, assigned_officer_id, status, penalty_amount, created_at, updated_at, resolved_at) FROM stdin;
\.


--
-- Data for Name: improvement_notices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.improvement_notices (id, inspection_id, manufacturer_id, status, violations, due_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inspections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inspections (id, product_id, officer_id, status, risk_level, result, evidence_payload, is_reinspection, parent_inspection_id, created_at, updated_at) FROM stdin;
INSP-24AA9FA9	\N	\N	COMPLETED	LOW	PASS	{"status": "success", "metadata": {"filename": "INSP-24AA9FA9.jpg", "processed_width": 1024, "processed_height": 682, "ocr_status": "SUCCESS", "ocr_error": "", "model_type": "DOMAIN", "model_name": "metroniq.pt", "model_version": "1.0.0", "is_valid_image": true, "validation_note": "Valid product evidence found"}, "yolo_objects": [], "raw_ocr": [{"text": "PEARL MILLET & BLACK RICE MIX", "confidence": 0.9717, "bounding_box": [615, 0, 950, 23], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "100%", "confidence": 1.0, "bounding_box": [408, 47, 467, 82], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "100%", "confidence": 1.0, "bounding_box": [8, 63, 53, 82], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "INGREDIENTS:", "confidence": 0.9999, "bounding_box": [538, 59, 630, 76], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NUTRITION INFORMATION", "confidence": 0.9998, "bounding_box": [805, 53, 977, 73], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VEGETARIAN", "confidence": 1.0, "bounding_box": [0, 82, 67, 99], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VALEN", "confidence": 1.0, "bounding_box": [112, 73, 359, 139], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "GOODNESS", "confidence": 0.9345, "bounding_box": [388, 77, 476, 129], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Pearl Millet (Kambu),", "confidence": 0.9748, "bounding_box": [536, 81, 664, 101], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Serving Size: 50g", "confidence": 0.9993, "bounding_box": [764, 86, 866, 107], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Black Rice.", "confidence": 1.0, "bounding_box": [538, 105, 606, 123], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Servings Per Pack: 10", "confidence": 0.9999, "bounding_box": [763, 106, 891, 126], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "\\u2014 NOURISHING NATURALLY \\u2014", "confidence": 0.9911, "bounding_box": [121, 141, 350, 161], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Nutrients", "confidence": 1.0, "bounding_box": [764, 138, 815, 154], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Per 100g", "confidence": 0.9154, "bounding_box": [875, 136, 924, 154], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Per Serving (50g)", "confidence": 0.9999, "bounding_box": [936, 135, 1022, 153], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "ALLERGEN INFORMATION:", "confidence": 0.9924, "bounding_box": [538, 157, 692, 175], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "PEARL MILLET &", "confidence": 0.9989, "bounding_box": [20, 169, 369, 232], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Energy (kcal)", "confidence": 0.9996, "bounding_box": [764, 162, 832, 181], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "364", "confidence": 1.0, "bounding_box": [888, 162, 912, 180], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "182", "confidence": 1.0, "bounding_box": [968, 161, 991, 179], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Packed in a facility that", "confidence": 0.9982, "bounding_box": [536, 179, 674, 199], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Protein (g)", "confidence": 0.9997, "bounding_box": [765, 186, 821, 204], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "11.2", "confidence": 1.0, "bounding_box": [889, 186, 914, 203], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "5.6", "confidence": 1.0, "bounding_box": [968, 185, 990, 202], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "processes nuts and seeds.", "confidence": 1.0, "bounding_box": [537, 201, 692, 221], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Carbohydrate (g)", "confidence": 0.9992, "bounding_box": [766, 209, 853, 227], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "72.1", "confidence": 1.0, "bounding_box": [888, 208, 915, 226], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "36.1", "confidence": 1.0, "bounding_box": [967, 208, 993, 224], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "BLACK RICE MIX", "confidence": 0.9999, "bounding_box": [22, 227, 371, 287], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Total Sugars (g)", "confidence": 0.9997, "bounding_box": [772, 232, 851, 251], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "1.3", "confidence": 1.0, "bounding_box": [891, 231, 912, 249], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.7", "confidence": 1.0, "bounding_box": [969, 230, 991, 248], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Dietary Fiber (g)", "confidence": 0.9963, "bounding_box": [772, 255, 855, 273], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "8.6", "confidence": 1.0, "bounding_box": [891, 254, 913, 271], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "4.3", "confidence": 1.0, "bounding_box": [969, 253, 991, 270], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "GLUTEN FREE", "confidence": 0.9998, "bounding_box": [583, 263, 656, 281], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Total Fat (g)", "confidence": 0.9712, "bounding_box": [766, 278, 829, 296], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "3.2", "confidence": 1.0, "bounding_box": [891, 277, 913, 293], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "1.6", "confidence": 1.0, "bounding_box": [970, 276, 991, 293], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "HEALTHY GRAINS FOR A BETTER YOU", "confidence": 1.0, "bounding_box": [41, 299, 356, 320], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Saturated Fat (g)", "confidence": 0.9996, "bounding_box": [772, 300, 858, 319], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.6", "confidence": 1.0, "bounding_box": [892, 299, 913, 317], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.3", "confidence": 1.0, "bounding_box": [970, 298, 991, 317], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NO ARTIFICIAL COLORS", "confidence": 0.9992, "bounding_box": [581, 313, 701, 330], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Trans Fat (g)", "confidence": 0.9886, "bounding_box": [773, 324, 838, 342], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0", "confidence": 0.9991, "bounding_box": [896, 324, 909, 340], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0", "confidence": 0.9987, "bounding_box": [974, 322, 987, 339], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Sodium (mg)", "confidence": 0.9995, "bounding_box": [765, 347, 833, 365], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "4", "confidence": 1.0, "bounding_box": [896, 346, 909, 363], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "2", "confidence": 1.0, "bounding_box": [974, 345, 987, 362], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "RICH IN FIBER", "confidence": 0.9999, "bounding_box": [61, 366, 146, 385], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NO PRESERVATIVES", "confidence": 0.9995, "bounding_box": [580, 362, 684, 380], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Supports Digestion", "confidence": 1.0, "bounding_box": [60, 386, 163, 406], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "* Approximate values", "confidence": 0.9918, "bounding_box": [758, 377, 862, 394], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "HIGH IN PROTEIN", "confidence": 0.9999, "bounding_box": [63, 422, 165, 442], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "STORAGE INSTRUCTIONS:", "confidence": 0.9946, "bounding_box": [538, 426, 680, 440], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MANUFACTURED & MARKETED BY:", "confidence": 0.999, "bounding_box": [778, 419, 965, 433], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Helps Build Strength", "confidence": 1.0, "bounding_box": [61, 441, 170, 462], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Store in a cool, dry place.", "confidence": 0.9995, "bounding_box": [538, 447, 670, 464], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VALEN FOODS PRIVATE LIMITED", "confidence": 0.9974, "bounding_box": [779, 440, 987, 455], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Keep away from moisture", "confidence": 0.9928, "bounding_box": [539, 466, 674, 483], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "123, Green Valley: Industrial Estate,", "confidence": 0.9982, "bounding_box": [780, 460, 971, 477], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NATURAL & NUTRITIOUS", "confidence": 0.9727, "bounding_box": [64, 478, 206, 497], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "and direct sunlight.", "confidence": 0.9996, "bounding_box": [538, 484, 643, 501], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Somanur Post, Coimbatore,", "confidence": 0.9943, "bounding_box": [781, 478, 935, 495], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "No Added Preservatives", "confidence": 1.0, "bounding_box": [64, 497, 187, 517], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Tamil Nadu - 641668, India.", "confidence": 0.9833, "bounding_box": [782, 496, 935, 514], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "BATCH NO.", "confidence": 0.9975, "bounding_box": [544, 525, 603, 539], "yolo_region": "GLOBAL_FALLBACK"}, {"text": ": VPMBR0524", "confidence": 0.9701, "bounding_box": [626, 525, 702, 539], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "+91 78458 84098", "confidence": 0.9749, "bounding_box": [808, 521, 907, 538], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MFG. DATE", "confidence": 0.9927, "bounding_box": [545, 548, 607, 565], "yolo_region": "GLOBAL_FALLBACK"}, {"text": ":20 MAY 2024", "confidence": 0.9988, "bounding_box": [624, 547, 709, 566], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "support@valenfoods.com", "confidence": 1.0, "bounding_box": [809, 540, 953, 557], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "www.valenfoods.com", "confidence": 1.0, "bounding_box": [810, 560, 931, 574], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "EXPIRY DATE : 19 NOV 2024", "confidence": 0.9832, "bounding_box": [545, 573, 709, 592], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NET WEIGHT", "confidence": 0.9999, "bounding_box": [2, 597, 86, 615], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Issa", "confidence": 0.9242, "bounding_box": [791, 591, 828, 610], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "LIC. NO. 12423999001234", "confidence": 0.9732, "bounding_box": [839, 590, 998, 607], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MRP", "confidence": 0.9973, "bounding_box": [547, 600, 588, 618], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "150.00", "confidence": 1.0, "bounding_box": [641, 601, 682, 619], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "500g", "confidence": 1.0, "bounding_box": [9, 624, 75, 660], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "(INCL. OF ALL TAXES)", "confidence": 0.9473, "bounding_box": [550, 620, 637, 634], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "8904567890123", "confidence": 0.9989, "bounding_box": [839, 656, 991, 679], "yolo_region": "GLOBAL_FALLBACK"}], "legal_declarations": {"NET_QUANTITY": {"field": "NET_QUANTITY", "value": "500g", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [9, 624, 75, 660], "detection_method": "HOLISTIC_OCR"}, "MANUFACTURER": {"field": "MANUFACTURER", "value": "RICH IN FIBER NO PRESERVATIVES Supports Digestion * Approximate values MANUFACTURED & MARKETED BY:", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [61, 366, 146, 385], "detection_method": "HOLISTIC_OCR"}, "CONSUMER_CARE": {"field": "CONSUMER_CARE", "value": "+91 78458 84098 support@valenfoods.com", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [808, 521, 907, 538], "detection_method": "HOLISTIC_OCR"}, "BATCH": {"field": "BATCH", "value": "BATCH NO.", "confidence": 0.9975, "source": "PaddleOCR", "bounding_box": [544, 525, 603, 539], "detection_method": "HOLISTIC_OCR"}, "DATE": {"field": "DATE", "value": "MFG. DATE", "confidence": 0.9927, "source": "PaddleOCR", "bounding_box": [545, 548, 607, 565], "detection_method": "HOLISTIC_OCR"}, "MRP": {"field": "MRP", "value": "MRP", "confidence": 0.9973, "source": "PaddleOCR", "bounding_box": [547, 600, 588, 618], "detection_method": "HOLISTIC_OCR"}, "PRODUCT_NAME": {"field": "PRODUCT_NAME", "value": "PEARL MILLET & BLACK RICE MIX", "confidence": 0.9717, "source": "PaddleOCR", "bounding_box": [615, 0, 950, 23], "detection_method": "HOLISTIC_OCR"}, "_META_IS_IMPORTED": {"field": "_META_IS_IMPORTED", "value": "False", "confidence": 1.0, "source": "System"}}, "validation": {"compliance": "PASS", "risk_score": "LOW", "numerical_risk": 0, "missing_rule_definitions": [], "evaluations": [{"field": "MRP", "status": "PASS", "evidence": "MRP", "message": "MRP successfully verified (Confidence: 100%)."}, {"field": "NET_QUANTITY", "status": "PASS", "evidence": "500g", "message": "NET_QUANTITY successfully verified (Confidence: 100%)."}, {"field": "MANUFACTURER", "status": "PASS", "evidence": "RICH IN FIBER NO PRESERVATIVES Supports Digestion * Approximate values MANUFACTURED & MARKETED BY:", "message": "MANUFACTURER successfully verified (Confidence: 100%)."}, {"field": "PACKER", "status": "NOT_APPLICABLE", "evidence": "Field not present", "message": "Field PACKER is not required and not present."}, {"field": "IMPORTER", "status": "NOT_APPLICABLE", "evidence": "MISSING_FROM_PACKAGE", "message": "Importer details not applicable for domestic products."}, {"field": "CONSUMER_CARE", "status": "PASS", "evidence": "+91 78458 84098 support@valenfoods.com", "message": "CONSUMER_CARE successfully verified (Confidence: 100%)."}, {"field": "DATE", "status": "PASS", "evidence": "MFG. DATE", "message": "DATE successfully verified (Confidence: 99%)."}, {"field": "BATCH", "status": "PASS", "evidence": "BATCH NO.", "message": "BATCH successfully verified (Confidence: 100%)."}, {"field": "PRODUCT_NAME", "status": "PASS", "evidence": "PEARL MILLET & BLACK RICE MIX", "message": "PRODUCT_NAME successfully verified (Confidence: 97%)."}]}}	f	\N	2026-09-28 01:02:40.56519+05:30	\N
INSP-653370D6	\N	\N	COMPLETED	LOW	PASS	{"status": "success", "metadata": {"filename": "INSP-653370D6.jpg", "processed_width": 1024, "processed_height": 682, "ocr_status": "SUCCESS", "ocr_error": "", "model_type": "DOMAIN", "model_name": "metroniq.pt", "model_version": "1.0.0", "is_valid_image": true, "validation_note": "Valid product evidence found"}, "yolo_objects": [], "raw_ocr": [{"text": "PEARL MILLET & BLACK RICE MIX", "confidence": 0.9717, "bounding_box": [615, 0, 950, 23], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "100%", "confidence": 1.0, "bounding_box": [408, 47, 467, 82], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "100%", "confidence": 1.0, "bounding_box": [8, 63, 53, 82], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "INGREDIENTS:", "confidence": 0.9999, "bounding_box": [538, 59, 630, 76], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NUTRITION INFORMATION", "confidence": 0.9998, "bounding_box": [805, 53, 977, 73], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VEGETARIAN", "confidence": 1.0, "bounding_box": [0, 82, 67, 99], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VALEN", "confidence": 1.0, "bounding_box": [112, 73, 359, 139], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "GOODNESS", "confidence": 0.9345, "bounding_box": [388, 77, 476, 129], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Pearl Millet (Kambu),", "confidence": 0.9748, "bounding_box": [536, 81, 664, 101], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Serving Size: 50g", "confidence": 0.9993, "bounding_box": [764, 86, 866, 107], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Black Rice.", "confidence": 1.0, "bounding_box": [538, 105, 606, 123], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Servings Per Pack: 10", "confidence": 0.9999, "bounding_box": [763, 106, 891, 126], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "\\u2014 NOURISHING NATURALLY \\u2014", "confidence": 0.9911, "bounding_box": [121, 141, 350, 161], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Nutrients", "confidence": 1.0, "bounding_box": [764, 138, 815, 154], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Per 100g", "confidence": 0.9154, "bounding_box": [875, 136, 924, 154], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Per Serving (50g)", "confidence": 0.9999, "bounding_box": [936, 135, 1022, 153], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "ALLERGEN INFORMATION:", "confidence": 0.9924, "bounding_box": [538, 157, 692, 175], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "PEARL MILLET &", "confidence": 0.9989, "bounding_box": [20, 169, 369, 232], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Energy (kcal)", "confidence": 0.9996, "bounding_box": [764, 162, 832, 181], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "364", "confidence": 1.0, "bounding_box": [888, 162, 912, 180], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "182", "confidence": 1.0, "bounding_box": [968, 161, 991, 179], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Packed in a facility that", "confidence": 0.9982, "bounding_box": [536, 179, 674, 199], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Protein (g)", "confidence": 0.9997, "bounding_box": [765, 186, 821, 204], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "11.2", "confidence": 1.0, "bounding_box": [889, 186, 914, 203], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "5.6", "confidence": 1.0, "bounding_box": [968, 185, 990, 202], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "processes nuts and seeds.", "confidence": 1.0, "bounding_box": [537, 201, 692, 221], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Carbohydrate (g)", "confidence": 0.9992, "bounding_box": [766, 209, 853, 227], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "72.1", "confidence": 1.0, "bounding_box": [888, 208, 915, 226], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "36.1", "confidence": 1.0, "bounding_box": [967, 208, 993, 224], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "BLACK RICE MIX", "confidence": 0.9999, "bounding_box": [22, 227, 371, 287], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Total Sugars (g)", "confidence": 0.9997, "bounding_box": [772, 232, 851, 251], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "1.3", "confidence": 1.0, "bounding_box": [891, 231, 912, 249], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.7", "confidence": 1.0, "bounding_box": [969, 230, 991, 248], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Dietary Fiber (g)", "confidence": 0.9963, "bounding_box": [772, 255, 855, 273], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "8.6", "confidence": 1.0, "bounding_box": [891, 254, 913, 271], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "4.3", "confidence": 1.0, "bounding_box": [969, 253, 991, 270], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "GLUTEN FREE", "confidence": 0.9998, "bounding_box": [583, 263, 656, 281], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Total Fat (g)", "confidence": 0.9712, "bounding_box": [766, 278, 829, 296], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "3.2", "confidence": 1.0, "bounding_box": [891, 277, 913, 293], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "1.6", "confidence": 1.0, "bounding_box": [970, 276, 991, 293], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "HEALTHY GRAINS FOR A BETTER YOU", "confidence": 1.0, "bounding_box": [41, 299, 356, 320], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Saturated Fat (g)", "confidence": 0.9996, "bounding_box": [772, 300, 858, 319], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.6", "confidence": 1.0, "bounding_box": [892, 299, 913, 317], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.3", "confidence": 1.0, "bounding_box": [970, 298, 991, 317], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NO ARTIFICIAL COLORS", "confidence": 0.9992, "bounding_box": [581, 313, 701, 330], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Trans Fat (g)", "confidence": 0.9886, "bounding_box": [773, 324, 838, 342], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0", "confidence": 0.9991, "bounding_box": [896, 324, 909, 340], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0", "confidence": 0.9987, "bounding_box": [974, 322, 987, 339], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Sodium (mg)", "confidence": 0.9995, "bounding_box": [765, 347, 833, 365], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "4", "confidence": 1.0, "bounding_box": [896, 346, 909, 363], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "2", "confidence": 1.0, "bounding_box": [974, 345, 987, 362], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "RICH IN FIBER", "confidence": 0.9999, "bounding_box": [61, 366, 146, 385], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NO PRESERVATIVES", "confidence": 0.9995, "bounding_box": [580, 362, 684, 380], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Supports Digestion", "confidence": 1.0, "bounding_box": [60, 386, 163, 406], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "* Approximate values", "confidence": 0.9918, "bounding_box": [758, 377, 862, 394], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "HIGH IN PROTEIN", "confidence": 0.9999, "bounding_box": [63, 422, 165, 442], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "STORAGE INSTRUCTIONS:", "confidence": 0.9946, "bounding_box": [538, 426, 680, 440], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MANUFACTURED & MARKETED BY:", "confidence": 0.999, "bounding_box": [778, 419, 965, 433], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Helps Build Strength", "confidence": 1.0, "bounding_box": [61, 441, 170, 462], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Store in a cool, dry place.", "confidence": 0.9995, "bounding_box": [538, 447, 670, 464], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VALEN FOODS PRIVATE LIMITED", "confidence": 0.9974, "bounding_box": [779, 440, 987, 455], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Keep away from moisture", "confidence": 0.9928, "bounding_box": [539, 466, 674, 483], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "123, Green Valley: Industrial Estate,", "confidence": 0.9982, "bounding_box": [780, 460, 971, 477], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NATURAL & NUTRITIOUS", "confidence": 0.9727, "bounding_box": [64, 478, 206, 497], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "and direct sunlight.", "confidence": 0.9996, "bounding_box": [538, 484, 643, 501], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Somanur Post, Coimbatore,", "confidence": 0.9943, "bounding_box": [781, 478, 935, 495], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "No Added Preservatives", "confidence": 1.0, "bounding_box": [64, 497, 187, 517], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Tamil Nadu - 641668, India.", "confidence": 0.9833, "bounding_box": [782, 496, 935, 514], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "BATCH NO.", "confidence": 0.9975, "bounding_box": [544, 525, 603, 539], "yolo_region": "GLOBAL_FALLBACK"}, {"text": ": VPMBR0524", "confidence": 0.9701, "bounding_box": [626, 525, 702, 539], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "+91 78458 84098", "confidence": 0.9749, "bounding_box": [808, 521, 907, 538], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MFG. DATE", "confidence": 0.9927, "bounding_box": [545, 548, 607, 565], "yolo_region": "GLOBAL_FALLBACK"}, {"text": ":20 MAY 2024", "confidence": 0.9988, "bounding_box": [624, 547, 709, 566], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "support@valenfoods.com", "confidence": 1.0, "bounding_box": [809, 540, 953, 557], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "www.valenfoods.com", "confidence": 1.0, "bounding_box": [810, 560, 931, 574], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "EXPIRY DATE : 19 NOV 2024", "confidence": 0.9832, "bounding_box": [545, 573, 709, 592], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NET WEIGHT", "confidence": 0.9999, "bounding_box": [2, 597, 86, 615], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Issa", "confidence": 0.9242, "bounding_box": [791, 591, 828, 610], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "LIC. NO. 12423999001234", "confidence": 0.9732, "bounding_box": [839, 590, 998, 607], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MRP", "confidence": 0.9973, "bounding_box": [547, 600, 588, 618], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "150.00", "confidence": 1.0, "bounding_box": [641, 601, 682, 619], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "500g", "confidence": 1.0, "bounding_box": [9, 624, 75, 660], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "(INCL. OF ALL TAXES)", "confidence": 0.9473, "bounding_box": [550, 620, 637, 634], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "8904567890123", "confidence": 0.9989, "bounding_box": [839, 656, 991, 679], "yolo_region": "GLOBAL_FALLBACK"}], "legal_declarations": {"NET_QUANTITY": {"field": "NET_QUANTITY", "value": "500g", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [9, 624, 75, 660], "detection_method": "HOLISTIC_OCR"}, "MANUFACTURER": {"field": "MANUFACTURER", "value": "RICH IN FIBER NO PRESERVATIVES Supports Digestion * Approximate values MANUFACTURED & MARKETED BY:", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [61, 366, 146, 385], "detection_method": "HOLISTIC_OCR"}, "CONSUMER_CARE": {"field": "CONSUMER_CARE", "value": "+91 78458 84098 support@valenfoods.com", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [808, 521, 907, 538], "detection_method": "HOLISTIC_OCR"}, "BATCH": {"field": "BATCH", "value": "BATCH NO.", "confidence": 0.9975, "source": "PaddleOCR", "bounding_box": [544, 525, 603, 539], "detection_method": "HOLISTIC_OCR"}, "DATE": {"field": "DATE", "value": "MFG. DATE", "confidence": 0.9927, "source": "PaddleOCR", "bounding_box": [545, 548, 607, 565], "detection_method": "HOLISTIC_OCR"}, "MRP": {"field": "MRP", "value": "MRP", "confidence": 0.9973, "source": "PaddleOCR", "bounding_box": [547, 600, 588, 618], "detection_method": "HOLISTIC_OCR"}, "PRODUCT_NAME": {"field": "PRODUCT_NAME", "value": "PEARL MILLET & BLACK RICE MIX", "confidence": 0.9717, "source": "PaddleOCR", "bounding_box": [615, 0, 950, 23], "detection_method": "HOLISTIC_OCR"}, "_META_IS_IMPORTED": {"field": "_META_IS_IMPORTED", "value": "False", "confidence": 1.0, "source": "System"}}, "validation": {"compliance": "PASS", "risk_score": "LOW", "numerical_risk": 0, "missing_rule_definitions": [], "evaluations": [{"field": "MRP", "status": "PASS", "evidence": "MRP", "message": "MRP successfully verified (Confidence: 100%)."}, {"field": "NET_QUANTITY", "status": "PASS", "evidence": "500g", "message": "NET_QUANTITY successfully verified (Confidence: 100%)."}, {"field": "MANUFACTURER", "status": "PASS", "evidence": "RICH IN FIBER NO PRESERVATIVES Supports Digestion * Approximate values MANUFACTURED & MARKETED BY:", "message": "MANUFACTURER successfully verified (Confidence: 100%)."}, {"field": "PACKER", "status": "NOT_APPLICABLE", "evidence": "Field not present", "message": "Field PACKER is not required and not present."}, {"field": "IMPORTER", "status": "NOT_APPLICABLE", "evidence": "MISSING_FROM_PACKAGE", "message": "Importer details not applicable for domestic products."}, {"field": "CONSUMER_CARE", "status": "PASS", "evidence": "+91 78458 84098 support@valenfoods.com", "message": "CONSUMER_CARE successfully verified (Confidence: 100%)."}, {"field": "DATE", "status": "PASS", "evidence": "MFG. DATE", "message": "DATE successfully verified (Confidence: 99%)."}, {"field": "BATCH", "status": "PASS", "evidence": "BATCH NO.", "message": "BATCH successfully verified (Confidence: 100%)."}, {"field": "PRODUCT_NAME", "status": "PASS", "evidence": "PEARL MILLET & BLACK RICE MIX", "message": "PRODUCT_NAME successfully verified (Confidence: 97%)."}]}}	f	\N	2026-09-28 01:05:40.452739+05:30	\N
INSP-A911B738	\N	\N	COMPLETED	LOW	PASS	{"status": "success", "metadata": {"filename": "INSP-A911B738.jpg", "processed_width": 1024, "processed_height": 682, "ocr_status": "SUCCESS", "ocr_error": "", "model_type": "DOMAIN", "model_name": "metroniq.pt", "model_version": "1.0.0", "is_valid_image": true, "validation_note": "Valid product evidence found"}, "yolo_objects": [], "raw_ocr": [{"text": "PEARL MILLET & BLACK RICE MIX", "confidence": 0.9717, "bounding_box": [615, 0, 950, 23], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "100%", "confidence": 1.0, "bounding_box": [408, 47, 467, 82], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "100%", "confidence": 1.0, "bounding_box": [8, 63, 53, 82], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "INGREDIENTS:", "confidence": 0.9999, "bounding_box": [538, 59, 630, 76], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NUTRITION INFORMATION", "confidence": 0.9998, "bounding_box": [805, 53, 977, 73], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VEGETARIAN", "confidence": 1.0, "bounding_box": [0, 82, 67, 99], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VALEN", "confidence": 1.0, "bounding_box": [112, 73, 359, 139], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "GOODNESS", "confidence": 0.9345, "bounding_box": [388, 77, 476, 129], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Pearl Millet (Kambu),", "confidence": 0.9748, "bounding_box": [536, 81, 664, 101], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Serving Size: 50g", "confidence": 0.9993, "bounding_box": [764, 86, 866, 107], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Black Rice.", "confidence": 1.0, "bounding_box": [538, 105, 606, 123], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Servings Per Pack: 10", "confidence": 0.9999, "bounding_box": [763, 106, 891, 126], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "\\u2014 NOURISHING NATURALLY \\u2014", "confidence": 0.9911, "bounding_box": [121, 141, 350, 161], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Nutrients", "confidence": 1.0, "bounding_box": [764, 138, 815, 154], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Per 100g", "confidence": 0.9154, "bounding_box": [875, 136, 924, 154], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Per Serving (50g)", "confidence": 0.9999, "bounding_box": [936, 135, 1022, 153], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "ALLERGEN INFORMATION:", "confidence": 0.9924, "bounding_box": [538, 157, 692, 175], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "PEARL MILLET &", "confidence": 0.9989, "bounding_box": [20, 169, 369, 232], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Energy (kcal)", "confidence": 0.9996, "bounding_box": [764, 162, 832, 181], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "364", "confidence": 1.0, "bounding_box": [888, 162, 912, 180], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "182", "confidence": 1.0, "bounding_box": [968, 161, 991, 179], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Packed in a facility that", "confidence": 0.9982, "bounding_box": [536, 179, 674, 199], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Protein (g)", "confidence": 0.9997, "bounding_box": [765, 186, 821, 204], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "11.2", "confidence": 1.0, "bounding_box": [889, 186, 914, 203], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "5.6", "confidence": 1.0, "bounding_box": [968, 185, 990, 202], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "processes nuts and seeds.", "confidence": 1.0, "bounding_box": [537, 201, 692, 221], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Carbohydrate (g)", "confidence": 0.9992, "bounding_box": [766, 209, 853, 227], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "72.1", "confidence": 1.0, "bounding_box": [888, 208, 915, 226], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "36.1", "confidence": 1.0, "bounding_box": [967, 208, 993, 224], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "BLACK RICE MIX", "confidence": 0.9999, "bounding_box": [22, 227, 371, 287], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Total Sugars (g)", "confidence": 0.9997, "bounding_box": [772, 232, 851, 251], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "1.3", "confidence": 1.0, "bounding_box": [891, 231, 912, 249], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.7", "confidence": 1.0, "bounding_box": [969, 230, 991, 248], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Dietary Fiber (g)", "confidence": 0.9963, "bounding_box": [772, 255, 855, 273], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "8.6", "confidence": 1.0, "bounding_box": [891, 254, 913, 271], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "4.3", "confidence": 1.0, "bounding_box": [969, 253, 991, 270], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "GLUTEN FREE", "confidence": 0.9998, "bounding_box": [583, 263, 656, 281], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Total Fat (g)", "confidence": 0.9712, "bounding_box": [766, 278, 829, 296], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "3.2", "confidence": 1.0, "bounding_box": [891, 277, 913, 293], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "1.6", "confidence": 1.0, "bounding_box": [970, 276, 991, 293], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "HEALTHY GRAINS FOR A BETTER YOU", "confidence": 1.0, "bounding_box": [41, 299, 356, 320], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Saturated Fat (g)", "confidence": 0.9996, "bounding_box": [772, 300, 858, 319], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.6", "confidence": 1.0, "bounding_box": [892, 299, 913, 317], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.3", "confidence": 1.0, "bounding_box": [970, 298, 991, 317], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NO ARTIFICIAL COLORS", "confidence": 0.9992, "bounding_box": [581, 313, 701, 330], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Trans Fat (g)", "confidence": 0.9886, "bounding_box": [773, 324, 838, 342], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0", "confidence": 0.9991, "bounding_box": [896, 324, 909, 340], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0", "confidence": 0.9987, "bounding_box": [974, 322, 987, 339], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Sodium (mg)", "confidence": 0.9995, "bounding_box": [765, 347, 833, 365], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "4", "confidence": 1.0, "bounding_box": [896, 346, 909, 363], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "2", "confidence": 1.0, "bounding_box": [974, 345, 987, 362], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "RICH IN FIBER", "confidence": 0.9999, "bounding_box": [61, 366, 146, 385], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NO PRESERVATIVES", "confidence": 0.9995, "bounding_box": [580, 362, 684, 380], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Supports Digestion", "confidence": 1.0, "bounding_box": [60, 386, 163, 406], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "* Approximate values", "confidence": 0.9918, "bounding_box": [758, 377, 862, 394], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "HIGH IN PROTEIN", "confidence": 0.9999, "bounding_box": [63, 422, 165, 442], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "STORAGE INSTRUCTIONS:", "confidence": 0.9946, "bounding_box": [538, 426, 680, 440], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MANUFACTURED & MARKETED BY:", "confidence": 0.999, "bounding_box": [778, 419, 965, 433], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Helps Build Strength", "confidence": 1.0, "bounding_box": [61, 441, 170, 462], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Store in a cool, dry place.", "confidence": 0.9995, "bounding_box": [538, 447, 670, 464], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VALEN FOODS PRIVATE LIMITED", "confidence": 0.9974, "bounding_box": [779, 440, 987, 455], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Keep away from moisture", "confidence": 0.9928, "bounding_box": [539, 466, 674, 483], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "123, Green Valley: Industrial Estate,", "confidence": 0.9982, "bounding_box": [780, 460, 971, 477], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NATURAL & NUTRITIOUS", "confidence": 0.9727, "bounding_box": [64, 478, 206, 497], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "and direct sunlight.", "confidence": 0.9996, "bounding_box": [538, 484, 643, 501], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Somanur Post, Coimbatore,", "confidence": 0.9943, "bounding_box": [781, 478, 935, 495], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "No Added Preservatives", "confidence": 1.0, "bounding_box": [64, 497, 187, 517], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Tamil Nadu - 641668, India.", "confidence": 0.9833, "bounding_box": [782, 496, 935, 514], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "BATCH NO.", "confidence": 0.9975, "bounding_box": [544, 525, 603, 539], "yolo_region": "GLOBAL_FALLBACK"}, {"text": ": VPMBR0524", "confidence": 0.9701, "bounding_box": [626, 525, 702, 539], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "+91 78458 84098", "confidence": 0.9749, "bounding_box": [808, 521, 907, 538], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MFG. DATE", "confidence": 0.9927, "bounding_box": [545, 548, 607, 565], "yolo_region": "GLOBAL_FALLBACK"}, {"text": ":20 MAY 2024", "confidence": 0.9988, "bounding_box": [624, 547, 709, 566], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "support@valenfoods.com", "confidence": 1.0, "bounding_box": [809, 540, 953, 557], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "www.valenfoods.com", "confidence": 1.0, "bounding_box": [810, 560, 931, 574], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "EXPIRY DATE : 19 NOV 2024", "confidence": 0.9832, "bounding_box": [545, 573, 709, 592], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NET WEIGHT", "confidence": 0.9999, "bounding_box": [2, 597, 86, 615], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Issa", "confidence": 0.9242, "bounding_box": [791, 591, 828, 610], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "LIC. NO. 12423999001234", "confidence": 0.9732, "bounding_box": [839, 590, 998, 607], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MRP", "confidence": 0.9973, "bounding_box": [547, 600, 588, 618], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "150.00", "confidence": 1.0, "bounding_box": [641, 601, 682, 619], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "500g", "confidence": 1.0, "bounding_box": [9, 624, 75, 660], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "(INCL. OF ALL TAXES)", "confidence": 0.9473, "bounding_box": [550, 620, 637, 634], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "8904567890123", "confidence": 0.9989, "bounding_box": [839, 656, 991, 679], "yolo_region": "GLOBAL_FALLBACK"}], "legal_declarations": {"NET_QUANTITY": {"field": "NET_QUANTITY", "value": "500g", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [9, 624, 75, 660], "detection_method": "HOLISTIC_OCR"}, "MANUFACTURER": {"field": "MANUFACTURER", "value": "RICH IN FIBER NO PRESERVATIVES Supports Digestion * Approximate values MANUFACTURED & MARKETED BY:", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [61, 366, 146, 385], "detection_method": "HOLISTIC_OCR"}, "CONSUMER_CARE": {"field": "CONSUMER_CARE", "value": "+91 78458 84098 support@valenfoods.com", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [808, 521, 907, 538], "detection_method": "HOLISTIC_OCR"}, "BATCH": {"field": "BATCH", "value": "BATCH NO.", "confidence": 0.9975, "source": "PaddleOCR", "bounding_box": [544, 525, 603, 539], "detection_method": "HOLISTIC_OCR"}, "DATE": {"field": "DATE", "value": "MFG. DATE", "confidence": 0.9927, "source": "PaddleOCR", "bounding_box": [545, 548, 607, 565], "detection_method": "HOLISTIC_OCR"}, "MRP": {"field": "MRP", "value": "MRP", "confidence": 0.9973, "source": "PaddleOCR", "bounding_box": [547, 600, 588, 618], "detection_method": "HOLISTIC_OCR"}, "PRODUCT_NAME": {"field": "PRODUCT_NAME", "value": "PEARL MILLET & BLACK RICE MIX", "confidence": 0.9717, "source": "PaddleOCR", "bounding_box": [615, 0, 950, 23], "detection_method": "HOLISTIC_OCR"}, "_META_IS_IMPORTED": {"field": "_META_IS_IMPORTED", "value": "False", "confidence": 1.0, "source": "System"}}, "validation": {"compliance": "PASS", "risk_score": "LOW", "numerical_risk": 0, "missing_rule_definitions": [], "evaluations": [{"field": "MRP", "status": "PASS", "evidence": "MRP", "message": "MRP successfully verified (Confidence: 100%)."}, {"field": "NET_QUANTITY", "status": "PASS", "evidence": "500g", "message": "NET_QUANTITY successfully verified (Confidence: 100%)."}, {"field": "MANUFACTURER", "status": "PASS", "evidence": "RICH IN FIBER NO PRESERVATIVES Supports Digestion * Approximate values MANUFACTURED & MARKETED BY:", "message": "MANUFACTURER successfully verified (Confidence: 100%)."}, {"field": "PACKER", "status": "NOT_APPLICABLE", "evidence": "Field not present", "message": "Field PACKER is not required and not present."}, {"field": "IMPORTER", "status": "NOT_APPLICABLE", "evidence": "MISSING_FROM_PACKAGE", "message": "Importer details not applicable for domestic products."}, {"field": "CONSUMER_CARE", "status": "PASS", "evidence": "+91 78458 84098 support@valenfoods.com", "message": "CONSUMER_CARE successfully verified (Confidence: 100%)."}, {"field": "DATE", "status": "PASS", "evidence": "MFG. DATE", "message": "DATE successfully verified (Confidence: 99%)."}, {"field": "BATCH", "status": "PASS", "evidence": "BATCH NO.", "message": "BATCH successfully verified (Confidence: 100%)."}, {"field": "PRODUCT_NAME", "status": "PASS", "evidence": "PEARL MILLET & BLACK RICE MIX", "message": "PRODUCT_NAME successfully verified (Confidence: 97%)."}]}}	f	\N	2026-09-28 01:10:47.685756+05:30	\N
INSP-0BB76AC4	\N	\N	COMPLETED	LOW	PASS	{"status": "success", "metadata": {"filename": "INSP-0BB76AC4.jpg", "processed_width": 1024, "processed_height": 682, "ocr_status": "SUCCESS", "ocr_error": "", "model_type": "DOMAIN", "model_name": "metroniq.pt", "model_version": "1.0.0", "is_valid_image": true, "validation_note": "Valid product evidence found"}, "yolo_objects": [], "raw_ocr": [{"text": "PEARL MILLET & BLACK RICE MIX", "confidence": 0.9717, "bounding_box": [615, 0, 950, 23], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "100%", "confidence": 1.0, "bounding_box": [408, 47, 467, 82], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "100%", "confidence": 1.0, "bounding_box": [8, 63, 53, 82], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "INGREDIENTS:", "confidence": 0.9999, "bounding_box": [538, 59, 630, 76], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NUTRITION INFORMATION", "confidence": 0.9998, "bounding_box": [805, 53, 977, 73], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VEGETARIAN", "confidence": 1.0, "bounding_box": [0, 82, 67, 99], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VALEN", "confidence": 1.0, "bounding_box": [112, 73, 359, 139], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "GOODNESS", "confidence": 0.9345, "bounding_box": [388, 77, 476, 129], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Pearl Millet (Kambu),", "confidence": 0.9748, "bounding_box": [536, 81, 664, 101], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Serving Size: 50g", "confidence": 0.9993, "bounding_box": [764, 86, 866, 107], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Black Rice.", "confidence": 1.0, "bounding_box": [538, 105, 606, 123], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Servings Per Pack: 10", "confidence": 0.9999, "bounding_box": [763, 106, 891, 126], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "\\u2014 NOURISHING NATURALLY \\u2014", "confidence": 0.9911, "bounding_box": [121, 141, 350, 161], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Nutrients", "confidence": 1.0, "bounding_box": [764, 138, 815, 154], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Per 100g", "confidence": 0.9154, "bounding_box": [875, 136, 924, 154], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Per Serving (50g)", "confidence": 0.9999, "bounding_box": [936, 135, 1022, 153], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "ALLERGEN INFORMATION:", "confidence": 0.9924, "bounding_box": [538, 157, 692, 175], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "PEARL MILLET &", "confidence": 0.9989, "bounding_box": [20, 169, 369, 232], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Energy (kcal)", "confidence": 0.9996, "bounding_box": [764, 162, 832, 181], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "364", "confidence": 1.0, "bounding_box": [888, 162, 912, 180], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "182", "confidence": 1.0, "bounding_box": [968, 161, 991, 179], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Packed in a facility that", "confidence": 0.9982, "bounding_box": [536, 179, 674, 199], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Protein (g)", "confidence": 0.9997, "bounding_box": [765, 186, 821, 204], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "11.2", "confidence": 1.0, "bounding_box": [889, 186, 914, 203], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "5.6", "confidence": 1.0, "bounding_box": [968, 185, 990, 202], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "processes nuts and seeds.", "confidence": 1.0, "bounding_box": [537, 201, 692, 221], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Carbohydrate (g)", "confidence": 0.9992, "bounding_box": [766, 209, 853, 227], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "72.1", "confidence": 1.0, "bounding_box": [888, 208, 915, 226], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "36.1", "confidence": 1.0, "bounding_box": [967, 208, 993, 224], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "BLACK RICE MIX", "confidence": 0.9999, "bounding_box": [22, 227, 371, 287], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Total Sugars (g)", "confidence": 0.9997, "bounding_box": [772, 232, 851, 251], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "1.3", "confidence": 1.0, "bounding_box": [891, 231, 912, 249], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.7", "confidence": 1.0, "bounding_box": [969, 230, 991, 248], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Dietary Fiber (g)", "confidence": 0.9963, "bounding_box": [772, 255, 855, 273], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "8.6", "confidence": 1.0, "bounding_box": [891, 254, 913, 271], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "4.3", "confidence": 1.0, "bounding_box": [969, 253, 991, 270], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "GLUTEN FREE", "confidence": 0.9998, "bounding_box": [583, 263, 656, 281], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Total Fat (g)", "confidence": 0.9712, "bounding_box": [766, 278, 829, 296], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "3.2", "confidence": 1.0, "bounding_box": [891, 277, 913, 293], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "1.6", "confidence": 1.0, "bounding_box": [970, 276, 991, 293], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "HEALTHY GRAINS FOR A BETTER YOU", "confidence": 1.0, "bounding_box": [41, 299, 356, 320], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Saturated Fat (g)", "confidence": 0.9996, "bounding_box": [772, 300, 858, 319], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.6", "confidence": 1.0, "bounding_box": [892, 299, 913, 317], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.3", "confidence": 1.0, "bounding_box": [970, 298, 991, 317], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NO ARTIFICIAL COLORS", "confidence": 0.9992, "bounding_box": [581, 313, 701, 330], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Trans Fat (g)", "confidence": 0.9886, "bounding_box": [773, 324, 838, 342], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0", "confidence": 0.9991, "bounding_box": [896, 324, 909, 340], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0", "confidence": 0.9987, "bounding_box": [974, 322, 987, 339], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Sodium (mg)", "confidence": 0.9995, "bounding_box": [765, 347, 833, 365], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "4", "confidence": 1.0, "bounding_box": [896, 346, 909, 363], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "2", "confidence": 1.0, "bounding_box": [974, 345, 987, 362], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "RICH IN FIBER", "confidence": 0.9999, "bounding_box": [61, 366, 146, 385], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NO PRESERVATIVES", "confidence": 0.9995, "bounding_box": [580, 362, 684, 380], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Supports Digestion", "confidence": 1.0, "bounding_box": [60, 386, 163, 406], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "* Approximate values", "confidence": 0.9918, "bounding_box": [758, 377, 862, 394], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "HIGH IN PROTEIN", "confidence": 0.9999, "bounding_box": [63, 422, 165, 442], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "STORAGE INSTRUCTIONS:", "confidence": 0.9946, "bounding_box": [538, 426, 680, 440], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MANUFACTURED & MARKETED BY:", "confidence": 0.999, "bounding_box": [778, 419, 965, 433], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Helps Build Strength", "confidence": 1.0, "bounding_box": [61, 441, 170, 462], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Store in a cool, dry place.", "confidence": 0.9995, "bounding_box": [538, 447, 670, 464], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VALEN FOODS PRIVATE LIMITED", "confidence": 0.9974, "bounding_box": [779, 440, 987, 455], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Keep away from moisture", "confidence": 0.9928, "bounding_box": [539, 466, 674, 483], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "123, Green Valley: Industrial Estate,", "confidence": 0.9982, "bounding_box": [780, 460, 971, 477], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NATURAL & NUTRITIOUS", "confidence": 0.9727, "bounding_box": [64, 478, 206, 497], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "and direct sunlight.", "confidence": 0.9996, "bounding_box": [538, 484, 643, 501], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Somanur Post, Coimbatore,", "confidence": 0.9943, "bounding_box": [781, 478, 935, 495], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "No Added Preservatives", "confidence": 1.0, "bounding_box": [64, 497, 187, 517], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Tamil Nadu - 641668, India.", "confidence": 0.9833, "bounding_box": [782, 496, 935, 514], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "BATCH NO.", "confidence": 0.9975, "bounding_box": [544, 525, 603, 539], "yolo_region": "GLOBAL_FALLBACK"}, {"text": ": VPMBR0524", "confidence": 0.9701, "bounding_box": [626, 525, 702, 539], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "+91 78458 84098", "confidence": 0.9749, "bounding_box": [808, 521, 907, 538], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MFG. DATE", "confidence": 0.9927, "bounding_box": [545, 548, 607, 565], "yolo_region": "GLOBAL_FALLBACK"}, {"text": ":20 MAY 2024", "confidence": 0.9988, "bounding_box": [624, 547, 709, 566], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "support@valenfoods.com", "confidence": 1.0, "bounding_box": [809, 540, 953, 557], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "www.valenfoods.com", "confidence": 1.0, "bounding_box": [810, 560, 931, 574], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "EXPIRY DATE : 19 NOV 2024", "confidence": 0.9832, "bounding_box": [545, 573, 709, 592], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NET WEIGHT", "confidence": 0.9999, "bounding_box": [2, 597, 86, 615], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Issa", "confidence": 0.9242, "bounding_box": [791, 591, 828, 610], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "LIC. NO. 12423999001234", "confidence": 0.9732, "bounding_box": [839, 590, 998, 607], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MRP", "confidence": 0.9973, "bounding_box": [547, 600, 588, 618], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "150.00", "confidence": 1.0, "bounding_box": [641, 601, 682, 619], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "500g", "confidence": 1.0, "bounding_box": [9, 624, 75, 660], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "(INCL. OF ALL TAXES)", "confidence": 0.9473, "bounding_box": [550, 620, 637, 634], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "8904567890123", "confidence": 0.9989, "bounding_box": [839, 656, 991, 679], "yolo_region": "GLOBAL_FALLBACK"}], "legal_declarations": {"NET_QUANTITY": {"field": "NET_QUANTITY", "value": "500g", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [9, 624, 75, 660], "detection_method": "HOLISTIC_OCR"}, "MANUFACTURER": {"field": "MANUFACTURER", "value": "RICH IN FIBER NO PRESERVATIVES Supports Digestion * Approximate values MANUFACTURED & MARKETED BY:", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [61, 366, 146, 385], "detection_method": "HOLISTIC_OCR"}, "CONSUMER_CARE": {"field": "CONSUMER_CARE", "value": "+91 78458 84098 support@valenfoods.com", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [808, 521, 907, 538], "detection_method": "HOLISTIC_OCR"}, "BATCH": {"field": "BATCH", "value": "BATCH NO.", "confidence": 0.9975, "source": "PaddleOCR", "bounding_box": [544, 525, 603, 539], "detection_method": "HOLISTIC_OCR"}, "DATE": {"field": "DATE", "value": "MFG. DATE", "confidence": 0.9927, "source": "PaddleOCR", "bounding_box": [545, 548, 607, 565], "detection_method": "HOLISTIC_OCR"}, "MRP": {"field": "MRP", "value": "MRP", "confidence": 0.9973, "source": "PaddleOCR", "bounding_box": [547, 600, 588, 618], "detection_method": "HOLISTIC_OCR"}, "PRODUCT_NAME": {"field": "PRODUCT_NAME", "value": "PEARL MILLET & BLACK RICE MIX", "confidence": 0.9717, "source": "PaddleOCR", "bounding_box": [615, 0, 950, 23], "detection_method": "HOLISTIC_OCR"}, "_META_IS_IMPORTED": {"field": "_META_IS_IMPORTED", "value": "False", "confidence": 1.0, "source": "System"}}, "validation": {"compliance": "PASS", "risk_score": "LOW", "numerical_risk": 0, "missing_rule_definitions": [], "evaluations": [{"field": "MRP", "status": "PASS", "evidence": "MRP", "message": "MRP successfully verified (Confidence: 100%)."}, {"field": "NET_QUANTITY", "status": "PASS", "evidence": "500g", "message": "NET_QUANTITY successfully verified (Confidence: 100%)."}, {"field": "MANUFACTURER", "status": "PASS", "evidence": "RICH IN FIBER NO PRESERVATIVES Supports Digestion * Approximate values MANUFACTURED & MARKETED BY:", "message": "MANUFACTURER successfully verified (Confidence: 100%)."}, {"field": "PACKER", "status": "NOT_APPLICABLE", "evidence": "Field not present", "message": "Field PACKER is not required and not present."}, {"field": "IMPORTER", "status": "NOT_APPLICABLE", "evidence": "MISSING_FROM_PACKAGE", "message": "Importer details not applicable for domestic products."}, {"field": "CONSUMER_CARE", "status": "PASS", "evidence": "+91 78458 84098 support@valenfoods.com", "message": "CONSUMER_CARE successfully verified (Confidence: 100%)."}, {"field": "DATE", "status": "PASS", "evidence": "MFG. DATE", "message": "DATE successfully verified (Confidence: 99%)."}, {"field": "BATCH", "status": "PASS", "evidence": "BATCH NO.", "message": "BATCH successfully verified (Confidence: 100%)."}, {"field": "PRODUCT_NAME", "status": "PASS", "evidence": "PEARL MILLET & BLACK RICE MIX", "message": "PRODUCT_NAME successfully verified (Confidence: 97%)."}]}}	f	\N	2026-09-28 01:43:51.537994+05:30	\N
INSP-AFC7B9CE	\N	\N	COMPLETED	LOW	INVALID_IMAGE	{"status": "success", "metadata": {"filename": "INSP-AFC7B9CE.jpg", "processed_width": 100, "processed_height": 100, "ocr_status": "SUCCESS", "ocr_error": "", "model_type": "DOMAIN", "model_name": "metroniq.pt", "model_version": "1.0.0", "is_valid_image": false, "validation_note": "No valid product/package detected for inspection"}, "yolo_objects": [], "raw_ocr": [{"text": "", "confidence": 0.0, "bounding_box": [0, 0, 100, 100], "yolo_region": "GLOBAL_FALLBACK"}], "legal_declarations": {"_META_IS_IMPORTED": {"field": "_META_IS_IMPORTED", "value": "False", "confidence": 1.0, "source": "System"}}, "validation": {"compliance": "INVALID_IMAGE", "risk_score": "LOW", "evaluations": [], "message": "No valid product/package detected for inspection"}}	f	\N	2026-09-28 01:48:40.412021+05:30	\N
INSP-76DD3377	\N	\N	COMPLETED	LOW	PASS	{"status": "success", "metadata": {"filename": "INSP-76DD3377.jpg", "processed_width": 1024, "processed_height": 682, "ocr_status": "SUCCESS", "ocr_error": "", "model_type": "DOMAIN", "model_name": "metroniq.pt", "model_version": "1.0.0", "is_valid_image": true, "validation_note": "Valid product evidence found"}, "yolo_objects": [], "raw_ocr": [{"text": "PEARL MILLET & BLACK RICE MIX", "confidence": 0.9717, "bounding_box": [615, 0, 950, 23], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "100%", "confidence": 1.0, "bounding_box": [408, 47, 467, 82], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "100%", "confidence": 1.0, "bounding_box": [8, 63, 53, 82], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "INGREDIENTS:", "confidence": 0.9999, "bounding_box": [538, 59, 630, 76], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NUTRITION INFORMATION", "confidence": 0.9998, "bounding_box": [805, 53, 977, 73], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VEGETARIAN", "confidence": 1.0, "bounding_box": [0, 82, 67, 99], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VALEN", "confidence": 1.0, "bounding_box": [112, 73, 359, 139], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "GOODNESS", "confidence": 0.9345, "bounding_box": [388, 77, 476, 129], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Pearl Millet (Kambu),", "confidence": 0.9748, "bounding_box": [536, 81, 664, 101], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Serving Size: 50g", "confidence": 0.9993, "bounding_box": [764, 86, 866, 107], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Black Rice.", "confidence": 1.0, "bounding_box": [538, 105, 606, 123], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Servings Per Pack: 10", "confidence": 0.9999, "bounding_box": [763, 106, 891, 126], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "\\u2014 NOURISHING NATURALLY \\u2014", "confidence": 0.9911, "bounding_box": [121, 141, 350, 161], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Nutrients", "confidence": 1.0, "bounding_box": [764, 138, 815, 154], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Per 100g", "confidence": 0.9154, "bounding_box": [875, 136, 924, 154], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Per Serving (50g)", "confidence": 0.9999, "bounding_box": [936, 135, 1022, 153], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "ALLERGEN INFORMATION:", "confidence": 0.9924, "bounding_box": [538, 157, 692, 175], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "PEARL MILLET &", "confidence": 0.9989, "bounding_box": [20, 169, 369, 232], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Energy (kcal)", "confidence": 0.9996, "bounding_box": [764, 162, 832, 181], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "364", "confidence": 1.0, "bounding_box": [888, 162, 912, 180], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "182", "confidence": 1.0, "bounding_box": [968, 161, 991, 179], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Packed in a facility that", "confidence": 0.9982, "bounding_box": [536, 179, 674, 199], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Protein (g)", "confidence": 0.9997, "bounding_box": [765, 186, 821, 204], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "11.2", "confidence": 1.0, "bounding_box": [889, 186, 914, 203], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "5.6", "confidence": 1.0, "bounding_box": [968, 185, 990, 202], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "processes nuts and seeds.", "confidence": 1.0, "bounding_box": [537, 201, 692, 221], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Carbohydrate (g)", "confidence": 0.9992, "bounding_box": [766, 209, 853, 227], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "72.1", "confidence": 1.0, "bounding_box": [888, 208, 915, 226], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "36.1", "confidence": 1.0, "bounding_box": [967, 208, 993, 224], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "BLACK RICE MIX", "confidence": 0.9999, "bounding_box": [22, 227, 371, 287], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Total Sugars (g)", "confidence": 0.9997, "bounding_box": [772, 232, 851, 251], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "1.3", "confidence": 1.0, "bounding_box": [891, 231, 912, 249], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.7", "confidence": 1.0, "bounding_box": [969, 230, 991, 248], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Dietary Fiber (g)", "confidence": 0.9963, "bounding_box": [772, 255, 855, 273], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "8.6", "confidence": 1.0, "bounding_box": [891, 254, 913, 271], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "4.3", "confidence": 1.0, "bounding_box": [969, 253, 991, 270], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "GLUTEN FREE", "confidence": 0.9998, "bounding_box": [583, 263, 656, 281], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Total Fat (g)", "confidence": 0.9712, "bounding_box": [766, 278, 829, 296], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "3.2", "confidence": 1.0, "bounding_box": [891, 277, 913, 293], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "1.6", "confidence": 1.0, "bounding_box": [970, 276, 991, 293], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "HEALTHY GRAINS FOR A BETTER YOU", "confidence": 1.0, "bounding_box": [41, 299, 356, 320], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Saturated Fat (g)", "confidence": 0.9996, "bounding_box": [772, 300, 858, 319], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.6", "confidence": 1.0, "bounding_box": [892, 299, 913, 317], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.3", "confidence": 1.0, "bounding_box": [970, 298, 991, 317], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NO ARTIFICIAL COLORS", "confidence": 0.9992, "bounding_box": [581, 313, 701, 330], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Trans Fat (g)", "confidence": 0.9886, "bounding_box": [773, 324, 838, 342], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0", "confidence": 0.9991, "bounding_box": [896, 324, 909, 340], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0", "confidence": 0.9987, "bounding_box": [974, 322, 987, 339], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Sodium (mg)", "confidence": 0.9995, "bounding_box": [765, 347, 833, 365], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "4", "confidence": 1.0, "bounding_box": [896, 346, 909, 363], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "2", "confidence": 1.0, "bounding_box": [974, 345, 987, 362], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "RICH IN FIBER", "confidence": 0.9999, "bounding_box": [61, 366, 146, 385], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NO PRESERVATIVES", "confidence": 0.9995, "bounding_box": [580, 362, 684, 380], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Supports Digestion", "confidence": 1.0, "bounding_box": [60, 386, 163, 406], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "* Approximate values", "confidence": 0.9918, "bounding_box": [758, 377, 862, 394], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "HIGH IN PROTEIN", "confidence": 0.9999, "bounding_box": [63, 422, 165, 442], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "STORAGE INSTRUCTIONS:", "confidence": 0.9946, "bounding_box": [538, 426, 680, 440], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MANUFACTURED & MARKETED BY:", "confidence": 0.999, "bounding_box": [778, 419, 965, 433], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Helps Build Strength", "confidence": 1.0, "bounding_box": [61, 441, 170, 462], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Store in a cool, dry place.", "confidence": 0.9995, "bounding_box": [538, 447, 670, 464], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VALEN FOODS PRIVATE LIMITED", "confidence": 0.9974, "bounding_box": [779, 440, 987, 455], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Keep away from moisture", "confidence": 0.9928, "bounding_box": [539, 466, 674, 483], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "123, Green Valley: Industrial Estate,", "confidence": 0.9982, "bounding_box": [780, 460, 971, 477], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NATURAL & NUTRITIOUS", "confidence": 0.9727, "bounding_box": [64, 478, 206, 497], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "and direct sunlight.", "confidence": 0.9996, "bounding_box": [538, 484, 643, 501], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Somanur Post, Coimbatore,", "confidence": 0.9943, "bounding_box": [781, 478, 935, 495], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "No Added Preservatives", "confidence": 1.0, "bounding_box": [64, 497, 187, 517], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Tamil Nadu - 641668, India.", "confidence": 0.9833, "bounding_box": [782, 496, 935, 514], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "BATCH NO.", "confidence": 0.9975, "bounding_box": [544, 525, 603, 539], "yolo_region": "GLOBAL_FALLBACK"}, {"text": ": VPMBR0524", "confidence": 0.9701, "bounding_box": [626, 525, 702, 539], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "+91 78458 84098", "confidence": 0.9749, "bounding_box": [808, 521, 907, 538], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MFG. DATE", "confidence": 0.9927, "bounding_box": [545, 548, 607, 565], "yolo_region": "GLOBAL_FALLBACK"}, {"text": ":20 MAY 2024", "confidence": 0.9988, "bounding_box": [624, 547, 709, 566], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "support@valenfoods.com", "confidence": 1.0, "bounding_box": [809, 540, 953, 557], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "www.valenfoods.com", "confidence": 1.0, "bounding_box": [810, 560, 931, 574], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "EXPIRY DATE : 19 NOV 2024", "confidence": 0.9832, "bounding_box": [545, 573, 709, 592], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NET WEIGHT", "confidence": 0.9999, "bounding_box": [2, 597, 86, 615], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Issa", "confidence": 0.9242, "bounding_box": [791, 591, 828, 610], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "LIC. NO. 12423999001234", "confidence": 0.9732, "bounding_box": [839, 590, 998, 607], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MRP", "confidence": 0.9973, "bounding_box": [547, 600, 588, 618], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "150.00", "confidence": 1.0, "bounding_box": [641, 601, 682, 619], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "500g", "confidence": 1.0, "bounding_box": [9, 624, 75, 660], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "(INCL. OF ALL TAXES)", "confidence": 0.9473, "bounding_box": [550, 620, 637, 634], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "8904567890123", "confidence": 0.9989, "bounding_box": [839, 656, 991, 679], "yolo_region": "GLOBAL_FALLBACK"}], "legal_declarations": {"NET_QUANTITY": {"field": "NET_QUANTITY", "value": "500g", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [9, 624, 75, 660], "detection_method": "HOLISTIC_OCR"}, "MANUFACTURER": {"field": "MANUFACTURER", "value": "RICH IN FIBER NO PRESERVATIVES Supports Digestion * Approximate values MANUFACTURED & MARKETED BY:", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [61, 366, 146, 385], "detection_method": "HOLISTIC_OCR"}, "CONSUMER_CARE": {"field": "CONSUMER_CARE", "value": "+91 78458 84098 support@valenfoods.com", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [808, 521, 907, 538], "detection_method": "HOLISTIC_OCR"}, "BATCH": {"field": "BATCH", "value": "BATCH NO.", "confidence": 0.9975, "source": "PaddleOCR", "bounding_box": [544, 525, 603, 539], "detection_method": "HOLISTIC_OCR"}, "DATE": {"field": "DATE", "value": "MFG. DATE", "confidence": 0.9927, "source": "PaddleOCR", "bounding_box": [545, 548, 607, 565], "detection_method": "HOLISTIC_OCR"}, "MRP": {"field": "MRP", "value": "MRP", "confidence": 0.9973, "source": "PaddleOCR", "bounding_box": [547, 600, 588, 618], "detection_method": "HOLISTIC_OCR"}, "PRODUCT_NAME": {"field": "PRODUCT_NAME", "value": "PEARL MILLET & BLACK RICE MIX", "confidence": 0.9717, "source": "PaddleOCR", "bounding_box": [615, 0, 950, 23], "detection_method": "HOLISTIC_OCR"}, "_META_IS_IMPORTED": {"field": "_META_IS_IMPORTED", "value": "False", "confidence": 1.0, "source": "System"}}, "validation": {"compliance": "PASS", "risk_score": "LOW", "numerical_risk": 0, "missing_rule_definitions": [], "evaluations": [{"field": "MRP", "status": "PASS", "evidence": "MRP", "message": "MRP successfully verified (Confidence: 100%)."}, {"field": "NET_QUANTITY", "status": "PASS", "evidence": "500g", "message": "NET_QUANTITY successfully verified (Confidence: 100%)."}, {"field": "MANUFACTURER", "status": "PASS", "evidence": "RICH IN FIBER NO PRESERVATIVES Supports Digestion * Approximate values MANUFACTURED & MARKETED BY:", "message": "MANUFACTURER successfully verified (Confidence: 100%)."}, {"field": "PACKER", "status": "NOT_APPLICABLE", "evidence": "Field not present", "message": "Field PACKER is not required and not present."}, {"field": "IMPORTER", "status": "NOT_APPLICABLE", "evidence": "MISSING_FROM_PACKAGE", "message": "Importer details not applicable for domestic products."}, {"field": "CONSUMER_CARE", "status": "PASS", "evidence": "+91 78458 84098 support@valenfoods.com", "message": "CONSUMER_CARE successfully verified (Confidence: 100%)."}, {"field": "DATE", "status": "PASS", "evidence": "MFG. DATE", "message": "DATE successfully verified (Confidence: 99%)."}, {"field": "BATCH", "status": "PASS", "evidence": "BATCH NO.", "message": "BATCH successfully verified (Confidence: 100%)."}, {"field": "PRODUCT_NAME", "status": "PASS", "evidence": "PEARL MILLET & BLACK RICE MIX", "message": "PRODUCT_NAME successfully verified (Confidence: 97%)."}]}}	f	\N	2026-09-28 01:50:21.919171+05:30	\N
INSP-0708C9FC	\N	\N	COMPLETED	LOW	PASS	{"status": "success", "metadata": {"filename": "INSP-0708C9FC.jpg", "processed_width": 1024, "processed_height": 682, "ocr_status": "SUCCESS", "ocr_error": "", "model_type": "DOMAIN", "model_name": "metroniq.pt", "model_version": "1.0.0", "is_valid_image": true, "validation_note": "Valid product evidence found"}, "yolo_objects": [], "raw_ocr": [{"text": "PEARL MILLET & BLACK RICE MIX", "confidence": 0.9717, "bounding_box": [615, 0, 950, 23], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "100%", "confidence": 1.0, "bounding_box": [408, 47, 467, 82], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "100%", "confidence": 1.0, "bounding_box": [8, 63, 53, 82], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "INGREDIENTS:", "confidence": 0.9999, "bounding_box": [538, 59, 630, 76], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NUTRITION INFORMATION", "confidence": 0.9998, "bounding_box": [805, 53, 977, 73], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VEGETARIAN", "confidence": 1.0, "bounding_box": [0, 82, 67, 99], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VALEN", "confidence": 1.0, "bounding_box": [112, 73, 359, 139], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "GOODNESS", "confidence": 0.9345, "bounding_box": [388, 77, 476, 129], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Pearl Millet (Kambu),", "confidence": 0.9748, "bounding_box": [536, 81, 664, 101], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Serving Size: 50g", "confidence": 0.9993, "bounding_box": [764, 86, 866, 107], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Black Rice.", "confidence": 1.0, "bounding_box": [538, 105, 606, 123], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Servings Per Pack: 10", "confidence": 0.9999, "bounding_box": [763, 106, 891, 126], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "\\u2014 NOURISHING NATURALLY \\u2014", "confidence": 0.9911, "bounding_box": [121, 141, 350, 161], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Nutrients", "confidence": 1.0, "bounding_box": [764, 138, 815, 154], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Per 100g", "confidence": 0.9154, "bounding_box": [875, 136, 924, 154], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Per Serving (50g)", "confidence": 0.9999, "bounding_box": [936, 135, 1022, 153], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "ALLERGEN INFORMATION:", "confidence": 0.9924, "bounding_box": [538, 157, 692, 175], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "PEARL MILLET &", "confidence": 0.9989, "bounding_box": [20, 169, 369, 232], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Energy (kcal)", "confidence": 0.9996, "bounding_box": [764, 162, 832, 181], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "364", "confidence": 1.0, "bounding_box": [888, 162, 912, 180], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "182", "confidence": 1.0, "bounding_box": [968, 161, 991, 179], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Packed in a facility that", "confidence": 0.9982, "bounding_box": [536, 179, 674, 199], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Protein (g)", "confidence": 0.9997, "bounding_box": [765, 186, 821, 204], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "11.2", "confidence": 1.0, "bounding_box": [889, 186, 914, 203], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "5.6", "confidence": 1.0, "bounding_box": [968, 185, 990, 202], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "processes nuts and seeds.", "confidence": 1.0, "bounding_box": [537, 201, 692, 221], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Carbohydrate (g)", "confidence": 0.9992, "bounding_box": [766, 209, 853, 227], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "72.1", "confidence": 1.0, "bounding_box": [888, 208, 915, 226], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "36.1", "confidence": 1.0, "bounding_box": [967, 208, 993, 224], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "BLACK RICE MIX", "confidence": 0.9999, "bounding_box": [22, 227, 371, 287], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Total Sugars (g)", "confidence": 0.9997, "bounding_box": [772, 232, 851, 251], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "1.3", "confidence": 1.0, "bounding_box": [891, 231, 912, 249], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.7", "confidence": 1.0, "bounding_box": [969, 230, 991, 248], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Dietary Fiber (g)", "confidence": 0.9963, "bounding_box": [772, 255, 855, 273], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "8.6", "confidence": 1.0, "bounding_box": [891, 254, 913, 271], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "4.3", "confidence": 1.0, "bounding_box": [969, 253, 991, 270], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "GLUTEN FREE", "confidence": 0.9998, "bounding_box": [583, 263, 656, 281], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Total Fat (g)", "confidence": 0.9712, "bounding_box": [766, 278, 829, 296], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "3.2", "confidence": 1.0, "bounding_box": [891, 277, 913, 293], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "1.6", "confidence": 1.0, "bounding_box": [970, 276, 991, 293], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "HEALTHY GRAINS FOR A BETTER YOU", "confidence": 1.0, "bounding_box": [41, 299, 356, 320], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Saturated Fat (g)", "confidence": 0.9996, "bounding_box": [772, 300, 858, 319], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.6", "confidence": 1.0, "bounding_box": [892, 299, 913, 317], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0.3", "confidence": 1.0, "bounding_box": [970, 298, 991, 317], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NO ARTIFICIAL COLORS", "confidence": 0.9992, "bounding_box": [581, 313, 701, 330], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Trans Fat (g)", "confidence": 0.9886, "bounding_box": [773, 324, 838, 342], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0", "confidence": 0.9991, "bounding_box": [896, 324, 909, 340], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "0", "confidence": 0.9987, "bounding_box": [974, 322, 987, 339], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Sodium (mg)", "confidence": 0.9995, "bounding_box": [765, 347, 833, 365], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "4", "confidence": 1.0, "bounding_box": [896, 346, 909, 363], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "2", "confidence": 1.0, "bounding_box": [974, 345, 987, 362], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "RICH IN FIBER", "confidence": 0.9999, "bounding_box": [61, 366, 146, 385], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NO PRESERVATIVES", "confidence": 0.9995, "bounding_box": [580, 362, 684, 380], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Supports Digestion", "confidence": 1.0, "bounding_box": [60, 386, 163, 406], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "* Approximate values", "confidence": 0.9918, "bounding_box": [758, 377, 862, 394], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "HIGH IN PROTEIN", "confidence": 0.9999, "bounding_box": [63, 422, 165, 442], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "STORAGE INSTRUCTIONS:", "confidence": 0.9946, "bounding_box": [538, 426, 680, 440], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MANUFACTURED & MARKETED BY:", "confidence": 0.999, "bounding_box": [778, 419, 965, 433], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Helps Build Strength", "confidence": 1.0, "bounding_box": [61, 441, 170, 462], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Store in a cool, dry place.", "confidence": 0.9995, "bounding_box": [538, 447, 670, 464], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "VALEN FOODS PRIVATE LIMITED", "confidence": 0.9974, "bounding_box": [779, 440, 987, 455], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Keep away from moisture", "confidence": 0.9928, "bounding_box": [539, 466, 674, 483], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "123, Green Valley: Industrial Estate,", "confidence": 0.9982, "bounding_box": [780, 460, 971, 477], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NATURAL & NUTRITIOUS", "confidence": 0.9727, "bounding_box": [64, 478, 206, 497], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "and direct sunlight.", "confidence": 0.9996, "bounding_box": [538, 484, 643, 501], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Somanur Post, Coimbatore,", "confidence": 0.9943, "bounding_box": [781, 478, 935, 495], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "No Added Preservatives", "confidence": 1.0, "bounding_box": [64, 497, 187, 517], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Tamil Nadu - 641668, India.", "confidence": 0.9833, "bounding_box": [782, 496, 935, 514], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "BATCH NO.", "confidence": 0.9975, "bounding_box": [544, 525, 603, 539], "yolo_region": "GLOBAL_FALLBACK"}, {"text": ": VPMBR0524", "confidence": 0.9701, "bounding_box": [626, 525, 702, 539], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "+91 78458 84098", "confidence": 0.9749, "bounding_box": [808, 521, 907, 538], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MFG. DATE", "confidence": 0.9927, "bounding_box": [545, 548, 607, 565], "yolo_region": "GLOBAL_FALLBACK"}, {"text": ":20 MAY 2024", "confidence": 0.9988, "bounding_box": [624, 547, 709, 566], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "support@valenfoods.com", "confidence": 1.0, "bounding_box": [809, 540, 953, 557], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "www.valenfoods.com", "confidence": 1.0, "bounding_box": [810, 560, 931, 574], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "EXPIRY DATE : 19 NOV 2024", "confidence": 0.9832, "bounding_box": [545, 573, 709, 592], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "NET WEIGHT", "confidence": 0.9999, "bounding_box": [2, 597, 86, 615], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "Issa", "confidence": 0.9242, "bounding_box": [791, 591, 828, 610], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "LIC. NO. 12423999001234", "confidence": 0.9732, "bounding_box": [839, 590, 998, 607], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "MRP", "confidence": 0.9973, "bounding_box": [547, 600, 588, 618], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "150.00", "confidence": 1.0, "bounding_box": [641, 601, 682, 619], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "500g", "confidence": 1.0, "bounding_box": [9, 624, 75, 660], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "(INCL. OF ALL TAXES)", "confidence": 0.9473, "bounding_box": [550, 620, 637, 634], "yolo_region": "GLOBAL_FALLBACK"}, {"text": "8904567890123", "confidence": 0.9989, "bounding_box": [839, 656, 991, 679], "yolo_region": "GLOBAL_FALLBACK"}], "legal_declarations": {"NET_QUANTITY": {"field": "NET_QUANTITY", "value": "500g", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [9, 624, 75, 660], "detection_method": "HOLISTIC_OCR"}, "MANUFACTURER": {"field": "MANUFACTURER", "value": "RICH IN FIBER NO PRESERVATIVES Supports Digestion * Approximate values MANUFACTURED & MARKETED BY:", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [61, 366, 146, 385], "detection_method": "HOLISTIC_OCR"}, "CONSUMER_CARE": {"field": "CONSUMER_CARE", "value": "+91 78458 84098 support@valenfoods.com", "confidence": 1.0, "source": "PaddleOCR", "bounding_box": [808, 521, 907, 538], "detection_method": "HOLISTIC_OCR"}, "BATCH": {"field": "BATCH", "value": "BATCH NO.", "confidence": 0.9975, "source": "PaddleOCR", "bounding_box": [544, 525, 603, 539], "detection_method": "HOLISTIC_OCR"}, "DATE": {"field": "DATE", "value": "MFG. DATE", "confidence": 0.9927, "source": "PaddleOCR", "bounding_box": [545, 548, 607, 565], "detection_method": "HOLISTIC_OCR"}, "MRP": {"field": "MRP", "value": "MRP", "confidence": 0.9973, "source": "PaddleOCR", "bounding_box": [547, 600, 588, 618], "detection_method": "HOLISTIC_OCR"}, "PRODUCT_NAME": {"field": "PRODUCT_NAME", "value": "PEARL MILLET & BLACK RICE MIX", "confidence": 0.9717, "source": "PaddleOCR", "bounding_box": [615, 0, 950, 23], "detection_method": "HOLISTIC_OCR"}, "_META_IS_IMPORTED": {"field": "_META_IS_IMPORTED", "value": "False", "confidence": 1.0, "source": "System"}}, "validation": {"compliance": "PASS", "risk_score": "LOW", "numerical_risk": 0, "missing_rule_definitions": [], "evaluations": [{"field": "MRP", "status": "PASS", "evidence": "MRP", "message": "MRP successfully verified (Confidence: 100%)."}, {"field": "NET_QUANTITY", "status": "PASS", "evidence": "500g", "message": "NET_QUANTITY successfully verified (Confidence: 100%)."}, {"field": "MANUFACTURER", "status": "PASS", "evidence": "RICH IN FIBER NO PRESERVATIVES Supports Digestion * Approximate values MANUFACTURED & MARKETED BY:", "message": "MANUFACTURER successfully verified (Confidence: 100%)."}, {"field": "PACKER", "status": "NOT_APPLICABLE", "evidence": "Field not present", "message": "Field PACKER is not required and not present."}, {"field": "IMPORTER", "status": "NOT_APPLICABLE", "evidence": "MISSING_FROM_PACKAGE", "message": "Importer details not applicable for domestic products."}, {"field": "CONSUMER_CARE", "status": "PASS", "evidence": "+91 78458 84098 support@valenfoods.com", "message": "CONSUMER_CARE successfully verified (Confidence: 100%)."}, {"field": "DATE", "status": "PASS", "evidence": "MFG. DATE", "message": "DATE successfully verified (Confidence: 99%)."}, {"field": "BATCH", "status": "PASS", "evidence": "BATCH NO.", "message": "BATCH successfully verified (Confidence: 100%)."}, {"field": "PRODUCT_NAME", "status": "PASS", "evidence": "PEARL MILLET & BLACK RICE MIX", "message": "PRODUCT_NAME successfully verified (Confidence: 97%)."}]}}	f	\N	2026-09-28 01:50:46.542834+05:30	\N
\.


--
-- Data for Name: manufacturer_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.manufacturer_documents (id, owner_id, product_id, title, category, file_path, created_at) FROM stdin;
\.


--
-- Data for Name: manufacturers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.manufacturers (id, name, location, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, category, manufacturer_id, created_at, sku, owner_id, status, net_quantity, mrp, generic_name, manufacturer_name, country_of_origin, updated_at) FROM stdin;
4c920caf-703b-473c-bf12-49efea847fed	PEARL MILLET & BLACK RICE MIX	Scanned Audit	\N	2026-09-28 01:11:18.654284+05:30	\N	e90ef710-69ab-4cb8-882f-a52a2d04216f	UNDER_REVIEW	\N	\N	\N	\N	\N	2026-09-28 01:11:18.701812+05:30
\.


--
-- Data for Name: rectifications_mfg; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rectifications_mfg (id, submission_id, product_id, owner_id, issue, required_action, status, due_date, created_at) FROM stdin;
\.


--
-- Data for Name: reinspections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reinspections (id, original_inspection_id, notice_id, assigned_officer_id, status, scheduled_date, new_inspection_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: rule_versions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rule_versions (id, rule_id, version_number, status, logic_payload, created_at) FROM stdin;
465b2dce-2791-4cc0-8cca-786076ac5b17	RULE-001	1	ACTIVE	{"field": "net_quantity", "required": true}	2026-08-31 05:00:04+05:30
8f610a90-3c6e-4f6b-bed4-81e61ab64e90	RULE-002	1	ACTIVE	{"area_min_percentage": 40}	2026-08-31 05:00:04+05:30
0ccddf6b-00a6-41e9-abb5-d4f937c5d035	RULE-003	1	DRAFT	{}	2026-08-31 05:00:04+05:30
8ca9a19a-3f76-4e20-8b85-f339f5c4c9a6	RULE-MRP-01	1	RETIRED	{"field": "MRP", "required": true}	2026-08-31 20:51:17+05:30
675b963a-d75f-42c2-9803-c2932fad9e19	RULE-NET-01	1	RETIRED	{"field": "NET_QUANTITY", "required": true}	2026-08-31 20:51:17+05:30
7847e75b-23ef-4165-93bc-e672f57f0f81	RULE-MFG-01	1	RETIRED	{"field": "MANUFACTURER", "required": true}	2026-08-31 20:51:17+05:30
aac20a62-dc39-4f2c-bbd2-6a0ccb8d3d49	RULE-CARE-01	1	RETIRED	{"field": "CONSUMER_CARE", "required": true}	2026-08-31 20:51:17+05:30
3451f2aa-1ea8-4f30-bcc4-748a4dff401c	RULE-PKR-01	1	RETIRED	{"field": "PACKER", "required": false}	2026-08-31 20:51:17+05:30
a25a8bb8-60bf-4e92-adc6-274a8b0878a2	RULE-IMP-01	1	RETIRED	{"field": "IMPORTER", "required": false}	2026-08-31 20:51:17+05:30
524da8f3-b0fd-420e-9a3d-f4113946b6fe	RULE-MRP-01	1	ACTIVE	{"field": "MRP", "required": true}	2026-08-31 20:55:33+05:30
5464365d-816b-468c-bfc9-9e6f2de1a6b2	RULE-NET-01	1	ACTIVE	{"field": "NET_QUANTITY", "required": true}	2026-08-31 20:55:33+05:30
ba2ea500-7c1a-485f-a13d-3e63fd5c0eb2	RULE-MFG-01	1	ACTIVE	{"field": "MANUFACTURER", "required": false}	2026-08-31 20:55:33+05:30
97b96927-1a53-43a8-a8d8-ff31237eecac	RULE-CARE-01	1	ACTIVE	{"field": "CONSUMER_CARE", "required": true}	2026-08-31 20:55:33+05:30
3beba8ae-383b-4cb0-918c-a4f06738376b	RULE-PKR-01	1	ACTIVE	{"field": "PACKER", "required": false}	2026-08-31 20:55:33+05:30
5fdc1f48-dbd7-4e15-9d87-8286c2514ab6	RULE-IMP-01	1	ACTIVE	{"field": "IMPORTER", "required": false}	2026-08-31 20:55:33+05:30
2085f457-452e-468e-a5ee-c00f27c30435	RULE-DATE-01	1	ACTIVE	{"field": "DATE", "required": true}	2026-08-31 20:55:33+05:30
980c67f7-2a44-42dc-a9aa-780b76d90b79	RULE-BATCH-01	1	ACTIVE	{"field": "BATCH", "required": true}	2026-08-31 20:55:33+05:30
b7f9d0b5-be9d-4361-90bc-6a4b605438d4	RULE-PROD-01	1	ACTIVE	{"field": "PRODUCT_NAME", "required": true}	2026-08-31 20:55:33+05:30
\.


--
-- Data for Name: rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rules (id, name, category, created_at) FROM stdin;
RULE-001	Mandatory Declarations on Packaged Commodities	PACKAGING	2026-08-31 05:00:04+05:30
RULE-002	Principal Display Panel Area Calculation	DISPLAY	2026-08-31 05:00:04+05:30
RULE-003	Standard Quantities for Specified Disposables	PACKAGING	2026-08-31 05:00:04+05:30
RULE-MRP-01	Maximum Retail Price Declaration	FOOD_PACKAGING	2026-08-31 20:51:17+05:30
RULE-NET-01	Net Quantity Declaration	FOOD_PACKAGING	2026-08-31 20:51:17+05:30
RULE-MFG-01	Manufacturer Name and Address	FOOD_PACKAGING	2026-08-31 20:51:17+05:30
RULE-CARE-01	Customer Care Details	FOOD_PACKAGING	2026-08-31 20:51:17+05:30
RULE-PKR-01	Packer Details	FOOD_PACKAGING	2026-08-31 20:51:17+05:30
RULE-IMP-01	Importer Details	FOOD_PACKAGING	2026-08-31 20:51:17+05:30
RULE-DATE-01	Date Declaration	FOOD_PACKAGING	2026-08-31 20:55:33+05:30
RULE-BATCH-01	Batch Declaration	FOOD_PACKAGING	2026-08-31 20:55:33+05:30
RULE-PROD-01	Product Name	FOOD_PACKAGING	2026-08-31 20:55:33+05:30
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.submissions (id, product_id, owner_id, status, officer_comments, created_at, updated_at) FROM stdin;
1b158072-e24f-473c-9b46-3eeb6886e1dd	4c920caf-703b-473c-bf12-49efea847fed	e90ef710-69ab-4cb8-882f-a52a2d04216f	UNDER_REVIEW	\N	2026-09-28 01:11:18.701812+05:30	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, hashed_password, role, is_active, created_at, status) FROM stdin;
c2c32c5a-f972-4ac0-854e-758f610973b1	learningusingai02@gmail.com	$2b$12$lc4znE1g.VQrPBasKO3dRutJY8pvaLoTO2rzXDsNT7XOy9Rurd8G2	MANUFACTURER	t	2026-09-28 00:52:41.264394+05:30	APPROVED
5afd5168-8e41-4548-b4b3-a668eaab0240	admin@metroniq.local	$2b$12$eTnH7WiVn7xTCN8Theb3Ee24n5NxjKOn7EbsPmilP.TUhqf32EGXe	ADMIN	t	2026-09-28 01:16:03.685047+05:30	APPROVED
e90ef710-69ab-4cb8-882f-a52a2d04216f	muhammadwasimda78@gmail.com	$2b$12$3wNFnf.zYxN4M9nB/UA1ZO02MPInDLtQ8XzWBqoAJp3wbVjD8g8xK	MANUFACTURER	t	2026-09-28 01:02:19.666235+05:30	APPROVED
e7d025c2-f2cc-40f0-bcf0-ebf0b1e6119c	manufacturer@metroniq.local	$2b$12$CUI9Ju4FTPgD3tjBIUM6TushKeyzyqpfwuRKX/nKwLIuxFd3Bpc46	MANUFACTURER	t	2026-09-28 01:41:09.527366+05:30	APPROVED
2c894edf-8ef3-479c-8ebc-846b2aec6be9	officer@metroniq.local	$2b$12$aEgYTcl2WVkQajYYxxKVy.ZmVn.6BP33bGd5yZS5og4coJiJEGPu2	OFFICER	t	2026-09-28 01:41:09.527366+05:30	APPROVED
\.


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: compliance_histories compliance_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compliance_histories
    ADD CONSTRAINT compliance_histories_pkey PRIMARY KEY (id);


--
-- Name: ecommerce_monitors ecommerce_monitors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecommerce_monitors
    ADD CONSTRAINT ecommerce_monitors_pkey PRIMARY KEY (id);


--
-- Name: enforcement_cases enforcement_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_cases
    ADD CONSTRAINT enforcement_cases_pkey PRIMARY KEY (id);


--
-- Name: enforcement_cases enforcement_cases_reinspection_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_cases
    ADD CONSTRAINT enforcement_cases_reinspection_id_key UNIQUE (reinspection_id);


--
-- Name: improvement_notices improvement_notices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.improvement_notices
    ADD CONSTRAINT improvement_notices_pkey PRIMARY KEY (id);


--
-- Name: inspections inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_pkey PRIMARY KEY (id);


--
-- Name: manufacturer_documents manufacturer_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manufacturer_documents
    ADD CONSTRAINT manufacturer_documents_pkey PRIMARY KEY (id);


--
-- Name: manufacturers manufacturers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manufacturers
    ADD CONSTRAINT manufacturers_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: rectifications_mfg rectifications_mfg_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rectifications_mfg
    ADD CONSTRAINT rectifications_mfg_pkey PRIMARY KEY (id);


--
-- Name: reinspections reinspections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reinspections
    ADD CONSTRAINT reinspections_pkey PRIMARY KEY (id);


--
-- Name: rule_versions rule_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rule_versions
    ADD CONSTRAINT rule_versions_pkey PRIMARY KEY (id);


--
-- Name: rules rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rules
    ADD CONSTRAINT rules_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_manufacturers_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_manufacturers_name ON public.manufacturers USING btree (name);


--
-- Name: ix_products_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_products_name ON public.products USING btree (name);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: compliance_histories compliance_histories_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compliance_histories
    ADD CONSTRAINT compliance_histories_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: compliance_histories compliance_histories_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compliance_histories
    ADD CONSTRAINT compliance_histories_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: ecommerce_monitors ecommerce_monitors_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecommerce_monitors
    ADD CONSTRAINT ecommerce_monitors_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: enforcement_cases enforcement_cases_assigned_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_cases
    ADD CONSTRAINT enforcement_cases_assigned_officer_id_fkey FOREIGN KEY (assigned_officer_id) REFERENCES public.users(id);


--
-- Name: enforcement_cases enforcement_cases_manufacturer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_cases
    ADD CONSTRAINT enforcement_cases_manufacturer_id_fkey FOREIGN KEY (manufacturer_id) REFERENCES public.users(id);


--
-- Name: enforcement_cases enforcement_cases_original_inspection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_cases
    ADD CONSTRAINT enforcement_cases_original_inspection_id_fkey FOREIGN KEY (original_inspection_id) REFERENCES public.inspections(id);


--
-- Name: enforcement_cases enforcement_cases_reinspection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enforcement_cases
    ADD CONSTRAINT enforcement_cases_reinspection_id_fkey FOREIGN KEY (reinspection_id) REFERENCES public.reinspections(id);


--
-- Name: improvement_notices improvement_notices_inspection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.improvement_notices
    ADD CONSTRAINT improvement_notices_inspection_id_fkey FOREIGN KEY (inspection_id) REFERENCES public.inspections(id);


--
-- Name: inspections inspections_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: inspections inspections_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: manufacturer_documents manufacturer_documents_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manufacturer_documents
    ADD CONSTRAINT manufacturer_documents_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: manufacturer_documents manufacturer_documents_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manufacturer_documents
    ADD CONSTRAINT manufacturer_documents_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: products products_manufacturer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_manufacturer_id_fkey FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers(id);


--
-- Name: products products_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: rectifications_mfg rectifications_mfg_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rectifications_mfg
    ADD CONSTRAINT rectifications_mfg_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: rectifications_mfg rectifications_mfg_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rectifications_mfg
    ADD CONSTRAINT rectifications_mfg_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: rectifications_mfg rectifications_mfg_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rectifications_mfg
    ADD CONSTRAINT rectifications_mfg_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id);


--
-- Name: reinspections reinspections_assigned_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reinspections
    ADD CONSTRAINT reinspections_assigned_officer_id_fkey FOREIGN KEY (assigned_officer_id) REFERENCES public.users(id);


--
-- Name: reinspections reinspections_new_inspection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reinspections
    ADD CONSTRAINT reinspections_new_inspection_id_fkey FOREIGN KEY (new_inspection_id) REFERENCES public.inspections(id);


--
-- Name: reinspections reinspections_notice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reinspections
    ADD CONSTRAINT reinspections_notice_id_fkey FOREIGN KEY (notice_id) REFERENCES public.improvement_notices(id);


--
-- Name: reinspections reinspections_original_inspection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reinspections
    ADD CONSTRAINT reinspections_original_inspection_id_fkey FOREIGN KEY (original_inspection_id) REFERENCES public.inspections(id);


--
-- Name: rule_versions rule_versions_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rule_versions
    ADD CONSTRAINT rule_versions_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.rules(id);


--
-- Name: submissions submissions_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: submissions submissions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- PostgreSQL database dump complete
--

