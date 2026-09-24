import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  throw new Error(
    'GOOGLE_API_KEY is not set. Please configure it in your environment.'
  );
}

export const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GOOGLE_API_KEY,
  model: 'gemini-embedding-2',
  // Must match the Pinecone index dimension
  outputDimensionality: 1024,
  maxRetries: 2,
  onFailedAttempt: (err) => {
    if (err?.response?.status === 429) {
      throw new Error('Rate limit exceeded');
    }
  },
});
