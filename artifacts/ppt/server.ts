import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from 'ai';
import { z } from 'zod';
import { myProvider } from '@/lib/ai/providers';
import { pptPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';

export const pptDocumentHandler = createDocumentHandler({
  kind: 'ppt',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: pptPrompt,
      prompt: title,
      schema: z.object({
        title: z.string(),
        slides: z.array(z.object({
          title: z.string(),
          content: z.array(z.string()),
          layout: z.enum(['title', 'content', 'two-column', 'image'])
        }))
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;

        if (object) {
          const content = JSON.stringify(object, null, 2);
          
          dataStream.writeData({
            type: 'ppt-delta',
            content: content,
          });

          draftContent = content;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'ppt'),
      prompt: description,
      schema: z.object({
        title: z.string(),
        slides: z.array(z.object({
          title: z.string(),
          content: z.array(z.string()),
          layout: z.enum(['title', 'content', 'two-column', 'image'])
        }))
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;

        if (object) {
          const content = JSON.stringify(object, null, 2);
          
          dataStream.writeData({
            type: 'ppt-delta',
            content: content,
          });

          draftContent = content;
        }
      }
    }

    return draftContent;
  },
});