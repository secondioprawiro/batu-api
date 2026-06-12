"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useBalance,
  useBlockNumber,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import {
  BaseError,
  ContractFunctionRevertedError,
  bytesToHex,
  formatUnits,
  maxUint256,
  parseEther,
  parseEventLogs,
  parseUnits,
  type Hex,
} from "viem";
import { ELEMENTS, type ElementKey } from "@/app/lib/elements";
import {
  ELEMENT_INDEX,
  MIN_BET,
  MIN_WITHDRAW,
  REVEAL_WINDOW,
  clearCommit,
  elementFromIndex,
  fmt,
  hashCommit,
  isElementKey,
  loadCommit,
  loadHistory,
  outcomeFromIndex,
  saveCommit,
  saveHistory,
  type BattleRecord,
  type FightResult,
} from "@/app/lib/arena";
import {
  API_COIN_ADDRESS,
  BATU_API_ADDRESS,
  CELO_CHAIN_ID,
  apiCoinAbi,
  batuApiAbi,
} from "@/app/lib/contracts";
import { ArenaAudioProvider } from "./ArenaAudio";
import BankPanel from "./BankPanel";
import BattleStage, { type Phase } from "./BattleStage";
import HistoryPanel from "./HistoryPanel";

const ERROR_MESSAGES: Record<string, string> = {
  ZeroAmount: "Jumlah tidak boleh nol.",
  BetBelowMinimum: `Bet minimal ${MIN_BET} API.`,
  InsufficientPool: "Reward pool tidak cukup untuk menampung bet sebesar ini.",
  NothingToWithdraw: `Withdraw minimal ${fmt(MIN_WITHDRAW, 0)} API (1 CELO).`,
  ActiveBattleExists: "Masih ada battle yang belum di-reveal. Selesaikan dulu.",
  NoActiveBattle: "Tidak ada battle aktif.",
  InvalidReveal: "Data reveal tidak cocok dengan commitment.",
  RevealTooEarly: "Terlalu cepat — tunggu 1 block lagi lalu coba reveal ulang.",
  RevealExpired: "Jendela reveal habis. Battle harus di-forfeit.",
  NotYetExpired: "Battle belum kedaluwarsa — belum bisa forfeit.",
};

function humanizeError(error: unknown): string {
  if (error instanceof BaseError) {
    const revert = error.walk(
      (e) => e instanceof ContractFunctionRevertedError,
    );
    if (revert instanceof ContractFunctionRevertedError) {
      const name = revert.data?.errorName;
      if (name && ERROR_MESSAGES[name]) return ERROR_MESSAGES[name];
    }
    if (error.shortMessage.includes("User rejected"))
      return "Transaksi dibatalkan di wallet.";
    return error.shortMessage;
  }
  return error instanceof Error ? error.message : "Terjadi kesalahan.";
}

export default function Arena() {
  const params = useSearchParams();
  const fromQuery = params.get("element");

  const { address, isConnected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient({ chainId: CELO_CHAIN_ID });
  const { writeContractAsync } = useWriteContract();

  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<FightResult | null>(null);
  const [selected, setSelected] = useState<ElementKey>(
    isElementKey(fromQuery) ? fromQuery : "api",
  );
  const [bet, setBet] = useState("100");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<BattleRecord[]>([]);
  const [forfeiting, setForfeiting] = useState(false);

  /* Roda elemen sistem — berputar selama transaksi battle berjalan */
  const [spinIndex, setSpinIndex] = useState(0);
  const busy =
    phase === "approving" ||
    phase === "committing" ||
    phase === "waiting" ||
    phase === "revealing";

  useEffect(() => {
    if (!busy) return;
    const id = window.setInterval(
      () => setSpinIndex((i) => (i + 1) % ELEMENTS.length),
      90,
    );
    return () => window.clearInterval(id);
  }, [busy]);

  /* === Data on-chain === */
  const wrongChain = isConnected && chainId !== CELO_CHAIN_ID;

  const { data: celoBalance, refetch: refetchCelo } = useBalance({
    address,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const { data: apiBalanceWei, refetch: refetchApi } = useReadContract({
    address: API_COIN_ADDRESS,
    abi: apiCoinAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: API_COIN_ADDRESS,
    abi: apiCoinAbi,
    functionName: "allowance",
    args: address ? [address, BATU_API_ADDRESS] : undefined,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address },
  });

  const { data: availablePool, refetch: refetchPool } = useReadContract({
    address: BATU_API_ADDRESS,
    abi: batuApiAbi,
    functionName: "availablePool",
    chainId: CELO_CHAIN_ID,
    query: { refetchInterval: 10_000 },
  });

  const { data: pending, refetch: refetchPending } = useReadContract({
    address: BATU_API_ADDRESS,
    abi: batuApiAbi,
    functionName: "pendingBattle",
    args: address ? [address] : undefined,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const { data: blockNumber } = useBlockNumber({
    chainId: CELO_CHAIN_ID,
    watch: true,
  });

  const refetchAll = () => {
    refetchCelo();
    refetchApi();
    refetchAllowance();
    refetchPool();
    refetchPending();
  };

  const celo = celoBalance
    ? Number(formatUnits(celoBalance.value, celoBalance.decimals))
    : 0;
  const api = apiBalanceWei ? Number(formatUnits(apiBalanceWei, 18)) : 0;
  const pool = availablePool ? Number(formatUnits(availablePool, 18)) : 0;
  /* Bet maksimum yang bisa ditanggung pool: liability menang = bet × 0.95
   * harus ≤ availablePool → maxBet = pool × 100/95 (README: pool capacity).
   * Infinity selama data pool belum termuat supaya tombol tidak terkunci palsu. */
  const poolMaxBet =
    availablePool !== undefined ? Math.floor((pool * 100) / 95) : Infinity;

  /* Riwayat battle per wallet (hasil on-chain, cache lokal) —
   * dimuat ulang saat wallet berganti (adjust-state-during-render) */
  const [historyOwner, setHistoryOwner] = useState<string | undefined>();
  if (historyOwner !== address) {
    setHistoryOwner(address);
    setHistory(address ? loadHistory(address) : []);
  }

  /* === Battle pending (commit belum di-reveal) === */
  const [pendingBet, pendingCommitBlock, pendingActive, pendingHash] =
    pending ?? [0n, 0n, false, "0x" as Hex];
  const storedCommit =
    address && pendingActive ? loadCommit(address) : null;
  const commitMatches =
    storedCommit !== null &&
    storedCommit.commitHash.toLowerCase() ===
      (pendingHash as string).toLowerCase();
  const targetBlock = BigInt(pendingCommitBlock) + 1n;
  const revealReady = blockNumber !== undefined && blockNumber > targetBlock;
  const revealExpired =
    blockNumber !== undefined && blockNumber > targetBlock + REVEAL_WINDOW;

  /* === Aksi kontrak === */

  const waitForBlockAfter = async (target: bigint) => {
    if (!publicClient) throw new Error("RPC tidak tersedia.");
    // revealBattle butuh block.number > commitBlock + 1 (Celo ±1 detik/block)
    for (;;) {
      const current = await publicClient.getBlockNumber({ cacheTime: 0 });
      if (current > target) return;
      await new Promise((r) => setTimeout(r, 1_000));
    }
  };

  const doReveal = async (elementIndex: number, secret: Hex) => {
    if (!address || !publicClient) return;
    setPhase("revealing");
    const txHash = await writeContractAsync({
      address: BATU_API_ADDRESS,
      abi: batuApiAbi,
      functionName: "revealBattle",
      args: [elementIndex, secret],
      chainId: CELO_CHAIN_ID,
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    const [revealed] = parseEventLogs({
      abi: batuApiAbi,
      logs: receipt.logs,
      eventName: "BattleRevealed",
    });
    if (!revealed) throw new Error("Event BattleRevealed tidak ditemukan.");

    const betApi = Number(formatUnits(revealed.args.bet, 18));
    const payout = Number(formatUnits(revealed.args.payout, 18));
    const record: FightResult = {
      player: elementFromIndex(revealed.args.playerElement),
      system: elementFromIndex(revealed.args.systemElement),
      bet: betApi,
      outcome: outcomeFromIndex(revealed.args.outcome),
      delta: payout - betApi,
      txHash,
    };

    clearCommit(address);
    setResult(record);
    setPhase("result");
    setHistory((h) => {
      const next = [{ id: Date.now(), ...record }, ...h].slice(0, 8);
      saveHistory(address, next);
      return next;
    });
    refetchAll();
  };

  /* Mulai battle: approve (jika perlu) → commit → tunggu block → reveal */
  const fight = async () => {
    if (!address || !publicClient || busy) return;
    if (wrongChain) {
      setError("Pindah ke jaringan Celo dulu (lihat tombol wallet di atas).");
      return;
    }
    const betN = Math.floor(Number(bet));
    if (!Number.isFinite(betN) || betN < MIN_BET || betN > api) return;
    if (betN > poolMaxBet) {
      setError(
        `Reward pool sedang rendah — bet maksimum saat ini ${fmt(poolMaxBet, 0)} API.`,
      );
      return;
    }

    setError(null);
    setResult(null);
    const betWei = parseUnits(String(betN), 18);

    try {
      /* Approve sekali (unlimited, sesuai panduan README kontrak) —
       * battle berikutnya cukup 2 transaksi: commit + reveal. */
      if ((allowance ?? 0n) < betWei) {
        setPhase("approving");
        const approveHash = await writeContractAsync({
          address: API_COIN_ADDRESS,
          abi: apiCoinAbi,
          functionName: "approve",
          args: [BATU_API_ADDRESS, maxUint256],
          chainId: CELO_CHAIN_ID,
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        refetchAllowance();
      }

      /* Secret acak baru tiap battle; disimpan SEBELUM commit terkirim
       * supaya refresh/error tidak menghilangkan kunci reveal. */
      const secret = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      const elementIndex = ELEMENT_INDEX[selected];
      const commitHash = hashCommit(address, elementIndex, secret);
      saveCommit(address, {
        secret,
        elementIndex,
        bet: betWei.toString(),
        commitHash,
      });

      setPhase("committing");
      const commitTx = await writeContractAsync({
        address: BATU_API_ADDRESS,
        abi: batuApiAbi,
        functionName: "commitBattle",
        args: [betWei, commitHash],
        chainId: CELO_CHAIN_ID,
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: commitTx,
      });

      setPhase("waiting");
      await waitForBlockAfter(receipt.blockNumber + 1n);
      await doReveal(elementIndex, secret);
    } catch (err) {
      setPhase("idle");
      setError(humanizeError(err));
      refetchAll();
    }
  };

  /* Lanjutkan reveal untuk commit yang tersimpan (mis. setelah refresh) */
  const resumeReveal = async () => {
    if (!storedCommit || busy) return;
    setError(null);
    try {
      setPhase("waiting");
      await waitForBlockAfter(targetBlock);
      await doReveal(storedCommit.elementIndex, storedCommit.secret);
    } catch (err) {
      setPhase("idle");
      setError(humanizeError(err));
      refetchAll();
    }
  };

  /* Battle kedaluwarsa (atau secret hilang): selesaikan sebagai kalah */
  const forfeit = async () => {
    if (!address || !publicClient || forfeiting) return;
    setError(null);
    setForfeiting(true);
    try {
      const txHash = await writeContractAsync({
        address: BATU_API_ADDRESS,
        abi: batuApiAbi,
        functionName: "forfeitExpired",
        args: [address],
        chainId: CELO_CHAIN_ID,
      });
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      clearCommit(address);
      refetchAll();
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setForfeiting(false);
    }
  };

  const deposit = async (amount: number): Promise<string | null> => {
    if (!address || !publicClient) return "Hubungkan wallet dulu.";
    if (wrongChain) return "Pindah ke jaringan Celo dulu.";
    if (!Number.isFinite(amount) || amount <= 0)
      return "Masukkan jumlah yang valid.";
    if (amount > celo) return "Saldo CELO tidak cukup.";
    try {
      const txHash = await writeContractAsync({
        address: BATU_API_ADDRESS,
        abi: batuApiAbi,
        functionName: "deposit",
        value: parseEther(String(amount)),
        chainId: CELO_CHAIN_ID,
      });
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      refetchAll();
      return null;
    } catch (err) {
      return humanizeError(err);
    }
  };

  const withdraw = async (amount: number): Promise<string | null> => {
    if (!address || !publicClient) return "Hubungkan wallet dulu.";
    if (wrongChain) return "Pindah ke jaringan Celo dulu.";
    if (!Number.isFinite(amount) || amount <= 0)
      return "Masukkan jumlah yang valid.";
    if (amount < MIN_WITHDRAW)
      return `Withdraw minimal ${fmt(MIN_WITHDRAW, 0)} API (= 1 CELO).`;
    if (amount > api) return "Saldo API tidak cukup.";
    try {
      const txHash = await writeContractAsync({
        address: BATU_API_ADDRESS,
        abi: batuApiAbi,
        functionName: "withdraw",
        args: [parseUnits(String(Math.floor(amount)), 18)],
        chainId: CELO_CHAIN_ID,
      });
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      refetchAll();
      return null;
    } catch (err) {
      return humanizeError(err);
    }
  };

  const hudChips = [
    { icon: "🟡", label: "CELO", value: fmt(celo) },
    { icon: "🔥", label: "API", value: fmt(api, 0) },
    { icon: "🏺", label: "Pool", value: fmt(pool, 0) },
  ];

  /* Banner battle pending hanya saat tidak sedang dalam alur battle aktif */
  const showPendingBanner = pendingActive && !busy && phase !== "result";

  return (
    <ArenaAudioProvider>
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-blood-950 via-abyss-950 to-night">
      {/* Dekorasi atmosfer */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="animate-drift absolute -left-40 top-1/4 h-96 w-[40rem] rounded-full bg-abyss-600/10 blur-3xl" />
        <div
          className="animate-drift absolute -right-40 bottom-10 h-80 w-[36rem] rounded-full bg-ember-500/5 blur-3xl"
          style={{ animationDelay: "-9s" }}
        />
        <span className="animate-float-slow absolute right-[5%] top-32 rotate-12 text-5xl opacity-20 blur-[1px]">
          🍃
        </span>
        <span
          className="animate-float-slow absolute bottom-24 left-[3%] -rotate-12 text-4xl opacity-20 blur-[1px]"
          style={{ animationDelay: "2s" }}
        >
          🌿
        </span>
      </div>

      {/* Strip jaringan */}
      <p className="relative z-10 border-b border-ember-500/20 bg-ember-500/10 px-4 py-2 text-center text-xs text-ember-300">
        ⛓️ LIVE di Celo mainnet — battle memakai commit–reveal on-chain;
        menang dibayar 1.95× bet dari reward pool.
      </p>

      {/* HUD */}
      <header className="glass relative z-10 border-b border-white/5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Logo Batu Api"
              width={36}
              height={36}
              priority
              className="h-9 w-9 object-contain drop-shadow-[0_0_10px_rgba(255,138,30,0.35)]"
            />
            <span className="font-display text-lg tracking-wider text-cream">
              BATU <span className="text-ember-400">API</span>
            </span>
            <span className="ml-1 hidden text-xs text-abyss-300 sm:inline">
              ← kembali
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {isConnected &&
              hudChips.map((chip) => (
                <span
                  key={chip.label}
                  className="glass rounded-full border border-white/10 px-3 py-1.5 text-xs text-cream"
                >
                  {chip.icon}{" "}
                  <span className="text-abyss-300">{chip.label}</span>{" "}
                  <strong>{chip.value}</strong>
                </span>
              ))}
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus="address"
            />
          </div>
        </div>
      </header>

      {/* Konten utama */}
      <main className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-start gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {showPendingBanner && (
            <div className="rounded-2xl border border-ember-500/40 bg-ember-500/10 p-4 text-sm text-ember-200">
              <p className="font-semibold">
                ⏳ Ada battle yang belum di-reveal (bet{" "}
                {fmt(Number(formatUnits(pendingBet, 18)), 0)} API).
              </p>
              {commitMatches && !revealExpired && (
                <>
                  <p className="mt-1 text-ember-300/90">
                    {revealReady
                      ? "Block hash sudah tersedia — reveal sekarang untuk melihat hasilnya."
                      : "Menunggu 1 block lagi sebelum bisa reveal."}
                  </p>
                  <button
                    type="button"
                    onClick={resumeReveal}
                    className="btn-ember font-display mt-3 rounded-full px-6 py-2 text-sm tracking-wider"
                  >
                    🔓 LANJUTKAN REVEAL
                  </button>
                </>
              )}
              {!commitMatches && !revealExpired && (
                <p className="mt-1 text-ember-300/90">
                  Secret battle ini tidak ditemukan di browser ini (mungkin
                  di-commit dari perangkat lain). Tanpa secret, battle hanya
                  bisa diselesaikan lewat forfeit setelah ±256 block.
                </p>
              )}
              {revealExpired && (
                <>
                  <p className="mt-1 text-ember-300/90">
                    Jendela reveal sudah lewat. Forfeit untuk membuka arena
                    lagi (bet hangus ke pool).
                  </p>
                  <button
                    type="button"
                    onClick={forfeit}
                    disabled={forfeiting}
                    className="font-display mt-3 rounded-full border border-red-400/50 bg-red-500/10 px-6 py-2 text-sm tracking-wider text-red-300 disabled:opacity-50"
                  >
                    {forfeiting ? "MEMPROSES…" : "💀 FORFEIT"}
                  </button>
                </>
              )}
            </div>
          )}

          {error && (
            <p className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-300">
              ⚠️ {error}
            </p>
          )}

          <BattleStage
            phase={phase}
            result={result}
            selected={selected}
            onSelect={setSelected}
            bet={bet}
            onBetChange={setBet}
            apiBalance={api}
            poolMaxBet={poolMaxBet}
            spinElement={busy ? ELEMENTS[spinIndex].key : null}
            onFight={fight}
            onAgain={() => {
              setResult(null);
              setPhase("idle");
            }}
            disabled={pendingActive}
          />
        </div>
        <div className="space-y-6">
          <BankPanel
            celo={celo}
            api={api}
            busy={busy}
            onDeposit={deposit}
            onWithdraw={withdraw}
          />
          <HistoryPanel history={history} />
        </div>
      </main>

      {/* Overlay connect wallet */}
      {!isConnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/70 p-4 backdrop-blur-md">
          <div className="stitched w-full max-w-sm rounded-3xl bg-abyss-900/95 p-8 text-center shadow-2xl">
            <Image
              src="/logo.png"
              alt="Logo Batu Api"
              width={120}
              height={120}
              className="mx-auto h-28 w-28 object-contain drop-shadow-[0_0_24px_rgba(255,138,30,0.45)]"
            />
            <h1 className="font-display text-glow-soft mt-4 text-2xl tracking-wide text-cream">
              MASUK ARENA
            </h1>
            <p className="mt-3 text-sm text-abyss-300">
              Hubungkan wallet Celo-mu untuk mulai battle on-chain. Deposit
              CELO, terima API Coin, dan lawan sistem.
            </p>
            <button
              type="button"
              onClick={openConnectModal}
              className="btn-ember font-display mt-6 w-full rounded-2xl py-3.5 text-lg tracking-wider transition-transform hover:-translate-y-0.5"
            >
              CONNECT WALLET
            </button>
            <Link
              href="/"
              className="mt-4 inline-block text-xs text-abyss-300 transition-colors hover:text-ember-300"
            >
              ← Kembali ke beranda
            </Link>
          </div>
        </div>
      )}
    </div>
    </ArenaAudioProvider>
  );
}
