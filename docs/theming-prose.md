# Editor Prose Elements & Dark Mode Styling

This document details the typography, elements, code blocks, tables, and placeholder theming inside the `.tiptap` editor canvas.

---

## 1. Editor Prose Elements & Dark Mode

All internal document elements rendered by ProseMirror must utilize semantic CSS classes:

```css
/* Tiptap content styling in app/globals.css or scoped editor classes */
.tiptap {
  /* Selection Highlight */
  & ::selection {
    background-color: var(--primary);
    color: var(--primary-foreground);
    opacity: 0.2;
  }

  /* Headings & Text */
  & h1,
  & h2,
  & h3,
  & h4,
  & h5,
  & h6 {
    color: var(--card-foreground);
    font-weight: 700;
  }

  & p {
    color: var(--card-foreground);
  }

  /* Hyperlinks */
  & a {
    color: var(--primary);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  /* Blockquotes */
  & blockquote {
    border-left: 3px solid var(--primary);
    color: var(--muted-foreground);
    padding-left: 1rem;
    font-style: italic;
  }

  /* Code Blocks */
  & pre {
    background-color: var(--muted);
    color: var(--foreground);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.75rem 1rem;
  }

  & code {
    background-color: var(--muted);
    color: var(--foreground);
    border-radius: calc(var(--radius) * 0.5);
    padding: 0.2rem 0.4rem;
  }

  /* Tables */
  & table {
    border-collapse: collapse;
    width: 100%;

    & td,
    & th {
      border: 1px solid var(--border);
      padding: 0.5rem;
    }

    & th {
      background-color: var(--muted);
      font-weight: 600;
    }
  }

  /* Empty Paragraph Placeholder */
  & p.is-editor-empty:first-child::before {
    color: var(--muted-foreground);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
    opacity: 0.6;
  }
}
```
