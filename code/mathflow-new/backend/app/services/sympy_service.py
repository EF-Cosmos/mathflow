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
