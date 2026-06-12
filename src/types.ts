export type Tab = 'calculator' | 'history' | 'settings';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
  isFavorite?: boolean;
}

export interface CalculatorSettings {
  decimalPrecision: number;
  clickSound: boolean;
  hapticFeedback: boolean;
  theme: 'dark' | 'oled' | 'bronze' | 'glass';
  angleUnit: 'deg' | 'rad';
  memoryValue: number;
}
