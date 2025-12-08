"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

interface AudioContextType {
  isPlaying: boolean;
  isMuted: boolean;
  startAudio: () => void;
  toggleAudio: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize audio element once
  useEffect(() => {
    if (typeof window !== "undefined" && !audioRef.current) {
      const audio = new Audio("/ambient-music.mp3");
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;

      // Handle audio ending (shouldn't happen with loop, but just in case)
      audio.addEventListener("ended", () => setIsPlaying(false));
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("play", () => setIsPlaying(true));

      return () => {
        audio.pause();
        audio.src = "";
      };
    }
  }, []);

  const startAudio = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
        })
        .catch((err) => {
          console.warn("Audio autoplay blocked:", err);
        });
    }
  }, [isPlaying]);

  const toggleAudio = useCallback(() => {
    if (!audioRef.current) {
      // Create audio if it doesn't exist
      const audio = new Audio("/ambient-music.mp3");
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;
    }

    if (isPlaying && !isMuted) {
      audioRef.current.pause();
      setIsMuted(true);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
        })
        .catch((err) => {
          console.warn("Audio play blocked:", err);
        });
    }
  }, [isPlaying, isMuted]);

  return (
    <AudioContext.Provider
      value={{ isPlaying, isMuted, startAudio, toggleAudio }}
    >
      {children}
    </AudioContext.Provider>
  );
}

// Floating audio control button component
export function AudioControl() {
  const { isPlaying, isMuted, toggleAudio } = useAudio();

  const showPlayIcon = !isPlaying || isMuted;

  return (
    <button
      onClick={toggleAudio}
      className="
        fixed bottom-6 right-6 z-50
        w-12 h-12 rounded-full
        bg-cream border border-cream-dark
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-300
        hover:scale-105
        group
      "
      aria-label={showPlayIcon ? "Play music" : "Mute music"}
      title={showPlayIcon ? "Play ambient music" : "Mute music"}
    >
      {showPlayIcon ? (
        // Music off - speaker with X
        <svg
          className="w-6 h-6 text-warm-gray group-hover:text-forest-dark transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
          />
        </svg>
      ) : (
        // Music on - speaker with sound waves
        <svg
          className="w-6 h-6 text-terracotta group-hover:text-terracotta-dark transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
          />
        </svg>
      )}
    </button>
  );
}

