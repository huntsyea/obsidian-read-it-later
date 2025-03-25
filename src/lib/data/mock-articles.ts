import { Article } from '../types/article';

/**
 * Mock article data for development and testing
 * Following Single Responsibility Principle by keeping mock data separate from components
 */
export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Understanding TypeScript\'s Type System',
    url: 'https://typescript-handbook.com/advanced-types',
    domain: 'typescript-handbook.com',
    addedAt: new Date('2025-03-20T10:30:00'),
    status: 'unread',
    tags: ['typescript', 'programming'],
    content: '<div><h1>Understanding TypeScript\'s Type System</h1><p>TypeScript\'s advanced type system provides powerful tools for creating type-safe applications. This article explores the nuances of union types, intersection types, and conditional types...</p></div>'
  },
  {
    id: '2',
    title: 'SOLID Principles in Modern JavaScript',
    url: 'https://dev.to/solid-principles-js',
    domain: 'dev.to',
    addedAt: new Date('2025-03-18T14:45:00'),
    status: 'read',
    tags: ['javascript', 'architecture'],
    content: '<div><h1>SOLID Principles in Modern JavaScript</h1><p>Understanding and applying SOLID principles can dramatically improve your JavaScript architecture. This article breaks down each principle with practical examples...</p></div>'
  },
  {
    id: '3',
    title: 'React 19 New Features Explained',
    url: 'https://reactjs.org/blog/2025/03/15/react-19-explained',
    domain: 'reactjs.org',
    addedAt: new Date('2025-03-15T09:15:00'),
    status: 'unread',
    tags: ['react', 'frontend'],
    content: '<div><h1>React 19 New Features Explained</h1><p>React 19 introduces several game-changing features that will revolutionize how we build user interfaces. This comprehensive guide explores the new Server Components, improved Suspense, and enhanced hooks system...</p></div>'
  },
  {
    id: '4',
    title: 'Building Obsidian Plugins: Best Practices',
    url: 'https://obsidian.md/developer/plugins/best-practices',
    domain: 'obsidian.md',
    addedAt: new Date('2025-03-10T16:20:00'),
    status: 'read',
    tags: ['obsidian', 'plugins'],
    content: '<div><h1>Building Obsidian Plugins: Best Practices</h1><p>Learn how to create robust and maintainable plugins for Obsidian with these expert recommendations. This guide covers everything from project structure to API usage and performance optimization...</p></div>'
  },
  {
    id: '5',
    title: 'Advanced TailwindCSS Techniques',
    url: 'https://tailwindcss.com/blog/advanced-techniques',
    domain: 'tailwindcss.com',
    addedAt: new Date('2025-03-05T11:10:00'),
    status: 'unread',
    tags: ['css', 'tailwind'],
    content: '<div><h1>Advanced TailwindCSS Techniques</h1><p>Take your TailwindCSS skills to the next level with these advanced techniques and best practices. This article covers custom configuration, component extraction, and responsive design strategies...</p></div>'
  }
];
