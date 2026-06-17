import rawTemplates from "@/data/passport-templates.json";

/**
 * Raw template seed data for Phase 1.
 * The service layer validates this once at startup so the API only ever reads clean catalog data.
 */
export const passportTemplateSeed = rawTemplates;