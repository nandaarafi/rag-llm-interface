'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Components } from 'react-markdown'

interface MarkdownWithHeadingsProps {
  content: string
}

// Custom heading components that add IDs for navigation
const createHeadingComponent = (level: number) => {
  const HeadingComponent: Components['h1'] = ({ children, ...props }) => {
    const text = typeof children === 'string' ? children : 
      Array.isArray(children) ? children.join('') :
      children?.toString() || ''
    
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

    return (
      <Tag id={id} {...(props as any)}>
        {children}
      </Tag>
    )
  }

  HeadingComponent.displayName = `Heading${level}`
  return HeadingComponent
}

const components: Components = {
  h1: createHeadingComponent(1),
  h2: createHeadingComponent(2),
  h3: createHeadingComponent(3),
  h4: createHeadingComponent(4),
  h5: createHeadingComponent(5),
  h6: createHeadingComponent(6),
}

export function MarkdownWithHeadings({ content }: MarkdownWithHeadingsProps) {
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}