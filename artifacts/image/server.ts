import { createDocumentHandler } from '@/lib/artifacts/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    try {
      console.log('Generating image for prompt:', title);
      
      // Generate image using Gemini 2.0 Flash Exp
      const result = await generateText({
        model: google('gemini-2.0-flash-exp'),
        providerOptions: {
          google: { responseModalities: ['TEXT', 'IMAGE'] },
        },
        prompt: `Generate an image of: ${title}`,
      });

      console.log('Gemini response received');
      
      // Check if any images were generated
      if (result.files && result.files.length > 0) {
        const imageFiles = result.files.filter(file => {
          return file.mimeType?.startsWith('image/') ||
                 !file.mimeType;
        });
        
        if (imageFiles.length > 0) {
          const imageFile = imageFiles[0];
          
          // Get base64 data
          let base64Data = imageFile.base64Data || imageFile.data || imageFile.content;
          
          if (base64Data) {
            // Clean up base64 data if it includes data URL prefix
            if (base64Data.includes(',')) {
              base64Data = base64Data.split(',')[1];
            }
            
            const mediaType = imageFile.mimeType || 'image/png';
            
            // Convert base64 to File object for UploadThing
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `ai-generated-${Date.now()}.png`;
            const file = new File([buffer], fileName, { type: mediaType });
            
            // Upload to UploadThing
            const uploadResponse = await utapi.uploadFiles(file);
            
            if (uploadResponse.data) {
              const imageUrl = uploadResponse.data.url;
              console.log('Image uploaded to UploadThing:', imageUrl);
              
              draftContent = imageUrl;
              
              dataStream.writeData({
                type: 'image-delta',
                content: imageUrl,
              });
              
            } else {
              throw new Error('UploadThing upload failed');
            }
          } else {
            throw new Error('No base64 data in generated image');
          }
        } else {
          throw new Error('No image files in response');
        }
      } else {
        throw new Error('No files in Gemini response');
      }
      
    } catch (error) {
      console.error('Image generation or upload failed:', error);
      
      // Return a fallback placeholder URL
      const placeholderUrl = 'https://via.placeholder.com/512x512/cccccc/666666?text=Image+Generation+Failed';
      draftContent = placeholderUrl;
      
      dataStream.writeData({
        type: 'image-delta',
        content: placeholderUrl,
      });
    }

    return draftContent;
  },
  onUpdateDocument: async ({ description, dataStream }) => {
    let draftContent = '';

    try {
      console.log('Updating image for description:', description);
      
      // Generate updated image using Gemini 2.0 Flash Exp
      const result = await generateText({
        model: google('gemini-2.0-flash-exp'),
        providerOptions: {
          google: { responseModalities: ['TEXT', 'IMAGE'] },
        },
        prompt: `Generate an image of: ${description}`,
      });

      console.log('Gemini update response received');
      
      // Check if any images were generated
      if (result.files && result.files.length > 0) {
        const imageFiles = result.files.filter(file => {
          return file.mimeType?.startsWith('image/') ||
                 !file.mimeType;
        });
        
        if (imageFiles.length > 0) {
          const imageFile = imageFiles[0];
          
          // Get base64 data
          let base64Data = imageFile.base64Data || imageFile.data || imageFile.content;
          
          if (base64Data) {
            // Clean up base64 data if it includes data URL prefix
            if (base64Data.includes(',')) {
              base64Data = base64Data.split(',')[1];
            }
            
            const mediaType = imageFile.mimeType || 'image/png';
            
            // Convert base64 to File object for UploadThing
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `ai-updated-${Date.now()}.png`;
            const file = new File([buffer], fileName, { type: mediaType });
            
            // Upload to UploadThing
            const uploadResponse = await utapi.uploadFiles(file);
            
            if (uploadResponse.data) {
              const imageUrl = uploadResponse.data.url;
              console.log('Updated image uploaded to UploadThing:', imageUrl);
              
              draftContent = imageUrl;
              
              dataStream.writeData({
                type: 'image-delta',
                content: imageUrl,
              });
              
            } else {
              throw new Error('UploadThing upload failed');
            }
          } else {
            throw new Error('No base64 data in generated image');
          }
        } else {
          throw new Error('No image files in response');
        }
      } else {
        throw new Error('No files in Gemini response');
      }
      
    } catch (error) {
      console.error('Image update or upload failed:', error);
      
      // Return a fallback placeholder URL
      const placeholderUrl = 'https://via.placeholder.com/512x512/cccccc/666666?text=Image+Update+Failed';
      draftContent = placeholderUrl;
      
      dataStream.writeData({
        type: 'image-delta',
        content: placeholderUrl,
      });
    }

    return draftContent;
  },
});
