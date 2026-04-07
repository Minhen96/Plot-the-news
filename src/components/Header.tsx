"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { connectWallet, shortenAddress } from "@/lib/wallet";

export default function Header() {
  const [address, setAddress] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("walletAddress");
    if (saved) setAddress(saved);
  }, []);

  async function handleConnect() {
    const addr = await connectWallet();
    if (addr) {
      setAddress(addr);
      localStorage.setItem("walletAddress", addr);
    }
  }

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">&#x1f4dc;</span>
          <span className="text-xl font-bold tracking-tight text-zinc-900">
            Chronicle<span className="text-amber-600">Chain</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
          >
            Stories
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
          >
            Leaderboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {address ? (
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {shortenAddress(address)}
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
