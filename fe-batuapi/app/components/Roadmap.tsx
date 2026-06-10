import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const PHASES = [
  {
    n: 1,
    icon: "⚙️",
    title: "Smart Contract & Token Logic",
    desc: "Kontrak API Coin, deposit, dan konversi CELO on-chain.",
    active: true,
  },
  {
    n: 2,
    icon: "🎮",
    title: "Frontend Battle UI",
    desc: "Arena visual tempat para elemen saling bertarung.",
    active: true,
  },
  {
    n: 3,
    icon: "🎲",
    title: "Random Battle System",
    desc: "Sistem lawan acak yang adil dan transparan.",
    active: false,
  },
  {
    n: 4,
    icon: "💰",
    title: "Reward Pool & Withdraw",
    desc: "Pool reward aktif plus penarikan CELO penuh.",
    active: false,
  },
  {
    n: 5,
    icon: "⚔️",
    title: "PvP Battle Mode",
    desc: "Pemain vs pemain — arena sesungguhnya dimulai.",
