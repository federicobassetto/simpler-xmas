# A Simpler Xmas 🎄

A mindful advent-style planning app that helps you design a calmer, more intentional holiday season. Using AI, it creates a personalised 14-day plan based on your wishes and preferences.

## ✨ Features

- **Personalised Planning**: Share your Christmas wish and answer 5 thoughtful questions to receive a tailored 14-day plan
- **AI-Powered**: Uses OpenAI's Agents SDK to generate adaptive questions and meaningful daily activities
- **Mindful Design**: Focus on low-stress, low-consumerism activities like journaling, nature walks, simple recipes, and connection
- **Beautiful UI**: Warm, minimal design with gentle animations and a calming colour palette
- **Advent Calendar View**: Interactive 14-day calendar with detailed activity descriptions and inspirational quotes

## 🛠 Tech Stack

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS** with custom theme
- **Drizzle ORM** with SQLite
- **OpenAI Agents SDK** for AI-powered question generation and plan creation
- **ZenQuotes.io** for inspirational quotes

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- An OpenAI API key

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd qzo
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
4. **Plan Generation**: AI creates a 14-day advent-style plan with daily activities, drawing inspiration from wellness quotes
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
