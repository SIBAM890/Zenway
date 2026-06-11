import { useState } from 'react';
import type { Announcement } from '../types/alert';
import { Volume2, VolumeX, Mic, Check } from 'lucide-react';

interface PAPanelProps {
  announcements?: Announcement[];
  alertStatus: string;
}

export function PAPanel({ announcements, alertStatus }: PAPanelProps) {
  const [selectedLang, setSelectedLang] = useState<string>('English');
  const [speakingLang, setSpeakingLang] = useState<string | null>(null);

  if (!announcements || announcements.length === 0) {
    return (
      <div className="bg-[#0D160F] border border-[#1A3320] rounded-xl p-5 text-center text-gray-500 text-xs py-8 h-full flex items-center justify-center">
        No active PA announcements. Triggered on Critical Surge Alert.
      </div>
    );
  }

  const currentAnnouncement = announcements.find((a) => a.language === selectedLang) || announcements[0];

  // Map languages to browser voice locale codes
  const voiceMap: Record<string, string> = {
    'English': 'en-IN',
    'Hindi': 'hi-IN',
    'Tamil': 'ta-IN',
    'Telugu': 'te-IN',
    'Odia': 'or-IN', // fall back if voice not loaded
    'Bengali': 'bn-IN'
  };

  const handleSpeak = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      if (speakingLang === lang) {
        window.speechSynthesis.cancel();
        setSpeakingLang(null);
        return;
      }
      
      window.speechSynthesis.cancel(); // stop anything playing
      
      const utterance = new SpeechSynthesisUtterance(text);
      const locale = voiceMap[lang] || 'en-IN';
      utterance.lang = locale;

      // Find suitable voice matching locale
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang.startsWith(locale.split('-')[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => setSpeakingLang(null);
      utterance.onerror = () => setSpeakingLang(null);

      setSpeakingLang(lang);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported on this browser version.');
    }
  };

  return (
    <div className="bg-[#0D160F] border border-[#1A3320] rounded-xl p-5 shadow-lg h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-[#1C3B24] pb-3 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Mic className="w-4 h-4 text-[#4ADE80]" />
            Multilingual PA Announcement Desk
          </h3>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Bhashini API Engine</span>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4 border-b border-[#122316]/50 pb-2">
          {announcements.map((announce) => {
            const isSelected = announce.language === selectedLang;
            return (
              <button
                key={announce.language}
                onClick={() => setSelectedLang(announce.language)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-colors ${
                  isSelected
                    ? 'bg-[#1C3B24] text-white border border-[#2D5E3B]'
                    : 'text-gray-400 hover:text-white hover:bg-[#122316]/35'
                }`}
              >
                {announce.language}
              </button>
            );
          })}
        </div>

        {/* Selected language text script */}
        <div className="bg-[#080E09] border border-[#122316] rounded-lg p-4 min-h-[100px] flex flex-col justify-between relative overflow-hidden">
          {alertStatus === 'broadcasted' && (
            <div className="absolute top-2 right-2 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[8px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-widest">
              <Check className="w-2.5 h-2.5" />
              Live On-Air
            </div>
          )}
          
          <p className="text-sm font-semibold text-gray-200 leading-relaxed font-sans text-left">
            {currentAnnouncement.text}
          </p>

          <div className="flex items-center justify-between border-t border-[#1C3B24]/40 pt-3 mt-4">
            <span className="text-[10px] font-semibold text-gray-500 uppercase">
              PA Broadcaster Script ({selectedLang})
            </span>
            
            <button
              onClick={() => handleSpeak(currentAnnouncement.text, currentAnnouncement.language)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                speakingLang === currentAnnouncement.language
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                  : 'bg-[#1C3B24] hover:bg-[#2D5E3B] text-[#4ADE80] border border-[#2D5E3B]'
              }`}
            >
              {speakingLang === currentAnnouncement.language ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  Mute PA
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  Listen PA Audio
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-[10px] text-gray-500 border-t border-[#1C3B24]/40 pt-3 text-left">
        Note: Safety broadcasts are formatted automatically using neutral, non-alarmist phrasing to ensure orderly station flow management.
      </div>
    </div>
  );
}
