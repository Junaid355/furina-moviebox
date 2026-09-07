import React, { useState } from 'react';
import { X, Lock, Unlock, Eye, EyeOff, Flame, ShieldCheck } from 'lucide-react';

export default function MasterModeModal({
  isOpen,
  onClose,
  isMasterMode,
  setIsMasterMode,
  isStealthMode,
  setIsStealthMode,
  includeMature,
  setIncludeMature
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pin.trim() === '2030') {
      setIsMasterMode(true);
      setError(false);
      setPin('');
    } else {
      setError(true);
    }
  };

  const handleLock = () => {
    setIsMasterMode(false);
    setIncludeMature(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-md bg-[#091129] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(77,197,249,0.3)] p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              {isMasterMode ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-cyan-400" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Master Control & Secret Vault</h3>
              <p className="text-[11px] text-cyan-200/50">Passcode Protected</p>
            </div>
          </div>
          <button onClick={onClose} className="text-cyan-300/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Locked: PIN input */}
        {!isMasterMode ? (
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="bg-[#0c1938] border border-cyan-500/20 rounded-xl p-4 text-center">
              <Lock className="w-10 h-10 text-cyan-400/80 mx-auto mb-2" />
              <p className="text-xs text-cyan-200/70">
                Enter your secret 4-digit code to unlock the Master Vault and system controls.
              </p>
            </div>

            <div>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(false); }}
                placeholder="Enter PIN"
                className="w-full bg-[#070e24] border border-cyan-500/30 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 transition"
                autoFocus
              />
              {error && (
                <p className="text-rose-400 text-xs text-center mt-2 font-medium">
                  Incorrect code. Access denied.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-bold text-sm transition shadow-[0_0_20px_rgba(77,197,249,0.4)]"
            >
              Unlock Master Mode
            </button>
          </form>
        ) : (
          /* If Unlocked: Master Controls */
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Master Mode Active (Code: 2030)
              </div>
              <button
                onClick={handleLock}
                className="text-[11px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-md font-bold transition"
              >
                Lock Vault
              </button>
            </div>

            {/* Feature 1: 18+ Mature Content Vault */}
            <div className="bg-[#0c1836] border border-cyan-500/20 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                  <Flame className="w-4 h-4 text-amber-400" />
                  18+ Mature / Uncut Cinema
                </div>
                <p className="text-[11px] text-cyan-200/50 mt-0.5">
                  Includes R-rated, NC-17, and unfiltered releases.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIncludeMature(!includeMature)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  includeMature ? 'bg-amber-500' : 'bg-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  includeMature ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Feature 2: Stealth Disguise Mode */}
            <div className="bg-[#0c1836] border border-cyan-500/20 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                  {isStealthMode ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4 text-cyan-400" />}
                  Stealth Disguise Mode
                </div>
                <p className="text-[11px] text-cyan-200/50 mt-0.5">
                  Disguises as neutral StreamBox (hides Furina avatar & anime bg).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStealthMode(!isStealthMode)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  isStealthMode ? 'bg-cyan-500' : 'bg-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isStealthMode ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 transition"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
