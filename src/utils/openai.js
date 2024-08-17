const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const IMAGE_API_ENDPOINT = 'https://api.openai.com/v1/images/generations';

export async function callOpenAI(prompt, type = 'text', model = 'gpt-3.5-turbo') {
  const apiKey = localStorage.getItem('openaiApiKey');
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set it in the settings.');
  }

  try {
    if (type === 'image') {
      const response = await fetch(IMAGE_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 1,
          size: "256x256",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.data[0].url;
    } else {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}