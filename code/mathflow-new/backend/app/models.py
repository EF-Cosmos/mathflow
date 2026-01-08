from pydantic import BaseModel, Field


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
