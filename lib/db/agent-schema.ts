import { pgTable, uuid, text, timestamp, json, varchar, boolean } from 'drizzle-orm/pg-core';
import { user } from './schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const agent = pgTable('Agent', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  instructions: text('instructions').notNull(), // System prompt/instructions
  icon: text('icon').default('🤖'), // Emoji or icon identifier
  color: text('color').default('#3B82F6'), // Hex color for UI theming
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  isDefault: boolean('isDefault').default(false), // Is this the default agent for the user?
  isActive: boolean('isActive').default(true),
  metadata: json('metadata'), // Additional settings (model, temperature, etc.)
  createdAt: timestamp('createdAt').notNull().defaultRandom(),
  updatedAt: timestamp('updatedAt').notNull().defaultRandom(),
});

export type Agent = InferSelectModel<typeof agent>;
export type NewAgent = InferInsertModel<typeof agent>;

// We'll need to modify the existing chat table to include agentId
// This would be done in a migration, but for now I'll show the updated schema
export const chatWithAgent = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  agentId: uuid('agentId')
    .references(() => agent.id), // Optional - null means default assistant
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type ChatWithAgent = InferSelectModel<typeof chatWithAgent>;