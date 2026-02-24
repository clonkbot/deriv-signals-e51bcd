import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Minus,
  Trash2,
  Filter
} from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

export function SignalsPanel() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState<Id<"signals"> | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all");

  const signals = useQuery(api.signals.list, filter === "all" ? {} : { status: filter });
  const createSignal = useMutation(api.signals.create);
  const closeSignal = useMutation(api.signals.closeSignal);
  const removeSignal = useMutation(api.signals.remove);

  const [newSignal, setNewSignal] = useState({
    symbol: "",
    type: "BUY" as "BUY" | "SELL",
    strategy: "",
    entryPrice: "",
    targetPrice: "",
    stopLoss: "",
    confidence: 75,
    notes: "",
  });

  const handleCreate = async () => {
    if (!newSignal.symbol || !newSignal.entryPrice || !newSignal.strategy) return;

    await createSignal({
      symbol: newSignal.symbol.toUpperCase(),
      type: newSignal.type,
      strategy: newSignal.strategy,
      entryPrice: parseFloat(newSignal.entryPrice),
      targetPrice: newSignal.targetPrice ? parseFloat(newSignal.targetPrice) : undefined,
      stopLoss: newSignal.stopLoss ? parseFloat(newSignal.stopLoss) : undefined,
      confidence: newSignal.confidence,
      notes: newSignal.notes || undefined,
    });

    setNewSignal({
      symbol: "",
      type: "BUY",
      strategy: "",
      entryPrice: "",
      targetPrice: "",
      stopLoss: "",
      confidence: 75,
      notes: "",
    });
    setShowAddModal(false);
  };

  const [closeData, setCloseData] = useState({ exitPrice: "", result: "win" as "win" | "loss" | "breakeven" });

  const handleClose = async () => {
    if (!showCloseModal || !closeData.exitPrice) return;

    await closeSignal({
      id: showCloseModal,
      exitPrice: parseFloat(closeData.exitPrice),
      result: closeData.result,
    });

    setCloseData({ exitPrice: "", result: "win" });
    setShowCloseModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Signals
            </span>
          </h2>
          <p className="text-zinc-500 mt-1">Manage your trading signals</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus size={18} />
          New Signal
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "active", "closed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? "bg-white/10 text-white border border-white/20"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Filter size={14} className="inline mr-2" />
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Signals List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {signals?.map((signal: { _id: Id<"signals">; symbol: string; type: string; strategy: string; entryPrice: number; targetPrice?: number; stopLoss?: number; confidence: number; status: string; result?: string; pnlPercent?: number; notes?: string; createdAt: number }, i: number) => (
            <motion.div
              key={signal._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-4 md:p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Symbol & Type */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    signal.type === "BUY" ? "bg-emerald-500/20" : "bg-red-500/20"
                  }`}>
                    {signal.type === "BUY" ? (
                      <TrendingUp className="text-emerald-400" size={24} />
                    ) : (
                      <TrendingDown className="text-red-400" size={24} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-white">{signal.symbol}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                        signal.type === "BUY"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {signal.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                        signal.status === "active"
                          ? "bg-blue-500/20 text-blue-400"
                          : signal.status === "closed"
                          ? "bg-zinc-500/20 text-zinc-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {signal.status}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-sm">{signal.strategy}</p>
                  </div>
                </div>

                {/* Middle: Prices */}
                <div className="flex flex-wrap gap-4 md:gap-6">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Entry</p>
                    <p className="text-white font-mono">{signal.entryPrice.toFixed(5)}</p>
                  </div>
                  {signal.targetPrice && (
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Target size={10} /> Target
                      </p>
                      <p className="text-emerald-400 font-mono">{signal.targetPrice.toFixed(5)}</p>
                    </div>
                  )}
                  {signal.stopLoss && (
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                        <AlertTriangle size={10} /> Stop
                      </p>
                      <p className="text-red-400 font-mono">{signal.stopLoss.toFixed(5)}</p>
                    </div>
                  )}
                  {signal.result && (
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Result</p>
                      <div className="flex items-center gap-1">
                        {signal.result === "win" ? (
                          <CheckCircle size={14} className="text-emerald-400" />
                        ) : signal.result === "loss" ? (
                          <XCircle size={14} className="text-red-400" />
                        ) : (
                          <Minus size={14} className="text-zinc-400" />
                        )}
                        <span className={`font-semibold ${
                          signal.result === "win" ? "text-emerald-400" :
                          signal.result === "loss" ? "text-red-400" : "text-zinc-400"
                        }`}>
                          {signal.pnlPercent !== undefined ? `${signal.pnlPercent >= 0 ? "+" : ""}${signal.pnlPercent.toFixed(2)}%` : signal.result}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                  {signal.status === "active" && (
                    <button
                      onClick={() => setShowCloseModal(signal._id)}
                      className="px-3 py-2 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
                    >
                      Close Trade
                    </button>
                  )}
                  <button
                    onClick={() => removeSignal({ id: signal._id })}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(signal.createdAt).toLocaleString()}
                  </span>
                  <span>Confidence: {signal.confidence}%</span>
                </div>
                {signal.notes && (
                  <span className="text-zinc-600 truncate max-w-[200px]">{signal.notes}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {signals?.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <TrendingUp size={48} className="mx-auto mb-4 opacity-30" />
            <p>No signals found</p>
            <p className="text-sm mt-1">Create your first signal to get started</p>
          </div>
        )}
      </div>

      {/* Add Signal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0d0d14] rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">New Signal</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Symbol</label>
                    <input
                      type="text"
                      value={newSignal.symbol}
                      onChange={(e) => setNewSignal({ ...newSignal, symbol: e.target.value })}
                      placeholder="EUR/USD"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Type</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewSignal({ ...newSignal, type: "BUY" })}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          newSignal.type === "BUY"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/5 text-zinc-400 border border-white/10"
                        }`}
                      >
                        BUY
                      </button>
                      <button
                        onClick={() => setNewSignal({ ...newSignal, type: "SELL" })}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          newSignal.type === "SELL"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-white/5 text-zinc-400 border border-white/10"
                        }`}
                      >
                        SELL
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Strategy</label>
                  <input
                    type="text"
                    value={newSignal.strategy}
                    onChange={(e) => setNewSignal({ ...newSignal, strategy: e.target.value })}
                    placeholder="e.g., RSI Divergence"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Entry Price</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={newSignal.entryPrice}
                      onChange={(e) => setNewSignal({ ...newSignal, entryPrice: e.target.value })}
                      placeholder="1.08500"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Target</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={newSignal.targetPrice}
                      onChange={(e) => setNewSignal({ ...newSignal, targetPrice: e.target.value })}
                      placeholder="1.09000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Stop Loss</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={newSignal.stopLoss}
                      onChange={(e) => setNewSignal({ ...newSignal, stopLoss: e.target.value })}
                      placeholder="1.08200"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Confidence: {newSignal.confidence}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newSignal.confidence}
                    onChange={(e) => setNewSignal({ ...newSignal, confidence: parseInt(e.target.value) })}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Notes (optional)</label>
                  <textarea
                    value={newSignal.notes}
                    onChange={(e) => setNewSignal({ ...newSignal, notes: e.target.value })}
                    placeholder="Add any notes about this signal..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!newSignal.symbol || !newSignal.entryPrice || !newSignal.strategy}
                  className="w-full py-3.5 rounded-xl font-semibold text-black bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Signal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close Signal Modal */}
      <AnimatePresence>
        {showCloseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCloseModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#0d0d14] rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Close Trade</h3>
                <button
                  onClick={() => setShowCloseModal(null)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Exit Price</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={closeData.exitPrice}
                    onChange={(e) => setCloseData({ ...closeData, exitPrice: e.target.value })}
                    placeholder="1.08700"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Result</label>
                  <div className="flex gap-2">
                    {(["win", "loss", "breakeven"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setCloseData({ ...closeData, result: r })}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                          closeData.result === r
                            ? r === "win"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : r === "loss"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
                            : "bg-white/5 text-zinc-400 border border-white/10"
                        }`}
                      >
                        {r === "win" ? <CheckCircle size={16} /> : r === "loss" ? <XCircle size={16} /> : <Minus size={16} />}
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  disabled={!closeData.exitPrice}
                  className="w-full py-3.5 rounded-xl font-semibold text-black bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Close Trade
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
