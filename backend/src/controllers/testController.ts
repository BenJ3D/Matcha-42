import { Request, Response } from 'express';
import testService from '../services/testService';

export const getTest = (req: Request, res: Response) => {
  const message = testService.getTestMessage();
  res.json({ message });
};
