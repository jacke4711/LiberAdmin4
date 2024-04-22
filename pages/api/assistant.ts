// pages/api/assistant.ts
// This is the rewritten api page using the open ai assistant instead of the chat api.
//

import type { NextApiRequest, NextApiResponse } from 'next';
import * as OpenAIService from '../../services/OpenAIService'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const assistantId = process.env.ASSISTANT_ID;
      const threadId = process.env.THREAD_ID;
      const response : string[] = [];
      const message = req.body.question;
      
      console.log(`Sending message <${message}> to thread with ID: ${threadId}`);
      // Add logic to remove a thread
      //console.log(thread);
      if (assistantId != undefined && threadId != undefined) { 
          await OpenAIService.sendMessage(threadId, assistantId, <OpenAIService.Message>{role: 'user', content: message});
          
          // Show the messages
          const messages = await OpenAIService.getThreadMessages(threadId, false);
  
          if(messages.length > 1) {
            //response.push(messages[1]);
            response.push(messages[0].content);
          }
          else {
              console.error("No answer from the OpenAI service")
          }
      }
      else {
          console.error("ASSISTANT_ID and THREAD_ID must be set in environment")
      }
 
      // Check if the response has the expected data
      if (response.length > 0) {
        res.status(200).json({ answer: response[0] });
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
