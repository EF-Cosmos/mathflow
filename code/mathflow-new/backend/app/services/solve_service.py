"""
Equation, inequality, and system solving service.

Generates step-by-step solutions using SymPy's verified solving APIs.
SymPy computes the answers; we build pedagogical steps on top.
"""

import sympy
from sympy import (
    Symbol, Eq, latex, solve, reduce_inequalities, linsolve,
    Poly, Rational, simplify,
    StrictLessThan, LessThan, StrictGreaterThan, GreaterThan,
    And, Or, S, oo, symbols,
)
from typing import Optional

from .sympy_service import parse_latex_safe


def _find_variable(expr) -> Symbol:
    """
    Find the variable in a SymPy expression.

    Scans free symbols for a single-letter variable (excludes Greek symbols
    like Delta). Returns the first one alphabetically if multiple found.
    """
    free_syms = expr.free_symbols
    # Filter out Greek symbols and constants
    candidates = sorted(
        [s for s in free_syms if len(s.name) == 1 and s.name.isalpha()],
        key=lambda s: s.name
    )
    if not candidates:
        raise ValueError("无法识别方程中的变量")
    return candidates[0]


def _is_fractional(eq) -> bool:
    """Check if an equation contains fractions with the variable in the denominator."""
    var = _find_variable(eq)
    # Check both sides for fractions with variable in denominator
    full_expr = eq.lhs - eq.rhs
    return full_expr.has(sympy.Pow, sympy.Mul)


def _check_extraneous(eq, solutions, var: Symbol) -> list:
    """
    Filter out solutions that make denominators zero.

    Returns tuple of (valid_solutions, extraneous_solutions).
    """
    valid = []
    extraneous = []
    for sol in solutions:
        try:
            # Check if substituting the solution causes division by zero
            lhs_val = eq.lhs.subs(var, sol)
            rhs_val = eq.rhs.subs(var, sol)
            # Try to evaluate both sides -- if either raises, it's extraneous
            lhs_val.evalf()
            rhs_val.evalf()
            valid.append(sol)
        except (ZeroDivisionError, TypeError, ValueError):
            extraneous.append(sol)
        except Exception:
            # If anything goes wrong during evaluation, keep the solution
            # (SymPy usually handles this correctly)
            valid.append(sol)
    return valid, extraneous


def _format_number(val) -> str:
    """Format a SymPy number for display in step descriptions."""
    try:
        if val.is_Integer:
            return str(int(val))
        elif val.is_Rational:
            fval = float(val)
            if fval == int(fval):
                return str(int(fval))
            return str(val)
        else:
            return str(val)
    except Exception:
        return str(val)


def solve_equation_with_steps(latex_str: str) -> dict:
    """
    Solve an equation and return result with step-by-step process.

    Handles linear, quadratic, and fractional equations.
    Returns dict with keys: result, steps, verified.
    """
    if not latex_str or not latex_str.strip():
        raise ValueError("LaTeX 表达式不能为空")

    if len(latex_str) > 500:
        raise ValueError("表达式过长，请简化后重试")

    parsed = parse_latex_safe(latex_str)
    var = _find_variable(parsed)

    steps = []
    steps.append({"description": "原方程", "latex": latex(parsed)})

    if not isinstance(parsed, Eq):
        # Not an equation -- try to solve as expression = 0
        parsed = Eq(parsed, 0)
        steps[0]["latex"] = latex(parsed)

    # Rearrange to lhs - rhs = 0
    rearranged = simplify(parsed.lhs - parsed.rhs)

    # Try to detect polynomial
    try:
        poly = Poly(rearranged, var)
        degree = poly.degree()
    except (sympy.PolynomialError, Exception):
        poly = None
        degree = None

    if degree == 1:
        # Linear equation: a*x + c = 0 where c = constant from rearranged
        a = poly.coeff_monomial(var)
        c = poly.coeff_monomial(1)  # constant term (from lhs - rhs = 0)

        # Step: rearrange original equation to isolate terms with variable
        # Move constant from RHS to LHS (or vice versa)
        # The constant c is from (lhs - rhs), so the equation is a*x + c = 0
        # We want: a*x = -c, then x = -c/a
        if c != 0:
            # Show: move constant to other side
            # From original: a*x + (terms_from_rhs_const) = rhs_const
            # Rearranged: a*x = -c (in the lhs-rhs=0 form)
            const_on_lhs = simplify(parsed.lhs - a * var)
            const_on_rhs = simplify(parsed.rhs)
            new_lhs = a * var
            new_rhs = simplify(const_on_rhs - const_on_lhs)

            const_val = simplify(-c)  # This is the value to move
            if c > 0:
                desc = f"两边减 {_format_number(c)}"
            else:
                desc = f"两边加 {_format_number(abs(c))}"
            steps.append({
                "description": desc,
                "latex": latex(Eq(new_lhs, new_rhs))
            })
        else:
            new_rhs = parsed.rhs

        # Compute actual solution
        solution = simplify(-c / a)

        # Step: divide by coefficient
        a_display = _format_number(a)
        steps.append({
            "description": f"两边除以 {a_display}",
            "latex": latex(Eq(var, solution))
        })

        final_result = latex(Eq(var, solution))

    elif degree == 2:
        # Quadratic equation
        a = poly.coeff_monomial(var ** 2)
        b = poly.coeff_monomial(var)
        c = poly.coeff_monomial(1)

        # Step: identify coefficients
        steps.append({
            "description": f"识别系数: a = {_format_number(a)}, b = {_format_number(b)}, c = {_format_number(c)}",
            "latex": latex(Eq(var ** 2 * a + var * b + c, 0))
        })

        # Step: calculate discriminant
        delta = b ** 2 - 4 * a * c
        delta_val = simplify(delta)
        steps.append({
            "description": f"计算判别式: \\Delta = {_format_number(b)}^2 - 4 \\times {_format_number(a)} \\times {_format_number(c)} = {_format_number(delta_val)}",
            "latex": latex(Eq(Symbol('\\Delta'), delta_val))
        })

        # Solve using SymPy
        solutions = solve(parsed, var)
        solutions = [simplify(s) for s in solutions]

        # Check for no real roots
        real_solutions = []
        complex_solutions = []
        for sol in solutions:
            try:
                sol_val = complex(sol.evalf())
                if abs(sol_val.imag) < 1e-10:
                    real_solutions.append(simplify(sol_val.real))
                else:
                    complex_solutions.append(sol)
            except (TypeError, ValueError):
                real_solutions.append(sol)

        if not real_solutions:
            steps.append({
                "description": "\\Delta < 0，方程无实数根",
                "latex": "\\text{无实数解}"
            })
            final_result = "\\text{无实数解}"
        else:
            # Step: apply quadratic formula
            formula_latex = f"x = \\frac{{-{_format_number(b)} \\pm \\sqrt{{{_format_number(delta_val)}}}}}{{2 \\times {_format_number(a)}}}"
            steps.append({
                "description": "应用求根公式",
                "latex": formula_latex
            })

            # Format solutions
            if len(real_solutions) == 1:
                final_result = latex(Eq(var, real_solutions[0]))
                steps.append({
                    "description": "方程有一个重根",
                    "latex": final_result
                })
            else:
                sol_parts = [latex(Eq(var, s)) for s in real_solutions]
                final_result = ", ".join(sol_parts)
                steps.append({
                    "description": f"方程有两个实数根",
                    "latex": final_result
                })

    else:
        # General case: use solve directly
        # Check for fractional equations
        solutions = solve(parsed, var)
        solutions = [simplify(s) for s in solutions]

        # Check for extraneous solutions if expression has fractions
        is_frac = any(
            term.has(var) and isinstance(term, sympy.Pow) and term.exp == -1
            for term in (parsed.lhs - parsed.rhs).as_ordered_terms()
            if hasattr(term, 'has')
        )

        if is_frac and solutions:
            valid, extraneous = _check_extraneous(parsed, solutions, var)
            for ext in extraneous:
                steps.append({
                    "description": f"{var.name} = {_format_number(ext)} 使分母为零，舍去",
                    "latex": f"{var.name} = {_format_number(ext)} \\rightarrow \\text{舍去}"
                })
            solutions = valid

        if not solutions:
            steps.append({
                "description": "方程无解",
                "latex": "\\text{无解}"
            })
            final_result = "\\text{无解}"
        else:
            sol_parts = [latex(Eq(var, s)) for s in solutions]
            final_result = ", ".join(sol_parts)
            steps.append({
                "description": "求解结果",
                "latex": final_result
            })

    return {"result": final_result, "steps": steps, "verified": False}


def _extract_intervals(result, var: Symbol) -> list:
    """
    Extract interval data from reduce_inequalities result.

    Handles And, Or, Eq, True, False result types.
    Returns list of dicts with lower, upper, lower_strict, upper_strict.
    """
    intervals = []

    if result is S.true:
        # All real numbers
        intervals.append({
            "lower": None,
            "upper": None,
            "lower_strict": False,
            "upper_strict": False,
        })
        return intervals

    if result is S.false:
        # No solution
        return intervals

    if isinstance(result, Eq):
        # Single point
        val = result.rhs if result.lhs == var else result.lhs
        try:
            fval = float(val)
        except (TypeError, ValueError):
            fval = None
        intervals.append({
            "lower": fval,
            "upper": fval,
            "lower_strict": False,
            "upper_strict": False,
        })
        return intervals

    if isinstance(result, And):
        # Single interval
        bounds = {"lower": None, "upper": None, "lower_strict": True, "upper_strict": True}
        for arg in result.args:
            if isinstance(arg, (StrictLessThan, LessThan)):
                if arg.lhs == var:
                    # var < upper or var <= upper
                    try:
                        bounds["upper"] = float(arg.rhs)
                    except (TypeError, ValueError):
                        bounds["upper"] = None
                    bounds["upper_strict"] = isinstance(arg, StrictLessThan)
                elif arg.rhs == var:
                    # lower < var or lower <= var
                    try:
                        bounds["lower"] = float(arg.lhs)
                    except (TypeError, ValueError):
                        bounds["lower"] = None
                    bounds["lower_strict"] = isinstance(arg, StrictLessThan)
        intervals.append(bounds)
        return intervals

    if isinstance(result, Or):
        # Union of intervals -- recursively extract from each arg
        for arg in result.args:
            intervals.extend(_extract_intervals(arg, var))
        return intervals

    # Handle relational directly (var > expr, var < expr, etc.)
    if isinstance(result, (StrictLessThan, LessThan, StrictGreaterThan, GreaterThan)):
        bounds = {"lower": None, "upper": None, "lower_strict": True, "upper_strict": True}
        if isinstance(result, (StrictLessThan, LessThan)):
            if result.lhs == var:
                try:
                    bounds["upper"] = float(result.rhs)
                except (TypeError, ValueError):
                    bounds["upper"] = None
                bounds["upper_strict"] = isinstance(result, StrictLessThan)
            elif result.rhs == var:
                try:
                    bounds["lower"] = float(result.lhs)
                except (TypeError, ValueError):
                    bounds["lower"] = None
                bounds["lower_strict"] = isinstance(result, StrictLessThan)
        elif isinstance(result, (StrictGreaterThan, GreaterThan)):
            if result.lhs == var:
                try:
                    bounds["lower"] = float(result.rhs)
                except (TypeError, ValueError):
                    bounds["lower"] = None
                bounds["lower_strict"] = isinstance(result, StrictGreaterThan)
            elif result.rhs == var:
                try:
                    bounds["upper"] = float(result.lhs)
                except (TypeError, ValueError):
                    bounds["upper"] = None
                bounds["upper_strict"] = isinstance(result, StrictGreaterThan)
        intervals.append(bounds)

    return intervals


def solve_inequality_with_steps(latex_str: str) -> dict:
    """
    Solve an inequality and return result with step-by-step process.

    Handles linear and quadratic inequalities.
    Returns dict with keys: result, steps, intervals, verified.
    """
    if not latex_str or not latex_str.strip():
        raise ValueError("LaTeX 表达式不能为空")

    if len(latex_str) > 500:
        raise ValueError("表达式过长，请简化后重试")

    parsed = parse_latex_safe(latex_str)
    var = _find_variable(parsed)

    steps = []
    steps.append({"description": "原不等式", "latex": latex(parsed)})

    # Normalize inequality: move everything to one side
    rearranged = simplify(parsed.lhs - parsed.rhs)

    # Determine inequality type and build expression for reduce_inequalities
    if isinstance(parsed, StrictLessThan):
        # lhs < rhs -> lhs - rhs < 0
        result = reduce_inequalities([rearranged < 0], var)
    elif isinstance(parsed, LessThan):
        # lhs <= rhs -> lhs - rhs <= 0
        result = reduce_inequalities([rearranged <= 0], var)
    elif isinstance(parsed, StrictGreaterThan):
        # lhs > rhs -> lhs - rhs > 0
        result = reduce_inequalities([rearranged > 0], var)
    elif isinstance(parsed, GreaterThan):
        # lhs >= rhs -> lhs - rhs >= 0
        result = reduce_inequalities([rearranged >= 0], var)
    else:
        raise ValueError(f"无法识别的不等式类型: {type(parsed).__name__}")

    # Handle result types
    if result is S.true:
        result_text = f"{var.name} \\in \\mathbb{{R}}"
        steps.append({"description": "解为全体实数", "latex": result_text})
        intervals_data = []
    elif result is S.false:
        result_text = "\\text{无解}"
        steps.append({"description": "该不等式无解", "latex": result_text})
        intervals_data = []
    else:
        result_text = latex(result)
        steps.append({"description": "解集", "latex": result_text})
        intervals_data = _extract_intervals(result, var)

    return {
        "result": result_text,
        "steps": steps,
        "intervals": intervals_data,
        "verified": False,
    }


def solve_system_with_steps(equations: list, variables: list) -> dict:
    """
    Solve a system of linear equations and return result with steps.

    Args:
        equations: List of LaTeX equation strings
        variables: List of variable name strings

    Returns dict with keys: result, steps, verified.
    """
    if not equations or not variables:
        raise ValueError("方程和变量不能为空")

    if len(equations) < len(variables):
        raise ValueError(f"方程数量（{len(equations)}）不能少于变量数量（{len(variables)}）")

    for eq_str in equations:
        if not eq_str or not eq_str.strip():
            raise ValueError("方程不能为空")
        if len(eq_str) > 500:
            raise ValueError("表达式过长，请简化后重试")

    syms = [Symbol(v) for v in variables]
    exprs = []
    steps = []

    for i, eq_latex in enumerate(equations):
        parsed = parse_latex_safe(eq_latex)
        if not isinstance(parsed, Eq):
            parsed = Eq(parsed, 0)
        expr = simplify(parsed.lhs - parsed.rhs)
        exprs.append(expr)
        steps.append({
            "description": f"方程 {i + 1}",
            "latex": eq_latex
        })

    # Use linsolve for linear systems
    result = linsolve(exprs, tuple(syms))

    if result.is_empty:
        steps.append({
            "description": "方程组无解",
            "latex": "\\text{无解}"
        })
        final_result = "\\text{无解}"
    else:
        sol_dict = {}
        result_latex_parts = []
        # linsolve returns FiniteSet containing tuples
        sol_tuple = list(result)[0]
        for i, sym in enumerate(syms):
            val = sol_tuple[i]
            sol_dict[sym.name] = val
            result_latex_parts.append(latex(Eq(sym, simplify(val))))

        final_result = ", ".join(result_latex_parts)
        steps.append({
            "description": "求解结果",
            "latex": final_result
        })

    return {"result": final_result, "steps": steps, "verified": False}
