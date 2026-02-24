import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  Bell,
  MessageCircle,
  Mail,
  Phone,
  Smartphone,
  Save,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export function AlertSettingsPanel() {
  const settings = useQuery(api.alertSettings.get);
  const updateSettings = useMutation(api.alertSettings.update);

  const [localSettings, setLocalSettings] = useState({
    telegramEnabled: false,
    telegramChatId: "",
    emailEnabled: false,
    email: "",
    smsEnabled: false,
    phoneNumber: "",
    pushEnabled: false,
    minConfidence: 70,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        telegramEnabled: settings.telegramEnabled,
        telegramChatId: settings.telegramChatId || "",
        emailEnabled: settings.emailEnabled,
        email: settings.email || "",
        smsEnabled: settings.smsEnabled,
        phoneNumber: settings.phoneNumber || "",
        pushEnabled: settings.pushEnabled,
        minConfidence: settings.minConfidence,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      telegramEnabled: localSettings.telegramEnabled,
      telegramChatId: localSettings.telegramChatId || undefined,
      emailEnabled: localSettings.emailEnabled,
      email: localSettings.email || undefined,
      smsEnabled: localSettings.smsEnabled,
      phoneNumber: localSettings.phoneNumber || undefined,
      pushEnabled: localSettings.pushEnabled,
      minConfidence: localSettings.minConfidence,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const channels = [
    {
      id: "telegram",
      name: "Telegram",
      icon: <MessageCircle size={20} />,
      enabled: localSettings.telegramEnabled,
      color: "cyan",
      field: "telegramChatId",
      fieldValue: localSettings.telegramChatId,
      placeholder: "Enter your Telegram Chat ID",
    },
    {
      id: "email",
      name: "Email",
      icon: <Mail size={20} />,
      enabled: localSettings.emailEnabled,
      color: "violet",
      field: "email",
      fieldValue: localSettings.email,
      placeholder: "Enter your email address",
    },
    {
      id: "sms",
      name: "SMS",
      icon: <Phone size={20} />,
      enabled: localSettings.smsEnabled,
      color: "amber",
      field: "phoneNumber",
      fieldValue: localSettings.phoneNumber,
      placeholder: "Enter your phone number",
    },
    {
      id: "push",
      name: "Push Notifications",
      icon: <Smartphone size={20} />,
      enabled: localSettings.pushEnabled,
      color: "emerald",
      field: null,
      fieldValue: null,
      placeholder: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Alert Settings
          </span>
        </h2>
        <p className="text-zinc-500 mt-1">Configure how you receive trading alerts</p>
      </div>

      {/* Notification Channels */}
      <div className="grid gap-4">
        {channels.map((channel) => (
          <motion.div
            key={channel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${channel.color}-500/20 text-${channel.color}-400 flex items-center justify-center`}>
                  {channel.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{channel.name}</h3>
                  <p className="text-zinc-500 text-sm">
                    {channel.enabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const key = `${channel.id}Enabled` as keyof typeof localSettings;
                  setLocalSettings((prev) => ({ ...prev, [key]: !prev[key] }));
                }}
                className={`relative w-14 h-8 rounded-full transition-all ${
                  channel.enabled ? `bg-${channel.color}-500` : "bg-zinc-700"
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
                    channel.enabled ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            {channel.enabled && channel.field && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <input
                  type={channel.id === "email" ? "email" : "text"}
                  value={channel.fieldValue || ""}
                  onChange={(e) => setLocalSettings({ ...localSettings, [channel.field!]: e.target.value })}
                  placeholder={channel.placeholder || ""}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 mt-2"
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Minimum Confidence */}
      <div className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Minimum Confidence</h3>
            <p className="text-zinc-500 text-sm">
              Only send alerts for signals with confidence above this threshold
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            value={localSettings.minConfidence}
            onChange={(e) => setLocalSettings({ ...localSettings, minConfidence: parseInt(e.target.value) })}
            className="flex-1 accent-emerald-500"
          />
          <div className="w-16 text-center">
            <span className="text-2xl font-bold text-white">{localSettings.minConfidence}</span>
            <span className="text-zinc-500 text-sm">%</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {[50, 60, 70, 80, 90].map((val) => (
            <button
              key={val}
              onClick={() => setLocalSettings({ ...localSettings, minConfidence: val })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                localSettings.minConfidence === val
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-zinc-400 border border-white/10 hover:border-white/20"
              }`}
            >
              {val}%
            </button>
          ))}
        </div>
      </div>

      {/* Webhook Info */}
      <div className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">TradingView Webhook</h3>
            <p className="text-zinc-500 text-sm">
              Connect TradingView alerts to receive signals automatically
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Webhook URL</p>
          <code className="text-sm text-emerald-400 font-mono break-all">
            https://api.derivsignals.com/webhook/tradingview
          </code>
          <p className="text-xs text-zinc-600 mt-3">
            Add this URL to your TradingView alerts to automatically create signals
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            saved
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:from-emerald-400 hover:to-cyan-400"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle size={18} />
              Saved!
            </>
          ) : (
            <>
              <Save size={18} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
