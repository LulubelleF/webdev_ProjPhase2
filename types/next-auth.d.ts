import { DefaultSession } from "next-auth";
import { RoleLevel } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userId: string;
      username: string;
      role: RoleLevel;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    userId: string;
    username: string;
    role: RoleLevel;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userId: string;
    username: string;
    role: RoleLevel;
  }
}