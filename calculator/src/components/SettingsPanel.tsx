import React from 'react';
import { CalculatorSettings } from '../types';
import { 
  Volume2, 
  Smartphone, 
  Sliders, 
  Palette, 
  Info, 
  RotateCcw, 
  Compass, 
  Sparkles,
  ExternalLink,
  Keyboard
} from 'lucide-react';
import { playSoftClick, triggerHapticFeedback } from '../utils/feedback';

interface SettingsPanelProps {
  settings: CalculatorSettings;
  onUpdateSettings: (settings: CalculatorSettings) => void;
  onResetSettings: () => void;
  historyCount: number;
}

export default function SettingsPanel({
  settings,
  onUpdateSettings,
  onResetSettings,
  historyCount,
}: SettingsPanelProps) {
  
  const handleToggle = (key: keyof CalculatorSettings) => {
    // Play sound & haptic
    const updatedValue = !settings[key];
    const newSettings = { ...settings, [key]: updatedValue };
    
    // Determine feedback based on current/new setting to ensure it plays immediately
    if (key === 'clickSound' ? updatedValue : settings.clickSound) {
      playSoftClick();
    }
    if (key === 'hapticFeedback' ? updatedValue : settings.hapticFeedback) {
      triggerHapticFeedback();
    }

    onUpdateSettings(newSettings);
  };

  const handleModeChange = (key: keyof CalculatorSettings, value: any) => {
    if (settings.clickSound) playSoftClick();
    if (settings.hapticFeedback) triggerHapticFeedback();
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="flex flex-col h-full bg-background text-on-surface" id="settings-panel">
      {/* Settings Header */}
      <div className="px-6 py-4 border-b border-surface-container-high flex justify-between items-center bg-surface-dim">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sliders size={18} className="text-primary" />
            Preferences
          </h2>
          <p className="text-xs text-on-secondary-container">Tailor your calculator feedback and values</p>
        </div>
        <button
          onClick={() => {
            if (settings.clickSound) playSoftClick();
            if (settings.hapticFeedback) triggerHapticFeedback();
            onResetSettings();
          }}
          className="p-2 text-on-secondary-container hover:text-primary hover:bg-surface-container-high rounded-full transition-all duration-150"
          title="Reset to Defaults"
          id="reset-settings-btn"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 pb-28">
        
        {/* Tactile & Sound section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-2">Feedback & Sensory</h3>
          
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-surface-container-high">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Volume2 size={18} />
              </div>
              <div>
                <p className="font-medium text-sm">Key Click Sound</p>
                <p className="text-xs text-on-secondary-container">Produces a highly satisfying micro-acoustic beep</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('clickSound')}
              className={`w-12 h-6 rounded-full transition-colors relative duration-200 focus:outline-none ${
                settings.clickSound ? 'bg-primary-container' : 'bg-surface-container-highest'
              }`}
              id="click-sound-toggle"
            >
              <span
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 block ${
                  settings.clickSound ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptics Toggle */}
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-surface-container-high">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Smartphone size={18} />
              </div>
              <div>
                <p className="font-medium text-sm">Haptic Vibration</p>
                <p className="text-xs text-on-secondary-container">Gentle haptic click pulse upon keypad taps</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('hapticFeedback')}
              className={`w-12 h-6 rounded-full transition-colors relative duration-200 focus:outline-none ${
                settings.hapticFeedback ? 'bg-primary-container' : 'bg-surface-container-highest'
              }`}
              id="haptic-toggle"
            >
              <span
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 block ${
                  settings.hapticFeedback ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Math Configuration */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-2">Math Operations</h3>

          {/* Decimal Precision Slider */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Sliders size={18} />
                </div>
                <div>
                  <p className="font-medium text-sm">Decimal Precision</p>
                  <p className="text-xs text-on-secondary-container">Max post-decimal places for calculations</p>
                </div>
              </div>
              <span className="font-mono bg-surface-container-highest text-primary-fixed font-bold px-2 py-0.5 rounded text-sm">
                {settings.decimalPrecision}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="9"
              value={settings.decimalPrecision}
              onChange={(e) => handleModeChange('decimalPrecision', parseInt(e.target.value))}
              className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
              id="decimal-precision-slider"
            />
            <div className="flex justify-between text-[10px] text-on-secondary-container font-mono px-1">
              <span>0 (Integers Only)</span>
              <span>5</span>
              <span>9 (Maximum)</span>
            </div>
          </div>

          {/* Angle Unit (for scientific mode computations) */}
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-surface-container-high">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Compass size={18} />
              </div>
              <div>
                <p className="font-medium text-sm">Trigonometry Angle Unit</p>
                <p className="text-xs text-on-secondary-container">Defaults trigonometric evaluations format</p>
              </div>
            </div>
            <div className="flex bg-surface-container rounded-lg p-1 border border-surface-container-high">
              <button
                onClick={() => handleModeChange('angleUnit', 'deg')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all duration-150 ${
                  settings.angleUnit === 'deg' 
                    ? 'bg-primary-container text-white shadow-sm' 
                    : 'text-on-secondary-container hover:text-on-surface'
                }`}
              >
                DEG
              </button>
              <button
                onClick={() => handleModeChange('angleUnit', 'rad')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all duration-150 ${
                  settings.angleUnit === 'rad' 
                    ? 'bg-primary-container text-white shadow-sm' 
                    : 'text-on-secondary-container hover:text-on-surface'
                }`}
              >
                RAD
              </button>
            </div>
          </div>
        </section>

        {/* Visual Theme Modes */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-2">Theme Selection</h3>
          <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Palette size={18} />
              </div>
              <div>
                <p className="font-medium text-sm">Styling presets</p>
                <p className="text-xs text-on-secondary-container">Choose an aesthetic backdrop variant</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => handleModeChange('theme', 'dark')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-surface-container-high border-primary-container text-primary-fixed font-semibold'
                    : 'bg-surface border-surface-container hover:border-surface-container-highest text-on-secondary-container'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-[#131313] border border-white/10 mx-auto mb-1.5" />
                <span className="text-xs">Deep Dark</span>
              </button>

              <button
                onClick={() => handleModeChange('theme', 'oled')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  settings.theme === 'oled'
                    ? 'bg-surface-container-high border-primary-container text-primary-fixed font-semibold'
                    : 'bg-surface border-surface-container hover:border-surface-container-highest text-on-secondary-container'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-[#000000] border border-white/20 mx-auto mb-1.5" />
                <span className="text-xs">True OLED</span>
              </button>

              <button
                onClick={() => handleModeChange('theme', 'bronze')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  settings.theme === 'bronze'
                    ? 'bg-surface-container-high border-primary-container text-primary-fixed font-semibold'
                    : 'bg-surface border-surface-container hover:border-surface-container-highest text-on-secondary-container'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-[#1a1c1c] border border-amber-900/40 mx-auto mb-1.5" />
                <span className="text-xs">Amber Gold</span>
              </button>
            </div>
          </div>
        </section>

        {/* Keyboard Instructions */}
        <section className="p-4 bg-surface-container-low/50 rounded-xl border border-surface-container-high/40 space-y-2">
          <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <Keyboard size={14} className="text-primary" />
            Desktop Hotkeys
          </h4>
          <p className="text-xs text-on-secondary-container leading-relaxed">
            Feel free to type operations using your desktop keyboard too! We support standard numeric items, <kbd className="px-1 py-0.5 bg-surface-container-high border border-surface-container-highest rounded text-[10px]">Enter</kbd> (equals), <kbd className="px-1 py-0.5 bg-surface-container-high border border-surface-container-highest rounded text-[10px]">Esc</kbd> or <kbd className="px-1 py-0.5 bg-surface-container-high border border-surface-container-highest rounded text-[10px]">Backpsace</kbd> (clear/delete).
          </p>
        </section>

        {/* App Info Footer */}
        <section className="flex flex-col items-center justify-center pt-4 pb-2 text-center text-xs text-on-secondary-container space-y-2">
          <div className="flex items-center gap-1">
            <Sparkles size={12} className="text-primary" />
            <span className="font-semibold">Precision Calculator v1.2</span>
          </div>
          <p className="max-w-xs leading-relaxed opacity-75">
            Designed and engineered for lightning speed, durable cloud-less standard calculations, and high tactile fidelity.
          </p>
        </section>

      </div>
    </div>
  );
}
