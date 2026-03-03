import type { JwtUser } from './jwt-user';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtUser;
  }
}
