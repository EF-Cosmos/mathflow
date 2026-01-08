import { splitTerms, parseTermCoefficient, ParsedTerm, formatTerms } from './equation';

/**
 * 计算两个数的最大公约数
 */
function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

/**
 * 计算数组的最大公约数
 */
function gcdArray(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((acc, n) => gcd(acc, n), Math.abs(nums[0]));
}

/**
 * 检查字符串是否为数字（包括小数和负数）
 */
function isNumeric(s: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(s.trim());
}

/**
 * 标准化分数：返回最简形式
 * 例如：4/6 -> 2/3, 2/4 -> 1/2
 */
function simplifyFraction(numerator: number, denominator: number): { num: number; den: number } {
  const common = gcd(Math.abs(numerator), Math.abs(denominator));
  return {
    num: numerator / common,
    den: denominator / common,
  };
}

/**
 * 将数字转换为 LaTeX 分数格式
 * 如果是整数返回字符串，如果是分数返回 \frac{a}{b}
 */
function toFractionLatex(num: number, den: number): string {
  const simplified = simplifyFraction(num, den);
  if (simplified.den === 1) {
    return String(simplified.num);
  }
  if (simplified.den === -1) {
    return String(-simplified.num);
  }
  return `\\frac{${simplified.num}}${simplified.den}`;
}

/**
 * 提取表达式中的公因子
 * @param latex - LaTeX 表达式
 * @returns 因式分解后的表达式，如果没有公因子返回 null
 */
export function extractCommonFactor(latex: string): string | null {
  const terms = splitTerms(latex);
  if (terms.length < 2) return null;

  // 1. 计算系数的 GCD
  const coefficients: number[] = [];
  const variableParts: string[] = [];

  for (const term of terms) {
    const parsed = parseTermCoefficient(term.latex);
    const signedCoeff = (term.sign === '+' ? 1 : -1) * parsed.coefficient;
    coefficients.push(Math.abs(signedCoeff));
    variableParts.push(parsed.variable);
  }

  const coeffGCD = gcdArray(coefficients);
  if (coeffGCD <= 1) {
    // 没有数字公因子，检查是否有变量公因子
    const commonVar = findCommonVariable(variableParts);
    if (!commonVar) return null;

    // 只提取变量公因子
    const newTerms = terms.map(t => {
      const parsed = parseTermCoefficient(t.latex);
      const newVar = removeVariable(parsed.variable, commonVar);
      if (newVar === '' || newVar === '__constant__') {
        return { sign: t.sign, latex: String(Math.abs(parsed.coefficient)) || '1' };
      }
      if (parsed.coefficient === 1) {
        return { sign: t.sign, latex: newVar };
      }
      return { sign: t.sign, latex: `${Math.abs(parsed.coefficient)}${newVar}` };
    });

    return `${commonVar}\\left(${formatTerms(newTerms)}\\right)`;
  }

  // 2. 找出共同的变量部分
  const commonVar = findCommonVariable(variableParts);

  // 3. 构建公因子
  const factor = commonVar ? `${coeffGCD}${commonVar}` : `${coeffGCD}`;

  // 4. 构建括号内的表达式
  const newTerms = terms.map(t => {
    const parsed = parseTermCoefficient(t.latex);
    const signedCoeff = (t.sign === '+' ? 1 : -1) * parsed.coefficient;
    const newCoeff = signedCoeff / coeffGCD;

    const newVar = commonVar ? removeVariable(parsed.variable, commonVar) : parsed.variable;

    if (newVar === '' || newVar === '__constant__') {
      return { sign: newCoeff >= 0 ? '+' : '-', latex: String(Math.abs(newCoeff)) };
    }
    if (Math.abs(newCoeff) === 1) {
      return { sign: newCoeff >= 0 ? '+' : '-', latex: newVar };
    }
    return { sign: newCoeff >= 0 ? '+' : '-', latex: `${Math.abs(newCoeff)}${newVar}` };
  });

  return `${factor}\\left(${formatTerms(newTerms)}\\right)`;
}

/**
 * 找出变量数组中的公共部分
 * 例如：["x^2", "x"] -> "x", ["xy", "xz"] -> "x"
 */
function findCommonVariable(variables: string[]): string | null {
  if (variables.length === 0) return null;

  // 过滤掉常数项
  const nonConstants = variables.filter(v => v && v !== '__constant__');
  if (nonConstants.length === 0) return null;
  if (nonConstants.length === 1) return null; // 只有一个变量项，无法提取

  // 简单实现：检查是否所有项都包含某个变量
  // 找出第一个变量的所有字符因子
  const firstVar = nonConstants[0];
  const factors = extractVariableFactors(firstVar);

  for (const factor of factors) {
    const allContain = nonConstants.every(v => v.includes(factor));
    if (allContain) {
      return factor;
    }
  }

  return null;
}

/**
 * 提取变量的因子
 * 例如： "x^2y" -> ["x", "y"], "xyz" -> ["x", "y", "z"]
 */
function extractVariableFactors(variable: string): string[] {
  const factors: string[] = [];
  // 匹配变量名和可能的指数，如 x^2, y, z
  const matches = variable.match(/([a-zA-Z])(?:\^(\d+))?/g);
  if (matches) {
    for (const match of matches) {
      // 只返回变量名部分
      factors.push(match[0]);
    }
  }
  return factors;
}

/**
 * 从变量中移除指定因子
 */
function removeVariable(variable: string, toRemove: string): string {
  if (!variable) return variable;
  // 简单的字符串替换（对于简单情况够用）
  // 例如：removeVariable("x^2y", "x") -> "xy"
  let result = variable;
  if (result.startsWith(toRemove)) {
    result = result.slice(toRemove.length);
  } else {
    result = result.replace(toRemove, '');
  }
  // 处理 ^ 符号
  result = result.replace(/^\^/, '');
  return result || '';
}

/**
 * 解析二次多项式 ax² + bx + c
 * 返回系数 {a, b, c} 或 null
 */
function parseQuadratic(latex: string): { a: number; b: number; c: number } | null {
  const terms = splitTerms(latex);

  let a = 0;
  let b = 0;
  let c = 0;

  for (const term of terms) {
    const parsed = parseTermCoefficient(term.latex);
    const coeff = (term.sign === '+' ? 1 : -1) * parsed.coefficient;

    // 检查变量部分的幂次
    if (parsed.variable.includes('x^2') || parsed.variable.includes('^{2}')) {
      a = coeff;
    } else if (parsed.variable.includes('x') && !parsed.variable.includes('^')) {
      b = coeff;
    } else if (!parsed.variable || parsed.variable === '__constant__') {
      c = coeff;
    }
  }

  // 至少需要有 x² 项
  if (a === 0) return null;

  return { a, b, c };
}

/**
 * 因式分解二次多项式 ax² + bx + c
 * 使用求根公式
 */
export function factorQuadratic(latex: string): string | null {
  const quadratic = parseQuadratic(latex);
  if (!quadratic) return null;

  const { a, b, c } = quadratic;

  // 判别式
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null; // 无实数根

  const sqrtD = Math.sqrt(discriminant);

  // 求根
  const x1 = (-b + sqrtD) / (2 * a);
  const x2 = (-b - sqrtD) / (2 * a);

  // 构建因式分解形式
  // 如果根是整数或简单分数，使用 (x - r1)(x - r2) 形式
  // 否则使用标准形式

  const isInteger = (n: number) => Number.isInteger(n);
  const isSimpleFraction = (n: number) => {
    const abs = Math.abs(n);
    return abs < 10 && abs > 0 && !isInteger(n);
  };

  if ((isInteger(x1) && isInteger(x2)) || (isSimpleFraction(x1) && isSimpleFraction(x2))) {
    // 使用因式形式
    const factor1 = buildLinearFactor(a, x1);
    const factor2 = buildLinearFactor(1, x2);
    return `\\left(${factor1}\\right)\\left(${factor2}\\right)`;
  }

  // 无法用简单形式表示
  return null;
}

/**
 * 构建线性因子 (ax - b)
 */
function buildLinearFactor(a: number, root: number): string {
  if (root === 0) {
    return a === 1 ? 'x' : `${a}x`;
  }

  const absRoot = Math.abs(root);
  const sign = root > 0 ? '-' : '+';

  if (a === 1) {
    return `x ${sign} ${absRoot}`;
  }

  // 需要使用分数形式
  const numerator = absRoot * a;
  const denominator = a;
  const fraction = toFractionLatex(numerator, denominator);

  return `${a}x ${sign} ${fraction}`;
}

/**
 * 识别并因式分解平方差、立方差/和
 */
export function factorDifferenceOfPowers(latex: string): string | null {
  // 平方差：a² - b²
  // 立方差：a³ - b³
  // 立方和：a³ + b³

  const terms = splitTerms(latex);
  if (terms.length !== 2) return null;

  const [term1, term2] = terms;

  // 必须是一正一负
  if (term1.sign === term2.sign) return null;

  const positiveTerm = term1.sign === '+' ? term1 : term2;
  const negativeTerm = term1.sign === '-' ? term1 : term2;

  const parsed1 = parseTermCoefficient(positiveTerm.latex);
  const parsed2 = parseTermCoefficient(negativeTerm.latex);

  const coeff1 = parsed1.coefficient;
  const coeff2 = parsed2.coefficient;
  const var1 = parsed1.variable;
  const var2 = parsed2.variable;

  // 检查是否是平方差：a² - b²
  if (var1.includes('^{2}') || var1.includes('^2')) {
    if ((var2.includes('^{2}') || var2.includes('^2')) &&
        Math.abs(coeff1) === Math.abs(coeff2)) {
      // a² - b² = (a-b)(a+b)
      const base1 = removeExponent(var1);
      const base2 = removeExponent(var2);
      const c = Math.sqrt(Math.abs(coeff1));

      if (c === 1) {
        return `\\left(${base1} - ${base2}\\right)\\left(${base1} + ${base2}\\right)`;
      }
      return `\\left(${c}${base1} - ${c}${base2}\\right)\\left(${c}${base1} + ${c}${base2}\\right)`;
    }
  }

  // 检查立方差/和：a³ ± b³
  if (var1.includes('^{3}') || var1.includes('^3')) {
    if ((var2.includes('^{3}') || var2.includes('^3')) &&
        Math.abs(coeff1) === Math.abs(coeff2)) {
      const base1 = removeExponent(var1);
      const base2 = removeExponent(var2);
      const c = Math.cbrt(Math.abs(coeff1));

      const isFirst = positiveTerm.sign === '+';

      if (c === 1) {
        if (isFirst) {
          // a³ + b³ = (a+b)(a² - ab + b²)
          return `\\left(${base1} + ${base2}\\right)\\left(${base1}^{2} - ${base1}${base2} + ${base2}^{2}\\right)`;
        } else {
          // a³ - b³ = (a-b)(a² + ab + b²)
          return `\\left(${base1} - ${base2}\\right)\\left(${base1}^{2} + ${base1}${base2} + ${base2}^{2}\\right)`;
        }
      }
    }
  }

  return null;
}

/**
 * 移除变量的指数部分
 * 例如：x^2 -> x, ^{2} -> ''
 * 注意：只处理简单变量，不影响复杂的 LaTeX 结构
 */
function removeExponent(variable: string): string {
  return variable
    .replace(/\^\{?\d+\}?/g, '')
    .replace(/\^\{\d\}/g, '')
    .trim();
}

/**
 * 主入口函数：尝试所有因式分解方法
 * 按优先级顺序：
 * 1. 检查是否已经因式分解
 * 2. 公式识别（平方差、立方差/和）
 * 3. 二次多项式
 * 4. 公因子提取
 */
export function factorExpression(latex: string): string | null {
  if (!latex || latex.trim().length === 0) return null;

  // 检查是否已经因式分解（包含 \left 或 \right 表明可能已经是因式分解形式）
  // 避免对已经因式分解的表达式再次处理
  const trimmed = latex.trim();
  if (trimmed.includes('\\left(') || trimmed.includes('\\right)')) {
    // 如果看起来已经因式分解，返回 null 避免重复处理
    return null;
  }

  // 1. 尝试公式识别
  const formulaResult = factorDifferenceOfPowers(latex);
  if (formulaResult) return formulaResult;

  // 2. 尝试二次多项式
  const quadraticResult = factorQuadratic(latex);
  if (quadraticResult) return quadraticResult;

  // 3. 尝试公因子提取
  const commonFactorResult = extractCommonFactor(latex);
  if (commonFactorResult) return commonFactorResult;

  return null;
}

/**
 * 对等式两边分别进行因式分解
 * 如果等式两边都无法因式分解，返回 null
 */
export function factorEquation(latex: string): string | null {
  // 检查是否是等式
  const equalsIndex = latex.indexOf('=');
  if (equalsIndex === -1) {
    // 单个表达式
    return factorExpression(latex);
  }

  const lhs = latex.slice(0, equalsIndex).trim();
  const rhs = latex.slice(equalsIndex + 1).trim();

  const factoredLhs = factorExpression(lhs);
  const factoredRhs = factorExpression(rhs);

  // 检查是否至少有一边成功因式分解
  const lhsChanged = factoredLhs !== null && factoredLhs !== lhs;
  const rhsChanged = factoredRhs !== null && factoredRhs !== rhs;

  if (!lhsChanged && !rhsChanged) {
    // 两边都没有变化，返回 null
    return null;
  }

  // 使用因式分解结果，如果某边没有变化则使用原值
  const finalLhs = lhsChanged ? factoredLhs! : lhs;
  const finalRhs = rhsChanged ? factoredRhs! : rhs;

  return `${finalLhs} = ${finalRhs}`;
}

// ============================================================================
// SymPy API 调用
// ============================================================================

const SYMPY_API_URL = import.meta.env.VITE_SYMPY_API_URL || 'http://localhost:8000';

interface FactorizeResponse {
  result: string;
}

/**
 * 调用 SymPy 后端服务进行因式分解
 * @param latex - LaTeX 表达式
 * @returns 因式分解后的 LaTeX 表达式，失败返回 null
 */
export async function factorWithSympy(latex: string): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/factor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex }),
      signal: AbortSignal.timeout(5000), // 5 秒超时
    });

    if (!response.ok) {
      console.warn(`SymPy API error: ${response.status}`);
      return null;
    }

    const data: FactorizeResponse = await response.json();
    return data.result;
  } catch (error) {
    // 网络错误、超时等
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('SymPy API timeout');
    } else {
      console.warn('SymPy API unavailable:', error);
    }
    return null;
  }
}

/**
 * 调用 SymPy 后端服务展开表达式
 */
export async function expandWithSympy(latex: string): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/expand`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const data: FactorizeResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * 调用 SymPy 后端服务化简表达式
 */
export async function simplifyWithSympy(latex: string): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/simplify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const data: FactorizeResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * 带回退的因式分解：本地 → SymPy → 失败
 * 支持单个表达式和等式
 * @param latex - LaTeX 表达式或等式
 * @returns 因式分解结果，全部失败返回 null
 */
export async function factorWithFallback(latex: string): Promise<string | null> {
  // 1. 尝试本地算法（快速，覆盖常见情况）
  // 使用 factorEquation 以支持等式两边分别因式分解
  const localResult = factorEquation(latex);
  if (localResult) {
    return localResult;
  }

  // 2. 尝试 SymPy 服务（完整功能，覆盖复杂情况）
  const sympyResult = await factorWithSympy(latex);
  if (sympyResult) {
    return sympyResult;
  }

  return null;
}

/**
 * 对等式两边分别进行展开
 * 如果等式两边都无法展开，返回 null
 */
export function expandEquation(latex: string): string | null {
  // 检查是否是等式
  const equalsIndex = latex.indexOf('=');
  if (equalsIndex === -1) {
    // 单个表达式，无法本地展开（需要 SymPy）
    return null;
  }

  // 本地没有展开实现，直接返回 null 让 SymPy 处理
  return null;
}

/**
 * 展开表达式（优先 SymPy）
 * 支持单个表达式和等式
 * @param latex - LaTeX 表达式或等式
 * @returns 展开结果，失败返回 null
 */
export async function expandWithFallback(latex: string): Promise<string | null> {
  // 优先使用 SymPy（完整的展开功能）
  const sympyResult = await expandWithSympy(latex);
  if (sympyResult && sympyResult !== latex) {
    return sympyResult;
  }

  // 如果 SymPy 失败，尝试本地处理（目前只支持检测等式）
  const equalsIndex = latex.indexOf('=');
  if (equalsIndex !== -1) {
    // 对等式两边分别尝试展开
    const lhs = latex.slice(0, equalsIndex).trim();
    const rhs = latex.slice(equalsIndex + 1).trim();

    const expandedLhs = await expandWithSympy(lhs);
    const expandedRhs = await expandWithSympy(rhs);

    // 检查是否至少有一边成功展开
    const lhsChanged = expandedLhs && expandedLhs !== lhs;
    const rhsChanged = expandedRhs && expandedRhs !== rhs;

    if (!lhsChanged && !rhsChanged) {
      return null;
    }

    const finalLhs = lhsChanged ? expandedLhs! : lhs;
    const finalRhs = rhsChanged ? expandedRhs! : rhs;

    return `${finalLhs} = ${finalRhs}`;
  }

  return null;
}

/**
 * 化简表达式（优先 SymPy）
 * 支持单个表达式和等式
 * @param latex - LaTeX 表达式或等式
 * @returns 化简结果，失败返回 null
 */
export async function simplifyWithFallback(latex: string): Promise<string | null> {
  // 优先使用 SymPy（完整的化简功能）
  const sympyResult = await simplifyWithSympy(latex);
  if (sympyResult && sympyResult !== latex) {
    return sympyResult;
  }

  // 如果 SymPy 失败，尝试对等式两边分别处理
  const equalsIndex = latex.indexOf('=');
  if (equalsIndex !== -1) {
    // 对等式两边分别尝试化简
    const lhs = latex.slice(0, equalsIndex).trim();
    const rhs = latex.slice(equalsIndex + 1).trim();

    const simplifiedLhs = await simplifyWithSympy(lhs);
    const simplifiedRhs = await simplifyWithSympy(rhs);

    // 检查是否至少有一边成功化简
    const lhsChanged = simplifiedLhs && simplifiedLhs !== lhs;
    const rhsChanged = simplifiedRhs && simplifiedRhs !== rhs;

    if (!lhsChanged && !rhsChanged) {
      return null;
    }

    const finalLhs = lhsChanged ? simplifiedLhs! : lhs;
    const finalRhs = rhsChanged ? simplifiedRhs! : rhs;

    return `${finalLhs} = ${finalRhs}`;
  }

  return null;
}
