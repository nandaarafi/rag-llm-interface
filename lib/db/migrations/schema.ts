import { pgTable, uuid, varchar, text, boolean, timestamp, integer, foreignKey, json, primaryKey, pgEnum } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const artifactType = pgEnum("ArtifactType", ['policy', 'procedure', 'training'])
export const attachmentEntityType = pgEnum("AttachmentEntityType", ['task', 'vendor', 'risk', 'comment'])
export const attachmentType = pgEnum("AttachmentType", ['image', 'video', 'audio', 'document', 'other'])
export const commentEntityType = pgEnum("CommentEntityType", ['task', 'vendor', 'risk', 'policy'])
export const departments = pgEnum("Departments", ['none', 'admin', 'gov', 'hr', 'it', 'itsm', 'qms'])
export const frameworkId = pgEnum("FrameworkId", ['soc2'])
export const frequency = pgEnum("Frequency", ['monthly', 'quarterly', 'yearly'])
export const impact = pgEnum("Impact", ['insignificant', 'minor', 'moderate', 'major', 'severe'])
export const likelihood = pgEnum("Likelihood", ['very_unlikely', 'unlikely', 'possible', 'likely', 'very_likely'])
export const policyStatus = pgEnum("PolicyStatus", ['draft', 'published', 'needs_review'])
export const requirementId = pgEnum("RequirementId", ['soc2_CC1', 'soc2_CC2', 'soc2_CC3', 'soc2_CC4', 'soc2_CC5', 'soc2_CC6', 'soc2_CC7', 'soc2_CC8', 'soc2_CC9', 'soc2_A1', 'soc2_C1', 'soc2_PI1', 'soc2_P1'])
export const riskCategory = pgEnum("RiskCategory", ['customer', 'governance', 'operations', 'other', 'people', 'regulatory', 'reporting', 'resilience', 'technology', 'vendor_management'])
export const riskStatus = pgEnum("RiskStatus", ['open', 'pending', 'closed', 'archived'])
export const riskTreatmentType = pgEnum("RiskTreatmentType", ['accept', 'avoid', 'mitigate', 'transfer'])
export const role = pgEnum("Role", ['owner', 'admin', 'auditor', 'employee'])
export const taskEntityType = pgEnum("TaskEntityType", ['control', 'vendor', 'risk'])
export const taskFrequency = pgEnum("TaskFrequency", ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
export const taskStatus = pgEnum("TaskStatus", ['todo', 'in_progress', 'done'])
export const trustStatus = pgEnum("TrustStatus", ['draft', 'published'])
export const vendorCategory = pgEnum("VendorCategory", ['cloud', 'infrastructure', 'software_as_a_service', 'finance', 'marketing', 'sales', 'hr', 'other'])
export const vendorStatus = pgEnum("VendorStatus", ['not_assessed', 'in_progress', 'assessed'])



export const user = pgTable("User", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 64 }).notNull(),
	password: varchar({ length: 64 }),
	customerId: varchar({ length: 64 }),
	image: text(),
	variantId: varchar("variant_id", { length: 64 }),
	hasAccess: boolean("has_access").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	resetToken: varchar("reset_token", { length: 255 }),
	resetTokenExpiry: timestamp("reset_token_expiry", { mode: 'string' }),
	emailVerified: boolean("email_verified").default(false),
	emailVerificationToken: varchar("email_verification_token", { length: 255 }),
	credits: integer().default(3).notNull(),
	planType: varchar("plan_type").default('free').notNull(),
	lastCreditReset: timestamp("last_credit_reset", { mode: 'string' }).defaultNow(),
});

export const chat = pgTable("Chat", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	title: text().notNull(),
	userId: uuid().notNull(),
	visibility: varchar().default('private').notNull(),
},
(table) => {
	return {
		chatUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Chat_userId_User_id_fk"
		}),
	}
});

export const messageV2 = pgTable("Message_v2", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	role: varchar().notNull(),
	parts: json().notNull(),
	attachments: json().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		messageV2ChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Message_v2_chatId_Chat_id_fk"
		}),
	}
});

export const message = pgTable("Message", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	role: varchar().notNull(),
	content: json().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		messageChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Message_chatId_Chat_id_fk"
		}),
	}
});

export const suggestion = pgTable("Suggestion", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	documentId: uuid().notNull(),
	documentCreatedAt: timestamp({ mode: 'string' }).notNull(),
	originalText: text().notNull(),
	suggestedText: text().notNull(),
	description: text(),
	isResolved: boolean().default(false).notNull(),
	userId: uuid().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		suggestionUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Suggestion_userId_User_id_fk"
		}),
		suggestionDocumentIdDocumentCreatedAtDocumentIdCreatedAtF: foreignKey({
			columns: [table.documentId, table.documentCreatedAt],
			foreignColumns: [document.id, document.createdAt],
			name: "Suggestion_documentId_documentCreatedAt_Document_id_createdAt_f"
		}),
	}
});

export const voteV2 = pgTable("Vote_v2", {
	chatId: uuid().notNull(),
	messageId: uuid().notNull(),
	isUpvoted: boolean().notNull(),
},
(table) => {
	return {
		voteV2ChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Vote_v2_chatId_Chat_id_fk"
		}),
		voteV2MessageIdMessageV2IdFk: foreignKey({
			columns: [table.messageId],
			foreignColumns: [messageV2.id],
			name: "Vote_v2_messageId_Message_v2_id_fk"
		}),
		voteV2ChatIdMessageIdPk: primaryKey({ columns: [table.chatId, table.messageId], name: "Vote_v2_chatId_messageId_pk"}),
	}
});

export const vote = pgTable("Vote", {
	chatId: uuid().notNull(),
	messageId: uuid().notNull(),
	isUpvoted: boolean().notNull(),
},
(table) => {
	return {
		voteChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Vote_chatId_Chat_id_fk"
		}),
		voteMessageIdMessageIdFk: foreignKey({
			columns: [table.messageId],
			foreignColumns: [message.id],
			name: "Vote_messageId_Message_id_fk"
		}),
		voteChatIdMessageIdPk: primaryKey({ columns: [table.chatId, table.messageId], name: "Vote_chatId_messageId_pk"}),
	}
});

export const document = pgTable("Document", {
	id: uuid().defaultRandom().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	title: text().notNull(),
	content: text(),
	text: varchar().default('text').notNull(),
	userId: uuid().notNull(),
},
(table) => {
	return {
		documentUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Document_userId_User_id_fk"
		}),
		documentIdCreatedAtPk: primaryKey({ columns: [table.id, table.createdAt], name: "Document_id_createdAt_pk"}),
	}
});