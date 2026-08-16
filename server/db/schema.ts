import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
};

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  description: text("description"),
  ...timestamps
}, (table) => ({
  pathIdx: index("idx_workspace_path").on(table.path),
  nameIdx: index("idx_workspace_name").on(table.name),
}));

export const agents = sqliteTable("agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  config: text("config", { mode: 'json' }), // JSON string for arbitrary config
  status: text("status").notNull(),
  lastSync: text("last_sync"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  prefix: text("prefix").notNull(),
  identifier: text("identifier").notNull(),
  action: text("action").notNull(),
  raw: text("raw").notNull(),
  color: text("color"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  prefixIdx: index("idx_tag_prefix").on(table.prefix),
  rawIdx: index("idx_tag_raw").on(table.raw)
}));

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull().references(() => agents.id),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  model: text("model").notNull(),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  durationMs: integer("duration_ms"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  totalTokens: integer("total_tokens"),
  estimatedCost: real("estimated_cost"),
  status: text("status").notNull(),
  summary: text("summary"),
  toolCalls: integer("tool_calls"),
  filesModified: text("files_modified", { mode: 'json' }), // string[]
  metadata: text("metadata", { mode: 'json' }),
}, (table) => ({
  agentIdx: index("idx_session_agent").on(table.agentId),
  workspaceIdx: index("idx_session_workspace").on(table.workspaceId),
  startedIdx: index("idx_session_started").on(table.startedAt),
  statusIdx: index("idx_session_status").on(table.status)
}));

export const skills = sqliteTable("skills", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  name: text("name").notNull(),
  version: text("version").notNull(),
  description: text("description"),
  author: text("author"),
  triggerCommand: text("trigger_command"),
  instructions: text("instructions").notNull(),
  parameters: text("parameters", { mode: 'json' }),
  usageCount: integer("usage_count").notNull().default(0),
  enabled: integer("enabled", { mode: 'boolean' }).notNull().default(true),
  ...timestamps
}, (table) => ({
  nameIdx: index("idx_skill_name").on(table.name)
}));

export const commands = sqliteTable("commands", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  skillId: text("skill_id").notNull().references(() => skills.id),
  aliases: text("aliases", { mode: 'json' }), // string[]
  parameters: text("parameters", { mode: 'json' }),
  agents: text("agents", { mode: 'json' }), // string[]
  autoTags: text("auto_tags", { mode: 'json' }), // string[]
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  nameIdx: index("idx_command_name").on(table.name)
}));

export const rules = sqliteTable("rules", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  name: text("name").notNull(),
  scope: text("scope").notNull(),
  target: text("target").notNull(),
  priority: integer("priority").notNull(),
  enabled: integer("enabled", { mode: 'boolean' }).notNull().default(true),
  condition: text("condition"),
  instruction: text("instruction").notNull(),
  ...timestamps
}, (table) => ({
  scopePriorityIdx: index("idx_rule_scope").on(table.scope, table.priority)
}));

// Junction Tables

export const sessionTags = sqliteTable("session_tags", {
  sessionId: text("session_id").notNull().references(() => sessions.id),
  tagId: text("tag_id").notNull().references(() => tags.id),
}, (table) => ({
  pk: uniqueIndex("idx_session_tag").on(table.sessionId, table.tagId)
}));

export const skillTags = sqliteTable("skill_tags", {
  skillId: text("skill_id").notNull().references(() => skills.id),
  tagId: text("tag_id").notNull().references(() => tags.id),
}, (table) => ({
  pk: uniqueIndex("idx_skill_tag").on(table.skillId, table.tagId)
}));

export const ruleTags = sqliteTable("rule_tags", {
  ruleId: text("rule_id").notNull().references(() => rules.id),
  tagId: text("tag_id").notNull().references(() => tags.id),
}, (table) => ({
  pk: uniqueIndex("idx_rule_tag").on(table.ruleId, table.tagId)
}));

export const agentSkills = sqliteTable("agent_skills", {
  agentId: text("agent_id").notNull().references(() => agents.id),
  skillId: text("skill_id").notNull().references(() => skills.id),
});

// Relations definitions
export const workspacesRelations = relations(workspaces, ({ many }) => ({
  sessions: many(sessions),
  skills: many(skills),
  rules: many(rules),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [sessions.workspaceId], references: [workspaces.id] }),
  agent: one(agents, { fields: [sessions.agentId], references: [agents.id] }),
  sessionTags: many(sessionTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  sessionTags: many(sessionTags),
  skillTags: many(skillTags),
  ruleTags: many(ruleTags),
}));

export const sessionTagsRelations = relations(sessionTags, ({ one }) => ({
  session: one(sessions, { fields: [sessionTags.sessionId], references: [sessions.id] }),
  tag: one(tags, { fields: [sessionTags.tagId], references: [tags.id] }),
}));

export const skillsRelations = relations(skills, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [skills.workspaceId], references: [workspaces.id] }),
  skillTags: many(skillTags),
  commands: many(commands),
  agentSkills: many(agentSkills),
}));

export const commandsRelations = relations(commands, ({ one }) => ({
  skill: one(skills, { fields: [commands.skillId], references: [skills.id] }),
}));

export const skillTagsRelations = relations(skillTags, ({ one }) => ({
  skill: one(skills, { fields: [skillTags.skillId], references: [skills.id] }),
  tag: one(tags, { fields: [skillTags.tagId], references: [tags.id] }),
}));

export const rulesRelations = relations(rules, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [rules.workspaceId], references: [workspaces.id] }),
  ruleTags: many(ruleTags),
}));

export const ruleTagsRelations = relations(ruleTags, ({ one }) => ({
  rule: one(rules, { fields: [ruleTags.ruleId], references: [rules.id] }),
  tag: one(tags, { fields: [ruleTags.tagId], references: [tags.id] }),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  sessions: many(sessions),
  agentSkills: many(agentSkills),
}));

export const agentSkillsRelations = relations(agentSkills, ({ one }) => ({
  agent: one(agents, { fields: [agentSkills.agentId], references: [agents.id] }),
  skill: one(skills, { fields: [agentSkills.skillId], references: [skills.id] }),
}));

// Export Types
export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;
export type Command = typeof commands.$inferSelect;
export type InsertCommand = typeof commands.$inferInsert;
export type Rule = typeof rules.$inferSelect;
export type InsertRule = typeof rules.$inferInsert;
