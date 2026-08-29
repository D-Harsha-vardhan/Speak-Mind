import { env } from "./env";

// In-memory collections for SpeakMind Demo Mode
// Use globalThis to persist across Next.js Hot Module Replacements (HMR)
const globalDb = globalThis as any;
if (!globalDb.usersTable) {
  globalDb.usersTable = [];
  globalDb.conversationsTable = [];
  globalDb.messagesTable = [];
  globalDb.checkinsTable = [];
  globalDb.journalEntriesTable = [];
  globalDb.insightsTable = [];
  globalDb.activitiesTable = [];
  globalDb.activityHistoryTable = [];
  globalDb.safetyEventsTable = [];
  globalDb.emotionEventsTable = [];
}

const usersTable: any[] = globalDb.usersTable;
const conversationsTable: any[] = globalDb.conversationsTable;
const messagesTable: any[] = globalDb.messagesTable;
const checkinsTable: any[] = globalDb.checkinsTable;
const journalEntriesTable: any[] = globalDb.journalEntriesTable;
const insightsTable: any[] = globalDb.insightsTable;
const activitiesTable: any[] = globalDb.activitiesTable;
const activityHistoryTable: any[] = globalDb.activityHistoryTable;
const safetyEventsTable: any[] = globalDb.safetyEventsTable;
const emotionEventsTable: any[] = globalDb.emotionEventsTable;

function matchQuery(item: any, query: any): boolean {
  for (const key in query) {
    if (item[key] !== query[key]) {
      return false;
    }
  }
  return true;
}

class MockCollection {
  private table: any[];
  private query: any = {};

  constructor(table: any[]) {
    this.table = table;
  }

  where(query: any) {
    this.query = query;
    return this;
  }

  async first() {
    const matched = this.table.find((item) => matchQuery(item, this.query));
    this.query = {};
    return matched || null;
  }

  async all() {
    const matched = this.table.filter((item) => matchQuery(item, this.query));
    this.query = {};
    return matched;
  }

  async create(data: any) {
    const newItem = {
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.table.push(newItem);
    this.query = {};
    return newItem;
  }

  async update(data: any) {
    const items = this.table.filter((item) => matchQuery(item, this.query));
    for (const item of items) {
      Object.assign(item, data);
    }
    this.query = {};
    return items;
  }

  async delete() {
    let deletedCount = 0;
    for (let i = this.table.length - 1; i >= 0; i--) {
      if (matchQuery(this.table[i], this.query)) {
        this.table.splice(i, 1);
        deletedCount++;
      }
    }
    this.query = {};
    return deletedCount;
  }
}

// 1. Build Mock ORM client matching Prisma Next interface
const mockDb = {
  orm: {
    public: {
      User: new MockCollection(usersTable),
      Conversation: new MockCollection(conversationsTable),
      Message: new MockCollection(messagesTable),
      CheckIn: new MockCollection(checkinsTable),
      JournalEntry: new MockCollection(journalEntriesTable),
      Insight: new MockCollection(insightsTable),
      Activity: new MockCollection(activitiesTable),
      ActivityHistory: new MockCollection(activityHistoryTable),
      SafetyEvent: new MockCollection(safetyEventsTable),
      EmotionEvent: new MockCollection(emotionEventsTable),
    },
  },
};

// 2. Decide client based on DATABASE_URL
// If DATABASE_URL contains "localhost" or is blank, we use the local in-memory DB fallback.
const dbUrl = process.env.DATABASE_URL || "";
const useMockDb = dbUrl.includes("localhost") || !dbUrl || dbUrl.includes("placeholder");

let dbClient: any = mockDb;

if (!useMockDb) {
  try {
    const { db: prismaDb } = require("../../prisma/db");
    dbClient = prismaDb;
    console.log("DB Client: Connected to Supabase Remote PostgreSQL");
  } catch (error) {
    console.error("DB Client: Failed to load Prisma client. Falling back to local demo database.", error);
    dbClient = mockDb;
  }
} else {
  console.log("DB Client: Running in Local Demo Mode (In-memory Database)");
}

export const db = dbClient;
export const isDemoMode = useMockDb;
