from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .models import (
    FactorizationRequest,
    FactorizationResponse,
    ExpandRequest,
    ExpandResponse,
    SimplifyRequest,
    SimplifyResponse,
    # 微积分模型
    CalculusRequest,
    CalculusResponse,
    DefiniteIntegralRequest,
    LimitRequest,
    SummationRequest,
    ProductRequest,
    TaylorRequest,
    VectorCalculusRequest,
    VectorFieldRequest,
    DoubleIntegralRequest,
    TripleIntegralRequest,
)
from .services.sympy_service import (
    factor_expression,
    expand_expression,
    simplify_expression,
    # 微积分函数
    differentiate_expr,
    partial_derivative,
    integrate_indefinite,
    integrate_definite,
    compute_limit,
    limit_at_infinity,
    compute_summation,
    compute_product,
    taylor_series,
    compute_double_integral,
    compute_triple_integral,
)
from .services.vector_calculus import (
    compute_gradient,
    compute_divergence,
    compute_curl,
    compute_laplacian,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时
    print("MathFlow Symbolic Math API starting...")
    yield
    # 关闭时
    print("MathFlow Symbolic Math API shutting down...")


app = FastAPI(
    title="MathFlow Symbolic Math API",
    description="基于 SymPy 的符号数学计算服务，支持代数运算和微积分",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境允许所有来源，生产环境应限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "MathFlow Symbolic Math API",
        "version": "2.0.0",
        "endpoints": {
            "代数运算": {
                "factor": "/api/factor - 因式分解",
                "expand": "/api/expand - 展开",
                "simplify": "/api/simplify - 化简",
            },
            "基础微积分": {
                "differentiate": "/api/calculus/differentiate - 求导",
                "partial": "/api/calculus/partial - 偏导",
                "integrate": "/api/calculus/integrate - 不定积分",
                "definite": "/api/calculus/definite-integral - 定积分",
                "limit": "/api/calculus/limit - 极限",
                "limit-infinity": "/api/calculus/limit-infinity - 无穷极限",
                "sum": "/api/calculus/sum - 求和",
                "product": "/api/calculus/product - 求积",
            },
            "高级微积分": {
                "taylor": "/api/calculus/taylor - Taylor 展开",
            },
            "向量微积分": {
                "gradient": "/api/vector/gradient - 梯度",
                "divergence": "/api/vector/divergence - 散度",
                "curl": "/api/vector/curl - 旋度",
                "laplacian": "/api/vector/laplacian - 拉普拉斯",
            },
            "多重积分": {
                "double": "/api/integral/double - 二重积分",
                "triple": "/api/integral/triple - 三重积分",
            },
            "health": "/health - 健康检查",
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


# ==================== 代数运算端点 ====================

@app.post("/api/factor", response_model=FactorizationResponse)
async def factor_endpoint(request: FactorizationRequest):
    """
    因式分解表达式

    示例:
    - 输入: "x^2 - 5x + 6"
    - 输出: "(x - 2)(x - 3)"
    """
    try:
        result = factor_expression(request.latex)
        return FactorizationResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"因式分解失败: {str(e)}")


@app.post("/api/expand", response_model=ExpandResponse)
async def expand_endpoint(request: ExpandRequest):
    """
    展开表达式

    示例:
    - 输入: "(x + 1)^2"
    - 输出: "x^{2} + 2 x + 1"
    """
    try:
        result = expand_expression(request.latex)
        return ExpandResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"展开失败: {str(e)}")


@app.post("/api/simplify", response_model=SimplifyResponse)
async def simplify_endpoint(request: SimplifyRequest):
    """
    化简表达式

    示例:
    - 输入: "x^2 + 2x + x - 3"
    - 输出: "x^{2} + 3 x - 3"
    """
    try:
        result = simplify_expression(request.latex)
        return SimplifyResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"化简失败: {str(e)}")


# ==================== 基础微积分端点 ====================

@app.post("/api/calculus/differentiate", response_model=CalculusResponse)
async def differentiate_endpoint(request: CalculusRequest):
    """
    对表达式求导

    示例:
    - 输入: {"latex": "x^3", "variable": "x"}
    - 输出: {"result": "3 x^{2}"}
    """
    try:
        result = differentiate_expr(request.latex, request.variable)
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"求导失败: {str(e)}")


@app.post("/api/calculus/partial", response_model=CalculusResponse)
async def partial_derivative_endpoint(request: CalculusRequest):
    """
    对表达式求偏导数

    示例:
    - 输入: {"latex": "x^2 + y^2", "variable": "x"}
    - 输出: {"result": "2 x"}
    """
    try:
        result = partial_derivative(request.latex, request.variable)
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"偏导数计算失败: {str(e)}")


@app.post("/api/calculus/integrate", response_model=CalculusResponse)
async def integrate_endpoint(request: CalculusRequest):
    """
    对表达式求不定积分

    示例:
    - 输入: {"latex": "x^2", "variable": "x"}
    - 输出: {"result": "\\frac{x^{3}}{3}"}
    """
    try:
        result = integrate_indefinite(request.latex, request.variable)
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"积分失败: {str(e)}")


@app.post("/api/calculus/definite-integral", response_model=CalculusResponse)
async def definite_integral_endpoint(request: DefiniteIntegralRequest):
    """
    对表达式求定积分

    示例:
    - 输入: {"latex": "x^2", "variable": "x", "lower_limit": "0", "upper_limit": "1"}
    - 输出: {"result": "\\frac{1}{3}"}
    """
    try:
        result = integrate_definite(
            request.latex,
            request.variable,
            request.lower_limit,
            request.upper_limit
        )
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"定积分计算失败: {str(e)}")


@app.post("/api/calculus/limit", response_model=CalculusResponse)
async def limit_endpoint(request: LimitRequest):
    """
    计算表达式极限

    示例:
    - 输入: {"latex": "\\frac{\\sin(x)}{x}", "variable": "x", "point": "0"}
    - 输出: {"result": "1"}
    """
    try:
        result = compute_limit(request.latex, request.variable, request.point)
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"极限计算失败: {str(e)}")


@app.post("/api/calculus/limit-infinity", response_model=CalculusResponse)
async def limit_infinity_endpoint(request: CalculusRequest):
    """
    计算表达式在无穷处的极限

    示例:
    - 输入: {"latex": "\\frac{1}{x}", "variable": "x"}
    - 输出: {"result": "0"}
    """
    try:
        result = limit_at_infinity(request.latex, request.variable)
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"无穷极限计算失败: {str(e)}")


@app.post("/api/calculus/sum", response_model=CalculusResponse)
async def summation_endpoint(request: SummationRequest):
    """
    计算求和

    示例:
    - 输入: {"latex": "i", "variable": "i", "start": "1", "end": "10"}
    - 输出: {"result": "55"}
    """
    try:
        result = compute_summation(
            request.latex,
            request.variable,
            request.start,
            request.end
        )
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"求和计算失败: {str(e)}")


@app.post("/api/calculus/product", response_model=CalculusResponse)
async def product_endpoint(request: ProductRequest):
    """
    计算求积

    示例:
    - 输入: {"latex": "2", "variable": "i", "start": "1", "end": "5"}
    - 输出: {"result": "32"}
    """
    try:
        result = compute_product(
            request.latex,
            request.variable,
            request.start,
            request.end
        )
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"求积计算失败: {str(e)}")


@app.post("/api/calculus/taylor", response_model=CalculusResponse)
async def taylor_endpoint(request: TaylorRequest):
    """
    计算 Taylor 级数展开

    示例:
    - 输入: {"latex": "\\sin(x)", "variable": "x", "point": "0", "order": "5"}
    - 输出: {"result": "x - \\frac{x^{3}}{6} + \\frac{x^{5}}{120}"}
    """
    try:
        result = taylor_series(
            request.latex,
            request.variable,
            request.point,
            request.order
        )
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Taylor 级数展开失败: {str(e)}")


# ==================== 向量微积分端点 ====================

@app.post("/api/vector/gradient", response_model=CalculusResponse)
async def gradient_endpoint(request: VectorCalculusRequest):
    """
    计算标量场的梯度

    示例:
    - 输入: {"latex": "x^2 + y^2", "variables": ["x", "y", "z"]}
    - 输出: {"result": "\\langle 2 x, 2 y \\rangle"}
    """
    try:
        result = compute_gradient(request.latex, request.variables)
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"梯度计算失败: {str(e)}")


@app.post("/api/vector/divergence", response_model=CalculusResponse)
async def divergence_endpoint(request: VectorFieldRequest):
    """
    计算向量场的散度

    示例:
    - 输入: {"components": ["x", "y", "z"], "variables": ["x", "y", "z"]}
    - 输出: {"result": "3"}
    """
    try:
        result = compute_divergence(request.components, request.variables)
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"散度计算失败: {str(e)}")


@app.post("/api/vector/curl", response_model=CalculusResponse)
async def curl_endpoint(request: VectorFieldRequest):
    """
    计算向量场的旋度

    示例:
    - 输入: {"components": ["-y", "x", "0"], "variables": ["x", "y", "z"]}
    - 输出: {"result": "\\langle 0, 0, 2 \\rangle"}
    """
    try:
        result = compute_curl(request.components, request.variables)
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"旋度计算失败: {str(e)}")


@app.post("/api/vector/laplacian", response_model=CalculusResponse)
async def laplacian_endpoint(request: VectorCalculusRequest):
    """
    计算标量场的拉普拉斯算子

    示例:
    - 输入: {"latex": "x^2 + y^2 + z^2", "variables": ["x", "y", "z"]}
    - 输出: {"result": "6"}
    """
    try:
        result = compute_laplacian(request.latex, request.variables)
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"拉普拉斯计算失败: {str(e)}")


# ==================== 多重积分端点 ====================

@app.post("/api/integral/double", response_model=CalculusResponse)
async def double_integral_endpoint(request: DoubleIntegralRequest):
    """
    计算二重积分

    示例:
    - 输入: {"latex": "x + y", "variables": ["x", "y"], "limits": [["0", "1"], ["0", "1"]]}
    - 输出: {"result": "1"}
    """
    try:
        result = compute_double_integral(
            request.latex,
            request.variables,
            request.limits
        )
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"二重积分计算失败: {str(e)}")


@app.post("/api/integral/triple", response_model=CalculusResponse)
async def triple_integral_endpoint(request: TripleIntegralRequest):
    """
    计算三重积分

    示例:
    - 输入: {"latex": "1", "variables": ["x", "y", "z"], "limits": [["0", "1"], ["0", "1"], ["0", "1"]]}
    - 输出: {"result": "1"}
    """
    try:
        result = compute_triple_integral(
            request.latex,
            request.variables,
            request.limits
        )
        return CalculusResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"三重积分计算失败: {str(e)}")
