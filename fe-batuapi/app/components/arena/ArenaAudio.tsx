"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* Soundtrack arena Batu Api — diputar berulang (loop) selama pemain
 * berada di arena. Disajikan sebagai aset statis dari /public. */
const TRACK_SRC = "/battle-theme.mp3";

type ArenaAudioValue = {
  /** Musik sedang disenyapkan. */
  muted: boolean;
  /** Bergantian senyap / nyala. */
  toggleMuted: () => void;
};

const ArenaAudioContext = createContext<ArenaAudioValue | null>(null);

export function useArenaAudio(): ArenaAudioValue {
  const value = useContext(ArenaAudioContext);
  if (!value) {
    throw new Error("useArenaAudio harus dipakai di dalam <ArenaAudioProvider>.");
  }
  return value;
}

export function ArenaAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  const toggleMuted = useCallback(() => setMuted((m) => !m), []);

  return (
    <ArenaAudioContext.Provider value={{ muted, toggleMuted }}>
      <audio
        ref={audioRef}
        src={TRACK_SRC}
        loop
        preload="auto"
        aria-hidden="true"
      />
      {children}
    </ArenaAudioContext.Provider>
  );
}
