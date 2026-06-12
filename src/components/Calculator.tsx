import React, { useState, useEffect, useRef } from 'react';
import { 
  HistoryItem, 
  CalculatorSettings 
} from '../types';
import { 
  evaluateExpression, 
  formatFormula, 
  formatNumber 
} from '../utils/calculatorEngine';
import { 
  playSoftClick, 
  triggerHapticFeedback 
} from '../utils/feedback';
import { 
  RotateCcw, 
  Clock, 
  ChevronRight, 
  Grid3X3, 
  Sparkles, 
  Copy, 
  Check, 
  HelpCircle,
  Delete,
  BookOpen
} from 'lucide-react';

interface CalculatorProps {
  settings: CalculatorSettings;
  onSaveHistory: (expression: string, result: string) => void;
  onNavigateToTab: (tab: 'calculator' | 'history' | 'settings') => void;
}

export default function Calculator({
  settings,
  onSaveHistory,
  onNavigateToTab,
}: CalculatorProps) {
  // Calculator state
  const [formula, setFormula] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [isNewCalculation, setIsNewCalculation] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [scientificMode, setScientificMode] = useState<boolean>(false);
  const [activeOperator, setActiveOperator] = useState<string | null>(null);

  const displayRef = useRef<HTMLDivElement>(null);

  // Play audio/haptic click feedback
  const triggerFeedback = () => {
    if (settings.clickSound) playSoftClick();
    if (settings.hapticFeedback) triggerHapticFeedback();
  };

  // Sound and feedback for key actions
  const handleKeyPress = (char: string) => {
    triggerFeedback();

    if (isNewCalculation && /^[0-9.]/.test(char)) {
      setDisplayValue(char === '.' ? '0.' : char);
      setIsNewCalculation(false);
      return;
    }

    if (char === '.') {
      // Find the last number token in our formula/display to verify if it already contains a decimal
      const lastNumberPart = displayValue.split(/[\+\−\×\÷\*\/\-]/).pop() || '';
      if (lastNumberPart.includes('.')) return; // Already has a dot
      setDisplayValue(prev => prev === '' ? '0.' : prev + '.');
      setIsNewCalculation(false);
      return;
    }

    setDisplayValue(prev => {
      if (prev === '0') return char;
      return prev + char;
    });
    setIsNewCalculation(false);
  };

  // Active operator keystroke handler
  const handleOperator = (op: string) => {
    triggerFeedback();
    
    let currentInput = displayValue;
    
    // If we have an active calculation starting with 'Error' or 'Infinity', clear it
    if (currentInput === 'Error' || currentInput === 'Infinity') {
      currentInput = '0';
    }

    // Set the overall math operation formulas
    if (isNewCalculation) {
      // Allow chaining from the previous result
      setFormula(currentInput + op);
    } else {
      setFormula(prev => prev + currentInput + op);
    }

    setActiveOperator(op);
    setIsNewCalculation(true);
  };

  // Equals execution
  const handleEvaluate = () => {
    triggerFeedback();

    if (isNewCalculation && formula === '') return;

    let finalExpression = formula + displayValue;
    
    // Clean up trailing operators if the user hit Equals directly after an operator
    if (/[\+\−\×\÷\*\/\-]$/.test(finalExpression)) {
      finalExpression = finalExpression.slice(0, -1);
    }

    if (!finalExpression) return;

    const result = evaluateExpression(finalExpression, settings.decimalPrecision);
    
    // Save history
    if (result !== 'Error' && result !== 'Infinity') {
      onSaveHistory(formatFormula(finalExpression), formatNumber(result, settings.decimalPrecision));
    }

    // Update screen display
    setFormula('');
    setDisplayValue(result);
    setIsNewCalculation(true);
    setActiveOperator(null);
  };

  // Backspace/Delete (removes last char)
  const handleBackspace = () => {
    triggerFeedback();
    if (isNewCalculation) {
      setFormula('');
      setDisplayValue('0');
      return;
    }

    setDisplayValue(prev => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  };

  // Clear / All Clear
  const handleClear = () => {
    triggerFeedback();
    setFormula('');
    setDisplayValue('0');
    setIsNewCalculation(true);
    setActiveOperator(null);
  };

  // Plus Minus negation toggle
  const handlePlusMinus = () => {
    triggerFeedback();
    if (displayValue === '0' || displayValue === 'Error') return;
    
    setDisplayValue(prev => {
      if (prev.startsWith('-')) {
        return prev.slice(1);
      } else {
        return '-' + prev;
      }
    });
    setIsNewCalculation(false);
  };

  // Percentage conversion
  const handlePercentage = () => {
    triggerFeedback();
    if (displayValue === '0' || displayValue === 'Error') return;

    try {
      const parsedVal = parseFloat(displayValue);
      if (!isNaN(parsedVal)) {
        // Simple division by 100
        const pctResult = parsedVal / 100;
        setDisplayValue(pctResult.toString());
        setIsNewCalculation(false);
      }
    } catch {
      setDisplayValue('Error');
    }
  };

  // Scientific calculation functions
  const handleScientificFunc = (funcName: string) => {
    triggerFeedback();
    let currentNum = parseFloat(displayValue);
    if (isNaN(currentNum)) return;

    // Standard degree-radian conversion multiplier
    const factor = settings.angleUnit === 'deg' ? Math.PI / 180 : 1;
    let computed = 0;

    switch (funcName) {
      case 'sin':
        computed = Math.sin(currentNum * factor);
        break;
      case 'cos':
        computed = Math.cos(currentNum * factor);
        break;
      case 'tan':
        computed = Math.tan(currentNum * factor);
        break;
      case 'ln':
        computed = Math.log(currentNum);
        break;
      case 'log':
        computed = Math.log10(currentNum);
        break;
      case 'sqrt':
        computed = Math.sqrt(currentNum);
        break;
      case 'sqr':
        computed = Math.pow(currentNum, 2);
        break;
      case 'pi':
        computed = Math.PI;
        break;
      case 'e':
        computed = Math.E;
        break;
      default:
        return;
    }

    if (isNaN(computed) || !isFinite(computed)) {
      setDisplayValue('Error');
    } else {
      // Format correctly
      const places = settings.decimalPrecision;
      const rounded = parseFloat(computed.toFixed(places));
      setDisplayValue(rounded.toString());
    }
    setIsNewCalculation(true);
  };

  // Keyboard desktop hotkeys support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement?.tagName;
      if (activeElement === 'INPUT' || activeElement === 'TEXTAREA') return;

      const key = e.key;
      
      if (/[0-9]/.test(key)) {
        handleKeyPress(key);
      } else if (key === '.') {
        handleKeyPress('.');
      } else if (key === '+') {
        handleOperator('+');
      } else if (key === '-') {
        handleOperator('−');
      } else if (key === '*') {
        handleOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (key === '%') {
        handlePercentage();
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEvaluate();
      } else if (key === 'Escape') {
        handleClear();
      } else if (key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayValue, formula, isNewCalculation, settings]);

  // Listen to select history item events to load them into the calculator
  useEffect(() => {
    const handleLoadExpression = (e: Event) => {
      const customEvent = e as CustomEvent<{ expression: string; result: string }>;
      if (customEvent.detail) {
        // Remove standard thousand comma formatting before placing back to core displays
        const rawResult = customEvent.detail.result.replace(/,/g, '');
        
        setFormula('');
        setDisplayValue(rawResult);
        setIsNewCalculation(true);
        setActiveOperator(null);
      }
    };

    window.addEventListener('load-calculator-expression', handleLoadExpression);
    return () => window.removeEventListener('load-calculator-expression', handleLoadExpression);
  }, []);

  const copyToClipboard = () => {
    triggerFeedback();
    navigator.clipboard.writeText(displayValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Swipe-to-delete gesture emulation on display panel
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    // Swiped left or right by at least 50px
    if (Math.abs(diff) > 50) {
      handleBackspace();
    }
    setTouchStart(null);
  };

  // Let's format visual states
  const showFormula = formula !== '';
  const isAllClear = displayValue === '0' && formula === '';

  return (
    <div className="flex flex-col h-full bg-background transition-colors duration-300 select-none pb-20 justify-between" id="calculator-panel">
      
      {/* Top action header info */}
      <header className="flex justify-between items-center px-6 py-4 w-full bg-surface-dim border-b border-surface-container-low">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary-container">
            <span className="font-bold text-lg font-mono">±</span>
          </div>
          <span className="font-sans text-lg font-bold text-on-surface">Calculator</span>
        </div>
        
        {/* Toggle between basic and pro-scientific mode */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerFeedback();
              setScientificMode(prev => !prev);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1 transition-all ${
              scientificMode 
                ? 'bg-primary-container border-primary-container text-white' 
                : 'bg-surface-container border-surface-container-high text-on-secondary-container hover:text-on-surface'
            }`}
            id="scientific-toggle-btn"
          >
            <Sparkles size={12} />
            <span>{scientificMode ? 'Basic' : 'Sci-Fi'}</span>
          </button>

          <button
            onClick={() => {
              triggerFeedback();
              onNavigateToTab('history');
            }}
            className="p-2 rounded-full hover:bg-surface-container-high text-on-secondary-container hover:text-on-surface transition-colors"
            title="Open History"
            id="quick-history-btn"
          >
            <Clock size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-end">
        {/* Display Area and gesture listener */}
        <div 
          onClick={copyToClipboard}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          title="Click to copy, swipe left/right to slice digits"
          className="flex flex-col items-end px-6 pb-6 cursor-pointer space-y-2 group transition-all duration-200 hover:bg-white/[0.01]"
          id="calculator-display-container"
        >
          {/* Live copying visual popup indicator */}
          <div className="h-4 flex items-center">
            {copied && (
              <span className="text-[10px] bg-primary-container text-white px-2 py-0.5 rounded-full font-mono flex items-center gap-1 animate-pulse">
                <Check size={9} /> Copy Clipboard
              </span>
            )}
            {!copied && isNewCalculation && displayValue !== '0' && (
              <span className="text-[10px] text-on-secondary-container opacity-0 group-hover:opacity-60 transition-opacity duration-150 flex items-center gap-1">
                <Copy size={9} /> Click to Copy
              </span>
            )}
          </div>

          {/* Scrolling parenthesised context expression in real-time formula */}
          <div className="text-on-secondary-container font-mono text-lg opacity-80 min-h-8 text-right break-all transition-all">
            {showFormula ? formatFormula(formula) : ' '}
          </div>

          {/* Dynamic scaling display result */}
          <div 
            ref={displayRef}
            className={`text-on-surface text-right font-display-result font-light break-all grow tracking-tight transition-all duration-150 ${
              displayValue.length > 15 
                ? 'text-3xl' 
                : displayValue.length > 10 
                  ? 'text-4xl' 
                  : displayValue.length > 7 
                    ? 'text-5xl lg:text-6xl' 
                    : 'text-6xl lg:text-7xl'
            }`}
            id="calc-screen-display"
          >
            {formatNumber(displayValue, settings.decimalPrecision) === 'Error' 
              ? displayValue 
              : formatNumber(displayValue, settings.decimalPrecision)}
          </div>
        </div>

        {/* Scientific Advanced Options Layer */}
        {scientificMode && (
          <div className="grid grid-cols-5 gap-2 px-6 pb-3 ease-in-out duration-300" id="scientific-panel">
            <button
              onClick={() => handleScientificFunc('sin')}
              className="h-11 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary-fixed border border-surface-container"
            >
              sin
            </button>
            <button
              onClick={() => handleScientificFunc('cos')}
              className="h-11 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary-fixed border border-surface-container"
            >
              cos
            </button>
            <button
              onClick={() => handleScientificFunc('tan')}
              className="h-11 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary-fixed border border-surface-container"
            >
              tan
            </button>
            <button
              onClick={() => handleScientificFunc('pi')}
              className="h-11 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary-fixed border border-surface-container font-mono"
            >
              π
            </button>
            <button
              onClick={() => handleScientificFunc('e')}
              className="h-11 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary-fixed border border-surface-container font-mono"
            >
              e
            </button>

            <button
              onClick={() => handleScientificFunc('sqrt')}
              className="h-11 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary-fixed border border-surface-container"
            >
              √x
            </button>
            <button
              onClick={() => handleScientificFunc('sqr')}
              className="h-11 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary-fixed border border-surface-container"
            >
              x²
            </button>
            <button
              onClick={() => handleScientificFunc('ln')}
              className="h-11 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary-fixed border border-surface-container"
            >
              ln
            </button>
            <button
              onClick={() => handleScientificFunc('log')}
              className="h-11 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary-fixed border border-surface-container"
            >
              log
            </button>
            <button
              onClick={() => {
                triggerFeedback();
                setDisplayValue(prev => prev === '0' ? '(' : prev + '(');
              }}
              className="h-11 text-xs font-bold rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary-fixed border border-surface-container"
            >
              (
            </button>
          </div>
        )}

        {/* Regular Tactile Keygrid Keypad */}
        <div className="grid grid-cols-4 gap-3 px-4 pb-4 w-full select-none" id="calc-grid-layout">
          {/* Row 1: Action Modifier Operations */}
          <button
            onClick={handleClear}
            className="h-18 rounded-full bg-secondary text-surface text-xl font-bold active:scale-95 hover:brightness-110 transition-all duration-150"
            id="key-clear"
          >
            {isAllClear ? 'AC' : 'C'}
          </button>
          
          <button
            onClick={handlePlusMinus}
            className="h-18 rounded-full bg-secondary text-surface text-xl font-bold active:scale-95 hover:brightness-110 transition-all duration-150 flex items-center justify-center font-mono"
            id="key-plus-minus"
          >
            ⁺∕₋
          </button>
          
          <button
            onClick={handlePercentage}
            className="h-18 rounded-full bg-secondary text-surface text-xl font-bold active:scale-95 hover:brightness-110 transition-all duration-150"
            id="key-percent"
          >
            %
          </button>
          
          <button
            onClick={() => handleOperator('÷')}
            className={`h-18 rounded-full text-white text-3xl font-semibold active:scale-95 hover:brightness-110 transition-all duration-150 flex items-center justify-center ${
              activeOperator === '÷' ? 'bg-white text-primary-container border-2 border-primary-container' : 'bg-primary-container'
            }`}
            id="key-div"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleKeyPress('7')}
            className="h-18 rounded-full bg-surface-container-highest text-white text-2xl active:scale-95 hover:brightness-110 transition-all duration-150"
            id="key-7"
          >
            7
          </button>
          <button
            onClick={() => handleKeyPress('8')}
            className="h-18 rounded-full bg-surface-container-highest text-white text-2xl active:scale-95 hover:brightness-110 transition-all duration-150"
            id="key-8"
          >
            8
          </button>
          <button
            onClick={() => handleKeyPress('9')}
            className="h-18 rounded-full bg-surface-container-highest text-white text-2xl active:scale-95 hover:brightness-110 transition-all duration-150"
            id="key-9"
          >
            9
          </button>
          <button
            onClick={() => handleOperator('×')}
            className={`h-18 rounded-full text-white text-3xl font-semibold active:scale-95 hover:brightness-110 transition-all duration-150 flex items-center justify-center ${
              activeOperator === '×' ? 'bg-white text-primary-container border-2 border-primary-container' : 'bg-primary-container'
            }`}
            id="key-mul"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleKeyPress('4')}
            className="h-18 rounded-full bg-surface-container-highest text-white text-2xl active:scale-95 hover:brightness-110 transition-all duration-150"
            id="key-4"
          >
            4
          </button>
          <button
            onClick={() => handleKeyPress('5')}
            className="h-18 rounded-full bg-surface-container-highest text-white text-2xl active:scale-95 hover:brightness-110 transition-all duration-150"
            id="key-5"
          >
            5
          </button>
          <button
            onClick={() => handleKeyPress('6')}
            className="h-18 rounded-full bg-surface-container-highest text-white text-2xl active:scale-95 hover:brightness-110 transition-all duration-150"
            id="key-6"
          >
            6
          </button>
          <button
            onClick={() => handleOperator('−')}
            className={`h-18 rounded-full text-white text-3xl font-semibold active:scale-95 hover:brightness-110 transition-all duration-150 flex items-center justify-center ${
              activeOperator === '−' ? 'bg-white text-primary-container border-2 border-primary-container' : 'bg-primary-container'
            }`}
            id="key-sub"
          >
            −
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleKeyPress('1')}
            className="h-18 rounded-full bg-surface-container-highest text-white text-2xl active:scale-95 hover:brightness-110 transition-all duration-150"
            id="key-1"
          >
            1
          </button>
          <button
            onClick={() => handleKeyPress('2')}
            className="h-18 rounded-full bg-surface-container-highest text-white text-2xl active:scale-95 hover:brightness-110 transition-all duration-150"
            id="key-2"
          >
            2
          </button>
          <button
            onClick={() => handleKeyPress('3')}
            className="h-18 rounded-full bg-surface-container-highest text-white text-2xl active:scale-95 hover:brightness-110 transition-all duration-150"
            id="key-3"
          >
            3
          </button>
          <button
            onClick={() => handleOperator('+')}
            className={`h-18 rounded-full text-white text-3xl font-semibold active:scale-95 hover:brightness-110 transition-all duration-150 flex items-center justify-center ${
              activeOperator === '+' ? 'bg-white text-primary-container border-2 border-primary-container' : 'bg-primary-container'
            }`}
            id="key-add"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleKeyPress('0')}
            className="h-18 rounded-full bg-surface-container-highest text-white text-2xl text-left px-8 col-span-2 active:scale-95 hover:brightness-110 transition-all duration-150"
            id="key-0"
          >
            0
          </button>
          <button
            onClick={() => handleKeyPress('.')}
            className="h-18 rounded-full bg-surface-container-highest text-white text-2xl active:scale-95 hover:brightness-110 transition-all duration-150"
            id="key-dot"
          >
            .
          </button>
          <button
            onClick={handleEvaluate}
            className="h-18 rounded-full bg-primary-container text-white text-3xl font-semibold active:scale-95 hover:brightness-110 transition-all duration-150 flex items-center justify-center"
            id="key-equals"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}
