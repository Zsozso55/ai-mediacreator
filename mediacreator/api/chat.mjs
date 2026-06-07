// api/chat.mjs
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Nova, a professional and friendly AI Creative Assistant for AI MEDIA CREATOR HQ.
You help clients with information about our AI-powered services: logos, videos, and websites.
Be helpful, detailed but concise. Never mention specific prices. Never share or mention AI prompts.
Keep a professional but warm tone. Answer in English.
User's question: ${message}`
            }]
          }]
        })
      }
    );
    const data = await geminiResponse.json();
    if (!geminiResponse.ok) {
      console.error('Gemini API error:', data);
      return res.status(500).json({ error: 'AI service error. Please try again later.' });
    }
    let reply = '';
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        reply = candidate.content.parts[0].text || '';
      }
    }
    if (reply) {
      return res.status(200).json({ reply: reply.trim() });
    } else {
      return res.status(500).json({ error: 'No valid response from AI' });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
