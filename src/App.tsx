import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Activity
} from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { SignalsPanel } from "./components/SignalsPanel";
import { WatchlistPanel } from "./components/WatchlistPanel";
import { AlertSettingsPanel } from "./components/AlertSettingsPanel";
import { StrategiesPanel } from "./components/StrategiesPanel";
import { AuthForm } from "./components/AuthForm";

type Tab = "dashboard" | "signals" | "watchlist" | "strategies" | "settings";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-zinc-400 font-mono text-sm">Initializing...</span>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={18} /> },
    { id: "signals", label: "Signals", icon: <Activity size={18} /> },
    { id: "watchlist", label: "Watchlist", icon: <TrendingUp size={18} /> },
    { id: "strategies", label: "Strategies", icon: <Activity size={18} /> },
    { id: "settings", label: "Alerts", icon: <Bell size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }}
      />

      <div className="relative flex flex-col lg:flex-row min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                <TrendingUp size={18} className="text-black" />
              </div>
              <span className="font-bold tracking-tight">DerivSignals</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence>
          {(mobileMenuOpen || true) && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: mobileMenuOpen ? 0 : -280 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed lg:static lg:translate-x-0 top-0 left-0 z-50 w-64 h-screen bg-[#0d0d14] border-r border-white/5 flex flex-col ${
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
              }`}
              style={{ transform: undefined }}
            >
              {/* Logo */}
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <TrendingUp size={22} className="text-black" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg tracking-tight">DerivSignals</h1>
                    <p className="text-xs text-zinc-500 font-mono">v2.0.0</p>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="flex-1 p-4 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"
                      />
                    )}
                  </button>
                ))}
              </nav>

              {/* User Section */}
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
          <div className="p-4 md:p-6 lg:p-8 min-h-screen flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                {activeTab === "dashboard" && <Dashboard />}
                {activeTab === "signals" && <SignalsPanel />}
                {activeTab === "watchlist" && <WatchlistPanel />}
                {activeTab === "strategies" && <StrategiesPanel />}
                {activeTab === "settings" && <AlertSettingsPanel />}
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <footer className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-zinc-600 font-mono">
                Requested by <span className="text-zinc-500">@davionbr</span> · Built by <span className="text-zinc-500">@clonkbot</span>
              </p>
            </footer>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d14]/95 backdrop-blur-xl border-t border-white/5 safe-area-pb">
        <div className="flex justify-around items-center py-2">
          {tabs.slice(0, 4).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "text-emerald-400"
                  : "text-zinc-500"
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              activeTab === "settings"
                ? "text-emerald-400"
                : "text-zinc-500"
            }`}
          >
            <Settings size={18} />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
