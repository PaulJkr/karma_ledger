import { Request } from 'express';
export interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    [key: string]: any;
  };
}
