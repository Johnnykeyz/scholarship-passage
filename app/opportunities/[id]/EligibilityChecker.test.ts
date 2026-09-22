import { describe, it, expect } from "vitest";
import { evaluate } from "./EligibilityChecker";
import type { Opportunity, Profile } from "@/lib/types/database";

// Minimal-but-valid fixtures. Only the fields evaluate() actually reads
// are varied per test; everything else is a plausible constant so the
// object satisfies the real Opportunity/Profile shape.
function makeOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "opp-1",
    name: "Test Scholarship",
    type: "scholarship",
    provider: "Test Provider",
    institution: null,
    country: "United Kingdom",
    city: null,
    degree_level: "masters",
    field: "Any",
    description: "A test opportunity",
    funding_type: "fully_funded",
    funding_amount: null,
    tuition_coverage: true,
    living_allowance: true,
    travel_allowance: null,
    accommodation_coverage: null,
    health_insurance: null,
    duration: "1 year",
    application_opens: null,
    application_deadline: "2027-01-01",
    start_date: null,
    eligibility_summary: null,
    nationality_requirements: null,
    language_requirements: null,
    work_experience_requirements: null,
    application_fee: null,
    official_website: "https://example.com",
    official_application_portal: null,
    source_name: "Example",
    source_url: "https://example.com",
    last_verified_at: "2026-09-20",
    status: "open",
    trust_level: "officially_verified",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "user-1",
    full_name: "Test User",
    email: "test@example.com",
    country: null,
    nationality: null,
    current_institution: null,
    degree_level: null,
    field_of_study: null,
    graduation_year: null,
    cgpa: null,
    cgpa_scale: null,
    target_degree: null,
    target_intake: null,
    planning_notes: null,
    preferred_countries: [],
    preferred_fields: [],
    funding_preference: null,
    onboarding_completed: true,
    is_admin: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("eligibility checker evaluate()", () => {
  it("never returns a status of 'meets' for nationality — that check always requires verification", () => {
    const items = evaluate(
      makeOpportunity({ nationality_requirements: "Citizens of eligible Commonwealth countries only" }),
      makeProfile()
    );
    const nationality = items.find((i) => i.label === "Nationality");
    expect(nationality?.status).toBe("needs_verification");
    expect(nationality?.status).not.toBe("meets");
  });

  it("never returns a status of 'meets' for work experience — always requires verification against the source", () => {
    const items = evaluate(
      makeOpportunity({ work_experience_requirements: "At least 2 years of relevant experience" }),
      makeProfile()
    );
    const workExp = items.find((i) => i.label === "Work experience");
    expect(workExp?.status).toBe("needs_verification");
  });

  it("never returns a status of 'meets' for academic standing, even with a CGPA on file", () => {
    // This is the most important guarantee in the whole checker: a CGPA
    // alone must never be enough for the tool to assert the person
    // qualifies. It should always defer to the opportunity's own page.
    const items = evaluate(makeOpportunity(), makeProfile({ cgpa: 4.95, cgpa_scale: 5 }));
    const academic = items.find((i) => i.label === "Academic standing");
    expect(academic?.status).toBe("needs_verification");
    expect(academic?.status).not.toBe("meets");
  });

  it("marks academic standing as unknown when no CGPA is on file", () => {
    const items = evaluate(makeOpportunity(), makeProfile({ cgpa: null }));
    const academic = items.find((i) => i.label === "Academic standing");
    expect(academic?.status).toBe("unknown");
  });

  it("marks degree level as unknown when the profile has no target degree", () => {
    const items = evaluate(makeOpportunity({ degree_level: "masters" }), makeProfile({ target_degree: null }));
    const degree = items.find((i) => i.label === "Degree level");
    expect(degree?.status).toBe("unknown");
  });

  it("marks degree level as meets when the profile's target degree matches", () => {
    const items = evaluate(
      makeOpportunity({ degree_level: "masters" }),
      makeProfile({ target_degree: "Master's" })
    );
    const degree = items.find((i) => i.label === "Degree level");
    expect(degree?.status).toBe("meets");
  });

  it("marks degree level as needs_verification when the profile's target degree clearly differs", () => {
    const items = evaluate(
      makeOpportunity({ degree_level: "phd" }),
      makeProfile({ target_degree: "Bachelor's" })
    );
    const degree = items.find((i) => i.label === "Degree level");
    expect(degree?.status).toBe("needs_verification");
  });

  it("omits the degree level check entirely when the opportunity doesn't state one", () => {
    const items = evaluate(makeOpportunity({ degree_level: null }), makeProfile({ target_degree: "Master's" }));
    expect(items.find((i) => i.label === "Degree level")).toBeUndefined();
  });

  it("omits nationality and work experience checks when the opportunity doesn't mention them", () => {
    const items = evaluate(
      makeOpportunity({ nationality_requirements: null, work_experience_requirements: null }),
      makeProfile()
    );
    expect(items.find((i) => i.label === "Nationality")).toBeUndefined();
    expect(items.find((i) => i.label === "Work experience")).toBeUndefined();
  });

  it("never produces a status outside the three allowed values", () => {
    const items = evaluate(
      makeOpportunity({
        degree_level: "masters",
        nationality_requirements: "Any",
        work_experience_requirements: "Any",
      }),
      makeProfile({ target_degree: "Master's", cgpa: 4.0 })
    );
    const allowed = new Set(["meets", "unknown", "needs_verification"]);
    for (const item of items) {
      expect(allowed.has(item.status)).toBe(true);
    }
  });
});
