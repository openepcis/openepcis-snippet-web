# OpenEPCIS Snippet Web

A modern web interface for managing EPCIS Event rules snippets built with Nuxt 3, Vue 3, and Tailwind CSS.

## Features

- Search Snippet
- Show Snippet Details 
- Manage Snippets

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:

```
SNIPPET_API_URL=http://localhost:8080
```

3. Start the development server:

```bash
npm run dev
```

## Configuration

The application can be configured using environment variables:

- `SNIPPET_API_URL`: The URL of the OpenEPCIS Snippet API (default: http://localhost:8080)

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build

## License

Apache License 2.0
