declare global {
  namespace Express {
    interface Request {
      body?: string | Buffer;
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

export {};
