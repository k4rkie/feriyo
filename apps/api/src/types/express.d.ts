export {};

declare module "express" {
  interface Request {
    user?: {
      userId: string;
    };
  }
}

