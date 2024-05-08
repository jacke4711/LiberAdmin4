// pages/api/assistant.ts
// This is the rewritten api page using the open ai assistant instead of the chat api.
//

import type { NextApiRequest, NextApiResponse } from 'next';
import * as OpenAIService from '../../services/OpenAIService'
import  authOptions  from '@/auth';
import { getServerSession } from 'next-auth';
import LokiUserThreadService from '@/services/LokiUserThreadService';
//import { getSession } from "next-auth/react"

const lokiUserThreadService = new LokiUserThreadService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //const session = await getSession({ req: req })//getServerSession(authOptions);
  const session = await getServerSession(req, res, authOptions);
  

  if (!session || session.user === null || session.user?.email === null) {
    //redirect('/api/auth/signin?callbackUrl=/protected');
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Must be logged in to use the assistant`);
    return;
  }
  
  if (req.method === 'POST') {
    try {
      const assistantId = process.env.ASSISTANT_ID;
      const response : OpenAIService.Message[] = [];
      const message = req.body.question;
      let threadId = req.body.threadId;
      
      console.log(`Sending message <${message}> to thread with ID: ${threadId}`);
      // Create a thread if it does not exist
      if (threadId === undefined || threadId === "") {
        threadId = await OpenAIService.createThread();
        // Save the threadId for the current user
        let userId = session?.user?.email ? session?.user?.email : ""; // Checked above so should be safe, but still need to check  
        lokiUserThreadService.addUserThread(userId, threadId, new Date().toISOString() + " - " + message); // TODO: Better title needed
      }

      if (assistantId != undefined) { 
          await OpenAIService.sendMessage(threadId, assistantId, <OpenAIService.Message>{role: 'user', content: message});
          
          // Show the messages
          const messages = await OpenAIService.getThreadMessages(threadId, false);
  
          if(messages.length > 1) {
            //response.push(messages[1]);
            response.push(messages[0]);
          }
          else {
              console.error("No answer from the OpenAI service")
          }
      }
      else {
          console.error("ASSISTANT_ID must be set in environment")
      }
 
      // Check if the response has the expected data
      if (response.length > 0) {
        res.status(200).json(response[0]);
      } else {
        res.status(500).json({ error: 'Internal Error. Received no answer from the AI Assistant.' });
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
