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

export const parseTermCoefficient = (latex: string): ParsedCoefficient => {
  const trimmed = latex.trim();
  
  // 纯数字
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return { coefficient: parseFloat(trimmed), variable: '' };
  }
  
  // 匹配开头的数字系数 (可能为负数)
  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*\\?\s*(?:cdot\s*)?(.+)$/);
  if (match) {
    return { 
      coefficient: parseFloat(match[1]), 
      variable: match[2].trim() 
    };
  }
  
  // 没有数字系数，默认为1
  return { coefficient: 1, variable: trimmed };
};

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
