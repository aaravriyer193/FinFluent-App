const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

interface AIContext {
  userName: string;
  spendableCoins: number;
  currentTitle: string;
  aiMemory: Record<string, any>; // The JSONB context summary from DB
  moduleProgress: string; // E.g., "Currently stuck on Module 3: Budgeting"
}

export const generateAIResponse = async (
  userMessage: string, 
  context: AIContext | null,
  chatHistory: { role: 'system' | 'user' | 'assistant', content: string }[] = [],
  onChunk: (accumulatedText: string) => void // Callback to update UI in real-time
) => {
  // 1. The Dynamic System Prompt
  const systemPrompt = `You are the Finfluent AI Assistant. You are a mature, gamified financial tutor.
  Keep answers concise, actionable, and encouraging.
  
  CURRENT USER DATA:
  - Name: ${context?.userName || 'New User'}
  - Wealth (FinCoins): ${context?.spendableCoins || 0}
  - Title: ${context?.currentTitle || 'Financial Novice'}
  - Progress: ${context?.moduleProgress || 'Just starting out.'}
  - AI Notes on User: ${JSON.stringify(context?.ai_context_summary|| {})}
  
  Do not break character. If they ask about things outside of finance or the app, gently redirect them.`;

  // 2. Build the exact payload for OpenRouter
  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://finfluent.app', 
        'X-Title': 'Finfluent', 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'xiaomi/mimo-v2-flash', 
        messages: messages,
        temperature: 0.7,
        stream: true, // CRITICAL: Tells OpenRouter to stream tokens
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 3. Process the Data Stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedText = '';

    if (!reader) throw new Error('No stream available from OpenRouter');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the raw bytes into text
      const chunk = decoder.decode(value, { stream: true });
      
      // OpenRouter sends Server-Sent Events (SSE). They look like: "data: { ...JSON... }\n\n"
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '');
          
          // The API sends "[DONE]" when the stream is finished
          if (dataStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(dataStr);
            const token = parsed.choices[0]?.delta?.content;
            
            if (token) {
              accumulatedText += token;
              // Pass the growing text back to React so it can type it out on screen!
              onChunk(accumulatedText);
            }
          } catch (e) {
            console.warn('Error parsing stream token', e);
          }
        }
      }
    }

    // Return the final string just in case the component needs to save it to the DB
    return accumulatedText; 

  } catch (error) {
    console.error('OpenRouter API Error:', error);
    const errorMessage = "I'm having trouble connecting right now. Let's try again in a moment!";
    onChunk(errorMessage);
    return errorMessage;
  }
};