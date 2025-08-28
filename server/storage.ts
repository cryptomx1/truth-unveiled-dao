import { users, polls, pollResponses, type User, type InsertUser, type Poll, type InsertPoll, type PollResponse, type InsertPollResponse } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Poll management
  createPoll(poll: InsertPoll): Promise<Poll>;
  getPolls(): Promise<Poll[]>;
  getPoll(id: number): Promise<Poll | undefined>;
  createPollResponse(response: InsertPollResponse): Promise<PollResponse>;
  getPollResponses(pollId: number): Promise<PollResponse[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private polls: Map<number, Poll>;
  private pollResponses: Map<number, PollResponse>;
  private currentUserId: number;
  private currentPollId: number;
  private currentResponseId: number;

  constructor() {
    this.users = new Map();
    this.polls = new Map();
    this.pollResponses = new Map();
    this.currentUserId = 1;
    this.currentPollId = 1;
    this.currentResponseId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPoll(insertPoll: InsertPoll): Promise<Poll> {
    const id = this.currentPollId++;
    const poll: Poll = { 
      id,
      title: insertPoll.title,
      description: insertPoll.description ?? null,
      category: insertPoll.category,
      pollType: insertPoll.pollType,
      options: insertPoll.options as string[],
      creatorDid: insertPoll.creatorDid,
      creatorTier: insertPoll.creatorTier,
      zkpHash: insertPoll.zkpHash,
      truthCoinStaked: insertPoll.truthCoinStaked ?? 0,
      expiresAt: insertPoll.expiresAt ?? null,
      isActive: insertPoll.isActive ?? true,
      createdAt: new Date()
    };
    this.polls.set(id, poll);
    return poll;
  }

  async getPolls(): Promise<Poll[]> {
    return Array.from(this.polls.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPoll(id: number): Promise<Poll | undefined> {
    return this.polls.get(id);
  }

  async createPollResponse(insertResponse: InsertPollResponse): Promise<PollResponse> {
    const id = this.currentResponseId++;
    const response: PollResponse = {
      id,
      pollId: insertResponse.pollId,
      responderDid: insertResponse.responderDid,
      responderTier: insertResponse.responderTier,
      response: insertResponse.response as string[],
      tierWeight: insertResponse.tierWeight,
      zkpProof: insertResponse.zkpProof,
      createdAt: new Date()
    };
    this.pollResponses.set(id, response);
    return response;
  }

  async getPollResponses(pollId: number): Promise<PollResponse[]> {
    return Array.from(this.pollResponses.values()).filter(
      response => response.pollId === pollId
    );
  }
}

export const storage = new MemStorage();
