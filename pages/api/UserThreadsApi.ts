//

import type { NextApiRequest, NextApiResponse } from 'next';
import  authOptions  from '@/auth';
import { getServerSession } from 'next-auth';
import LokiUserThreadService from '@/services/LokiUserThreadService';
const userThreadsService = await (LokiUserThreadService.service())
      

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //const session = await getSession({ req: req })//getServerSession(authOptions);
  const session = await getServerSession(req, res, authOptions);
  let userId: string = "";  

  if (!session || !session.user || !session.user.email) {
    res.status(401).json({ message: 'You must be logged in to access this resource.' });
    return;
  } else {
    userId = session.user.email;
  }
  
  if (req.method === 'GET') {
    try {  
      const userThreads = userThreadsService.getUserThreads(userId);
      if (userThreads.length > 0) {
        res.status(200).json(userThreads);
      } else {
        res.status(200).json([]);
      }
    } catch (error) {
      console.error('Service call failed:', error);
      res.status(500).json({ error: 'Internal Error. Received no answer from the AI Assistant.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}
