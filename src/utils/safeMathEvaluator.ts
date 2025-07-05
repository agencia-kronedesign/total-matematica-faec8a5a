import { create, all } from 'mathjs';

// Create a safe math.js instance with limited functionality
const math = create(all);

// Remove dangerous functions
math.import({
  'import': function () { throw new Error('Function import is disabled') },
  'createUnit': function () { throw new Error('Function createUnit is disabled') },
  'evaluate': function () { throw new Error('Function evaluate is disabled') },
  'parse': function () { throw new Error('Function parse is disabled') }
}, { override: true });

// Whitelist of allowed functions for mathematical expressions
const ALLOWED_FUNCTIONS = [
  'abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2', 'atanh',
  'cbrt', 'ceil', 'cos', 'cosh', 'exp', 'floor', 'log', 'log10', 'log2',
  'max', 'min', 'pow', 'round', 'sin', 'sinh', 'sqrt', 'tan', 'tanh',
  'add', 'subtract', 'multiply', 'divide', 'mod'
];

// Whitelist of allowed constants
const ALLOWED_CONSTANTS = ['pi', 'e', 'phi', 'tau'];

export class SafeMathEvaluator {
  /**
   * Safely evaluates a mathematical expression by replacing variable 'n' with a numeric value
   * @param formula - The mathematical formula as a string (e.g., "2*n + 5")
   * @param n - The numeric value to substitute for 'n'
   * @returns The calculated result
   * @throws Error if the formula contains unsafe operations
   */
  static evaluate(formula: string, n: number): number {
    // Input validation
    if (typeof formula !== 'string' || typeof n !== 'number') {
      throw new Error('Invalid input types');
    }

    if (!isFinite(n)) {
      throw new Error('Variable n must be a finite number');
    }

    // Basic security checks
    if (this.containsUnsafeOperations(formula)) {
      throw new Error('Formula contains unsafe operations');
    }

    try {
      // Replace 'n' with the actual value
      const sanitizedFormula = formula.replace(/\bn\b/g, n.toString());
      
      // Validate the sanitized formula doesn't contain dangerous patterns
      if (this.containsUnsafeOperations(sanitizedFormula)) {
        throw new Error('Sanitized formula contains unsafe operations');
      }

      // Use math.js to safely evaluate the expression
      const result = math.evaluate(sanitizedFormula);
      
      // Ensure result is a finite number
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Formula evaluation did not produce a valid number');
      }

      return result;
    } catch (error) {
      throw new Error(`Formula evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Checks if a formula contains unsafe operations
   * @param formula - The formula to check
   * @returns true if unsafe operations are detected
   */
  private static containsUnsafeOperations(formula: string): boolean {
    // Check for dangerous patterns
    const dangerousPatterns = [
      /eval\s*\(/i,
      /function\s*\(/i,
      /=>/,
      /\bthis\b/,
      /\bwindow\b/,
      /\bdocument\b/,
      /\bconsole\b/,
      /\bprocess\b/,
      /\brequire\b/,
      /\bimport\b/,
      /\bexport\b/,
      /\bwhile\s*\(/i,
      /\bfor\s*\(/i,
      /\bif\s*\(/i,
      /\btry\s*\{/i,
      /\bcatch\s*\(/i,
      /[{}]/,
      /[;]/,
      /\$/,
      /__/
    ];

    return dangerousPatterns.some(pattern => pattern.test(formula));
  }

  /**
   * Validates if a formula contains only allowed mathematical operations
   * @param formula - The formula to validate
   * @returns true if the formula is valid
   */
  static isValidFormula(formula: string): boolean {
    try {
      // Check for unsafe operations
      if (this.containsUnsafeOperations(formula)) {
        return false;
      }

      // Try to parse the formula with a test value
      const testFormula = formula.replace(/\bn\b/g, '1');
      math.evaluate(testFormula);
      
      return true;
    } catch {
      return false;
    }
  }
}