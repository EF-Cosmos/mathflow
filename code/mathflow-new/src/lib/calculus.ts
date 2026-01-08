/**
 * 微积分操作 API 调用函数
 *
 * 使用 SymPy 后端进行微积分计算
 */

const SYMPY_API_URL = import.meta.env.VITE_SYMPY_API_URL || 'http://localhost:8001';

// ==================== 类型定义 ====================

interface CalculusRequest {
  latex: string;
  variable?: string;
}

interface DefiniteIntegralRequest extends CalculusRequest {
  lower_limit: string;
  upper_limit: string;
}

interface LimitRequest extends CalculusRequest {
  point: string;
}

interface SummationRequest {
  latex: string;
  variable?: string;
  start: string;
  end: string;
}

interface ProductRequest {
  latex: string;
  variable?: string;
  start: string;
  end: string;
}

interface TaylorRequest extends CalculusRequest {
  point?: string;
  order?: number;
}

interface VectorCalculusRequest {
  latex: string;
  variables?: string[];
}

interface VectorFieldRequest {
  components: string[];
  variables?: string[];
}

interface MultipleIntegralRequest {
  latex: string;
  variables?: string[];
  limits: string[][];
}

interface ApiResponse {
  result: string;
}

// ==================== 基础微积分 ====================

/**
 * 求导
 */
export async function differentiateWithSympy(
  latex: string,
  variable: string = 'x'
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/calculus/differentiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex, variable }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * 偏导数
 */
export async function partialDerivativeWithSympy(
  latex: string,
  variable: string = 'x'
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/calculus/partial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex, variable }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * 不定积分
 */
export async function integrateWithSympy(
  latex: string,
  variable: string = 'x'
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/calculus/integrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex, variable }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * 定积分
 */
export async function definiteIntegralWithSympy(
  latex: string,
  variable: string,
  lower_limit: string,
  upper_limit: string
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/calculus/definite-integral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex, variable, lower_limit, upper_limit }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * 极限
 */
export async function limitWithSympy(
  latex: string,
  variable: string,
  point: string
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/calculus/limit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex, variable, point }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * 无穷极限
 */
export async function limitAtInfinityWithSympy(
  latex: string,
  variable: string = 'x'
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/calculus/limit-infinity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex, variable }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * 求和
 */
export async function summationWithSympy(
  latex: string,
  variable: string,
  start: string,
  end: string
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/calculus/sum`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex, variable, start, end }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * 求积
 */
export async function productWithSympy(
  latex: string,
  variable: string,
  start: string,
  end: string
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/calculus/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex, variable, start, end }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

// ==================== 高级微积分 ====================

/**
 * Taylor 级数展开
 */
export async function taylorSeriesWithSympy(
  latex: string,
  variable: string = 'x',
  point: string = '0',
  order: number = 10
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/calculus/taylor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex, variable, point, order }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

// ==================== 向量微积分 ====================

/**
 * 梯度
 */
export async function gradientWithSympy(
  latex: string,
  variables: string[] = ['x', 'y', 'z']
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/vector/gradient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex, variables }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * 散度
 */
export async function divergenceWithSympy(
  components: string[],
  variables: string[] = ['x', 'y', 'z']
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/vector/divergence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ components, variables }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * 旋度
 */
export async function curlWithSympy(
  components: string[],
  variables: string[] = ['x', 'y', 'z']
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/vector/curl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ components, variables }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * 拉普拉斯算子
 */
export async function laplacianWithSympy(
  latex: string,
  variables: string[] = ['x', 'y', 'z']
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/vector/laplacian`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex, variables }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

// ==================== 多重积分 ====================

/**
 * 二重积分
 */
export async function doubleIntegralWithSympy(
  latex: string,
  variables: string[],
  limits: string[][]
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/integral/double`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex, variables, limits }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * 三重积分
 */
export async function tripleIntegralWithSympy(
  latex: string,
  variables: string[],
  limits: string[][]
): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/integral/triple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex, variables, limits }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data: ApiResponse = await response.json();
    return data.result;
  } catch {
    return null;
  }
}

// ==================== 统一入口 ====================

/**
 * 根据操作名称调用相应的微积分 API
 *
 * @param operation 操作名称（中文）
 * @param latex LaTeX 表达式
 * @param params 额外参数
 * @returns 计算结果，失败返回 null
 */
export async function applyCalculusOperation(
  operation: string,
  latex: string,
  params?: Record<string, any>
): Promise<string | null> {
  switch (operation) {
    case '求导':
      return differentiateWithSympy(latex, params?.variable || 'x');
    case '偏导':
      return partialDerivativeWithSympy(latex, params?.variable || 'x');
    case '不定积分':
      return integrateWithSympy(latex, params?.variable || 'x');
    case '定积分':
      if (!params?.lower_limit || !params?.upper_limit) return null;
      return definiteIntegralWithSympy(
        latex,
        params?.variable || 'x',
        params.lower_limit,
        params.upper_limit
      );
    case '极限':
      if (!params?.point) return null;
      return limitWithSympy(latex, params?.variable || 'x', params.point);
    case '无穷极限':
      return limitAtInfinityWithSympy(latex, params?.variable || 'x');
    case '求和':
      if (!params?.start || !params?.end) return null;
      return summationWithSympy(latex, params?.variable || 'i', params.start, params.end);
    case '求积':
      if (!params?.start || !params?.end) return null;
      return productWithSympy(latex, params?.variable || 'i', params.start, params.end);
    case 'Taylor展开':
      return taylorSeriesWithSympy(
        latex,
        params?.variable || 'x',
        params?.point || '0',
        params?.order || 10
      );
    case '梯度':
      return gradientWithSympy(latex, params?.variables || ['x', 'y', 'z']);
    case '散度':
      if (!params?.components) return null;
      return divergenceWithSympy(params.components, params?.variables || ['x', 'y', 'z']);
    case '旋度':
      if (!params?.components) return null;
      return curlWithSympy(params.components, params?.variables || ['x', 'y', 'z']);
    case '拉普拉斯':
      return laplacianWithSympy(latex, params?.variables || ['x', 'y', 'z']);
    case '二重积分':
      if (!params?.variables || !params?.limits) return null;
      return doubleIntegralWithSympy(latex, params.variables, params.limits);
    case '三重积分':
      if (!params?.variables || !params?.limits) return null;
      return tripleIntegralWithSympy(latex, params.variables, params.limits);
    default:
      return null;
  }
}
