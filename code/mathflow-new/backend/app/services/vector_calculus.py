"""
向量微积分模块

使用 SymPy 的向量模块实现梯度、散度、旋度和拉普拉斯算子
"""
import sympy
from sympy.parsing.latex import parse_latex
from sympy import latex, Symbol
from sympy.vector import CoordSys3D, gradient, divergence, curl, laplacian
from typing import Optional, List


def parse_latex_safe(latex_str: str) -> Optional[sympy.Expr]:
    """安全地解析 LaTeX 表达式"""
    try:
        return parse_latex(latex_str)
    except Exception as e:
        raise ValueError(f"无法解析 LaTeX: {str(e)}")


def _create_coordinate_system(variables: List[str] = None):
    """
    创建笛卡尔坐标系

    Args:
        variables: 坐标变量列表，默认为 ["x", "y", "z"]

    Returns:
        CoordSys3D 坐标系对象
    """
    if variables is None:
        variables = ["x", "y", "z"]

    # 创建笛卡尔坐标系
    # SymPy 的 CoordSys3D 会自动创建 base scalars (i.x, i.y, i.z)
    coord_sys = CoordSys3D('C')
    return coord_sys, variables


def _expr_to_vector_field(expr_str: str, variables: List[str], coord_sys: CoordSys3D):
    """
    将表达式字符串转换为 SymPy 向量场

    Args:
        expr_str: 表达式字符串
        variables: 变量列表
        coord_sys: 坐标系

    Returns:
        SymPy 向量场表达式
    """
    # 创建变量符号映射
    var_map = {}
    for i, var in enumerate(variables):
        if i == 0:
            var_map[var] = coord_sys.x
        elif i == 1:
            var_map[var] = coord_sys.y
        elif i == 2:
            var_map[var] = coord_sys.z

    return expr_str, var_map


def compute_gradient(latex_str: str, variables: List[str] = None) -> str:
    """
    计算标量场的梯度

    ∇f = (∂f/∂x, ∂f/∂y, ∂f/∂z)

    Args:
        latex_str: LaTeX 格式的标量场表达式
        variables: 坐标变量列表，默认为 ["x", "y", "z"]

    Returns:
        梯度的 LaTeX 表达式
    """
    if variables is None:
        variables = ["x", "y", "z"]

    # 使用标量方法计算梯度
    # ∇f = (∂f/∂x)i + (∂f/∂y)j + (∂f/∂z)k
    expr = parse_latex_safe(latex_str)
    components = []

    for var in variables:
        var_sym = Symbol(var)
        partial = sympy.diff(expr, var_sym)
        components.append(latex(partial))

    # 格式化为向量形式
    result = f"\\left\\langle {components[0]}, {', '.join(components[1:])} \\right\\rangle"
    return result


def compute_divergence(components: List[str], variables: List[str] = None) -> str:
    """
    计算向量场的散度

    ∇·F = ∂Fx/∂x + ∂Fy/∂y + ∂Fz/∂z

    Args:
        components: 向量场的分量 [Fx, Fy, Fz] (LaTeX 格式)
        variables: 坐标变量列表，默认为 ["x", "y", "z"]

    Returns:
        散度的 LaTeX 表达式（标量）
    """
    if variables is None:
        variables = ["x", "y", "z"]

    # 计算散度：div F = dFx/dx + dFy/dy + dFz/dz
    terms = []
    for i, comp_latex in enumerate(components):
        comp_expr = parse_latex_safe(comp_latex)
        var_sym = Symbol(variables[i])
        div_term = sympy.diff(comp_expr, var_sym)
        terms.append(div_term)

    result = sympy.Add(*terms)
    return latex(result)


def compute_curl(components: List[str], variables: List[str] = None) -> str:
    """
    计算向量场的旋度

    ∇×F = (∂Fz/∂y - ∂Fy/∂z)i + (∂Fx/∂z - ∂Fz/∂x)j + (∂Fy/∂x - ∂Fx/∂y)k

    Args:
        components: 向量场的分量 [Fx, Fy, Fz] (LaTeX 格式)
        variables: 坐标变量列表，默认为 ["x", "y", "z"]

    Returns:
        旋度的 LaTeX 表达式（向量）
    """
    if variables is None:
        variables = ["x", "y", "z"]

    if len(components) != 3 or len(variables) != 3:
        raise ValueError("旋度计算需要三维向量场")

    # 解析分量
    Fx = parse_latex_safe(components[0])
    Fy = parse_latex_safe(components[1])
    Fz = parse_latex_safe(components[2])

    x, y, z = Symbol(variables[0]), Symbol(variables[1]), Symbol(variables[2])

    # 计算旋度分量
    curl_x = sympy.diff(Fz, y) - sympy.diff(Fy, z)
    curl_y = sympy.diff(Fx, z) - sympy.diff(Fz, x)
    curl_z = sympy.diff(Fy, x) - sympy.diff(Fx, y)

    # 格式化为向量形式
    result = f"\\left\\langle {latex(curl_x)}, {latex(curl_y)}, {latex(curl_z)} \\right\\rangle"
    return result


def compute_laplacian(latex_str: str, variables: List[str] = None) -> str:
    """
    计算标量场的拉普拉斯算子

    ∇²f = ∂²f/∂x² + ∂²f/∂y² + ∂²f/∂z²

    Args:
        latex_str: LaTeX 格式的标量场表达式
        variables: 坐标变量列表，默认为 ["x", "y", "z"]

    Returns:
        拉普拉斯的 LaTeX 表达式（标量）
    """
    if variables is None:
        variables = ["x", "y", "z"]

    expr = parse_latex_safe(latex_str)
    terms = []

    # 计算每个变量的二阶偏导数
    for var in variables:
        var_sym = Symbol(var)
        second_partial = sympy.diff(expr, var_sym, 2)  # 二阶导数
        terms.append(second_partial)

    result = sympy.Add(*terms)
    return latex(result)
