// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    token?: string;  // Add token to the User type
  }

  interface Session {
    user: User;  // Ensure token is part of the user object
  }

  interface JWT {
    authToken?: string; // Add token to the JWT type
  }
}
