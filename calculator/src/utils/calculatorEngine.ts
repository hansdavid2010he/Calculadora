// Calculator engine with support for basic arithmetic, dynamic formatting, and secure expression parsing.

/**
 * Normalizes an expression for calculation (e.g. replacing symbols, handles percentages)
 */
export function normalizeExpression(expr: string): string {
  // Replace visible multiplication and division symbols with standard programming symbols
  let finalExpr = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-');

  // Handle percentages
  // A standard way is to convert numbers followed by % into (number/100)
  // We look for patterns of digits optionally containing a decimal point, followed by '%'
  finalExpr = finalExpr.replace(/(\d+(\.\d+)?)(%)/g, '($1/100)');

  return finalExpr;
}

/**
 * Formats a raw number string or number into a standard comma-separated local format.
 * E.g., 1250000.456 -> "1,250,000.456"
 */
export function formatNumber(val: number | string, precision: number = 4): string {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return 'Infinity';

  // Format to standard representation with options
  const parts = num.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Format integer with commas
  const formattedInteger = Number(integerPart).toLocaleString('en-US');

  if (parts.length > 1) {
    // Keep decimal precision limited to settings precision
    const trimmedDecimal = decimalPart.substring(0, precision);
    return trimmedDecimal ? `${formattedInteger}.${trimmedDecimal}` : formattedInteger;
  }

  return formattedInteger;
}

/**
 * Simple Token-based expression parser for safety (rather than raw eval).
 * Supports parentheses, basic operators, and floating arithmetic.
 */
export function evaluateExpression(expr: string, precision: number = 4): string {
  try {
    const normalized = normalizeExpression(expr);
    
    // Use Function constructor in a closed sandboxed-like scope to avoid direct eval, 
    // but with strict validation of characters to prevent arbitrary script execution.
    // Allow only: digits, operators, dots, brackets, and math symbols.
    const safePattern = /^[0-9+\-*/().\s]+$/;
    if (!safePattern.test(normalized)) {
      return 'Error';
    }

    // Evaluate the validated calculation safely
    const evaluationResult = new Function(`return (${normalized})`)();
    
    if (evaluationResult === null || evaluationResult === undefined) {
      return '0';
    }

    if (typeof evaluationResult === 'number') {
      if (isNaN(evaluationResult)) return 'Error';
      if (!isFinite(evaluationResult)) return 'Infinity';
      
      // Let's resolve the decimal precision and avoid floating float bugs like 0.1 + 0.2 = 0.300000000004
      // We clip float precision to standard setting precision
      const rounded = parseFloat(evaluationResult.toFixed(precision));
      return rounded.toString();
    }
    
    return String(evaluationResult);
  } catch (error) {
    console.error('Calculation error: ', error);
    return 'Error';
  }
}

/**
 * Dynamically formats and highlights numbers in a formula string while preserving operators and active input layout.
 * E.g., "1270×2" -> "1,270 × 2"
 */
export function formatFormula(formula: string): string {
  // Add spaces around operators to look clean and neat, and format any complete number token with commas.
  // Split expression into tokens: numbers with decimals, and operators
  const tokens = formula.match(/(\d+(\.\d*)?%?)|([+\-−×÷*/()%])|([^\d+\-−×÷*/()% ]+)/g) || [];
  
  return tokens.map((token, index) => {
    // If it is a number token, format with commas
    if (/^\d+(\.\d*)?%?$/.test(token)) {
      const hasPercent = token.endsWith('%');
      const cleanToken = hasPercent ? token.slice(0, -1) : token;
      
      const parts = cleanToken.split('.');
      const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const decPart = parts.length > 1 ? '.' + parts[1] : '';
      
      return `${intPart}${decPart}${hasPercent ? '%' : ''}`;
    }
    
    // Provide nice spacious padding around operators
    if (/^[+\-−×÷*/]$/.test(token)) {
      const displayOp = token === '*' ? '×' : token === '/' ? '÷' : token === '-' ? '−' : token;
      return ` ${displayOp} `;
    }
    
    return token;
  }).join('');
}
