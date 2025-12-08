# A Simpler Xmas 🎄

A mindful advent-style planning app that helps you design a calmer, more intentional holiday season. Using AI, it creates a personalised 25-day advent plan (December 1-25) based on your wishes and preferences.

## ✨ Features

- **Personalised Planning**: Share your Christmas wish and answer 5 thoughtful questions to receive a tailored 25-day advent plan
- **AI-Powered**: Uses OpenAI's Agents SDK to generate adaptive questions and meaningful daily activities
- **Mindful Design**: Focus on low-stress, low-consumerism activities like journaling, nature walks, simple recipes, and connection
- **Beautiful UI**: Warm, minimal design with gentle animations and a calming colour palette
- **Advent Calendar View**: Interactive 25-day advent calendar (Dec 1-25) with detailed activity descriptions and inspirational quotes

## 🛠 Tech Stack

### Core Framework

- **[Next.js 16](https://nextjs.org/)** with App Router
- **[React 19](https://react.dev/)**
- **[TypeScript 5](https://www.typescriptlang.org/)**

### Styling

- **[Tailwind CSS 4](https://tailwindcss.com/)** with custom theme
- **Google Fonts** — Playfair Display (serif) & DM Sans (sans-serif)

### Database

- **[Drizzle ORM](https://orm.drizzle.team/)** — type-safe SQL ORM
- **[Turso](https://turso.tech/)** (LibSQL) — production edge database
- **SQLite** — local development

### AI & Validation

- **[OpenAI Agents SDK](https://github.com/openai/openai-agents-js)** — agentic framework for adaptive question generation and plan creation (GPT-5.1)
- **[Zod 4](https://zod.dev/)** — schema validation for AI structured outputs

### Utilities

- **[nanoid](https://github.com/ai/nanoid)** — unique ID generation
- **[EmailJS](https://www.emailjs.com/)** — client-side email capture
- **[ZenQuotes.io](https://zenquotes.io/)** — inspirational quotes API

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- An OpenAI API key

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Set up the database**

```bash
npx drizzle-kit push
```

5. **Run the development server**

```bash
npm run dev
```

6. **Open the app**

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── session/            # Create new session
│   │   ├── questions/          # Question generation & answers
│   │   ├── plan/               # Plan generation
│   │   └── email/              # Email capture
│   ├── wish/                   # Initial wish page
│   ├── questions/[sessionId]/  # Adaptive question flow
│   ├── plan/[sessionId]/       # Advent calendar view
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   └── ui/                     # Reusable UI components
├── lib/
│   ├── db/                     # Drizzle schema & connection
│   ├── agents.ts               # OpenAI agents configuration
│   ├── quotes.ts               # ZenQuotes.io integration
│   └── utils.ts                # Utility functions
└── drizzle.config.ts           # Drizzle configuration
```

## 🎨 Design Philosophy

The app embodies a **mindful, warm, minimal Christmas** aesthetic:

- **Colour Palette**: Soft cream background, muted forest green, warm terracotta accents
- **Typography**: Playfair Display (serif) for headings, DM Sans for body text
- **Animations**: Gentle fade-ins and hover states
- **Tone**: Calm, encouraging, non-judgmental

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📝 How It Works

1. **Landing Page**: User is welcomed and clicks "Begin"
2. **Wish Page**: User shares what they want from this holiday season
3. **Questions Flow**: AI generates 5 adaptive follow-up questions based on the user's wish and previous answers
4. **Plan Generation**: AI creates a 25-day advent plan (December 1-25) with daily activities, drawing inspiration from wellness quotes
5. **Plan View**: User can browse their personalised calendar and optionally save their email for future features

## 🔮 Future Features

- Daily email reminders with activities
- Progress tracking and completion stats
- Sharing plans with friends and family
- Alternative plan themes (New Year, general wellness)

## 📄 License

MIT

---

*Made with care for a calmer holiday season* 🕯️
