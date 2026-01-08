import sympy
from sympy.parsing.latex import parse_latex
from sympy import latex, Symbol
from typing import Optional


def parse_latex_safe(latex_str: str) -> Optional[sympy.Expr]:
    """安全地解析 LaTeX 表达式"""
    try:
        return parse_latex(latex_str)
    except Exception as e:
        raise ValueError(f"无法解析 LaTeX: {str(e)}")


def factor_expression(latex_str: str) -> str:
    """
    对表达式进行因式分解

    Args:
        latex_str: LaTeX 格式的表达式

    Returns:
        因式分解后的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)
    factored = sympy.factor(expr)
    return latex(factored)


def expand_expression(latex_str: str) -> str:
    """
    展开表达式

    Args:
        latex_str: LaTeX 格式的表达式

    Returns:
        展开后的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)
    expanded = sympy.expand(expr)
    return latex(expanded)


def simplify_expression(latex_str: str) -> str:
    """
    化简表达式

    Args:
        latex_str: LaTeX 格式的表达式

    Returns:
        化简后的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)
    simplified = sympy.simplify(expr)
    return latex(simplified)


def differentiate(latex_str: str, variable: str = "x") -> str:
    """
    对表达式求导

    Args:
        latex_str: LaTeX 格式的表达式
        variable: 求导变量，默认为 x

    Returns:
        求导后的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)
    var = Symbol(variable)
    derivative = sympy.diff(expr, var)
    return latex(derivative)


def integrate(latex_str: str, variable: str = "x") -> str:
    """
    对表达式积分

    Args:
        latex_str: LaTeX 格式的表达式
        variable: 积分变量，默认为 x

    Returns:
        积分后的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)
    var = Symbol(variable)
    integral = sympy.integrate(expr, var)
    return latex(integral)


# ==================== 微积分函数 ====================

def differentiate_expr(latex_str: str, variable: str = "x") -> str:
    """
    对表达式求导

    Args:
        latex_str: LaTeX 格式的表达式
        variable: 求导变量，默认为 x

    Returns:
        求导后的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)
    var = Symbol(variable)
    derivative = sympy.diff(expr, var)
    return latex(derivative)


def partial_derivative(latex_str: str, variable: str = "x") -> str:
    """
    对表达式求偏导数

    Args:
        latex_str: LaTeX 格式的表达式
        variable: 求偏导变量，默认为 x

    Returns:
        偏导数后的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)
    var = Symbol(variable)
    derivative = sympy.diff(expr, var)
    return latex(derivative)


def integrate_indefinite(latex_str: str, variable: str = "x") -> str:
    """
    对表达式求不定积分

    Args:
        latex_str: LaTeX 格式的表达式
        variable: 积分变量，默认为 x

    Returns:
        不定积分后的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)
    var = Symbol(variable)
    integral = sympy.integrate(expr, var)
    return latex(integral)


def integrate_definite(latex_str: str, variable: str, lower: str, upper: str) -> str:
    """
    对表达式求定积分

    Args:
        latex_str: LaTeX 格式的表达式
        variable: 积分变量
        lower: 积分下限
        upper: 积分上限

    Returns:
        定积分后的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)
    var = Symbol(variable)

    # 解析积分限
    a = parse_latex_safe(lower)
    b = parse_latex_safe(upper)

    integral = sympy.integrate(expr, (var, a, b))
    return latex(integral)


def compute_limit(latex_str: str, variable: str, point: str) -> str:
    """
    计算表达式极限

    Args:
        latex_str: LaTeX 格式的表达式
        variable: 变量名
        point: 趋近值

    Returns:
        极限的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)
    var = Symbol(variable)
    x0 = parse_latex_safe(point)

    result = sympy.limit(expr, var, x0)
    return latex(result)


def limit_at_infinity(latex_str: str, variable: str = "x") -> str:
    """
    计算表达式在无穷处的极限

    Args:
        latex_str: LaTeX 格式的表达式
        variable: 变量名，默认为 x

    Returns:
        无穷极限的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)
    var = Symbol(variable)
    result = sympy.limit(expr, var, sympy.oo)
    return latex(result)


def compute_summation(latex_str: str, variable: str, start: str, end: str) -> str:
    """
    计算求和

    Args:
        latex_str: LaTeX 格式的表达式
        variable: 求和指标变量
        start: 起始值
        end: 结束值

    Returns:
        求和结果的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)
    var = Symbol(variable)

    a = parse_latex_safe(start)
    b = parse_latex_safe(end)

    result = sympy.summation(expr, (var, a, b))
    return latex(result)


def compute_product(latex_str: str, variable: str, start: str, end: str) -> str:
    """
    计算求积

    Args:
        latex_str: LaTeX 格式的表达式
        variable: 求积指标变量
        start: 起始值
        end: 结束值

    Returns:
        求积结果的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)
    var = Symbol(variable)

    a = parse_latex_safe(start)
    b = parse_latex_safe(end)

    result = sympy.product(expr, (var, a, b))
    return latex(result)


def taylor_series(latex_str: str, variable: str = "x", point: str = "0", order: int = 10) -> str:
    """
    计算 Taylor 级数展开

    Args:
        latex_str: LaTeX 格式的表达式
        variable: 变量名，默认为 x
        point: 展开点，默认为 0（Maclaurin 级数）
        order: 展开阶数，默认为 10

    Returns:
        Taylor 级数的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)
    var = Symbol(variable)

    # 解析展开点
    x0 = parse_latex_safe(point) if point != "0" else 0

    # 计算级数并移除大O项
    series = expr.series(var, x0, order)
    result = series.removeO()
    return latex(result)


def compute_double_integral(latex_str: str, variables: list, limits: list) -> str:
    """
    计算二重积分

    Args:
        latex_str: LaTeX 格式的表达式
        variables: 积分变量列表，如 ["x", "y"]
        limits: 积分限列表，如 [["x_lower", "x_upper"], ["y_lower", "y_upper"]]

    Returns:
        二重积分的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)

    # 解析变量和积分限
    var1 = Symbol(variables[0])
    var2 = Symbol(variables[1])

    a1 = parse_latex_safe(limits[0][0])
    b1 = parse_latex_safe(limits[0][1])
    a2 = parse_latex_safe(limits[1][0])
    b2 = parse_latex_safe(limits[1][1])

    result = sympy.integrate(expr, (var1, a1, b1), (var2, a2, b2))
    return latex(result)


def compute_triple_integral(latex_str: str, variables: list, limits: list) -> str:
    """
    计算三重积分

    Args:
        latex_str: LaTeX 格式的表达式
        variables: 积分变量列表，如 ["x", "y", "z"]
        limits: 积分限列表，三组积分限

    Returns:
        三重积分的 LaTeX 表达式
    """
    expr = parse_latex_safe(latex_str)

    vars_symbols = [Symbol(v) for v in variables]

    # 解析积分限
    integration_vars = []
    for i, var in enumerate(vars_symbols):
        a = parse_latex_safe(limits[i][0])
        b = parse_latex_safe(limits[i][1])
        integration_vars.append((var, a, b))

    result = sympy.integrate(expr, *integration_vars)
    return latex(result)
