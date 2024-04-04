// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { question } = req.body;
      const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // Make sure this matches the model you're intending to use
          prompt: question,
          max_tokens: 150,
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      const openAIData = await openAIResponse.json();

      // Check if the response has the expected data
      if (openAIData.choices && openAIData.choices.length > 0 && openAIData.choices[0].text) {
        res.status(200).json({ answer: openAIData.choices[0].text.trim() });
      } else {
        // Log for debugging
        console.error('Unexpected response structure:', openAIData);
        res.status(500).json({ error: 'Received an unexpected response structure from the API.' });
      }
    } catch (error) {
      console.error('API call failed:', error);
      res.status(500).json({ error: 'Failed to fetch response from OpenAI' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}
