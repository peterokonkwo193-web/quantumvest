"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

const WALLETS = [
  {
    id: "BTC",
    label: "Bitcoin",
    network: "BTC",
    address: "bc1qhr8k5y85vhc34zdp7rv9qjnxhyfft3a2sqww25",
    color: "#F7931A",
    symbol: "₿",
  },
  {
    id: "USDT",
    label: "Tether",
    network: "TRC20",
    address: "TCV4JZRmQkppiZgNquH4LzP2MFquUAjirT",
    color: "#26A17B",
    symbol: "₮",
  },
  {
    id: "ETH",
    label: "Ethereum",
    network: "ERC20",
    address: "0x95EbE8d1302Fb9F30278d743379fAdb4636b2077",
    color: "#627EEA",
    symbol: "Ξ",
  },
];

type Step = "amount" | "address" | "done";

export function DepositFlow({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState(WALLETS[0]);
  const [txHash, setTxHash] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function goToAddress() {
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setError("");
    setStep("address");
  }

  async function confirm() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/transactions/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          cryptoType: wallet.id,
          network: wallet.network,
          txHash: txHash.trim() || null,
          walletAddress: wallet.address,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Submission failed. Try again.");
        return;
      }
      setStep("done");
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep("amount");
    setAmount("");
    setTxHash("");
    setError("");
  }

  if (step === "done") {
    return (
      <div className="space-y-4 py-2 text-center">
        <CheckCircle className="mx-auto h-14 w-14 text-neon" />
        <p className="text-lg font-bold text-white">Deposit Submitted!</p>
        <p className="text-sm text-on-surface-variant">
          Admin will verify your payment and credit your account shortly.
        </p>
        <Button className="w-full" onClick={reset}>
          New Deposit
        </Button>
      </div>
    );
  }

  if (step === "address") {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="label-mono text-xs text-on-surface-variant">Send exactly</p>
          <p className="text-3xl font-bold text-neon">{formatCurrency(Number(amount))}</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            via {wallet.label} ({wallet.network})
          </p>
        </div>

        <div className="flex justify-center rounded-2xl bg-white p-5">
          <QRCodeSVG value={wallet.address} size={190} level="H" />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="mb-1 text-xs text-on-surface-variant">{wallet.network} Wallet Address</p>
          <div className="flex items-start gap-2">
            <code className="flex-1 break-all font-mono text-xs leading-relaxed text-neon">
              {wallet.address}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="mt-0.5 shrink-0"
              onClick={() => copy(wallet.address)}
              aria-label="Copy address"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-neon" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-3 py-2 text-xs text-yellow-300">
          Only send <strong>{wallet.id}</strong> ({wallet.network}) assets to this address.
          Other assets will be lost forever.
        </div>

        <div className="space-y-1">
          <label className="text-xs text-on-surface-variant">
            Transaction Hash{" "}
            <span className="text-white/40">(optional — speeds up verification)</span>
          </label>
          <Input
            placeholder="Paste TX hash after sending"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            className="font-mono text-xs"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button className="w-full" onClick={confirm} disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? "Submitting..." : "I've Sent Payment — Confirm"}
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => setStep("amount")}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs text-on-surface-variant">Amount (USD)</label>
        <Input
          type="number"
          placeholder="0.00"
          min="1"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError("");
          }}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-on-surface-variant">Select Payment Method</label>
        <div className="space-y-2">
          {WALLETS.map((w) => (
            <button
              key={w.id}
              onClick={() => setWallet(w)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                wallet.id === w.id
                  ? "border-neon bg-neon/5"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: w.color + "33", border: `1px solid ${w.color}66` }}
              >
                {w.symbol}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{w.label}</p>
                <p className="text-xs text-on-surface-variant">{w.network}</p>
              </div>
              {wallet.id === w.id && (
                <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-neon" />
              )}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <Button className="w-full" onClick={goToAddress} disabled={!amount}>
        Continue
      </Button>
    </div>
  );
}
