import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    password?: string;
    token?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      password?: string;
      token?: string;
    };
  }

  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    picture?: string | null;
    password?: string;
    token?: string;
  }
}
