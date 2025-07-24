import pptxgen from 'pptxgenjs';

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
  let presentation: Presentation;
  
  try {
    presentation = JSON.parse(presentationData);
  } catch (error) {
    throw new Error('Invalid presentation data format');
  }

  const pres = new pptxgen();
  
  // Set presentation properties
  pres.title = presentation.title || 'Untitled Presentation';
  pres.subject = 'Generated with PptxGenJS';
  pres.author = 'AI Assistant';

  // Process each slide
  presentation.slides.forEach((slideData) => {
    const slide = pres.addSlide();

    // Set slide background if specified
    if (slideData.backgroundColor) {
      slide.background = { color: slideData.backgroundColor };
    }

    switch (slideData.layout) {
      case 'title':
        generateTitleSlide(slide, slideData);
        break;
      case 'two-column':
        generateTwoColumnSlide(slide, slideData);
        break;
      case 'image':
        generateImageSlide(slide, slideData);
        break;
      case 'content':
      default:
        generateContentSlide(slide, slideData);
        break;
    }

    // Add speaker notes if available
    if (slideData.speakerNotes) {
      slide.addNotes(slideData.speakerNotes);
    }
  });

  // Generate the PPTX file as a blob
  const pptxBlob = await pres.write({ outputType: 'blob' });
  return pptxBlob as Blob;
}

function generateTitleSlide(slide: any, slideData: Slide) {
  // Main title
  slide.addText(slideData.title, {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1.5,
    fontSize: 44,
    fontFace: 'Arial',
    bold: true,
    align: 'center',
    color: '363636'
  });

  // Subtitle/content
  if (slideData.content.length > 0) {
    slide.addText(slideData.content.join('\n'), {
      x: 0.5,
      y: 4.5,
      w: 9,
      h: 1,
      fontSize: 24,
      fontFace: 'Arial',
      align: 'center',
      color: '666666'
    });
  }
}

function generateContentSlide(slide: any, slideData: Slide) {
  // Title
  slide.addText(slideData.title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 1,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: '363636'
  });

  // Content as bullet points
  const bulletPoints = slideData.content.map(item => ({
    text: item,
    options: { bullet: true, fontSize: 18, fontFace: 'Arial', color: '444444' }
  }));

  if (bulletPoints.length > 0) {
    slide.addText(bulletPoints, {
      x: 0.5,
      y: 1.8,
      w: 9,
      h: 5,
      fontSize: 18,
      fontFace: 'Arial'
    });
  }
}

function generateTwoColumnSlide(slide: any, slideData: Slide) {
  // Title
  slide.addText(slideData.title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 1,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: '363636'
  });

  const midpoint = Math.ceil(slideData.content.length / 2);
  const leftContent = slideData.content.slice(0, midpoint);
  const rightContent = slideData.content.slice(midpoint);

  // Left column
  if (leftContent.length > 0) {
    const leftBullets = leftContent.map(item => ({
      text: item,
      options: { bullet: true, fontSize: 16, fontFace: 'Arial', color: '444444' }
    }));

    slide.addText(leftBullets, {
      x: 0.5,
      y: 1.8,
      w: 4.25,
      h: 5,
      fontSize: 16,
      fontFace: 'Arial'
    });
  }

  // Right column
  if (rightContent.length > 0) {
    const rightBullets = rightContent.map(item => ({
      text: item,
      options: { bullet: true, fontSize: 16, fontFace: 'Arial', color: '444444' }
    }));

    slide.addText(rightBullets, {
      x: 5.25,
      y: 1.8,
      w: 4.25,
      h: 5,
      fontSize: 16,
      fontFace: 'Arial'
    });
  }
}

function generateImageSlide(slide: any, slideData: Slide) {
  // Title
  slide.addText(slideData.title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 1,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: '363636'
  });

  // Placeholder for image (since we don't have actual images in the JSON)
  slide.addShape('rect', {
    x: 2,
    y: 2,
    w: 6,
    h: 4,
    fill: { color: 'F0F0F0' },
    line: { color: 'CCCCCC', width: 1 }
  });

  slide.addText('Image Placeholder', {
    x: 2,
    y: 3.8,
    w: 6,
    h: 0.4,
    align: 'center',
    fontSize: 14,
    fontFace: 'Arial',
    color: '888888'
  });

  // Content below image
  if (slideData.content.length > 0) {
    slide.addText(slideData.content.join('\n'), {
      x: 0.5,
      y: 6.5,
      w: 9,
      h: 1,
      fontSize: 14,
      fontFace: 'Arial',
      align: 'center',
      color: '666666'
    });
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