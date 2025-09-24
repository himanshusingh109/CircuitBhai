import type React from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Simple markdown parser for basic formatting
  const parseMarkdown = (text: string) => {
    // Split by lines to handle numbered lists and paragraphs
    const lines = text.split("\n")
    const elements: React.ReactNode[] = []

    lines.forEach((line, index) => {
      if (line.trim() === "") {
        elements.push(<br key={`br-${index}`} />)
        return
      }

      // Handle numbered lists (e.g., "1. **Backup your data:**")
      const numberedListMatch = line.match(/^(\d+)\.\s*(.*)$/)
      if (numberedListMatch) {
        const [, number, content] = numberedListMatch
        elements.push(
          <div key={index} className="mb-2">
            <span className="font-semibold text-primary">{number}. </span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
          </div>,
        )
        return
      }

      // Handle bullet points (e.g., "• iPhone 14 Pro")
      const bulletMatch = line.match(/^[•·]\s*(.*)$/)
      if (bulletMatch) {
        elements.push(
          <div key={index} className="mb-1 ml-4">
            <span className="text-accent mr-2">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(bulletMatch[1]) }} />
          </div>,
        )
        return
      }

      // Regular line
      elements.push(
        <div key={index} className="mb-1">
          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
        </div>,
      )
    })

    return elements
  }

  // Format inline markdown (bold, etc.)
  const formatInlineMarkdown = (text: string) => {
    return (
      text
        // Bold text: **text** -> <strong>text</strong>
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
        // Italic text: *text* -> <em>text</em>
        .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
        // Code: `text` -> <code>text</code>
        .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    )
  }

  return <div className={`text-sm leading-relaxed ${className}`}>{parseMarkdown(content)}</div>
}
