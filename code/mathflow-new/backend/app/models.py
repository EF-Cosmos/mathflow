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
