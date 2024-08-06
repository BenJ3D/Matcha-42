import { Request, Response } from 'express';
import anotherService from '../services/anotherService';

export const getAnother = (req: Request, res: Response) => {
  const message = anotherService.getAnotherMessage();
  res.json({ message });
};
