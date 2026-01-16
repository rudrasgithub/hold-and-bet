// next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";
import { Account as DefaultAccount } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    token?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      token: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface Account extends DefaultAccount {
    backendToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    authToken?: string;
  }
}
