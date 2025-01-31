// src/types.d.ts

declare global {
  namespace Express {
    interface Request {
      body?: unknown; // Replace with `unknown` for type safety
      params?: {
        [key: string]: string;
      };
      headers?: Record<string, string | string[]>;
    }

    interface Response {
      status(code: number): this;
      json(body: unknown): this;
      send(body?: unknown): this;
    }
  }
}

export {}; // Ensure this file is treated as a module
