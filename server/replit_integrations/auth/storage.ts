import bcrypt from "bcrypt";
import { users, type User } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  verifyPassword(userId: string, plainPassword: string): Promise<boolean>;
  createUser(data: { email: string; password: string; firstName?: string; lastName?: string }): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async verifyPassword(userId: string, plainPassword: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user?.passwordHash) return false;
    return bcrypt.compare(plainPassword, user.passwordHash);
  }


  async createUser(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
