import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
import crypto from 'crypto';

const generateRandomPassword = (length: number): string => {
  return crypto.randomBytes(length).toString('hex');
};
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      console.log('SignIn callback triggered for user:', user.email);
      try {
        const randomPassword = generateRandomPassword(8);
        console.log('Calling backend register API:', `${BACKEND_URL}/register`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${BACKEND_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            password: randomPassword,
            name: user.name,
            image: user.image,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log('Response status:', response.status);
        console.log('Response content-type:', response.headers.get('content-type'));

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          let errorData;
          
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            const text = await response.text();
            console.error('Non-JSON response:', text.substring(0, 200));
            throw new Error(`Backend returned non-JSON response: ${response.status}`);
          }
          
          console.error('Backend error:', errorData);
          throw new Error(errorData.error || 'Registration failed');
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Expected JSON but got:', text.substring(0, 200));
          throw new Error('Backend returned non-JSON response');
        }

        const data = await response.json();
        console.log('Backend response:', data);
        const { usertoken } = data;

        // Store token on user object
        user.token = usertoken;
        
        // Also store on account for backup
        if (account) {
          account.backendToken = usertoken;
        }

        return true;
      } catch (error: unknown) {
        const err = error as Error;
        console.error('Error signing in:', err.message || error);
        console.error('Full error:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // On initial sign-in, user and account will be available
      if (user?.token) {
        token.authToken = user.token;
        console.log('JWT: Token set from user.token');
      } else if (account?.backendToken) {
        token.authToken = account.backendToken as string;
        console.log('JWT: Token set from account.backendToken');
      }
      return token;
    },

    async session({ session, token }) {
      if (token.authToken) {
        session.user.id = token.sub as string;
        session.user.token = token.authToken as string;
        console.log('Session: Token attached to session.user.token');
      } else {
        console.log('Session: No authToken in JWT token');
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
