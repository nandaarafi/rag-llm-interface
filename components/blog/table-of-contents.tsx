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
    let match

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
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-100px 0px -80% 0px',
        threshold: 0
      }
    )

    // Observe all heading elements
    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [headings])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

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