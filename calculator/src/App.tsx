import React, { useState, useEffect } from 'react';
import { Tab, HistoryItem, CalculatorSettings } from './types';
import Calculator from './components/Calculator';
import HistoryLog from './components/HistoryLog';
import SettingsPanel from './components/SettingsPanel';
import { LayoutGrid, History, Settings, Sparkles } from 'lucide-react';
import { playSoftClick, triggerHapticFeedback } from './utils/feedback';

const DEFAULT_SETTINGS: CalculatorSettings = {
  decimalPrecision: 4,
  clickSound: true,
  hapticFeedback: true,
  theme: 'dark',
  angleUnit: 'deg',
  memoryValue: 0,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  
  // Persist calculator state & preferences
  const [settings, setSettings] = useState<CalculatorSettings>(() => {
    try {
      const saved = localStorage.getItem('precision_calc_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('precision_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save configurations when changed
  useEffect(() => {
    localStorage.setItem('precision_calc_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('precision_calc_history', JSON.stringify(history));
  }, [history]);

  // Apply visual theme to document body
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-oled', 'theme-bronze');
    if (settings.theme === 'oled') {
      root.classList.add('theme-oled');
      root.style.backgroundColor = '#000000';
    } else if (settings.theme === 'bronze') {
      root.classList.add('theme-bronze');
      root.style.backgroundColor = '#161311';
    } else {
      root.classList.add('theme-dark');
      root.style.backgroundColor = '#131313';
    }
  }, [settings.theme]);

  // Sounds & vibrations
  const triggerTabFeedback = () => {
    if (settings.clickSound) playSoftClick();
    if (settings.hapticFeedback) triggerHapticFeedback();
  };

  const handleSaveHistory = (expression: string, result: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      expression,
      result,
      timestamp: new Date().toISOString(),
      isFavorite: false,
    };
    setHistory(prev => [newItem, ...prev].slice(0, 100)); // Limit to last 100 items
  };

  const handleToggleFavorite = (id: string) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    // Navigate tab back to standard calculator and set active expression placeholder triggers
    // We trigger standard input simulation
    setActiveTab('calculator');
    
    // Dispatch a custom event to notify Calculator component of expression override loading
    const selectEvent = new CustomEvent('load-calculator-expression', {
      detail: { expression: item.expression, result: item.result }
    });
    window.dispatchEvent(selectEvent);
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // Determine container style classes based on active theme choice
  const getThemeWrapperClass = () => {
    switch (settings.theme) {
      case 'oled':
        return 'bg-black text-white';
      case 'bronze':
        return 'bg-[#161311] text-[#f7f5f3]';
      case 'dark':
      default:
        return 'bg-[#131313] text-[#e5e2e1]';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between overflow-hidden font-sans ${getThemeWrapperClass()}`} id="app-root-wrapper">
      
      {/* Active Tab Screen Content Panel */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'calculator' && (
          <Calculator
            settings={settings}
            onSaveHistory={handleSaveHistory}
            onNavigateToTab={(tab) => {
              triggerTabFeedback();
              setActiveTab(tab);
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryLog
            history={history}
            onSelect={handleSelectHistoryItem}
            onClear={handleClearHistory}
            onToggleFavorite={handleToggleFavorite}
            onRemoveItem={handleRemoveHistoryItem}
            useSound={settings.clickSound}
            useHaptics={settings.hapticFeedback}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            settings={settings}
            onUpdateSettings={setSettings}
            onResetSettings={handleResetSettings}
            historyCount={history.length}
          />
        )}
      </main>

      {/* Persistent Tactile Bottom Navigation Bar */}
      <nav 
        className={`fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-3 pb-6 border-t ${
          settings.theme === 'oled' 
            ? 'bg-black border-neutral-900' 
            : settings.theme === 'bronze'
              ? 'bg-[#1c1815] border-amber-950/40'
              : 'bg-[#171717] border-[#222222]'
        }`}
        id="persistent-bottom-nav"
      >
        {/* Tab 1: Calculator */}
        <button
          onClick={() => {
            triggerTabFeedback();
            setActiveTab('calculator');
          }}
          className={`flex flex-col items-center justify-center rounded-full p-3 transition-all duration-200 ${
            activeTab === 'calculator'
              ? 'bg-primary-container text-white scale-105 shadow-md shadow-primary-container/20'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-white/[0.04]'
          }`}
          title="Calculator Grid"
          id="tab-calculator-btn"
        >
          <LayoutGrid size={22} />
        </button>

        {/* Tab 2: History Log */}
        <button
          onClick={() => {
            triggerTabFeedback();
            setActiveTab('history');
          }}
          className={`flex flex-col items-center justify-center rounded-full p-3 transition-all duration-200 ${
            activeTab === 'history'
              ? 'bg-primary-container text-white scale-105 shadow-md shadow-primary-container/20'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-white/[0.04]'
          }`}
          title="History Log"
          id="tab-history-btn"
        >
          <History size={22} />
        </button>

        {/* Tab 3: Preference Preferences */}
        <button
          onClick={() => {
            triggerTabFeedback();
            setActiveTab('settings');
          }}
          className={`flex flex-col items-center justify-center rounded-full p-3 transition-all duration-200 ${
            activeTab === 'settings'
              ? 'bg-primary-container text-white scale-105 shadow-md shadow-primary-container/20'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-white/[0.04]'
          }`}
          title="Preferences & Settings"
          id="tab-settings-btn"
        >
          <Settings size={22} />
        </button>
      </nav>

    </div>
  );
}
