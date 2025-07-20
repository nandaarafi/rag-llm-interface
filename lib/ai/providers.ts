import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,

} from 'ai';
import { google } from "@ai-sdk/google"
import { openai } from "@ai-sdk/openai"
import { createOpenAI } from "@ai-sdk/openai"
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// OpenRouter provider configuration using OpenAI provider with custom baseURL
const openRouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': google('gemini-2.0-flash'),
        'chat-model-reasoning': wrapLanguageModel({
          model: google('gemini-2.0-flash'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': google('gemini-2.0-flash'),
        'artifact-model': google('gemini-2.0-flash'),
      },

    });
