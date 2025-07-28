// HTML presentation generator

interface TextFormat {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right';
  listType?: 'bullet' | 'numbered' | 'none';
}

interface Slide {
  id: string;
  title: string;
  content: string[];
  layout: 'title' | 'content' | 'two-column' | 'image';
  backgroundColor?: string;
  speakerNotes?: string;
  titlePosition?: { x: number; y: number; width: number; height: number };
  contentPositions?: { x: number; y: number; width: number; height: number }[];
  titleFormat?: TextFormat;
  contentFormats?: TextFormat[];
}

interface Presentation {
  title: string;
  slides: Slide[];
}

function formatTextStyle(format?: TextFormat): string {
  if (!format) return '';
  
  const styles: string[] = [];
  
  if (format.fontFamily) styles.push(`font-family: ${format.fontFamily}`);
  if (format.fontSize) styles.push(`font-size: ${format.fontSize}px`);
  if (format.bold) styles.push('font-weight: bold');
  if (format.italic) styles.push('font-style: italic');
  if (format.color) styles.push(`color: ${format.color}`);
  if (format.backgroundColor) styles.push(`background-color: ${format.backgroundColor}`);
  if (format.alignment) styles.push(`text-align: ${format.alignment}`);
  
  const decorations: string[] = [];
  if (format.underline) decorations.push('underline');
  if (format.strikethrough) decorations.push('line-through');
  if (decorations.length > 0) {
    styles.push(`text-decoration: ${decorations.join(' ')}`);
  }
  
  return styles.join('; ');
}

function generateSlideHTML(slide: Slide, slideIndex: number): string {
  const slideStyle = slide.backgroundColor ? `background-color: ${slide.backgroundColor}` : '';
  
  let contentHTML = '';
  
  if (slide.layout === 'two-column') {
    const midPoint = Math.ceil(slide.content.length / 2);
    const leftContent = slide.content.slice(0, midPoint);
    const rightContent = slide.content.slice(midPoint);
    
    contentHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; height: 100%;">
        <div>
          ${leftContent.map((item, index) => {
            const format = slide.contentFormats?.[index];
            const listType = format?.listType || 'bullet';
            const prefix = listType === 'numbered' ? `${index + 1}.` : listType === 'bullet' ? '•' : '';
            const style = formatTextStyle(format);
            return `<p style="margin: 1rem 0; ${style}">${prefix ? `${prefix} ` : ''}${item}</p>`;
          }).join('')}
        </div>
        <div>
          ${rightContent.map((item, index) => {
            const actualIndex = midPoint + index;
            const format = slide.contentFormats?.[actualIndex];
            const listType = format?.listType || 'bullet';
            const prefix = listType === 'numbered' ? `${actualIndex + 1}.` : listType === 'bullet' ? '•' : '';
            const style = formatTextStyle(format);
            return `<p style="margin: 1rem 0; ${style}">${prefix ? `${prefix} ` : ''}${item}</p>`;
          }).join('')}
        </div>
      </div>
    `;
  } else {
    contentHTML = slide.content.map((item, index) => {
      const format = slide.contentFormats?.[index];
      const listType = format?.listType || 'bullet';
      const prefix = listType === 'numbered' ? `${index + 1}.` : listType === 'bullet' ? '•' : '';
      const style = formatTextStyle(format);
      return `<p style="margin: 1rem 0; ${style}">${prefix ? `${prefix} ` : ''}${item}</p>`;
    }).join('');
  }
  
  const titleStyle = formatTextStyle(slide.titleFormat);
  
  return `
    <div class="slide" style="
      width: 100vw; 
      height: 100vh; 
      padding: 3rem; 
      display: flex; 
      flex-direction: column; 
      justify-content: center;
      page-break-after: always;
      ${slideStyle}
    ">
      <h1 style="
        font-size: 3rem; 
        font-weight: bold; 
        text-align: center; 
        margin-bottom: 2rem;
        ${titleStyle}
      ">${slide.title}</h1>
      
      <div style="
        flex: 1; 
        display: flex; 
        flex-direction: column; 
        justify-content: center;
        font-size: 1.5rem;
        line-height: 1.6;
      ">
        ${contentHTML}
      </div>
      
      ${slide.speakerNotes ? `
        <div style="
          position: fixed; 
          bottom: 1rem; 
          right: 1rem; 
          background: rgba(0,0,0,0.1); 
          padding: 0.5rem; 
          border-radius: 0.5rem;
          font-size: 0.8rem;
          max-width: 300px;
        ">
          <strong>Notes:</strong> ${slide.speakerNotes}
        </div>
      ` : ''}
    </div>
  `;
}

export function generatePresentationHTML(presentationData: string): string {
  let presentation: Presentation;
  
  try {
    presentation = JSON.parse(presentationData);
  } catch (error) {
    throw new Error('Invalid presentation data format');
  }
  
  const slidesHTML = presentation.slides.map((slide, index) => 
    generateSlideHTML(slide, index)
  ).join('');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentation.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      background: #f5f5f5;
      color: #333;
      overflow-x: hidden;
    }
    
    .presentation-container {
      scroll-snap-type: y mandatory;
      overflow-y: scroll;
      height: 100vh;
    }
    
    .slide {
      scroll-snap-align: start;
      background: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: relative;
    }
    
    .navigation {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 1rem;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.9);
      padding: 1rem;
      border-radius: 2rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .nav-button {
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    
    .nav-button:hover {
      background: #2563eb;
    }
    
    .nav-button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
    
    .slide-counter {
      display: flex;
      align-items: center;
      font-size: 0.9rem;
      color: #6b7280;
      padding: 0 1rem;
    }
    
    @media print {
      .navigation {
        display: none;
      }
      
      .slide {
        page-break-after: always;
        width: 210mm;
        height: 297mm;
        box-shadow: none;
      }
    }
    
    /* Fullscreen presentation mode */
    .fullscreen-mode .slide {
      width: 100vw;
      height: 100vh;
    }
    
    /* Keyboard navigation styles */
    .slide.current {
      border: 3px solid #3b82f6;
    }
  </style>
</head>
<body>
  <div class="presentation-container" id="presentationContainer">
    ${slidesHTML}
  </div>
  
  <div class="navigation">
    <button class="nav-button" onclick="previousSlide()" id="prevBtn">Previous</button>
    <div class="slide-counter">
      <span id="currentSlide">1</span> / <span id="totalSlides">${presentation.slides.length}</span>
    </div>
    <button class="nav-button" onclick="nextSlide()" id="nextBtn">Next</button>
    <button class="nav-button" onclick="toggleFullscreen()">Fullscreen</button>
    <button class="nav-button" onclick="window.print()">Print</button>
  </div>

  <script>
    let currentSlideIndex = 0;
    const totalSlides = ${presentation.slides.length};
    const slides = document.querySelectorAll('.slide');
    
    function updateSlideDisplay() {
      document.getElementById('currentSlide').textContent = currentSlideIndex + 1;
      document.getElementById('prevBtn').disabled = currentSlideIndex === 0;
      document.getElementById('nextBtn').disabled = currentSlideIndex === totalSlides - 1;
      
      // Scroll to current slide
      slides[currentSlideIndex].scrollIntoView({ behavior: 'smooth' });
    }
    
    function nextSlide() {
      if (currentSlideIndex < totalSlides - 1) {
        currentSlideIndex++;
        updateSlideDisplay();
      }
    }
    
    function previousSlide() {
      if (currentSlideIndex > 0) {
        currentSlideIndex--;
        updateSlideDisplay();
      }
    }
    
    function toggleFullscreen() {
      const elem = document.documentElement;
      if (document.fullscreenElement) {
        document.exitFullscreen();
        document.body.classList.remove('fullscreen-mode');
      } else {
        elem.requestFullscreen();
        document.body.classList.add('fullscreen-mode');
      }
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      switch(e.key) {
        case 'ArrowRight':
        case ' ':
          nextSlide();
          e.preventDefault();
          break;
        case 'ArrowLeft':
          previousSlide();
          e.preventDefault();
          break;
        case 'f':
        case 'F11':
          toggleFullscreen();
          e.preventDefault();
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
            document.body.classList.remove('fullscreen-mode');
          }
          break;
      }
    });
    
    // Initialize
    updateSlideDisplay();
    
    // Handle scroll-based slide detection
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const slideIndex = Array.from(slides).indexOf(entry.target);
          if (slideIndex !== -1) {
            currentSlideIndex = slideIndex;
            updateSlideDisplay();
          }
        }
      });
    }, { threshold: 0.5 });
    
    slides.forEach(slide => observer.observe(slide));
  </script>
</body>
</html>
  `.trim();
}

export function downloadHTML(htmlContent: string, filename = 'presentation.html') {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}