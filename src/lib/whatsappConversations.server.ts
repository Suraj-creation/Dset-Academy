import { and, desc, eq, lt } from 'drizzle-orm';
import { db } from './db';
import { whatsappConversations, whatsappMessages } from './schema';

export type ConversationStatus = 'bot' | 'human' | 'closed';
export type MessageDirection   = 'inbound' | 'outbound';

export interface WhatsAppConversation {
  id:                   string; // wa_id
  customerName?:        string;
  status:               ConversationStatus;
  lastInboundAt?:        string;
  lastOutboundAt?:       string;
  handoverRequestedAt?:  string;
  createdAt:             string;
}

export interface WhatsAppMessageInput {
  id:             string;
  conversationId: string;
  direction:      MessageDirection;
  messageType?:   string;
  content:        string;
  mediaUrl?:      string;
  status?:        string;
  aiHandled?:     boolean;
}

type ConversationRow = typeof whatsappConversations.$inferSelect;

function toConversation(row: ConversationRow): WhatsAppConversation {
  return {
    id:                  row.id,
    customerName:        row.customerName ?? undefined,
    status:              row.status as ConversationStatus,
    lastInboundAt:       row.lastInboundAt ?? undefined,
    lastOutboundAt:      row.lastOutboundAt ?? undefined,
    handoverRequestedAt: row.handoverRequestedAt ?? undefined,
    createdAt:           row.createdAt,
  };
}

export async function getOrCreateConversation(waId: string, customerName?: string): Promise<WhatsAppConversation> {
  const [existing] = await db.select().from(whatsappConversations).where(eq(whatsappConversations.id, waId)).limit(1);

  if (existing) {
    if (customerName && !existing.customerName) {
      await db.update(whatsappConversations).set({ customerName }).where(eq(whatsappConversations.id, waId));
      return { ...toConversation(existing), customerName };
    }
    return toConversation(existing);
  }

  await db.insert(whatsappConversations).values({
    id:           waId,
    customerName: customerName ?? null,
    status:       'bot',
  }).onConflictDoNothing();

  const [row] = await db.select().from(whatsappConversations).where(eq(whatsappConversations.id, waId)).limit(1);
  return toConversation(row);
}

export async function saveMessage(input: WhatsAppMessageInput): Promise<void> {
  await db.insert(whatsappMessages).values({
    id:             input.id,
    conversationId: input.conversationId,
    direction:      input.direction,
    messageType:    input.messageType ?? 'text',
    content:        input.content,
    mediaUrl:       input.mediaUrl ?? null,
    status:         input.status ?? 'received',
    aiHandled:      input.aiHandled ?? false,
  }).onConflictDoNothing();

  const now = new Date().toISOString();
  await db.update(whatsappConversations)
    .set(input.direction === 'inbound' ? { lastInboundAt: now } : { lastOutboundAt: now })
    .where(eq(whatsappConversations.id, input.conversationId));
}

// Delivery/read receipts from Meta's "statuses" webhook array.
export async function updateMessageStatus(waMessageId: string, status: string): Promise<void> {
  await db.update(whatsappMessages).set({ status }).where(eq(whatsappMessages.id, waMessageId));
}

export async function setConversationStatus(
  waId: string,
  status: ConversationStatus,
  handoverRequestedAt?: string | null,
): Promise<void> {
  await db.update(whatsappConversations)
    .set({ status, ...(handoverRequestedAt !== undefined ? { handoverRequestedAt } : {}) })
    .where(eq(whatsappConversations.id, waId));
}

export async function listConversations(): Promise<WhatsAppConversation[]> {
  const rows = await db.select().from(whatsappConversations).orderBy(desc(whatsappConversations.lastInboundAt));
  return rows.map(toConversation);
}

export async function getConversationMessages(waId: string, limit = 50) {
  const rows = await db.select().from(whatsappMessages)
    .where(eq(whatsappMessages.conversationId, waId))
    .orderBy(desc(whatsappMessages.createdAt))
    .limit(limit);
  return rows.reverse(); // chronological order for display
}

// Recent text turns, formatted for the AI's history array.
export async function getRecentHistory(waId: string, limit = 10): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const rows = await getConversationMessages(waId, limit);
  return rows
    .filter((r) => r.messageType === 'text')
    .map((r) => ({ role: r.direction === 'inbound' ? ('user' as const) : ('assistant' as const), content: r.content }));
}

// Cron target: flip conversations stuck in 'human' back to 'bot' after a period of inactivity.
export async function expireStaleHandovers(olderThanHours: number): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000).toISOString();
  const result = await db.update(whatsappConversations)
    .set({ status: 'bot', handoverRequestedAt: null })
    .where(and(eq(whatsappConversations.status, 'human'), lt(whatsappConversations.handoverRequestedAt, cutoff)))
    .returning({ id: whatsappConversations.id });
  return result.length;
}
