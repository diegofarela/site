/**
 * Portfolio content — presentation only.
 * Describes systems Diego designed and shipped; does not include proprietary source.
 */
window.PORTFOLIO = {
  domainLabels: {
    admissions: "Intake & Onboarding",
    crm: "CRM & Data",
    operations: "Operations",
    education: "LMS & Platforms",
    ai: "AI Platforms",
    personal: "Archive"
  },
  filterGroups: [
    {
      id: "domain",
      label: "Domain",
      filters: [
        { id: "admissions", label: "Intake & Onboarding" },
        { id: "crm", label: "CRM & Data" },
        { id: "operations", label: "Operations" },
        { id: "education", label: "LMS & Platforms" },
        { id: "ai", label: "AI Platforms" },
        { id: "personal", label: "Archive" }
      ]
    },
    {
      id: "language",
      label: "Language",
      filters: [
        { id: "lang-javascript", label: "JavaScript" },
        { id: "lang-python", label: "Python" },
        { id: "lang-sql", label: "SQL" }
      ]
    },
    {
      id: "concept",
      label: "Concept",
      filters: [
        { id: "concept-sync", label: "Data Sync" },
        { id: "concept-forms", label: "Forms & Intake" },
        { id: "concept-lms", label: "LMS Bridges" },
        { id: "concept-auth", label: "Auth & Access" },
        { id: "concept-events", label: "Events & Check-in" },
        { id: "concept-hygiene", label: "Data Hygiene" },
        { id: "concept-analytics", label: "Analytics" },
        { id: "concept-ai", label: "AI & Learning" },
        { id: "concept-ops", label: "Ops Tooling" }
      ]
    }
  ],
  projects: [
    {
      id: "crm-development",
      title: "Living Student–Parent CRM",
      category: "crm",
      languages: ["javascript"],
      concepts: ["sync"],
      visual: "crm",
      featured: false,
      status: "Shipped",
      summary: "Living CRM of students and parents with associations and email-delivery monitoring.",
      impact: "Org-wide email lands on accurate student–parent records—not stale or orphaned contacts.",
      tools: ["JavaScript", "CRM APIs", "Agile"],
      detail:
        "Architected and maintained a living CRM representation of students and parents—actionable records, parent associations, and ongoing monitoring of email delivery so organization-wide communications actually land."
    },
    {
      id: "bidirectional-sync",
      title: "Bidirectional CRM–Database Sync",
      category: "crm",
      languages: ["javascript", "python", "sql"],
      concepts: ["sync"],
      visual: "sync",
      featured: true,
      status: "Shipped",
      summary: "Bidirectional truth between workspaces, a local database, and CRM.",
      impact: "One shared truth across teams—reconcile less; stop arguing about which system is right.",
      tools: ["JavaScript", "Python", "MySQL", "HubSpot"],
      detail:
        "Built bidirectional synchronization so advisors and administrators see the same truth. Includes webhook-driven HubSpot updates, a change log, and advisor-workspace sync completed on a short timeline under production pressure."
    },
    {
      id: "duplicate-finder",
      title: "CRM Duplicate Detector",
      category: "crm",
      languages: ["python", "javascript", "sql"],
      concepts: ["hygiene", "sync"],
      visual: "match",
      featured: false,
      status: "In progress",
      summary: "Explainable matching to catch likely HubSpot duplicates before they fragment records.",
      impact: "Staff get explainable likely-duplicates to review—no silent merges that break LMS and email.",
      tools: ["Python", "FastAPI", "React", "Postgres", "HubSpot", "Docker"],
      detail:
        "Incremental CRM sync into a local store with scored, explainable matches. Designed so humans decide—never silent merges or deletes—protecting downstream LMS and communications."
    },
    {
      id: "address-cleaner",
      title: "Address & Record Cleaner",
      category: "crm",
      languages: ["javascript"],
      concepts: ["hygiene"],
      visual: "address",
      status: "Shipped",
      summary: "Normalize messy addresses, high-school names, and phone numbers into usable CRM fields.",
      impact: "Outreach and reporting stop failing on inconsistent free-text.",
      tools: ["JavaScript", "HubSpot"],
      detail:
        "A family of cleaners for the records that break automations: street addresses, school names, and phone formats. Presentation-safe hygiene so staff can trust filters, maps, and mail merges."
    },
    {
      id: "safe-contacts",
      title: "Safe Contact Creation",
      category: "admissions",
      languages: ["javascript"],
      concepts: ["hygiene", "forms"],
      visual: "contacts",
      status: "Shipped",
      summary: "Create student and parent contacts without duplicating or orphaning associations.",
      impact: "Applications become CRM records without creating a second identity.",
      tools: ["JavaScript", "HubSpot"],
      detail:
        "Guarded contact creation used by admissions and onboarding—lookup before write, associate student to parent, and refuse the silent duplicates that fragment later communications."
    },
    {
      id: "admissions",
      title: "Intake → CRM Automation",
      category: "admissions",
      languages: ["javascript"],
      concepts: ["forms", "sync"],
      visual: "forms",
      featured: true,
      status: "Shipped",
      summary: "Intake that creates and links CRM contacts—not a form dump that never becomes records.",
      impact: "Intake becomes trusted CRM records with associations—follow-up stops falling through cracks.",
      tools: ["JavaScript", "Forms", "HubSpot"],
      detail:
        "Upgraded admissions so submissions create and associate student and parent contacts, flag recurring applicants, and route reviewers to the latest submission—cutting noise and missed follow-ups."
    },
    {
      id: "application-reviewer",
      title: "Application Reviewer",
      category: "admissions",
      languages: ["javascript"],
      concepts: ["forms", "auth"],
      visual: "review",
      status: "Shipped",
      summary: "Auth-gated review UI over application rows—decisions, not cell hunting.",
      impact: "Reviewers decide in a purpose-built UI instead of hunting rows in a raw table.",
      tools: ["JavaScript"],
      detail:
        "A dedicated web app for authorized staff to review applications with selectable views—presentation and workflow focused on decisions, not cell hunting."
    },
    {
      id: "student-portals",
      title: "Applicant & Student Portals",
      category: "admissions",
      languages: ["javascript"],
      concepts: ["auth", "ops"],
      visual: "portal",
      status: "Shipped",
      summary: "Focused portals for admitted applicants and newly enrolled students.",
      impact: "Families see the next step without hunting through email threads.",
      tools: ["HTML", "HubSpot", "Web"],
      detail:
        "Purpose-built pages for admitted applicants and new students—status, next actions, and links into the rest of the systems stack instead of a generic dump of announcements."
    },
    {
      id: "registration-forms",
      title: "Registration Forms",
      category: "operations",
      languages: ["javascript"],
      concepts: ["forms", "events"],
      visual: "forms",
      status: "Shipped",
      summary: "Reusable forms with calculators and automatic CRM updates.",
      impact: "New events reuse the pattern—less setup, fewer one-off form snowflakes.",
      tools: ["JavaScript", "Forms"],
      detail:
        "Designed a reusable pattern for Orientation, Lab Safety, Core Trainings, and more—calculator-integrated fields, CRM updates, and registration emails that scale with each term."
    },
    {
      id: "qr-scanner",
      title: "QR Check-In Scanner",
      category: "operations",
      languages: ["javascript"],
      concepts: ["events", "auth"],
      visual: "qr",
      featured: true,
      status: "Shipped",
      summary: "Live whitelist validation with immediate feedback at the door.",
      impact: "Door check-in against a live whitelist—fast, secure, no clipboard theater.",
      tools: ["JavaScript", "QR APIs"],
      detail:
        "Event check-in that validates attendees against a live whitelist and returns immediate feedback—paired with QR delivery workflows for personalized codes."
    },
    {
      id: "qr-delivery",
      title: "Personalized QR Delivery",
      category: "operations",
      languages: ["javascript"],
      concepts: ["events"],
      visual: "qrmail",
      status: "Shipped",
      summary: "Mass-email unique QR codes from a roster, HubSpot-ready.",
      impact: "Every attendee arrives with a code already mapped to their record.",
      tools: ["JavaScript", "Gmail", "HubSpot"],
      detail:
        "Roster-driven send of personalized QR images and fallback links—used for trainings and events so check-in is a scan, not a roster hunt."
    },
    {
      id: "event-ops",
      title: "Event Registrations & Check-Ins",
      category: "operations",
      languages: ["javascript"],
      concepts: ["events", "forms"],
      visual: "events",
      status: "Shipped",
      summary: "End-to-end registration and check-in for Orientation, Lab Safety, Core Trainings, Expo.",
      impact: "Mission-critical events run on registration → CRM → check-in—not tribal knowledge.",
      tools: ["JavaScript", "Forms", "HubSpot"],
      detail:
        "Registration, CRM updates, qualifying-tier emails, and check-in flows for mission-critical events—including Blitz Talks and Expo abstract/attendee registration with HubSpot sync."
    },
    {
      id: "certificate-generator",
      title: "Certificate Generator",
      category: "operations",
      languages: ["javascript"],
      concepts: ["ops"],
      visual: "certificate",
      status: "Shipped",
      summary: "Mass certificates from flexible templates with admin control.",
      impact: "Recognition at scale without one-off design work every term.",
      tools: ["JavaScript", "Templates", "Drive"],
      detail:
        "Iterated through multiple fully functional versions until flexibility matched org needs—placeholder templates, signatures, PDF export, and optional mass email."
    },
    {
      id: "rosters",
      title: "Rosters & Advisor Tools",
      category: "operations",
      languages: ["javascript"],
      concepts: ["sync", "ops"],
      visual: "roster",
      status: "Shipped",
      summary: "Automated rosters plus live transition-form visibility for advisors.",
      impact: "Advisors see roster truth in real time—less manual chase, stronger compliance.",
      tools: ["JavaScript", "Forms", "HubSpot"],
      detail:
        "Term-based roster automation plus transition visibility so advisors see submissions in real time—later integrated with CRM for a single source of assignment truth."
    },
    {
      id: "google-groups",
      title: "Google Groups Provisioning",
      category: "operations",
      languages: ["javascript"],
      concepts: ["sync", "ops"],
      visual: "groups",
      status: "Shipped",
      summary: "Keep lab and org Google Groups in sync with CRM membership.",
      impact: "Mailing lists match reality instead of last term’s roster.",
      tools: ["JavaScript", "Groups API", "HubSpot"],
      detail:
        "Export-and-reconcile flows so lab groups and all-hands lists follow CRM assignments—adds, removals, and new-term rebuilds without hand-editing members."
    },
    {
      id: "lab-transfer",
      title: "Lab Transfer Formalization",
      category: "admissions",
      languages: ["javascript"],
      concepts: ["forms", "auth"],
      visual: "transfer",
      status: "In progress",
      summary: "Student requests and advisor approve/reject with capacity and CRM sync.",
      impact: "Structured transfers instead of informal chase-downs.",
      tools: ["JavaScript", "HubSpot", "Supabase"],
      detail:
        "Eligibility-gated student portal, advisor capacity checks, timeouts, and HubSpot sync—formalizing a high-touch process that used to live in email threads. Includes a confirmation path for students who already know their lab."
    },
    {
      id: "request-overlap",
      title: "Request Overlap Visualizer",
      category: "operations",
      languages: ["python"],
      concepts: ["analytics", "ops"],
      visual: "overlap",
      status: "Shipped",
      summary: "See how advisor lab requests pile up over time from a timestamp CSV.",
      impact: "Capacity conversations use a chart, not a gut feel.",
      tools: ["Python", "Streamlit", "Docker"],
      detail:
        "Small local tool that turns request timestamps—or true start/end intervals—into an overlap chart so leadership can see concurrency instead of scrolling raw rows."
    },
    {
      id: "canvas-systems",
      title: "LMS ↔ CRM Bridge Suite",
      category: "education",
      languages: ["javascript"],
      concepts: ["lms", "sync"],
      visual: "canvas",
      featured: true,
      status: "Shipped",
      summary: "Pre-work, grades, provisioning, and completion sync across LMS and CRM.",
      impact: "Term start isn’t a week of manual enrollment surgery—provisioning, grades, and completion stay in sync.",
      tools: ["JavaScript", "Canvas API", "HubSpot"],
      detail:
        "Suite spanning Pre-Work completion → HubSpot properties, CRM-to-Canvas user loading/enrollment, reusable completion-rule libraries, progress reporting, and a Canvas Live Events webhook that writes completion the moment a configured assignment is submitted."
    },
    {
      id: "canvas-user-load",
      title: "CRM → Canvas Provisioning",
      category: "education",
      languages: ["javascript"],
      concepts: ["lms", "sync"],
      visual: "webhook",
      status: "Shipped",
      summary: "HubSpot contacts → Canvas users and enrollments without copy-paste.",
      impact: "Term start is a load job—not a week of manual enrollment surgery.",
      tools: ["JavaScript", "Canvas API", "HubSpot"],
      detail:
        "Format, de-duplicate, and push CRM records into Canvas—user loading, enrollment, and export helpers so the LMS matches who is actually in the program."
    },
    {
      id: "canvas-mirror",
      title: "Canvas Mirror",
      category: "education",
      languages: ["python", "sql"],
      concepts: ["lms", "sync"],
      visual: "mirror",
      status: "Shipped",
      summary: "Searchable self-hosted mirror of courses, enrollments, and grades.",
      impact: "Ops visibility without waiting on live LMS clicks.",
      tools: ["Python", "FastAPI", "Postgres", "Docker", "Canvas REST"],
      detail:
        "Bootstrap plus incremental reconcile for graded activity—staff dashboards and APIs for operational questions Canvas wasn’t built to answer quickly."
    },
    {
      id: "canvas-catalog",
      title: "Canvas Self-Registration Catalog",
      category: "education",
      languages: ["javascript"],
      concepts: ["lms"],
      visual: "catalog",
      status: "Shipped",
      summary: "Polished course catalog for student self-enrollment, embeddable in Canvas.",
      impact: "Students discover and join courses without ticket ping-pong.",
      tools: ["Static web", "Docker", "Canvas embed"],
      detail:
        "Config-driven course cards with enrollment links and cache-busting for iframe embeds—simple surface, careful operational details."
    },
    {
      id: "section-switcher",
      title: "Canvas Section Switcher",
      category: "education",
      languages: ["javascript"],
      concepts: ["lms", "auth"],
      visual: "sections",
      status: "In progress",
      summary: "Eligible students pick or change sections within capacity rules.",
      impact: "Self-serve section changes with auditability.",
      tools: ["JavaScript", "Canvas", "HubSpot"],
      detail:
        "Auth-gated picker with eligibility tones, permanent vs temporary change modes, HubSpot/Canvas adapters, and roster sync."
    },
    {
      id: "hubspot-integrations",
      title: "HubSpot Ops Integrations",
      category: "crm",
      languages: ["javascript"],
      concepts: ["sync"],
      visual: "hubspot",
      status: "Shipped",
      summary: "Property updates, reporting, portals, and email-status monitoring via HubSpot APIs.",
      impact: "Repetitive admin work drops; reporting staff can trust the numbers.",
      tools: ["JavaScript", "HubSpot API"],
      detail:
        "Cross-cutting HubSpot work: property updates, enrollment portals, group exports, email status monitoring, and event syncing."
    },
    {
      id: "main-website",
      title: "Public Website Rebuild",
      category: "operations",
      languages: ["javascript"],
      concepts: ["ops"],
      visual: "web",
      status: "Shipped",
      summary: "End-to-end remake of the org’s public site—structure, content systems, maintenance.",
      impact: "Clearer public face for applicants and families—owned end-to-end, not handed off.",
      tools: ["JavaScript", "Web"],
      detail:
        "Full ownership of presentation for students, parents, faculty, and prospective applicants—structure, content systems, and ongoing maintenance."
    },
    {
      id: "redirector",
      title: "Link Redirector",
      category: "operations",
      languages: ["javascript"],
      concepts: ["ops"],
      visual: "redirect",
      status: "Shipped",
      summary: "Short, durable links that survive campaign and form URL changes.",
      impact: "Printed and emailed links keep working when the destination moves.",
      tools: ["JavaScript", "Cloudflare Workers"],
      detail:
        "A small routing layer—edge worker plus admin-friendly configuration—so orientation, admissions, and event links can be updated without republishing every flyer."
    },
    {
      id: "signin-pipeline",
      title: "Sign-In → CRM Pipeline",
      category: "operations",
      languages: ["python", "sql"],
      concepts: ["sync", "events"],
      visual: "pipeline",
      status: "Shipped",
      summary: "Check-in/out events land reliably in CRM.",
      impact: "Events land in CRM with retries and ops visibility—no silent drops.",
      tools: ["Python", "Postgres", "Docker", "nginx", "HubSpot"],
      detail:
        "Signed webhooks into a durable queue with HubSpot timestamp updates, failure alerting, and Watchtower-style ops tooling on a shared production host."
    },
    {
      id: "ai-helpdesk",
      title: "AI Helpdesk Platform",
      category: "ai",
      languages: ["python", "javascript", "sql"],
      concepts: ["ai", "auth"],
      visual: "ai",
      featured: false,
      status: "In progress",
      summary: "Grounded answers from approved knowledge with human handoff.",
      impact: "First-line support scales without inventing answers—sources visible, humans close the loop.",
      tools: ["Python", "FastAPI", "React", "Postgres", "pgvector", "Docker"],
      detail:
        "RAG chat with source visibility, admin ingest/publish, embeddable widget, multi-tenant org settings, and ticketing history—built for real helpdesk ops, not demo chat."
    },
    {
      id: "research-learn",
      title: "Research Learning Platform",
      category: "education",
      languages: ["javascript"],
      concepts: ["ai", "lms"],
      visual: "learn",
      status: "In progress",
      summary: "Duolingo-style practice for research topics, with a separate admin surface.",
      impact: "Practice loops instead of one-off slide decks.",
      tools: ["JavaScript", "Docker", "Admin UI"],
      detail:
        "Gamified learning for research concepts—learner app, admin authoring, and a containerized backend so content can be iterated without rebuilding the classroom each term."
    },
    {
      id: "resource-manager",
      title: "Resource Access Platform",
      category: "operations",
      languages: ["javascript", "sql"],
      concepts: ["auth"],
      visual: "resources",
      status: "In progress",
      summary: "Gated forms, docs, links, and media with org-aware permissions.",
      impact: "One place to grant the right people the right resources.",
      tools: ["Next.js", "Supabase", "Docker"],
      detail:
        "Multi-tenant design with Google OAuth, RLS-minded schema, admin CRUD, and audit—forms, links, documents, and video behind clear authorization."
    },
    {
      id: "colloquia",
      title: "Colloquia Operations",
      category: "operations",
      languages: ["javascript"],
      concepts: ["events"],
      visual: "events",
      status: "Shipped",
      summary: "Advisor–student messaging, site updates, and announcement emails each cycle.",
      impact: "Event logistics run on a repeatable backbone—not last-minute chase.",
      tools: ["JavaScript", "Web", "Gmail"],
      detail:
        "Operational backbone for colloquia: presenter requests, clarifications, website updates, and fresh announcement emails each cycle."
    },
    {
      id: "financial-aid",
      title: "Financial Aid Tracking",
      category: "operations",
      languages: ["javascript"],
      concepts: ["ops", "analytics"],
      visual: "finance",
      status: "Shipped",
      summary: "Automated reminders and reports so aid workflows don’t depend on memory.",
      impact: "Aid steps stay visible and accountable—fewer students fall through cracks.",
      tools: ["JavaScript"],
      detail:
        "Reminders and reporting so aid processes don’t depend on memory—aligned with a ‘no student left behind’ operating stance."
    },
    {
      id: "helpdesk-ops",
      title: "Helpdesk Operations",
      category: "personal",
      archive: true,
      languages: ["javascript"],
      concepts: ["ops"],
      visual: "helpdesk",
      status: "Shipped",
      summary: "Ticket triage through resolution across site, dashboards, and Canvas.",
      impact: "Sole-owner stack stays operable—tickets closed, systems documented, nothing orphaned.",
      tools: ["Workspace Admin"],
      detail:
        "Continuous ticket maintenance, escalation, and archival—paired with documentation so systems stay operable when Diego is the sole owner."
    },
    {
      id: "data-analysis-asdrp",
      title: "Admissions Data Analysis (2019–2024)",
      category: "crm",
      languages: ["python", "sql"],
      concepts: ["analytics"],
      visual: "analytics",
      status: "Shipped",
      summary: "Multi-year applicant trends to guide outreach and process changes.",
      impact: "Recruitment and admissions decisions backed by five years of data—not gut feel.",
      tools: ["Python", "SQL", "Tableau"],
      detail:
        "Analyzed five years of application data to surface patterns leadership could act on—not vanity charts, decision support."
    },
    {
      id: "research-directory-clean",
      title: "Research Directory Data Cleanup",
      category: "personal",
      archive: true,
      languages: ["python"],
      concepts: ["hygiene"],
      visual: "cleanup",
      status: "Shipped",
      summary: "Python tooling to separate mixed name/email cells for a research directory.",
      impact: "Hours of manual cell-splitting replaced with a repeatable script.",
      tools: ["Python"],
      detail:
        "Privacy-safe demo of a real ASDRP need: authors packed into messy cells. Script separates names and emails into clean columns for downstream use."
    },
    {
      id: "cyclistic",
      title: "Cyclistic Case Study",
      category: "personal",
      archive: true,
      languages: ["sql"],
      concepts: ["analytics"],
      visual: "bike",
      status: "Shipped",
      summary: "Full Google Data Analytics capstone: casual riders → members.",
      impact: "End-to-end analysis from collect → clean → insight → present.",
      tools: ["SQL", "Excel", "R"],
      link: "https://github.com/diegofarela/Cyclistic-Case-Study",
      detail:
        "Capstone for the Google Data Analytics certificate—asking how Cyclistic can convert casual riders into members, with a full R report."
    },
    {
      id: "advanced-analytics",
      title: "Advanced Data Analytics Portfolio",
      category: "personal",
      archive: true,
      languages: ["python", "sql"],
      concepts: ["analytics"],
      visual: "ml",
      status: "Shipped",
      summary: "Proposal through EDA, Tableau, A/B tests, regression, and ML communication.",
      impact: "Practiced every stage of the analytics lifecycle across scenarios.",
      tools: ["Python", "Tableau", "Statistics", "ML"],
      detail:
        "Google Advanced Data Analytics work spanning project proposal, exploratory analysis, experimentation, modeling, and stakeholder-ready communication."
    },
    {
      id: "pokemon-game",
      title: "Python Pokémon Videogame",
      category: "personal",
      archive: true,
      languages: ["python"],
      concepts: ["ops"],
      visual: "game",
      status: "Shipped",
      summary: "Curiosity project that started a lasting love of deterministic code.",
      impact: "Foundation story for programming → systems → data.",
      tools: ["Python"],
      link: "https://github.com/diegofarela/PythonVideogame",
      detail:
        "Early Python play that proved coding could be creative and precise—the spark before CRMs, APIs, and production platforms."
    }
  ]
};
