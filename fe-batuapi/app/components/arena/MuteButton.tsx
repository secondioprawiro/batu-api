"use client";

import { useArenaAudio } from "./ArenaAudio";

/* Tombol senyap / nyala untuk soundtrack arena. Mengonsumsi ArenaAudioProvider. */
export default function MuteButton() {
  const { muted, toggleMuted } = useArenaAudio();

  return (
    <button
      type="button"
      onClick={toggleMuted}
      aria-pressed={muted}
      aria-label={muted ? "Nyalakan musik" : "Senyapkan musik"}
      title={muted ? "Musik: mati" : "Musik: nyala"}
      className="glass flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-base text-cream transition-colors hover:border-ember-400/50 hover:text-ember-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-night"
    >
      <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
    </button>
  );
}
