from pydantic import BaseModel, Field
from typing import List, Optional


class FactorizationRequest(BaseModel):
    latex: str = Field(..., description="LaTeX 表达式，例如: x^2 - 5x + 6")


class FactorizationResponse(BaseModel):
    result: str = Field(..., description="因式分解后的 LaTeX 表达式")


class ExpandRequest(BaseModel):
    latex: str = Field(..., description="LaTeX 表达式")


class ExpandResponse(BaseModel):
    result: str = Field(..., description="展开后的 LaTeX 表达式")


class SimplifyRequest(BaseModel):
    latex: str = Field(..., description="LaTeX 表达式")


class SimplifyResponse(BaseModel):
    result: str = Field(..., description="化简后的 LaTeX 表达式")


class VerifyRequest(BaseModel):
    input_latex: str = Field(..., description="原始表达式的 LaTeX")
    output_latex: str = Field(..., description="操作结果表达式的 LaTeX")


class VerifyResponse(BaseModel):
    is_equivalent: bool = Field(..., description="两个表达式是否数学等价")


# ==================== 微积分模型 ====================

class CalculusRequest(BaseModel):
    latex: str = Field(..., description="LaTeX 表达式")
    variable: str = Field(default="x", description="变量名，默认为 x")


class CalculusResponse(BaseModel):
    result: str = Field(..., description="计算结果的 LaTeX 表示")


class DefiniteIntegralRequest(BaseModel):
    latex: str = Field(..., description="LaTeX 表达式")
    variable: str = Field(default="x", description="积分变量")
    lower_limit: str = Field(..., description="积分下限，可解析为数字或符号")
    upper_limit: str = Field(..., description="积分上限，可解析为数字或符号")


class LimitRequest(BaseModel):
    latex: str = Field(..., description="LaTeX 表达式")
    variable: str = Field(default="x", description="变量名")
    point: str = Field(..., description="趋近值，例如: 0, 1, oo")


class SummationRequest(BaseModel):
    latex: str = Field(..., description="LaTeX 表达式")
    variable: str = Field(default="i", description="求和指标变量")
    start: str = Field(..., description="起始值")
    end: str = Field(..., description="结束值")


class ProductRequest(BaseModel):
    latex: str = Field(..., description="LaTeX 表达式")
    variable: str = Field(default="i", description="求积指标变量")
    start: str = Field(..., description="起始值")
    end: str = Field(..., description="结束值")


class TaylorRequest(BaseModel):
    latex: str = Field(..., description="LaTeX 表达式")
    variable: str = Field(default="x", description="变量名")
    point: str = Field(default="0", description="展开点，默认为0（Maclaurin级数）")
    order: int = Field(default=10, description="展开阶数，默认10项")


class VectorCalculusRequest(BaseModel):
    latex: str = Field(..., description="标量场的 LaTeX 表达式（用于 gradient, laplacian）")
    variables: List[str] = Field(default=["x", "y", "z"], description="坐标变量列表")


class VectorFieldRequest(BaseModel):
    components: List[str] = Field(..., description="向量场的分量 [Fx, Fy, Fz]（用于 divergence, curl）")
    variables: List[str] = Field(default=["x", "y", "z"], description="坐标变量列表")


class DoubleIntegralRequest(BaseModel):
    latex: str = Field(..., description="LaTeX 表达式")
    variables: List[str] = Field(default=["x", "y"], description="积分变量")
    limits: List[List[str]] = Field(..., description="积分限 [[x_lower, x_upper], [y_lower, y_upper]]")


class TripleIntegralRequest(BaseModel):
    latex: str = Field(..., description="LaTeX 表达式")
    variables: List[str] = Field(default=["x", "y", "z"], description="积分变量")
    limits: List[List[str]] = Field(..., description="三组积分限")


# ==================== 求解模型 ====================

class SolveStep(BaseModel):
    description: str = Field(..., description="变换说明，如'两边减 3'")
    latex: str = Field(..., description="中间结果 LaTeX")


class SolveEquationRequest(BaseModel):
    latex: str = Field(..., description="方程的 LaTeX 表达式，如 2x + 3 = 7")


class SolveEquationResponse(BaseModel):
    result: str = Field(..., description="最终解的 LaTeX")
    steps: List[SolveStep] = Field(..., description="求解步骤列表")
    verified: bool = Field(default=False, description="结果是否经过验证")


class SolveInequalityRequest(BaseModel):
    latex: str = Field(..., description="不等式的 LaTeX 表达式，如 2x + 3 > 7")


class IntervalData(BaseModel):
    lower: Optional[float] = Field(None, description="区间下界，null 表示负无穷")
    upper: Optional[float] = Field(None, description="区间上界，null 表示正无穷")
    lower_strict: bool = Field(True, description="下界是否为开区间（不包含）")
    upper_strict: bool = Field(True, description="上界是否为开区间（不包含）")


class SolveInequalityResponse(BaseModel):
    result: str = Field(..., description="解集的 LaTeX 表达式")
    steps: List[SolveStep] = Field(..., description="求解步骤列表")
    intervals: List[IntervalData] = Field(default_factory=list, description="解集区间数据，供前端数轴图使用")
    verified: bool = Field(default=False, description="结果是否经过验证")


class SolveSystemRequest(BaseModel):
    equations: List[str] = Field(..., description="方程列表，每个元素是一个方程的 LaTeX")
    variables: List[str] = Field(..., description="变量名列表，如 ['x', 'y']")


class SolveSystemResponse(BaseModel):
    result: str = Field(..., description="最终解的 LaTeX")
    steps: List[SolveStep] = Field(..., description="求解步骤列表")
    verified: bool = Field(default=False, description="结果是否经过验证")
