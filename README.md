# AI Comic Generator

A Next.js application that generates comics using OpenAI's gpt-image-1 model for character and panel image generation.

## Features

- **Character Management**: Create and manage comic characters with AI-generated images
- **Flexible Page Layouts**: Configure panel count and orientation for each page
- **AI Panel Generation**: Generate comic panel images using character references and scene descriptions
- **Structured Content Analysis**: Uses OpenAI's structured output to detect characters and analyze scenes

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.local.example .env.local
   ```
   Add your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open Application**:
   Navigate to `http://localhost:3000`

## Usage

### 1. Character Creation
- Go to the "Characters" tab
- Create characters by providing:
  - Name and description
  - Image generation prompt
- Generate character reference images using gpt-image-1

### 2. Page Layout
- Configure panel count (1-9 panels)
- Set orientation for odd-numbered panels
- Preview the layout structure

### 3. Comic Editing
- Add content descriptions for each panel
- Generate panel images that reference your characters
- AI automatically detects which characters appear in each scene

## Technical Details

### OpenAI Integration
- Uses `gpt-image-1` for image generation
- Implements structured output with JSON schema for character detection
- Supports multiple reference images for consistent character appearance

### Architecture
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Radix UI components for accessibility

### API Endpoints
- `/api/generate-character` - Generate character reference images
- `/api/generate-panel` - Generate comic panel images with character detection

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main application
├── components/
│   ├── ui/            # Reusable UI components
│   ├── CharacterManager.tsx
│   ├── ComicEditor.tsx
│   └── PanelLayout.tsx
├── lib/
│   ├── openai.ts      # OpenAI API integration
│   └── utils.ts       # Utility functions
└── types/
    └── index.ts       # TypeScript type definitions
```

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```