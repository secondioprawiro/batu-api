import BattleRules from "./components/BattleRules";
import DepositSection from "./components/DepositSection";
import ElementCards from "./components/ElementCards";
import Footer from "./components/Footer";
import GameFlow from "./components/GameFlow";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Rewards from "./components/Rewards";
import Roadmap from "./components/Roadmap";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <GameFlow />
        <ElementCards />
        <BattleRules />
        <DepositSection />
        <Rewards />
        <Roadmap />
      </main>
      <Footer />
    </>
  );
}
