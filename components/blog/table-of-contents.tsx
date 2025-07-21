'use client'

import { useEffect, useState } from 'react'

interface Heading {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const extractedHeadings: Heading[] = []
    let match: RegExpExecArray | null

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const title = match[2].trim()
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      extractedHeadings.push({
        id,
        title,
        level
      })
    }

    setHeadings(extractedHeadings)
  }, [content])

  useEffect(() => {
    // Track which heading is currently visible
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting)
        
        if (visibleEntries.length > 0) {
          // Find the entry that's closest to the top of the viewport
          const topEntry = visibleEntries.reduce((closest, entry) => {
            const entryTop = entry.boundingClientRect.top
            const closestTop = closest.boundingClientRect.top
            return Math.abs(entryTop) < Math.abs(closestTop) ? entry : closest
          })
          
          setActiveId(topEntry.target.id)
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    )

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id)
        if (element) {
          observer.observe(element)
        }
      })
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [headings])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const headerHeight = 80 // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - headerHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="border rounded-lg p-4 bg-background/50 backdrop-blur-sm">
        <h3 className="font-semibold text-sm mb-3 text-foreground">
          Table of Contents
        </h3>
        <nav>
          <ul className="space-y-2">
            {headings.map(({ id, title, level }) => (
              <li key={id}>
                <button
                  onClick={() => scrollToHeading(id)}
                  className={`text-left w-full text-sm transition-colors hover:text-foreground ${
                    activeId === id
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                  style={{
                    paddingLeft: `${(level - 1) * 12}px`
                  }}
                >
                  {title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}