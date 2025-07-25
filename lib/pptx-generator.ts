// Client-side PPT generation using server API

interface Slide {
  id: string;
  title: string;
  content: string[];
  layout: 'title' | 'content' | 'two-column' | 'image';
  backgroundColor?: string;
  speakerNotes?: string;
}

interface Presentation {
  title: string;
  slides: Slide[];
}

export async function generatePPTX(presentationData: string): Promise<Blob> {
  try {
    // Validate presentation data
    let presentation: Presentation;
    try {
      presentation = JSON.parse(presentationData);
    } catch (error) {
      throw new Error('Invalid presentation data format');
    }

    // Call server-side API to generate PPTX
    const response = await fetch('/api/generate-pptx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ presentationData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    // Return the blob from the response
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Failed to generate PPTX:', error);
    throw error;
  }
}

export function downloadPPTX(blob: Blob, filename = 'presentation.pptx') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}