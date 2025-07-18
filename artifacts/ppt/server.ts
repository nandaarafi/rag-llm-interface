import { createDocumentHandler } from '@/lib/artifacts/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';

interface Slide {
  title: string;
  content: string[];
  layout: 'title' | 'content' | 'two-column' | 'image';
}

interface Presentation {
  title: string;
  slides: Slide[];
}

export const pptDocumentHandler = createDocumentHandler({
  kind: 'ppt',
  onCreateDocument: async ({ title, dataStream }) => {
    dataStream.writeData({ type: 'status', content: 'Generating presentation...' });

    const { object: presentation } = await generateObject({
      model: openai('gpt-4o-mini'),
      system: `You are an expert presentation designer. Create engaging, well-structured presentations.

Rules for presentations:
1. Create 4-8 slides maximum for the topic
2. Each slide should have a clear title and 2-5 bullet points
3. Use appropriate layouts: 'title' for title slides, 'content' for standard content, 'two-column' for comparisons
4. Keep content concise and impactful
5. Include a title slide and conclusion slide when appropriate`,
      prompt: `Create a presentation about: ${title}

The presentation should be informative, engaging, and well-structured. Each slide should have meaningful content that builds toward understanding the topic.`,
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          slides: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: {
                  type: 'array',
                  items: { type: 'string' }
                },
                layout: {
                  type: 'string',
                  enum: ['title', 'content', 'two-column', 'image']
                }
              },
              required: ['title', 'content', 'layout']
            }
          }
        },
        required: ['title', 'slides']
      }
    });

    const content = JSON.stringify(presentation, null, 2);

    dataStream.writeData({
      type: 'ppt-delta',
      content: content,
    });

    return content;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    dataStream.writeData({ type: 'status', content: 'Updating presentation...' });

    let currentPresentation: Presentation;
    try {
      currentPresentation = JSON.parse(document.content || '{}');
    } catch {
      currentPresentation = {
        title: document.title,
        slides: []
      };
    }

    const { object: updatedPresentation } = await generateObject({
      model: openai('gpt-4o-mini'),
      system: `You are an expert presentation designer. Update the existing presentation based on the user's request.

Rules for presentations:
1. Maintain the overall structure unless specifically asked to change it
2. Keep slide count reasonable (4-8 slides)
3. Each slide should have a clear title and 2-5 bullet points
4. Use appropriate layouts: 'title' for title slides, 'content' for standard content, 'two-column' for comparisons
5. Keep content concise and impactful`,
      prompt: `Current presentation:
${JSON.stringify(currentPresentation, null, 2)}

User request: ${description}

Update the presentation according to the user's request while maintaining quality and structure.`,
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          slides: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: {
                  type: 'array',
                  items: { type: 'string' }
                },
                layout: {
                  type: 'string',
                  enum: ['title', 'content', 'two-column', 'image']
                }
              },
              required: ['title', 'content', 'layout']
            }
          }
        },
        required: ['title', 'slides']
      }
    });

    const content = JSON.stringify(updatedPresentation, null, 2);

    dataStream.writeData({
      type: 'ppt-delta',
      content: content,
    });

    return content;
  },
});