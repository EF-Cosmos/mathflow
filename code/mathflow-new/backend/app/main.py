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
)
from .services.sympy_service import (
    factor_expression,
    expand_expression,
    simplify_expression,
    differentiate,
    integrate,
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
    description="基于 SymPy 的符号数学计算服务",
    version="1.0.0",
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
        "version": "1.0.0",
        "endpoints": {
            "factor": "/api/factor - 因式分解",
            "expand": "/api/expand - 展开",
            "simplify": "/api/simplify - 化简",
            "health": "/health - 健康检查",
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


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
