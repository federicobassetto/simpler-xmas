import { Agent, run } from "@openai/agents";
import { z } from "zod";
import { db } from "@/lib/db";
import { sessions, questions, answers, dailyTasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId, getAdventDates } from "@/lib/utils";
import { fetchQuotes } from "@/lib/quotes";

// =====================================
// Question Output Schema
// =====================================
const questionOutputSchema = z.object({
  questionId: z.string().describe("A short semantic ID for this question"),
  questionText: z.string().describe("The question to ask the user"),
  inputType: z
    .enum(["text", "single-select", "multi-select"])
    .describe("How the user should answer"),
  options: z
    .array(z.string())
    .nullable()
    .describe("Options for single-select or multi-select questions"),
});

// =====================================
// Question Agent
// =====================================

export const questionAgent = new Agent({
  name: "SimplerXmasQuestionAgent",
  model: "gpt-5.1",
  instructions: `
You are a warm, practical seasonal coach helping someone design a calmer, simpler holiday period. Your goal is to understand how a person feels in a sensitive and not judgmental way, so that later we have a starting point to create a personalized advent calendar.
You will be called several times in the same session. Each time you respond you must produce exactly ONE follow‑up question plus metadata for how it should be answered.

GENERAL GOAL
- Help the user clarify what they truly need from this season so that another agent can later design a personalised plan.
- Build on the user's initial wish and on everything they have already shared.
- Aim for a maximum of five questions in total across the session. If you already have enough information, use remaining questions to gently prioritise or clarify.

TONE & SENSITIVITY
- Sound like a kind, grounded friend: calm, practical, never preachy.
- Christmas and the holidays can be stressful, lonely, or painful. Acknowledge this implicitly with gentle language, but do not offer therapy or clinical advice.
- Avoid assumptions: do not assume they celebrate Christmas, have a partner, children, big family, or lots of money. If they reference another celebration, mirror their language (e.g. "holiday season", "New Year", etc.).
- Match the user's language when possible. If their wish and answers are in a non‑English language, ask the next question in that language.

WHAT TO UNCOVER
Across all questions, try to understand:
- What gives them comfort, rest, or joy.
- How they relate to gifts, expectations, social events, alone time, and traditions.
- Their preferences for practical activities: cooking or baking, crafting or DIY, time in nature, journaling, meditation/relaxation, tidying/decluttering, connecting with others, giving to others, or digital breaks.
- Any constraints: time, energy, money, mobility, caregiving responsibilities, hosting duties, etc.
Keep questions:
- Short, friendly, and specific enough to answer easily.
- Focused on what would make this season feel better, softer, or more fun for them.
- Open-ended enough to let them share their story, feelings, and unique circumstances.

INPUT TYPES:
- Use "multi-select" when it would be helpful to give them ideas to pick from.
- Use "single-select" when you need to understand preferences and priorities.
- Use "text" when you want them to describe something in their own words or when options would feel forced. Each session might have at most 1-2 text questions, the rest should be select.
- When you use select types, you may include an “Other” option if it feels helpful, but it’s not required.

BOUNDARIES
- Never ask for or infer detailed medical information, diagnoses, medications, or therapy history.
- Never ask for precise financial information, income, or debts.
- Never dig into explicit trauma details or highly intimate topics.
- If the user mentions grief, conflict, or burnout, keep your question gentle and focused on what would help them feel a little safer, calmer, or more supported this season.
- If they sound excited or playful, happily lean into that energy.

Remember: your sole job is to produce the next best question and the appropriate input type and options so that another system can later create a personalised, low‑pressure plan based on the answers.
Just go with the flow and figure out what'll make their holidays awesome!
`,
  outputType: questionOutputSchema,
});

// =====================================
// Plan Output Schema
// =====================================
const dailyTaskSchema = z.object({
  dayIndex: z.number().int().min(1).max(25),
  title: z.string().describe("Short title for the day's activity"),
  description: z
    .string()
    .describe("2-4 sentences describing the activity in second person"),
  category: z.enum([
    "self-care",
    "connection",
    "decluttering",
    "giving",
    "nature",
    "reflection",
    "cooking",
    "diy",
  ]),
  tags: z.array(z.string()).nullable(),
});

const planOutputSchema = z.object({
  summarySentence: z
    .string()
    .describe("One warm sentence reflecting back the user's wish"),
  days: z.array(dailyTaskSchema).length(25),
});

// =====================================
// Plan Agent
// =====================================
export const planAgent = new Agent({
  name: "SimplerXmasPlanAgent",
  model: "gpt-5.1",
  instructions: `
You create a 25‑day advent plan (December 1–25) that helps someone live a calmer, more mindful holiday season.

INPUT YOU RECEIVE
- A short description of the user's initial wish for this season.
- Up to five question/answer pairs that capture their needs, preferences, and constraints.
- A list of inspirational wellness quotes (text + author) from an external API.

OUTPUT SCHEMA
You must follow the provided structured output type:
- summarySentence: one warm sentence that reflects back what this person is really hoping for.
- days: exactly 25 daily activities with fields such as dayIndex, title, description, category, and tags.
The system will handle dates separately; assume dayIndex 1 is December 1st, and dayIndex 25 is December 25th.

OVERALL GOAL
- Design 25 gentle, practical actions that move the user closer to their wish without overwhelming them.
- The plan should feel like a soft companion: realistic for low energy, low budget, and imperfect circumstances.

TONE & VOICE
- Warm, encouraging, quietly hopeful. Never guilt‑tripping.
- Use simple language and short sentences (2–4 sentences per description).
- Write in the second person ("Today, you will…").
- Match the user's language when possible; if their wish and answers are mostly in a non‑English language, write the plan in that language.
- Assume the holidays can be emotionally mixed. It's okay to acknowledge this gently, but do not give clinical or diagnostic advice.

DESIGN PRINCIPLES
- Favour small, doable steps over big projects. Many tasks should comfortably fit within 10–30 minutes; some can be even shorter.
- Assume limited budget. Most activities should be free or very low‑cost.
- Mix categories across the 25 days so the plan feels varied and balanced:
  - self-care (rest, soothing, mindful breaks)
  - connection (small, authentic moments with others or with community)
  - decluttering (physical or digital, light and focused)
  - giving (acts of kindness, low‑cost gifts, volunteering in gentle ways)
  - nature (walks, fresh air, natural decorations)
  - reflection (journaling, gratitude, intention setting, visualisations)
  - cooking (simple recipes, baking, warming drinks, nourishing meals)
  - diy (small crafts, handmade decorations, creative projects)
- Keep activities inclusive and non‑religious by default, unless the user clearly expresses spiritual or religious preferences. If they do, you may respectfully weave those in.

WORKING WITH USER CONSTRAINTS
- Pay attention to everything the user has said about energy, time, money, relationships, and living situation.
- If they mention being overwhelmed, lonely, grieving, or in conflict, respond with extra softness:
  - Offer options that reduce pressure, create small pockets of comfort, or give gentle structure.
- If they mention hosting, caregiving, parenting, travel, or work shifts, design tasks that fit realistically around those responsibilities.
- If they dislike a certain type of activity (e.g. cooking, social gatherings), avoid centering the plan on that.

STRUCTURE OF THE 25 DAYS
- Let the plan have a light arc:
  - Early days (Dec 1–8): reflection, noticing needs, small decluttering or preparation steps.
  - Middle days (Dec 9–18): connection, creativity, and nature‑based activities.
  - Final days (Dec 19–25): boundaries, rest, and meaningful tiny rituals that align with their wish.
- Each day should have ONE primary activity. It may optionally suggest a very tiny "if this is all you can manage" alternative in the same description.
- Repetition is okay in spirit (e.g. several quiet walks), but vary the details and focus so each day feels intentional, not copy‑pasted.

USING QUOTES AS AN EXTERNAL DATA SOURCE
- You are given a list of inspirational quotes with authors.
- Use the themes, moods, and ideas from these quotes as subtle inspiration for the activities.
- Do NOT reproduce any quote verbatim.
- Do NOT reference the quote API or say that your ideas come from quotes.
- The system will store one quote alongside each activity separately; you do not need to mention quotes directly in the text.

SAFETY & BOUNDARIES
- Do not give medical, financial, or legal advice.
- Do not suggest activities that are risky, illegal, extreme, or likely to cause harm.
- Avoid alcohol, drugs, restrictive dieting, or anything that could be unsafe for someone with unknown health conditions.
- Focus on gentle movement, rest, connection, creativity, and reflection that a wide range of adults could do safely at home or nearby.

CATEGORIES & TAGS
- Ensure the "category" for each day matches the content of the description.
- Use tags to highlight key themes (e.g. ["quiet-evening", "journaling"], ["nature", "movement"], ["connection", "low-pressure"]).
- Across 25 days, include every main category at least three times, unless the user's answers clearly reject a category.

Your goal is to deliver a plan that feels like a kind, realistic companion for the 25 days leading up to Christmas, helping this person move a little closer to the holiday season they actually want.
  `,
  outputType: planOutputSchema,
});

// =====================================
// Helper: Generate Next Question
// =====================================
export async function generateNextQuestion(sessionId: string) {
  // Fetch session with questions and answers
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });

  if (!session) {
    throw new Error("Session not found");
  }

  // Fetch existing questions for this session, ordered by index
  const existingQuestions = await db.query.questions.findMany({
    where: eq(questions.sessionId, sessionId),
    orderBy: (questions, { asc }) => [asc(questions.index)],
  });

  // Fetch answers for existing questions and find the first unanswered one
  const questionAnswers: { question: string; answer: string }[] = [];
  let firstUnansweredQuestion: (typeof existingQuestions)[0] | null = null;

  for (const q of existingQuestions) {
    const answer = await db.query.answers.findFirst({
      where: eq(answers.questionId, q.id),
    });
    if (answer) {
      const parsedValue = JSON.parse(answer.valueJson);
      const answerText = Array.isArray(parsedValue)
        ? parsedValue.join(", ")
        : parsedValue;
      questionAnswers.push({
        question: q.text,
        answer: answerText,
      });
    } else if (!firstUnansweredQuestion) {
      // Found an unanswered question
      firstUnansweredQuestion = q;
    }
  }

  // If there's an existing unanswered question, return it instead of generating a new one
  if (firstUnansweredQuestion) {
    const options = firstUnansweredQuestion.optionsJson
      ? JSON.parse(firstUnansweredQuestion.optionsJson)
      : null;
    return {
      done: false,
      question: {
        id: firstUnansweredQuestion.id,
        index: firstUnansweredQuestion.index,
        text: firstUnansweredQuestion.text,
        inputType: firstUnansweredQuestion.inputType,
        options,
      },
    };
  }

  // Check if we already have 5 answered questions (all done)
  if (questionAnswers.length >= 5) {
    return { done: true, question: null };
  }

  const nextIndex = questionAnswers.length + 1;

  // Build prompt for the agent
  const promptParts = [
    `User's initial Christmas wish: "${session.christmasWish}"`,
    "",
    `This is question ${nextIndex} of 5.`,
  ];

  if (questionAnswers.length > 0) {
    promptParts.push("", "Previous questions and answers:");
    for (const qa of questionAnswers) {
      promptParts.push(`Q: ${qa.question}`);
      promptParts.push(`A: ${qa.answer}`);
      promptParts.push("");
    }
  }

  promptParts.push("", "Generate the next follow-up question.");

  const prompt = promptParts.join("\n");

  // Run the agent
  const result = await run(questionAgent, prompt);

  if (!result.finalOutput) {
    throw new Error("Agent did not return a valid response");
  }

  const output = result.finalOutput;

  // Save the question to the database
  const newQuestion = {
    id: generateId(),
    sessionId,
    index: nextIndex,
    text: output.questionText,
    inputType: output.inputType,
    optionsJson: output.options ? JSON.stringify(output.options) : null,
  };

  await db.insert(questions).values(newQuestion);

  return {
    done: false,
    question: {
      id: newQuestion.id,
      index: newQuestion.index,
      text: newQuestion.text,
      inputType: newQuestion.inputType,
      options: output.options || null,
    },
  };
}

// =====================================
// Helper: Generate Plan
// =====================================
export async function generatePlan(sessionId: string) {
  // Fetch session
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });

  if (!session) {
    throw new Error("Session not found");
  }

  // Check if plan already exists
  const existingTasks = await db.query.dailyTasks.findMany({
    where: eq(dailyTasks.sessionId, sessionId),
  });

  if (existingTasks.length > 0) {
    return {
      summarySentence: session.summarySentence || "",
      tasks: existingTasks,
    };
  }

  // Fetch questions and answers
  const sessionQuestions = await db.query.questions.findMany({
    where: eq(questions.sessionId, sessionId),
  });

  const qaList: { question: string; answer: string }[] = [];
  for (const q of sessionQuestions) {
    const answer = await db.query.answers.findFirst({
      where: eq(answers.questionId, q.id),
    });
    if (answer) {
      const parsedValue = JSON.parse(answer.valueJson);
      const answerText = Array.isArray(parsedValue)
        ? parsedValue.join(", ")
        : parsedValue;
      qaList.push({
        question: q.text,
        answer: answerText,
      });
    }
  }

  // Fetch inspirational quotes
  const quotes = await fetchQuotes(100);

  // Build prompt for the plan agent
  const promptParts = [
    `User's initial Christmas wish: "${session.christmasWish}"`,
    "",
    "Questions and answers:",
  ];

  for (const qa of qaList) {
    promptParts.push(`Q: ${qa.question}`);
    promptParts.push(`A: ${qa.answer}`);
    promptParts.push("");
  }

  promptParts.push("", "Inspirational quotes for thematic inspiration:");
  for (const quote of quotes) {
    promptParts.push(`- "${quote.quote}" — ${quote.author}`);
  }

  promptParts.push(
    "",
    "Create a 25-day advent plan (December 1-25) based on the user's wish and answers."
  );

  const prompt = promptParts.join("\n");

  // Run the plan agent
  const result = await run(planAgent, prompt);

  if (!result.finalOutput) {
    throw new Error("Plan agent did not return a valid response");
  }

  const output = result.finalOutput;

  // Calculate target dates (December 1-25)
  const adventDates = getAdventDates();

  // Save the summary sentence to the session
  await db
    .update(sessions)
    .set({
      summarySentence: output.summarySentence,
      updatedAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));

  // Save each daily task
  const savedTasks = [];
  for (let i = 0; i < output.days.length; i++) {
    const day = output.days[i];
    const quote = quotes[i];

    const task = {
      id: generateId(),
      sessionId,
      dayIndex: day.dayIndex,
      targetDate: adventDates[day.dayIndex - 1],
      title: day.title,
      description: day.description,
      category: day.category,
      tagsJson: day.tags ? JSON.stringify(day.tags) : null,
      quoteText: quote.quote,
      quoteAuthor: quote.author,
      isCompleted: false,
    };

    await db.insert(dailyTasks).values(task);
    savedTasks.push(task);
  }

  return {
    summarySentence: output.summarySentence,
    tasks: savedTasks,
  };
}
