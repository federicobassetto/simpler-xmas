import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Decorative branch SVG */}
      <div className="absolute top-8 right-8 opacity-20 pointer-events-none">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-forest"
        >
          <path
            d="M60 10 L60 110 M40 30 L60 50 L80 30 M35 50 L60 75 L85 50 M30 70 L60 100 L90 70"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="absolute bottom-8 left-8 opacity-15 pointer-events-none">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-terracotta"
        >
          <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="40" cy="40" r="25" stroke="currentColor" strokeWidth="1" />
          <circle cx="40" cy="40" r="15" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
        {/* Main heading */}
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-forest-dark mb-6 leading-tight">
          A Simpler Xmas
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-warm-gray mb-4 leading-relaxed max-w-lg mx-auto">
          Two weeks of small, kind moments for a calmer Christmas.
        </p>

        <p className="text-base text-warm-gray-light mb-12 max-w-md mx-auto">
          Create your personalised advent-style plan for a more mindful, 
          less stressful holiday season.
        </p>

        {/* CTA Button */}
        <Link
          href="/wish"
          className="
            inline-flex items-center justify-center
            px-10 py-4
            bg-terracotta text-white
            font-medium text-lg
            rounded-full
            transition-all duration-200 ease-out
            hover:bg-terracotta-dark hover:scale-[1.02]
            active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta
          "
        >
          Begin
        </Link>

        {/* Small note */}
        <p className="mt-8 text-sm text-warm-gray-light">
          Takes about 5 minutes · Free · No account needed
        </p>
      </div>

      {/* Decorative bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-terracotta-light to-transparent opacity-30" />
    </main>
  );
}
