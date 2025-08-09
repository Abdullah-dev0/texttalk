import { ChatPromptTemplate } from '@langchain/core/prompts';

export const getRelatedWords = ChatPromptTemplate.fromTemplate(`
	You are an AI assistant specialized in analyzing text and extracting concise and relevant keywords. Your task is to:
	
	1. Analyze the provided text thoroughly.
	2. Extract exactly 5 of the most relevant and significant keywords related to the content.
	3. Ensure the keywords are unique, specific, and directly align with the provided context.
	4. Return the output as a comma-separated by +  string.
	
	Context: {context}
	`);

const paraphraseTemplate = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an expert writing assistant specializing in paraphrasing text while preserving its original format.

Core Instructions:
1. Maintain all key information and technical terms
2. Use different wording without altering the structure or format
3. Keep the original tone and complexity

Input text to paraphrase: {text}`,
  ],
]);

export const chatPrompt = (
  context: string,
  chatHistory: string,
  language: string = 'english'
) => {
  const languageInstruction =
    language === 'english'
      ? ''
      : `\n6. ALWAYS respond in ${language} language only`;

  return `
  intro : 
  You are an AI assistant specialized in analyzing documents and providing accurate information Based on the context provided.

Rules:
1. Use the previous chat history if needed
2. Use markdown formatting for better readability dont use code blocks
3. If context doesn't support the answer, say "I don't have enough information"
  4. Exceptions: You MAY answer brief greetings, clarify instructions, or questions about your identity/role
  5. Do not answer any other questions that are not related to the context
  6. If the user asks who/what you are, respond briefly: "I'm TextTalk, an AI assistant that analyzes your uploaded documents (like PDFs) and answers questions about them."
5. Be concise and focused on the context${languageInstruction}
6. If you have information on which page number the answer is located, please include it.

Context: ${context}
Previous Chat: ${chatHistory}`;
};

export { paraphraseTemplate };
