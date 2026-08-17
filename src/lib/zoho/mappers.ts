// Pure field-mapping functions: Postgres row -> Zoho-shaped payload. No I/O, no side effects —
// safe to unit test in isolation. Field mappings follow the "Zoho CRM Integration —
// Implementation Plan" §06 exactly.
//
// Scoped to the modules currently approved for integration: Contacts and Chat Leads only.
// Career Applications, WhatsApp handover, and Whitepaper Leads are all deliberately not
// mapped here — Applications by explicit company policy (never sync to Zoho), the other two
// because they're still under development — see project memory for the current approved scope.
// Typed against the existing server-layer interfaces (what addContact()/saveLead()/
// addApplication() actually return) rather than raw Drizzle rows — those are the shapes
// available at each route's call site.
import type { ContactEntry } from '@/lib/contacts.server';
import { buildLeadSummary, type LeadData } from '@/lib/leads.server';
import type { ZohoLeadPayload } from './types';

const FALLBACK_COMPANY = 'Individual — Website Lead';

/** Zoho Leads has separate First_Name/Last_Name fields; the site only ever collects one "name" field. */
function splitName(fullName: string): { firstName?: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return { lastName: FALLBACK_COMPANY };
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) return { lastName: trimmed };
  return { firstName: trimmed.slice(0, spaceIndex), lastName: trimmed.slice(spaceIndex + 1) };
}

function nonEmptyCompany(company: string | null | undefined): string {
  const trimmed = company?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : FALLBACK_COMPANY;
}

/**
 * @param extra.intent - detected-intent label; computed inline in api/contact.ts today
 *   (detectIntent()) but not persisted on the contacts row, so the Phase 2 call site passes
 *   it through directly rather than this mapper re-deriving it.
 */
export function contactToZohoLead(contact: ContactEntry, extra?: { intent?: string }): ZohoLeadPayload {
  const { firstName, lastName } = splitName(contact.name);
  return {
    First_Name: firstName,
    Last_Name: lastName,
    Email: contact.email,
    Phone: contact.phone ?? undefined,
    Company: nonEmptyCompany(contact.company),
    Description: contact.message,
    Lead_Source: 'Website — Contact Form',
    Lead_Status: 'Not Contacted',
    Website_Record_ID: contact.id,
    Website_Intent: extra?.intent,
    Lead_Quality_Score: contact.leadScore,
  };
}

/** Only called once a chat session is "captured" (name + email known) and warm/hot — never for anonymous/cold turns. */
export function chatLeadToZohoLead(lead: LeadData): ZohoLeadPayload {
  const { firstName, lastName } = splitName(lead.name ?? '');
  return {
    First_Name: firstName,
    Last_Name: lastName,
    Email: lead.email ?? undefined,
    Phone: lead.phone ?? undefined,
    Company: nonEmptyCompany(lead.company),
    Description: buildLeadSummary(lead),
    Lead_Source: 'Website — Chat Widget',
    Lead_Status: 'Not Contacted',
    Website_Intent: lead.intent,
    Lead_Priority: lead.score === 'hot' ? 'Hot' : lead.score === 'warm' ? 'Warm' : 'Cold',
    Chat_Message_Count: lead.messages,
    Website_Session_ID: lead.id,
    Website_Record_ID: lead.id,
  };
}

// applicationToZohoJobApplication() was removed here (2026-08 — company policy: Career
// Applications no longer sync to Zoho CRM at all; see project memory).
