import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { Trash2, Copy, Play, Check, Clock, Star, Heart } from 'lucide-react';
import { playSoftClick, triggerHapticFeedback } from '../utils/feedback';

interface HistoryLogProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onToggleFavorite: (id: string) => void;
  onRemoveItem: (id: string) => void;
  useSound: boolean;
  useHaptics: boolean;
}

export default function HistoryLog({
  history,
  onSelect,
  onClear,
  onToggleFavorite,
  onRemoveItem,
  useSound,
  useHaptics,
}: HistoryLogProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleActionFeedback = () => {
    if (useSound) playSoftClick();
    if (useHaptics) triggerHapticFeedback();
  };

  const copyToClipboard = (text: string, id: string) => {
    handleActionFeedback();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center" id="empty-history-container">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary-fixed mb-4">
          <Clock size={32} />
        </div>
        <h3 className="text-xl font-semibold text-on-surface mb-2">No calculations yet</h3>
        <p className="text-on-secondary-container text-sm max-w-xs leading-relaxed">
          Your calculation history will appear here so you can easily review and reuse past results.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background" id="history-log-panel">
      {/* History Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-surface-container-high">
        <div>
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            Calculation History
          </h2>
          <span className="text-xs text-on-secondary-container font-mono">
            {history.length} {history.length === 1 ? 'record' : 'records'} saved
          </span>
        </div>
        <button
          onClick={() => {
            handleActionFeedback();
            onClear();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-950/40 active:scale-95 transition-all duration-150"
          title="Clear all history"
          id="clear-all-history-btn"
        >
          <Trash2 size={14} />
          Clear All
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-28">
        {history.map((item) => (
          <div
            key={item.id}
            className="group relative p-4 rounded-xl bg-surface-container-low border border-surface-container-high hover:border-surface-tint/20 transition-all duration-200"
            id={`history-item-${item.id}`}
          >
            {/* Timestamp & Top Line Buttons */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-on-secondary-container font-mono opacity-80 flex items-center gap-1">
                <Clock size={10} />
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              
              <div className="flex items-center gap-1">
                {/* Favorite Toggle button */}
                <button
                  onClick={() => {
                    handleActionFeedback();
                    onToggleFavorite(item.id);
                  }}
                  className={`p-1.5 rounded-md hover:bg-surface-container transition-colors ${
                    item.isFavorite ? 'text-orange-400' : 'text-on-secondary-container hover:text-on-surface'
                  }`}
                  title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={14} fill={item.isFavorite ? 'currentColor' : 'none'} />
                </button>

                {/* Copy button */}
                <button
                  onClick={() => copyToClipboard(item.result, item.id)}
                  className="p-1.5 rounded-md text-on-secondary-container hover:text-on-surface hover:bg-surface-container transition-colors"
                  title="Copy result"
                  id={`copy-res-${item.id}`}
                >
                  {copiedId === item.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>

                {/* Remove single item button */}
                <button
                  onClick={() => {
                    handleActionFeedback();
                    onRemoveItem(item.id);
                  }}
                  className="p-1.5 rounded-md text-on-secondary-container hover:text-red-400 hover:bg-red-950/20 transition-colors"
                  title="Delete record"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Expression and Result Display */}
            <div className="text-right select-all">
              <div className="text-on-secondary-container text-sm font-display-formula line-through-none opacity-70 break-all mb-1">
                {item.expression}
              </div>
              <div className="text-xl font-bold font-display-result text-on-surface break-all flex items-center justify-end gap-1">
                <span className="text-primary-fixed text-sm mr-auto font-normal opacity-60">=</span>
                {item.result}
              </div>
            </div>

            {/* Tap to reuse expression button */}
            <div className="mt-3 pt-2.5 border-t border-surface-container-high/40 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-[10px] text-on-secondary-container">Hovered item keypress options</span>
              <button
                onClick={() => {
                  handleActionFeedback();
                  onSelect(item);
                }}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-container font-medium transition-colors"
              >
                <Play size={12} className="fill-current" />
                Load to Calculator
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
