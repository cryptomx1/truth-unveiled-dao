export class MemStorage {
    users;
    polls;
    pollResponses;
    currentUserId;
    currentPollId;
    currentResponseId;
    constructor() {
        this.users = new Map();
        this.polls = new Map();
        this.pollResponses = new Map();
        this.currentUserId = 1;
        this.currentPollId = 1;
        this.currentResponseId = 1;
    }
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        return Array.from(this.users.values()).find((user) => user.username === username);
    }
    async createUser(insertUser) {
        const id = this.currentUserId++;
        const user = { ...insertUser, id };
        this.users.set(id, user);
        return user;
    }
    async createPoll(insertPoll) {
        const id = this.currentPollId++;
        const poll = {
            id,
            title: insertPoll.title,
            description: insertPoll.description ?? null,
            category: insertPoll.category,
            pollType: insertPoll.pollType,
            options: insertPoll.options,
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
    async getPolls() {
        return Array.from(this.polls.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getPoll(id) {
        return this.polls.get(id);
    }
    async createPollResponse(insertResponse) {
        const id = this.currentResponseId++;
        const response = {
            id,
            pollId: insertResponse.pollId,
            responderDid: insertResponse.responderDid,
            responderTier: insertResponse.responderTier,
            response: insertResponse.response,
            tierWeight: insertResponse.tierWeight,
            zkpProof: insertResponse.zkpProof,
            createdAt: new Date()
        };
        this.pollResponses.set(id, response);
        return response;
    }
    async getPollResponses(pollId) {
        return Array.from(this.pollResponses.values()).filter(response => response.pollId === pollId);
    }
}
export const storage = new MemStorage();
