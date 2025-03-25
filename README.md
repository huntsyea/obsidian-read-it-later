# Smart Reader - Obsidian Plugin

A modern Obsidian plugin that helps you save and organize web content for later reading, built with React, TypeScript, and shadcn/ui.

## Plugin Details

- **Name**: Smart Reader
- **Icon**: Album ("album" icon from Obsidian's icon set)
- **Purpose**: Save web articles for later reading within Obsidian

## Features

- Modern UI components using shadcn/ui
- TailwindCSS styling with Obsidian theme integration
- React-based component architecture with context providers
- TypeScript for type safety and solid principles
- Persistent storage using Obsidian's data API
- Article extraction from web URLs
- Reading mode with clean article view
- Custom templates for article formatting
- Vite for fast development and building

## Tech Stack

- React 18+
- TypeScript
- TailwindCSS
- shadcn/ui components
- Vite
- Lucide icons
- Obsidian API
- Context API for state management

## Project Structure

```
src/
├── components/           # React components
│   ├── articles/         # Article-related components
│   ├── ui/               # UI components from shadcn/ui
│   └── views/            # Main view components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and services
│   ├── context/         # React context providers
│   ├── data/            # Data models and mock data
│   ├── services/        # Service classes
│   └── types/           # TypeScript interfaces and types
├── App.tsx              # Main React application
├── SmartReaderView.tsx  # Obsidian view wrapper
├── main.ts              # Plugin initialization
└── index.css            # Global styles
```

## Development

### Prerequisites

- Node.js v20 or higher
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```
3. Start development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Building

```bash
npm run build
# or
yarn build
```

## Styling

This plugin uses TailwindCSS with custom configuration to match Obsidian's design system:
- Uses Obsidian's CSS variables for colors and design tokens
- shadcn/ui components styled to match Obsidian's theme
- Dark/light theme support
- Custom border radius and spacing utilities

### Button Styles

Buttons follow these consistent styling patterns:

```tsx
// Primary button
<Button className="flex items-center gap-1">
  <Icon className="h-4 w-4" />
  <span>Button Text</span>
</Button>

// Secondary button
<Button variant="outline" className="flex items-center gap-1">
  <Icon className="h-4 w-4" />
  <span>Button Text</span>
</Button>

// Destructive button
<Button variant="destructive" className="flex items-center gap-1">
  <Icon className="h-4 w-4" />
  <span>Button Text</span>
</Button>
```

### Form Elements

Form elements use the following consistent styling:

```tsx
// Input field
<Input
  id="input-id"
  placeholder="Placeholder text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="w-full"
/>

// Dialog
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description text</DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
    <DialogFooter>
      <Button type="submit">Submit</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Component Development

Components are built using shadcn/ui and follow these guidelines:
- Functional React components with TypeScript
- TailwindCSS for styling
- Obsidian theme compatibility
- Responsive design
- Single Responsibility Principle
- Type safety with proper interfaces
- Dependency injection via props and context

### Current Implementation

#### Storage Service

The plugin uses a `StorageService` class to handle article persistence:

```typescript
export class StorageService {
  private plugin: Plugin;
  private storageKey = 'smart-reader-articles';

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  async saveArticles(articles: Article[]): Promise<void> {
    await this.plugin.saveData(this.storageKey, articles);
  }

  async loadArticles(): Promise<Article[]> {
    const articles = await this.plugin.loadData(this.storageKey);
    return articles || [];
  }

  // Additional methods for adding, updating, and deleting articles
}
```

#### Context Provider

State management is handled through a React context provider:

```typescript
export const ArticleContext = createContext<ArticleContextType>({} as ArticleContextType);

export function ArticleProvider({ children, storageService }: ArticleProviderProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load articles on mount
  useEffect(() => {
    loadArticles();
  }, []);

  // Methods for managing articles
  // ...

  return (
    <ArticleContext.Provider value={{ 
      articles, loading, error, 
      addArticle, updateArticle, deleteArticle, 
      updateArticleStatus, refreshArticles 
    }}>
      {children}
    </ArticleContext.Provider>
  );
}
```

#### Current Implementation Status

**Article Storage:**
- Articles are currently stored in the plugin's data storage using Obsidian's data API
- Articles can be added, updated, deleted, and marked as read/unread
- The UI displays the saved articles and allows for interaction

**Planned Features (Not Yet Implemented):**
- Saving articles as Markdown notes in the Obsidian vault
- Template support for customizing note format
- Template variables: `{{title}}`, `{{content}}`, `{{url}}`, `{{date}}`

The settings UI includes options for these planned features, but the functionality to create Markdown notes from articles is still in development.

## License

MIT
