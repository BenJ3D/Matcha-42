import { Request, Response } from 'express';
import testService from '../services/testService';

export const getTest = (req: Request, res: Response) => {

  console.log("COUCOU");

  const message = testService.getTestMessage();
  res.json({ message });
};
