export type OpportunityType =
  | "scholarship"
  | "university_program"
  | "research_position"
  | "fellowship"
  | "assistantship"
  | "grant"
  | "exchange_program";

export type OpportunityStatus =
  | "upcoming"
  | "open"
  | "closing_soon"
  | "closed"
  | "expected"
  | "archived";

export type TrustLevel = "officially_verified" | "needs_verification" | "user_reported";

export type ApplicationStatus =
  | "interested"
  | "researching"
  | "preparing"
  | "ready_to_apply"
  | "submitted"
  | "under_review"
  | "interview"
  | "waitlisted"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "deferred";

export type RequirementStatus =
  | "not_started"
  | "in_progress"
  | "ready"
  | "submitted"
  | "verified"
  | "not_applicable";

export type RequirementSource = "platform" | "user_added";
export type TaskStatus = "to_do" | "in_progress" | "completed";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  country: string | null;
  nationality: string | null;
  current_institution: string | null;
  degree_level: string | null;
  field_of_study: string | null;
  graduation_year: number | null;
  cgpa: number | null;
  cgpa_scale: number | null;
  target_degree: string | null;
  target_intake: string | null;
  planning_notes: string | null;
  preferred_countries: string[];
  preferred_fields: string[];
  funding_preference: string | null;
  onboarding_completed: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  name: string;
  type: OpportunityType;
  provider: string | null;
  institution: string | null;
  country: string;
  city: string | null;
  degree_level: string | null;
  field: string | null;
  description: string | null;
  funding_type: string | null;
  funding_amount: string | null;
  tuition_coverage: boolean | null;
  living_allowance: boolean | null;
  travel_allowance: boolean | null;
  accommodation_coverage: boolean | null;
  health_insurance: boolean | null;
  duration: string | null;
  application_opens: string | null;
  application_deadline: string | null;
  start_date: string | null;
  eligibility_summary: string | null;
  nationality_requirements: string | null;
  language_requirements: string | null;
  work_experience_requirements: string | null;
  application_fee: string | null;
  official_website: string;
  official_application_portal: string | null;
  source_name: string;
  source_url: string;
  last_verified_at: string;
  status: OpportunityStatus;
  trust_level: TrustLevel;
  created_at: string;
  updated_at: string;
}

export interface OpportunityRequirement {
  id: string;
  opportunity_id: string;
  requirement_name: string;
  category: string;
  description: string | null;
  is_required: boolean;
  sort_order: number;
}

export interface SavedOpportunity {
  id: string;
  user_id: string;
  opportunity_id: string;
  tags: string[];
  notes: string | null;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: ApplicationStatus;
  program_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationRequirement {
  id: string;
  application_id: string;
  requirement_name: string;
  category: string;
  description: string | null;
  is_required: boolean;
  status: RequirementStatus;
  deadline: string | null;
  priority: string;
  notes: string | null;
  source_link: string | null;
  source: RequirementSource;
  discovered_on_official_site: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  application_id: string;
  user_id: string;
  title: string;
  status: TaskStatus;
  priority: string;
  deadline: string | null;
  notes: string | null;
  related_requirement_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  application_id: string;
  event_text: string;
  occurred_at: string;
}

export type ReportReason =
  | "incorrect_deadline"
  | "broken_link"
  | "outdated_requirement"
  | "incorrect_funding_info"
  | "duplicate_opportunity"
  | "suspicious_opportunity"
  | "other";

export type ReportStatus = "open" | "reviewed" | "dismissed";

export interface OpportunityReport {
  id: string;
  opportunity_id: string;
  reported_by: string | null;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  created_at: string;
}

export type AnalyticsEventType =
  | "page_view"
  | "opportunity_view"
  | "opportunity_official_link_click"
  | "opportunity_tracked"
  | "search_performed"
  | "signup"
  | "login";

export interface AnalyticsEvent {
  id: string;
  event_type: AnalyticsEventType;
  user_id: string | null;
  opportunity_id: string | null;
  path: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type DocumentCategory = "academic" | "identity" | "application" | "supporting" | "other";

export interface AppDocument {
  id: string;
  user_id: string;
  name: string;
  category: DocumentCategory;
  current_version_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  storage_path: string;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  document_id: string;
  document_version_id: string | null;
  attached_at: string;
}


