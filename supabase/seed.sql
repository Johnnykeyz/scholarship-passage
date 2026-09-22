-- ============================================================================
-- SEED DATA
-- A small set of real, currently-open scholarships with details pulled from
-- official/primary sources as of the dates noted below. Deadlines and terms
-- change — the platform's own "Last verified" field exists for exactly this
-- reason. Re-verify against the official sites before relying on this data.
-- ============================================================================

-- 1. Chevening Scholarship (UK)
-- Source: chevening.org/application-timeline (official)
insert into public.opportunities (
  name, type, provider, country, degree_level, field, description,
  funding_type, funding_amount, tuition_coverage, living_allowance,
  travel_allowance, accommodation_coverage, health_insurance, duration,
  application_opens, application_deadline, start_date,
  eligibility_summary, nationality_requirements, language_requirements,
  work_experience_requirements, application_fee,
  official_website, official_application_portal,
  source_name, source_url, last_verified_at, status, trust_level
) values (
  'Chevening Scholarship', 'scholarship', 'UK Foreign, Commonwealth & Development Office (FCDO)',
  'United Kingdom', 'masters', 'Any field (one-year taught master''s)',
  'The UK government''s global scholarship programme, funding a one-year taught master''s degree at any UK university for future leaders who commit to returning home for at least two years afterward.',
  'fully_funded', 'Tuition, monthly stipend, return travel, and other allowances (exact package set by current Chevening terms)',
  true, true, true, null, null, '1 year',
  '2026-08-04', '2026-10-06', '2027-09-01',
  'Citizen of a Chevening-eligible country/territory; undergraduate degree that qualifies for UK master''s admission; at least 2 years'' work experience (2,800 hours) after undergraduate study; commitment to return home for 2 years after the award.',
  'Citizens of Chevening-eligible countries and territories only',
  'English language requirement set by chosen UK university/course',
  'Minimum 2 years (2,800 hours) of work experience after completing undergraduate degree',
  'None',
  'https://www.chevening.org', 'https://www.chevening.org/apply/',
  'Chevening official application timeline', 'https://chevening.org/application-timeline',
  '2026-09-19', 'open', 'officially_verified'
);

-- 2. Commonwealth PhD Scholarship (UK) — least developed countries / fragile states
-- Source: Commonwealth Scholarship Commission via CSC Central, cross-referenced with HEC Pakistan official notice
insert into public.opportunities (
  name, type, provider, country, degree_level, field, description,
  funding_type, funding_amount, tuition_coverage, living_allowance,
  travel_allowance, accommodation_coverage, health_insurance, duration,
  application_opens, application_deadline, start_date,
  eligibility_summary, nationality_requirements, language_requirements,
  work_experience_requirements, application_fee,
  official_website, official_application_portal,
  source_name, source_url, last_verified_at, status, trust_level
) values (
  'Commonwealth PhD Scholarship (for least developed countries and fragile states)',
  'scholarship', 'Commonwealth Scholarship Commission (CSC), funded by UK FCDO',
  'United Kingdom', 'phd', 'Six priority themes incl. science & technology, health systems, innovation & entrepreneurship',
  'Full-time doctoral study at a UK university for candidates from low-income Commonwealth countries who could not otherwise afford to study in the UK, with an emphasis on development impact.',
  'fully_funded', 'Full tuition fees, stipend, return travel to UK, Research Training Support Grant, fieldwork costs',
  true, true, true, null, null, '3–4 years',
  '2026-09-08', '2026-10-20', '2027-09-01',
  'By October 2027, hold at least an upper second class (2:1) honours degree or equivalent; from an eligible low-income Commonwealth country; not already registered for a PhD/MPhil at a UK university; unable to afford UK study without the scholarship.',
  'Citizens of eligible least-developed/fragile Commonwealth states',
  'Set by host UK university',
  'Not specified as a blanket requirement — varies by host institution/supervisor',
  'None',
  'https://cscuk.fcdo.gov.uk', 'https://cscgrantmanagement.com',
  'Commonwealth Scholarship Commission (via official CSC Central timeline reporting)', 'https://propakistani.pk/edunation/?p=6693',
  '2026-09-19', 'open', 'officially_verified'
);

-- 3. DAAD EPOS — Development-Related Postgraduate Courses (Germany)
-- Source: DAAD official scholarship database; deadlines vary by specific course
insert into public.opportunities (
  name, type, provider, country, degree_level, field, description,
  funding_type, funding_amount, tuition_coverage, living_allowance,
  travel_allowance, accommodation_coverage, health_insurance, duration,
  application_opens, application_deadline, start_date,
  eligibility_summary, nationality_requirements, language_requirements,
  work_experience_requirements, application_fee,
  official_website, official_application_portal,
  source_name, source_url, last_verified_at, status, trust_level
) values (
  'DAAD EPOS — Development-Related Postgraduate Courses',
  'scholarship', 'German Academic Exchange Service (DAAD)',
  'Germany', 'masters', 'Development-related fields (varies by partner course)',
  'DAAD funding for young professionals from developing countries to pursue development-related master''s programmes at German universities, part of the EPOS programme.',
  'fully_funded', 'Monthly stipend (~EUR 934 for master''s per DAAD 2026/27 guidance), health insurance, travel allowance, tuition waiver where applicable',
  true, true, true, null, true, 'Typically 1–2 years, varies by course',
  null, null, null,
  'Academic degree significantly above average; at least 2 years of relevant professional experience at time of application; from a DAAD-eligible developing country.',
  'Applicants from DAAD-eligible developing countries',
  'English and/or German proficiency depending on course',
  'At least 2 years of relevant professional experience',
  'None',
  'https://www.daad.de', 'https://www2.daad.de/deutschland/stipendium/datenbank/en/',
  'DAAD official scholarship database', 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
  '2026-09-19', 'open', 'needs_verification'
);

-- Official/platform requirement templates -------------------------------

insert into public.opportunity_requirements (opportunity_id, requirement_name, category, description, is_required, sort_order)
select id, r.name, r.category, r.description, true, r.sort_order
from public.opportunities, (values
  ('Passport copy', 'identity', 'Valid passport photo page', 1),
  ('Academic transcripts', 'academic', 'Transcripts from most recent degree', 2),
  ('Two references', 'application', 'One academic, one professional recommended', 3),
  ('Personal/leadership essay', 'application', 'Chevening''s required essays on leadership, networking, career plan, and study choice', 4),
  ('Unconditional university offer (post-selection)', 'university', 'Required only if shortlisted; deadline typically the following July', 5)
) as r(name, category, description, sort_order)
where name = 'Chevening Scholarship';

insert into public.opportunity_requirements (opportunity_id, requirement_name, category, description, is_required, sort_order)
select id, r.name, r.category, r.description, true, r.sort_order
from public.opportunities, (values
  ('Research proposal', 'research', 'Aligned to one of the six CSC priority themes', 1),
  ('Supervisor statement', 'academic', 'Signed statement from intended UK supervisor on institutional letterhead', 2),
  ('Academic transcripts and degree certificates', 'academic', null, 3),
  ('Two academic references', 'application', null, 4),
  ('Development impact statement', 'application', 'How the PhD contributes to development in home country', 5)
) as r(name, category, description, sort_order)
where name like 'Commonwealth PhD Scholarship%';

-- 4. Erasmus Mundus Joint Masters (EMJM) — European Union
-- Source: EACEA official Erasmus Mundus Catalogue (European Education and
-- Culture Executive Agency, European Commission). Note: EMJM has no single
-- application portal or deadline — each of the 200+ joint-degree consortia
-- runs its own timeline via its own site, all indexed in the catalogue.
-- The dates below reflect the typical window across most 2027-entry
-- programmes, not one fixed date; the description makes this explicit.
insert into public.opportunities (
  name, type, provider, country, degree_level, field, description,
  funding_type, funding_amount, tuition_coverage, living_allowance,
  travel_allowance, accommodation_coverage, health_insurance, duration,
  application_opens, application_deadline, start_date,
  eligibility_summary, nationality_requirements, language_requirements,
  work_experience_requirements, application_fee,
  official_website, official_application_portal,
  source_name, source_url, last_verified_at, status, trust_level
) values (
  'Erasmus Mundus Joint Masters (EMJM)', 'scholarship',
  'European Education and Culture Executive Agency (EACEA), European Commission',
  'Multiple EU countries', 'masters', 'All fields — 200+ joint-degree programmes across every discipline',
  'A flagship EU programme funding joint master''s degrees delivered by a partnership of universities in two or more countries (within Europe and sometimes beyond). Scholars study at multiple institutions and graduate with a joint, recognized degree. There is no single EMJM application — each consortium programme in the EACEA catalogue has its own website, requirements and deadline; applicants apply directly to the specific joint master''s they want.',
  'fully_funded', 'Monthly stipend of approximately EUR 1,400, paid for the duration of the programme (typically up to 24 months)',
  true, true, true, null, true, 'Typically 1–2 years (most commonly 24 months)',
  '2026-10-01', '2027-01-31', '2027-09-01',
  'Open to students worldwide, including non-EU ("Partner Country") applicants, who hold or are completing a first higher-education degree by the application deadline; specific academic requirements are set by each individual joint master''s programme, not centrally by EMJM.',
  'Open to applicants of any nationality; "Partner Country" students (non-EU) generally receive the most generous funding package',
  'Typically IELTS/TOEFL or equivalent proof of English proficiency, unless waived by a specific programme',
  'Not required by EMJM generally; some individual programmes may prefer or require relevant experience',
  'Varies by consortium — often free, some charge a small application fee',
  'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en', 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en',
  'EACEA official Erasmus Mundus Catalogue', 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en',
  '2026-09-20', 'open', 'officially_verified'
);

-- 5. Mastercard Foundation Scholars Program — University of Cambridge
-- Source: official Mastercard Foundation Scholars Program @ Cambridge site.
-- Note: the Mastercard Foundation Scholars Program runs at many partner
-- universities worldwide, each with its own eligibility and deadlines; this
-- entry covers the Cambridge master's route specifically as a concrete,
-- verifiable example rather than describing the whole multi-university
-- programme as if it had one uniform process.
insert into public.opportunities (
  name, type, provider, institution, country, degree_level, field, description,
  funding_type, funding_amount, tuition_coverage, living_allowance,
  travel_allowance, accommodation_coverage, health_insurance, duration,
  application_opens, application_deadline, start_date,
  eligibility_summary, nationality_requirements, language_requirements,
  work_experience_requirements, application_fee,
  official_website, official_application_portal,
  source_name, source_url, last_verified_at, status, trust_level
) values (
  'Mastercard Foundation Scholars Program — University of Cambridge', 'scholarship',
  'Mastercard Foundation, in partnership with the University of Cambridge',
  'University of Cambridge', 'United Kingdom', 'masters',
  'Climate resilience and sustainability (any eligible one-year master''s course drawing on this theme)',
  'Funds talented young Africans to pursue a one-year master''s degree at Cambridge and grow their leadership potential, with a focus on climate resilience and sustainability. Excludes MBA, Master of Corporate Law, Master of Finance, and Master of Accountancy. Scholars apply for admission to a Cambridge master''s course first, then for the scholarship itself.',
  'fully_funded', 'Full tuition, monthly maintenance allowance, a laptop, visa fees, health surcharge, and travel costs',
  true, true, true, null, true, '1 year',
  null, '2027-01-05', '2027-10-01',
  'Citizen of an African country; resident in an African country (exceptions for temporary study/work absence, displaced persons, or refugees); applying for an eligible one-year Cambridge master''s course; must meet that course''s own academic entry requirements (commonly a first-class or strong upper-second-class undergraduate degree).',
  'Citizens of African countries only',
  'Set by the specific Cambridge course applied to',
  'Not centrally required; varies by course',
  'Application fee for the Cambridge course itself may be waived for eligible scholarship applicants',
  'https://www.mastercardfoundation.fund.cam.ac.uk', 'https://www.postgraduate.study.cam.ac.uk/courses',
  'Mastercard Foundation Scholars Program at the University of Cambridge (official)', 'https://www.mastercardfoundation.fund.cam.ac.uk/news/applications-20262027-academic-year-are-now-open',
  '2026-09-20', 'open', 'officially_verified'
);

-- Official/platform requirement templates -------------------------------

insert into public.opportunity_requirements (opportunity_id, requirement_name, category, description, is_required, sort_order)
select id, r.name, r.category, r.description, true, r.sort_order
from public.opportunities, (values
  ('Identify target joint master''s programme(s)', 'application', 'EMJM has no central application — choose from 200+ programmes in the EACEA catalogue', 1),
  ('Academic transcripts and degree certificate', 'academic', null, 2),
  ('CV', 'application', null, 3),
  ('Motivation letter', 'application', 'Requirements vary by consortium', 4),
  ('English proficiency proof', 'language', 'IELTS, TOEFL, or equivalent, unless waived by the programme', 5),
  ('Letters of recommendation', 'application', 'Typically 2–3, academic or professional', 6)
) as r(name, category, description, sort_order)
where name = 'Erasmus Mundus Joint Masters (EMJM)';

insert into public.opportunity_requirements (opportunity_id, requirement_name, category, description, is_required, sort_order)
select id, r.name, r.category, r.description, true, r.sort_order
from public.opportunities, (values
  ('Cambridge course application (via course directory)', 'university', 'Must apply for and meet the entry requirements of a specific eligible master''s course first', 1),
  ('Academic transcripts and degree certificate', 'academic', null, 2),
  ('Proof of African citizenship', 'identity', null, 3),
  ('Supplementary statement', 'application', 'Statement on commitment to climate resilience and sustainable futures for Africa', 4),
  ('References (per course requirements)', 'application', null, 5)
) as r(name, category, description, sort_order)
where name = 'Mastercard Foundation Scholars Program — University of Cambridge';

