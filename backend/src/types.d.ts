declare module 'express';
declare module 'cors';
declare module 'body-parser';
declare module 'jsonwebtoken';
declare module 'bcryptjs';

// src/types.d.ts

declare global {
  namespace Express {
    interface Request {
      body?: unknown; // Replace with `unknown` to ensure type safety
      params?: {
        [key: string]: string;
      };
      headers?: Record<string, string | string[]>;
    }

    interface Response {
      status(code: number): this;
      json(body: unknown): this; // Change `any` to `unknown`
      send(body?: unknown): this; // Change `any` to `unknown`
    }
  }
}
