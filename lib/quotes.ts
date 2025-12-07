export interface Quote {
  quote: string;
  author: string;
}

/**
 * Fetch inspirational quotes from ZenQuotes.io
 * Falls back to default quotes if the API is unavailable
 */
export async function fetchQuotes(count: number = 14): Promise<Quote[]> {
  try {
    const response = await fetch(
      `https://zenquotes.io/api/quotes`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      console.warn("ZenQuotes API unavailable, using fallback quotes");
      return getFallbackQuotes(count);
    }

    const data = await response.json();
    
    // ZenQuotes returns { q: quote, a: author }
    const quotes: Quote[] = data
      .slice(0, count)
      .map((item: { q: string; a: string }) => ({
        quote: item.q,
        author: item.a,
      }));

    if (quotes.length < count) {
      // Pad with fallback quotes if we didn't get enough
      const fallbacks = getFallbackQuotes(count - quotes.length);
      return [...quotes, ...fallbacks];
    }

    return quotes;
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return getFallbackQuotes(count);
  }
}

/**
 * Fallback quotes for when the API is unavailable
 */
function getFallbackQuotes(count: number): Quote[] {
  const fallbacks: Quote[] = [
    { quote: "The greatest gift you can give someone is your time, because when you give your time, you are giving a portion of your life that you will never get back.", author: "Unknown" },
    { quote: "Kindness is like snow—it beautifies everything it covers.", author: "Kahlil Gibran" },
    { quote: "The best way to spread Christmas cheer is singing loud for all to hear.", author: "Buddy the Elf" },
    { quote: "Christmas waves a magic wand over this world, and behold, everything is softer and more beautiful.", author: "Norman Vincent Peale" },
    { quote: "In the midst of winter, I found there was within me an invincible summer.", author: "Albert Camus" },
    { quote: "Peace on earth will come to stay, when we live Christmas every day.", author: "Helen Steiner Rice" },
    { quote: "The best of all gifts around any Christmas tree: the presence of a happy family all wrapped up in each other.", author: "Burton Hillis" },
    { quote: "Christmas isn't a season. It's a feeling.", author: "Edna Ferber" },
    { quote: "Blessed is the season which engages the whole world in a conspiracy of love.", author: "Hamilton Wright Mabie" },
    { quote: "One of the most glorious messes in the world is the mess created in the living room on Christmas day.", author: "Andy Rooney" },
    { quote: "The earth has grown old with its burden of care, but at Christmas it always is young.", author: "Phillips Brooks" },
    { quote: "Christmas is not as much about opening our presents as opening our hearts.", author: "Janice Maeditere" },
    { quote: "What is Christmas? It is tenderness for the past, courage for the present, hope for the future.", author: "Agnes M. Pahro" },
    { quote: "At Christmas, all roads lead home.", author: "Marjorie Holmes" },
    { quote: "Remember, if Christmas isn't found in your heart, you won't find it under a tree.", author: "Charlotte Carpenter" },
    { quote: "Christmas is doing a little something extra for someone.", author: "Charles M. Schulz" },
  ];

  return fallbacks.slice(0, count);
}

