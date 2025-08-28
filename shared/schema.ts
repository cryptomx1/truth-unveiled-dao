import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  pollType: text("poll_type").notNull(), // 'single', 'multi', 'scale'
  options: json("options").$type<string[]>().notNull(),
  creatorDid: text("creator_did").notNull(),
  creatorTier: text("creator_tier").notNull(),
  zkpHash: text("zkp_hash").notNull(),
  truthCoinStaked: integer("truth_coin_staked").default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const pollResponses = pgTable("poll_responses", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").references(() => polls.id).notNull(),
  responderDid: text("responder_did").notNull(),
  responderTier: text("responder_tier").notNull(),
  response: json("response").$type<string[]>().notNull(),
  tierWeight: integer("tier_weight").notNull(),
  zkpProof: text("zkp_proof").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPollSchema = createInsertSchema(polls).omit({
  id: true,
  createdAt: true,
});

export const insertPollResponseSchema = createInsertSchema(pollResponses).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Poll = typeof polls.$inferSelect;
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type PollResponse = typeof pollResponses.$inferSelect;
export type InsertPollResponse = z.infer<typeof insertPollResponseSchema>;
