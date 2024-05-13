// pages/api/assistant.ts
// This is the rewritten api page using the open ai assistant instead of the chat api.
//

import type { NextApiRequest, NextApiResponse } from 'next';
import * as OpenAIService from '../../services/OpenAIService'
import  authOptions  from '@/auth';
import { getServerSession } from 'next-auth';
import LokiUserThreadService from '@/services/LokiUserThreadService';
//import { getSession } from "next-auth/react"
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

  
  if (req.method === 'POST') {
    try {
      const assistantId = process.env.ASSISTANT_ID;
      //let response : OpenAIService.Message[] = [];
      const message = req.body.question;
      let threadId = req.body.threadId;
      let action = req.body.action;
      
      // Create a thread if it does not exist
      if (threadId === undefined || threadId === "") {
        threadId = await OpenAIService.createThread();
        // Save the threadId for the current user
        userThreadsService.addUserThread(userId, threadId, new Date().toISOString() + " - " + message); // TODO: Better title needed
      }
      
      if (assistantId != undefined) {
        
        if (action === 'sendMessage') {
          await sendMessage(message, threadId, assistantId, res);
        } else if (action === 'listMessages') {
          // Show the messages
          await listMessages(threadId, res);
        } else {
          console.error("Unknown action: ", action);
          res.status(500).json({ error: 'Internal Error. Received no answer from the AI Assistant.' });
          return
        }


      }
      else {
          console.error("ASSISTANT_ID must be set in environment")
      }
 
      // Check if the response has the expected data
    } catch (error) {
      console.error('Service call failed:', error);
      res.status(500).json({ error: 'Internal Error. Received no answer from the AI Assistant.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}

async function listMessages(threadId: any, res: NextApiResponse) {
  const messages = await OpenAIService.getThreadMessages(threadId, true);
  res.status(200).json(messages);
}

async function sendMessage(message: any, threadId: any, assistantId: string, res: NextApiResponse) {
  console.log(`Sending message <${message}> to thread with ID: ${threadId}`);
  await OpenAIService.sendMessage(threadId, assistantId, <OpenAIService.Message>{ role: 'user', content: message });

  // Show the messages
  const messages = await OpenAIService.getThreadMessages(threadId, false);

  if (messages.length > 0) {
    //response.push(messages[1]);
    res.status(200).json(messages[0]);
  } else {
    console.error("No answer from the OpenAI service");
    res.status(500).json({ error: 'Internal Error. Received no answer from the AI Assistant.' });
  }
}

