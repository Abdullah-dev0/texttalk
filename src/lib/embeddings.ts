import { MistralAIEmbeddings } from '@langchain/mistralai';

// 1: vectorize message with optimized settings
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
if (!MISTRAL_API_KEY) {
  throw new Error(
    'MISTRAL_API_KEY is not set. Please configure it in your environment.'
  );
}

export const embeddings = new MistralAIEmbeddings({
  apiKey: MISTRAL_API_KEY,
  model: 'mistral-embed',
  maxRetries: 2,
  onFailedAttempt: (err) => {
    if (err.response?.status === 429) {
      throw new Error('Rate limit exceeded');
    }
  },
});
