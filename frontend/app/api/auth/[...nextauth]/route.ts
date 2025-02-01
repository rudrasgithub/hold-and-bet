import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';
import crypto from 'crypto';

const generateRandomPassword = (length: number): string => {
  return crypto.randomBytes(length).toString('hex');
};
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      console.log(user);
      try {
        const randomPassword = generateRandomPassword(8);

        const response = await axios.post(`${BACKEND_URL}/register`, {
          email: user.email,
          password: randomPassword,
          name: user.name,
          image: user.image,
        });

        const { usertoken } = response.data;

        user.token = usertoken;

        return true;
      } catch (error) {
        console.error('Error signing in:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user && user.token) {
        token.authToken = user.token;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.authToken) {
        session.user.token = token.authToken as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
