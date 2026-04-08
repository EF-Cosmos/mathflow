export type EquationSide = 'lhs' | 'rhs';

export interface ParsedEquation {
  lhs: string;
  rhs: string;
  hasEquals: boolean;
}

export interface ParsedTerm {
  sign: '+' | '-';
  latex: string; // without leading sign
}

const isWhitespace = (ch: string) => ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r';

const stripOuterSpaces = (s: string) => s.trim().replace(/\s+/g, ' ');

// ============================================================================
// Tokenizer
// ============================================================================

export interface Token {
  type: 'number' | 'variable' | 'operator' | 'delimiter' | 'latex_command';
  value: string;
  position: number;
}

/** Known multi-letter function names recognized as single variable tokens */
const FUNCTION_NAMES = new Set(['sin', 'cos', 'tan', 'log', 'ln', 'sec', 'csc', 'cot', 'arcsin', 'arccos', 'arctan']);

/**
 * Tokenize a LaTeX expression into typed tokens.
 * Scope: simple polynomial expressions with coefficients, variables, and basic operators.
 * Per D-07, complex expressions go to SymPy -- the tokenizer does not try to parse arbitrary LaTeX.
 *
 * Uses index-based iteration with explicit increment; while loops have length guards (T-02-04).
 */
export function tokenizeLatex(latex: string): Token[] {
  const tokens: Token[] = [];
  const len = latex.length;
  let i = 0;

  while (i < len) {
    const ch = latex[i];

    // Skip whitespace
    if (isWhitespace(ch)) {
      i++;
      continue;
    }

    // Numbers (including decimals)
    if (/[\d]/.test(ch) || (ch === '.' && i + 1 < len && /\d/.test(latex[i + 1]))) {
      let num = '';
      const start = i;
      while (i < len && /[\d.]/.test(latex[i])) {
        num += latex[i];
        i++;
      }
      tokens.push({ type: 'number', value: num, position: start });
      continue;
    }

    // Variables: check for multi-letter function names first
    if (/[a-zA-Z]/.test(ch)) {
      const start = i;
      // Collect consecutive letters to check for function names
      let word = '';
      let j = i;
      while (j < len && /[a-zA-Z]/.test(latex[j])) {
        word += latex[j];
        j++;
      }

      // Check if this word is a known function name
      if (FUNCTION_NAMES.has(word)) {
        tokens.push({ type: 'variable', value: word, position: start });
        i = j;
        continue;
      }

      // Single letter variable
      tokens.push({ type: 'variable', value: ch, position: start });
      i++;
      continue;
    }

    // Operators: + - * / = ^
    if ('+-*/=^'.includes(ch)) {
      tokens.push({ type: 'operator', value: ch, position: i });
      i++;
      continue;
    }

    // Delimiters: ( ) { } [ ]
    if ('(){}[]'.includes(ch)) {
      tokens.push({ type: 'delimiter', value: ch, position: i });
      i++;
      continue;
    }

    // LaTeX commands: \ followed by letters
    if (ch === '\\') {
      const start = i;
      let cmd = '\\';
      i++;
      while (i < len && /[a-zA-Z]/.test(latex[i])) {
        cmd += latex[i];
        i++;
      }
      tokens.push({ type: 'latex_command', value: cmd, position: start });
      continue;
    }

    // Unknown character -- skip
    i++;
  }

  return tokens;
}

const scanTopLevel = (latex: string, onChar: (ch: string, index: number, depth: number) => void) => {
  let depth = 0;
  for (let i = 0; i < latex.length; i++) {
    const ch = latex[i];
    if (ch === '{') depth++;
    if (ch === '}') depth = Math.max(0, depth - 1);
    onChar(ch, i, depth);
  }
};

export const splitEquation = (latex: string): ParsedEquation => {
  const input = latex ?? '';
  let equalsIndex = -1;
  scanTopLevel(input, (ch, i, depth) => {
    if (equalsIndex !== -1) return;
    if (depth === 0 && ch === '=') equalsIndex = i;
  });

  if (equalsIndex === -1) {
    return { lhs: stripOuterSpaces(input), rhs: '', hasEquals: false };
  }

  return {
    lhs: stripOuterSpaces(input.slice(0, equalsIndex)),
    rhs: stripOuterSpaces(input.slice(equalsIndex + 1)),
    hasEquals: true,
  };
};

export const splitTerms = (expr: string): ParsedTerm[] => {
  const s = stripOuterSpaces(expr);
  if (!s) return [];

  const terms: ParsedTerm[] = [];

  let depth = 0;
  let start = 0;
  let currentSign: '+' | '-' = '+';

  // Handle leading sign
  let i = 0;
  while (i < s.length && isWhitespace(s[i])) i++;
  if (s[i] === '+' || s[i] === '-') {
    currentSign = s[i] as '+' | '-';
    i++;
    start = i;
  }

  for (; i < s.length; i++) {
    const ch = s[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth = Math.max(0, depth - 1);

    if (depth === 0 && (ch === '+' || ch === '-')) {
      const body = stripOuterSpaces(s.slice(start, i));
      if (body) terms.push({ sign: currentSign, latex: body });
      currentSign = ch as '+' | '-';
      start = i + 1;
    }
  }

  const last = stripOuterSpaces(s.slice(start));
  if (last) terms.push({ sign: currentSign, latex: last });

  return terms;
};

export const formatTerms = (terms: ParsedTerm[]): string => {
  if (terms.length === 0) return '';

  const parts: string[] = [];
  terms.forEach((t, idx) => {
    if (idx === 0) {
      parts.push(t.sign === '-' ? `-${t.latex}` : t.latex);
    } else {
      parts.push(`${t.sign} ${t.latex}`);
    }
  });

  return stripOuterSpaces(parts.join(' '));
};

const flipSign = (sign: '+' | '-'): '+' | '-' => (sign === '+' ? '-' : '+');

const termToSignedLatex = (t: ParsedTerm): string => `${t.sign === '-' ? '-' : ''}${t.latex}`;

// 解析项的系数和变量部分
// 例如: "2x" -> { coefficient: 2, variable: "x" }
// 例如: "x" -> { coefficient: 1, variable: "x" }
// 例如: "3" -> { coefficient: 3, variable: "" }
// 例如: "-2x^2" -> { coefficient: 2, variable: "x^2" }
export interface ParsedCoefficient {
  coefficient: number;
  variable: string;
}

/**
 * Parse a term's coefficient and variable part using token-based analysis.
 *
 * The sign (+ or -) is handled by the ParsedTerm wrapper, so this function
 * works on the unsigned term body. For example, given "-2y", the ParsedTerm
 * stores sign='-' and latex='2y'; this function receives '2y' and returns
 * { coefficient: 2, variable: 'y' }.
 *
 * If the input starts with a leading minus (e.g. "-2y" passed directly),
 * it strips the sign and returns the absolute coefficient.
 */
export const parseTermCoefficient = (latex: string): ParsedCoefficient => {
  const trimmed = latex.trim();

  // Strip leading minus -- sign is tracked by ParsedTerm
  const unsigned = trimmed.startsWith('-') ? trimmed.slice(1).trim() : trimmed;

  // Tokenize
  const tokens = tokenizeLatex(unsigned);
  if (tokens.length === 0) {
    return { coefficient: 0, variable: '' };
  }

  // If there's only a number token, it's a pure constant
  if (tokens.length === 1 && tokens[0].type === 'number') {
    return { coefficient: parseFloat(tokens[0].value), variable: '' };
  }

  // If the first token is a number, that's the coefficient
  // Everything else is the variable part (reconstructed from tokens)
  if (tokens[0].type === 'number') {
    const coefficient = parseFloat(tokens[0].value);
    // Reconstruct the variable part from remaining tokens
    const variablePart = reconstructFromTokens(tokens.slice(1));
    return { coefficient, variable: variablePart };
  }

  // No leading number token -- coefficient is 1
  return { coefficient: 1, variable: reconstructFromTokens(tokens) };
};

/**
 * Reconstruct a string from tokens, preserving original formatting positions.
 * Handles \cdot / \times by skipping them (they represent multiplication
 * within a term that the tokenizer has already split correctly).
 */
function reconstructFromTokens(tokens: Token[]): string {
  if (tokens.length === 0) return '';

  // Filter out \cdot and \times -- these are multiplication operators
  // within a term body that don't belong in the variable representation
  const filtered = tokens.filter(
    t => !(t.type === 'latex_command' && (t.value === '\\cdot' || t.value === '\\times'))
  );

  if (filtered.length === 0) return '';

  // Reconstruct by concatenating token values, adding spaces where needed
  let result = '';
  for (let i = 0; i < filtered.length; i++) {
    const token = filtered[i];
    // Add space between tokens that need separation
    if (i > 0) {
      const prev = filtered[i - 1];
      // No space between: variable/^, number/variable, delimiter/anything adjacent
      const needsSpace = !(
        (prev.type === 'variable' && token.type === 'operator' && token.value === '^') ||
        (prev.type === 'operator' && prev.value === '^' && token.type === 'number') ||
        (prev.type === 'delimiter' || token.type === 'delimiter')
      );
      // Only add space if there was whitespace between them in original
      // Actually, just concatenate tightly for polynomial terms
    }
    result += token.value;
  }

  return result || '';
}

// 获取项的"类型键" - 用于判断是否为同类项
export const getTermTypeKey = (latex: string): string => {
  const parsed = parseTermCoefficient(latex);
  return parsed.variable || '__constant__';
};

// 找到同类项
export const findLikeTerms = (terms: ParsedTerm[], targetIndex: number): number[] => {
  if (targetIndex < 0 || targetIndex >= terms.length) return [];
  
  const targetKey = getTermTypeKey(terms[targetIndex].latex);
  const indices: number[] = [];
  
  for (let i = 0; i < terms.length; i++) {
    if (getTermTypeKey(terms[i].latex) === targetKey) {
      indices.push(i);
    }
  }
  
  return indices;
};

const buildTermFromCoefficient = (latex: string, coefficient: number): ParsedTerm | null => {
  if (coefficient === 0) return null;
  const sign: '+' | '-' = coefficient < 0 ? '-' : '+';
  const abs = Math.abs(coefficient);
  if (abs === 1) return { sign, latex };
  return { sign, latex: `${abs}${latex}` };
};

// 重构：更智能地构建合并后的项
const buildCombinedTerm = (variable: string, totalCoefficient: number): ParsedTerm | null => {
  if (totalCoefficient === 0) return null;
  
  const sign: '+' | '-' = totalCoefficient < 0 ? '-' : '+';
  const absCoeff = Math.abs(totalCoefficient);
  
  // 纯常数项
  if (variable === '' || variable === '__constant__') {
    return { sign, latex: String(absCoeff) };
  }
  
  // 系数为1时省略
  if (absCoeff === 1) {
    return { sign, latex: variable };
  }
  
  return { sign, latex: `${absCoeff}${variable}` };
};

export const combineAllLikeTerms = (expr: string): string => {
  const terms = splitTerms(expr);
  if (terms.length === 0) return '';

  const counts = new Map<string, number>();
  const order: string[] = [];

  for (const t of terms) {
    if (!counts.has(t.latex)) order.push(t.latex);
    const prev = counts.get(t.latex) ?? 0;
    counts.set(t.latex, prev + (t.sign === '+' ? 1 : -1));
  }

  const out: ParsedTerm[] = [];
  for (const latex of order) {
    const coeff = counts.get(latex) ?? 0;
    const combined = buildTermFromCoefficient(latex, coeff);
    if (combined) out.push(combined);
  }

  return formatTerms(out);
};

export const combineLikeTermInEquation = (
  equationLatex: string,
  side: EquationSide,
  termIndex: number
): { nextEquation: string; combined: { side: EquationSide; count: number; variable: string } } | null => {
  const eq = splitEquation(equationLatex);
  if (!eq.hasEquals) return null;

  const lhsTerms = splitTerms(eq.lhs);
  const rhsTerms = splitTerms(eq.rhs);
  const terms = side === 'lhs' ? lhsTerms : rhsTerms;

  if (termIndex < 0 || termIndex >= terms.length) return null;

  // 找到所有同类项
  const likeTermIndices = findLikeTerms(terms, termIndex);
  
  // 只有一个项，没有可以合并的
  if (likeTermIndices.length < 2) return null;

  // 计算总系数
  const targetKey = getTermTypeKey(terms[termIndex].latex);
  let totalCoefficient = 0;
  
  for (const idx of likeTermIndices) {
    const term = terms[idx];
    const parsed = parseTermCoefficient(term.latex);
    const signMultiplier = term.sign === '+' ? 1 : -1;
    totalCoefficient += signMultiplier * parsed.coefficient;
  }

  // 从后往前删除所有同类项
  const firstIndex = likeTermIndices[0];
  for (let i = likeTermIndices.length - 1; i >= 0; i--) {
    terms.splice(likeTermIndices[i], 1);
  }

  // 构建合并后的项
  const variable = targetKey === '__constant__' ? '' : targetKey;
  const combined = buildCombinedTerm(variable, totalCoefficient);
  if (combined) {
    terms.splice(Math.min(firstIndex, terms.length), 0, combined);
  }

  const nextLhs = formatTerms(lhsTerms);
  const nextRhs = formatTerms(rhsTerms);
  const nextEquation = `${nextLhs || '0'} = ${nextRhs || '0'}`;

  return { 
    nextEquation, 
    combined: { side, count: likeTermIndices.length, variable: targetKey } 
  };
};

export const moveTermInEquation = (
  equationLatex: string,
  fromSide: EquationSide,
  termIndex: number
): { nextEquation: string; moved: { from: EquationSide; term: ParsedTerm; toSide: EquationSide; termAfterMove: ParsedTerm } } | null => {
  const eq = splitEquation(equationLatex);
  if (!eq.hasEquals) return null;

  const lhsTerms = splitTerms(eq.lhs);
  const rhsTerms = splitTerms(eq.rhs);

  const sourceTerms = fromSide === 'lhs' ? lhsTerms : rhsTerms;
  const targetTerms = fromSide === 'lhs' ? rhsTerms : lhsTerms;

  if (termIndex < 0 || termIndex >= sourceTerms.length) return null;

  const [term] = sourceTerms.splice(termIndex, 1);
  const movedTerm: ParsedTerm = { sign: flipSign(term.sign), latex: term.latex };
  targetTerms.push(movedTerm);

  const nextLhs = formatTerms(lhsTerms);
  const nextRhs = formatTerms(rhsTerms);
  const nextEquation = `${nextLhs || '0'} = ${nextRhs || '0'}`;

  return {
    nextEquation,
    moved: {
      from: fromSide,
      term,
      toSide: fromSide === 'lhs' ? 'rhs' : 'lhs',
      termAfterMove: movedTerm,
    },
  };
};

export const toSignedLatex = termToSignedLatex;

/**
 * 对等式中某一边的某个项进行乘法运算
 * 将选中项的系数乘以指定值
 *
 * @param equationLatex 等式 LaTeX 字符串
 * @param side 操作哪一边 ('lhs' | 'rhs')
 * @param termIndex 项的索引
 * @param multiplier 乘数（数字或表达式）
 * @returns 新的等式和操作信息
 */
export const multiplyTermInEquation = (
  equationLatex: string,
  side: EquationSide,
  termIndex: number,
  multiplier: string
): { nextEquation: string; multiplied: { side: EquationSide; originalTerm: ParsedTerm; multiplier: string; newTerm: ParsedTerm } } | null => {
  const eq = splitEquation(equationLatex);
  if (!eq.hasEquals) return null;

  const lhsTerms = splitTerms(eq.lhs);
  const rhsTerms = splitTerms(eq.rhs);
  const terms = side === 'lhs' ? lhsTerms : rhsTerms;

  if (termIndex < 0 || termIndex >= terms.length) return null;

  const originalTerm = terms[termIndex];

  // 解析乘数
  const multiplierNum = parseFloat(multiplier);
  const isNumericMultiplier = !isNaN(multiplierNum);

  // 构建新的项
  let newLatex: string;
  if (isNumericMultiplier) {
    // 数字乘法：修改系数
    const parsed = parseTermCoefficient(originalTerm.latex);
    const newCoefficient = parsed.coefficient * multiplierNum;
    const signMultiplier = originalTerm.sign === '+' ? 1 : -1;
    const finalCoefficient = signMultiplier * newCoefficient;

    if (finalCoefficient === 0) {
      // 乘积为0，移除该项
      terms.splice(termIndex, 1);
      const nextLhs = formatTerms(lhsTerms);
      const nextRhs = formatTerms(rhsTerms);
      const nextEquation = `${nextLhs || '0'} = ${nextRhs || '0'}`;

      return {
        nextEquation,
        multiplied: {
          side,
          originalTerm,
          multiplier,
          newTerm: { sign: '+', latex: '0' }
        }
      };
    }

    // 构建新项
    const newSign: '+' | '-' = finalCoefficient < 0 ? '-' : '+';
    const absCoeff = Math.abs(finalCoefficient);

    if (parsed.variable === '' || parsed.variable === '__constant__') {
      // 常数项
      newLatex = String(absCoeff);
    } else if (absCoeff === 1) {
      // 系数为1，省略系数
      newLatex = parsed.variable;
    } else {
      // 正常情况
      newLatex = `${absCoeff}${parsed.variable}`;
    }

    terms[termIndex] = { sign: newSign, latex: newLatex };
  } else {
    // 表达式乘法：使用 \cdot
    const originalSignedLatex = termToSignedLatex(originalTerm);
    // 简化处理：直接使用 \cdot 连接
    newLatex = `\\left(${originalSignedLatex}\\right) \\cdot ${multiplier}`;
    terms[termIndex] = { sign: originalTerm.sign, latex: newLatex };
  }

  const nextLhs = formatTerms(lhsTerms);
  const nextRhs = formatTerms(rhsTerms);
  const nextEquation = `${nextLhs || '0'} = ${nextRhs || '0'}`;

  return {
    nextEquation,
    multiplied: {
      side,
      originalTerm,
      multiplier,
      newTerm: terms[termIndex]
    }
  };
};
