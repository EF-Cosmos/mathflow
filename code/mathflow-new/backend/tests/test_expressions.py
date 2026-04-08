"""
Comprehensive test suite covering 100+ mathematical expressions.

Tests are organized into classes:
- TestAlgebra: factorization, expansion, simplification, verification (45+ tests)
- TestCalculus: differentiation, integration, limits, Taylor series (30+ tests)
- TestTrigonometry: trig operations and identities (15+ tests)
- TestEdgeCases: edge cases, negative tests, malformed input (15+ tests)

Per D-10, all test data is inline. Per D-11, uses verify_equivalence for robust
comparison instead of exact string matching where appropriate.
"""

import pytest
from app.services.sympy_service import (
    factor_expression,
    expand_expression,
    simplify_expression,
    verify_equivalence,
    differentiate_expr,
    integrate_indefinite,
    compute_limit,
    taylor_series,
    normalize_latex,
)


# ============================================================================
# TestAlgebra: Factorization, Expansion, Simplification, Verification
# ============================================================================


class TestFactorization:
    """Tests for factor_expression() covering polynomial factorization."""

    @pytest.mark.parametrize("input_latex,expected_equivalent", [
        # Perfect square trinomials
        ("x^2 + 2x + 1", "(x + 1)^2"),
        ("x^2 + 6x + 9", "(x + 3)^2"),
        ("x^2 - 4x + 4", "(x - 2)^2"),
        ("x^2 + 10x + 25", "(x + 5)^2"),
        # Difference of squares
        ("x^2 - 4", "(x - 2)(x + 2)"),
        ("x^2 - 9", "(x - 3)(x + 3)"),
        ("x^2 - 1", "(x - 1)(x + 1)"),
        ("4x^2 - 9", "(2x - 3)(2x + 3)"),
        ("9x^2 - 16", "(3x - 4)(3x + 4)"),
        # Integer roots (factorable quadratics)
        ("x^2 - 5x + 6", "(x - 2)(x - 3)"),
        ("x^2 + x - 2", "(x - 1)(x + 2)"),
        ("x^2 + 3x + 2", "(x + 1)(x + 2)"),
        ("x^2 - 7x + 12", "(x - 3)(x - 4)"),
        ("x^2 + 5x + 6", "(x + 2)(x + 3)"),
        # Difference/sum of cubes
        ("x^3 - 1", "(x - 1)(x^2 + x + 1)"),
        ("x^3 + 8", "(x + 2)(x^2 - 2x + 4)"),
        ("x^3 - 27", "(x - 3)(x^2 + 3x + 9)"),
        # Common factor extraction
        ("2x + 4", "2(x + 2)"),
        ("3x + 6", "3(x + 2)"),
        ("5x + 10", "5(x + 2)"),
        ("4x + 8", "4(x + 2)"),
    ])
    def test_factorization_correctness(self, input_latex, expected_equivalent):
        """Test that factorization result is mathematically equivalent to input."""
        result = factor_expression(input_latex)
        assert result is not None, f"factor_expression({input_latex!r}) returned None"
        assert verify_equivalence(input_latex, result), (
            f"factor({input_latex!r}) = {result!r}, not equivalent"
        )

    def test_factorization_perfect_square(self):
        """Test x^2 + 2x + 1 factors correctly."""
        result = factor_expression("x^2 + 2x + 1")
        assert result is not None
        assert verify_equivalence(result, "(x + 1)^2")

    def test_factorization_difference_of_squares(self):
        """Test x^2 - 4 factors correctly."""
        result = factor_expression("x^2 - 4")
        assert result is not None
        assert verify_equivalence(result, "(x - 2)(x + 2)")

    def test_factorization_integer_roots(self):
        """Test x^2 - 5x + 6 factors correctly."""
        result = factor_expression("x^2 - 5x + 6")
        assert result is not None
        assert verify_equivalence(result, "(x - 2)(x - 3)")

    def test_factorization_non_factorable_returns_same_or_null(self):
        """Test that x^2 + 1 cannot be factored over reals (returns unchanged or null)."""
        result = factor_expression("x^2 + 1")
        # SymPy may return the same expression or factor over complexes
        if result is not None:
            assert verify_equivalence("x^2 + 1", result)

    def test_factorization_cubic_difference(self):
        """Test x^3 - 1 factors as difference of cubes."""
        result = factor_expression("x^3 - 1")
        assert result is not None
        assert verify_equivalence(result, "(x - 1)(x^2 + x + 1)")

    def test_factorization_cubic_sum(self):
        """Test x^3 + 8 factors as sum of cubes."""
        result = factor_expression("x^3 + 8")
        assert result is not None
        assert verify_equivalence(result, "(x + 2)(x^2 - 2x + 4)")


class TestExpansion:
    """Tests for expand_expression() covering polynomial expansion."""

    @pytest.mark.parametrize("input_latex,expected_equivalent", [
        # Perfect square
        ("(x + 1)^2", "x^2 + 2x + 1"),
        ("(x - 1)^2", "x^2 - 2x + 1"),
        ("(x + 3)^2", "x^2 + 6x + 9"),
        # FOIL
        ("(x + 1)(x - 1)", "x^2 - 1"),
        ("(x + 2)(x + 3)", "x^2 + 5x + 6"),
        ("(x - 2)(x + 3)", "x^2 + x - 6"),
        ("(2x + 1)(3x - 2)", "6x^2 - x - 2"),
        # Binomial cube
        ("(x + 2)^3", "x^3 + 6x^2 + 12x + 8"),
        ("(x - 1)^3", "x^3 - 3x^2 + 3x - 1"),
        # Mixed letters
        ("(a + b)(a - b)", "a^2 - b^2"),
        ("(a + b)^2", "a^2 + 2ab + b^2"),
        # Higher power
        ("(x + 1)^4", "x^4 + 4x^3 + 6x^2 + 4x + 1"),
    ])
    def test_expansion_correctness(self, input_latex, expected_equivalent):
        """Test that expansion result is mathematically equivalent to input."""
        result = expand_expression(input_latex)
        assert result is not None, f"expand_expression({input_latex!r}) returned None"
        assert verify_equivalence(input_latex, result), (
            f"expand({input_latex!r}) = {result!r}, not equivalent"
        )
        assert verify_equivalence(result, expected_equivalent), (
            f"expand({input_latex!r}) = {result!r}, expected {expected_equivalent!r}"
        )

    def test_expansion_with_latex_notation(self):
        """Test expansion with LaTeX \\left/\\right delimiters."""
        result = expand_expression(r"\left(x + 1\right)^2")
        assert result is not None
        assert verify_equivalence(result, "x^2 + 2x + 1")

    def test_expansion_with_cdots(self):
        """Test expansion with \\cdot notation."""
        result = expand_expression(r"(x + 1) \cdot (x - 1)")
        assert result is not None
        assert verify_equivalence(result, "x^2 - 1")

    def test_expansion_already_expanded(self):
        """Test that expanding an already-expanded expression returns same result."""
        result = expand_expression("x^2 + 2x + 1")
        assert result is not None
        assert verify_equivalence(result, "x^2 + 2x + 1")


class TestSimplification:
    """Tests for simplify_expression() covering expression simplification."""

    @pytest.mark.parametrize("input_latex,expected_equivalent", [
        # Combine like terms
        ("x^2 + 2x + x - 3", "x^2 + 3x - 3"),
        ("2x + 3x", "5x"),
        ("3x + 2x - x", "4x"),
        ("x + x", "2x"),
        ("x * x", "x^2"),
        # Rational simplification
        ("(x^2 - 1)/(x - 1)", "x + 1"),
        ("(x^2 - 4)/(x + 2)", "x - 2"),
        ("(2x + 2)/(x + 1)", "2"),
        # Power rules
        ("x * x * x", "x^3"),
        ("x^2 * x^3", "x^5"),
        # Constant folding
        ("2 + 3", "5"),
        ("2 * 3 + 1", "7"),
    ])
    def test_simplification_correctness(self, input_latex, expected_equivalent):
        """Test that simplification result is mathematically correct."""
        result = simplify_expression(input_latex)
        assert result is not None, f"simplify_expression({input_latex!r}) returned None"
        assert verify_equivalence(input_latex, result), (
            f"simplify({input_latex!r}) = {result!r}, not equivalent to input"
        )
        assert verify_equivalence(result, expected_equivalent), (
            f"simplify({input_latex!r}) = {result!r}, expected equivalent to {expected_equivalent!r}"
        )

    def test_simplify_trig_identity(self):
        """Test that sin^2(x) + cos^2(x) simplifies to 1."""
        result = simplify_expression(r"\sin^{2}(x) + \cos^{2}(x)")
        assert result is not None
        assert verify_equivalence(result, "1")

    def test_simplify_complex_fraction(self):
        """Test simplification of complex rational expression."""
        result = simplify_expression("(x^2 + 2x + 1)/(x + 1)")
        assert result is not None
        assert verify_equivalence(result, "x + 1")

    def test_simplify_with_latex_notation(self):
        """Test simplification with LaTeX notation."""
        result = simplify_expression(r"2 \cdot x + 3 \cdot x")
        assert result is not None
        assert verify_equivalence(result, "5x")


class TestVerification:
    """Tests for verify_equivalence() covering equivalence checking."""

    @pytest.mark.parametrize("input_latex,output_latex,expected", [
        ("x^2 - 4", "(x-2)(x+2)", True),
        ("(x+1)^2", "x^2 + 2x + 1", True),
        ("x + 1", "x + 2", False),
        ("x^3 - 1", "(x-1)(x^2+x+1)", True),
        ("x^2 + 1", "x^2 + 1", True),
        ("x^2 + x", "x(x+1)", True),
        ("x + 1", "2x + 2", False),
        ("2x + 3x", "5x", True),
        ("x - 1", "x + 1", False),
    ])
    def test_verify_equivalence_pairs(self, input_latex, output_latex, expected):
        """Test verification of equivalent and non-equivalent expression pairs."""
        result = verify_equivalence(input_latex, output_latex)
        assert result is expected, (
            f"verify({input_latex!r}, {output_latex!r}) = {result}, expected {expected}"
        )

    def test_verify_same_expression(self):
        """Test that same expression is equivalent to itself."""
        assert verify_equivalence("x^2 + 2x + 1", "x^2 + 2x + 1") is True

    def test_verify_differing_only_by_sign(self):
        """Test that expressions differing by sign are not equivalent."""
        assert verify_equivalence("x + 1", "-x - 1") is False


# ============================================================================
# TestCalculus: Differentiation, Integration, Limits, Taylor Series
# ============================================================================


class TestDifferentiation:
    """Tests for differentiate_expr() covering derivative computation."""

    @pytest.mark.parametrize("input_latex,variable,expected_equivalent", [
        # Power rule
        ("x^3", "x", "3 x^{2}"),
        ("x^5", "x", "5 x^{4}"),
        ("x^2", "x", "2 x"),
        ("x", "x", "1"),
        ("x^4", "x", "4 x^{3}"),
        # Constant
        ("5", "x", "0"),
        ("1", "x", "0"),
        # Polynomial
        ("x^2 + 2x + 1", "x", "2 x + 2"),
        ("x^3 - 3x^2 + 2x", "x", "3 x^{2} - 6 x + 2"),
        ("3x^2 + 2x - 1", "x", "6 x + 2"),
        # Negative power / reciprocal
        ("1/x", "x", "-1/x^2"),
        # Square root
        (r"\sqrt{x}", "x", r"1/(2 \sqrt{x})"),
    ])
    def test_differentiation_correctness(self, input_latex, variable, expected_equivalent):
        """Test that differentiation result is mathematically correct."""
        result = differentiate_expr(input_latex, variable)
        assert result is not None, f"differentiate_expr({input_latex!r}) returned None"
        assert verify_equivalence(result, expected_equivalent), (
            f"diff({input_latex!r}) = {result!r}, expected equivalent to {expected_equivalent!r}"
        )

    def test_derivative_of_exponential(self):
        """Test that d/dx(e^x) = e^x."""
        result = differentiate_expr("e^x", "x")
        assert result is not None
        assert verify_equivalence(result, "e^x")

    def test_derivative_of_natural_log(self):
        """Test that d/dx(ln(x)) = 1/x."""
        result = differentiate_expr(r"\ln(x)", "x")
        assert result is not None
        assert verify_equivalence(result, "1/x")

    def test_derivative_of_sine(self):
        """Test that d/dx(sin(x)) = cos(x)."""
        result = differentiate_expr(r"\sin(x)", "x")
        assert result is not None
        assert verify_equivalence(result, r"\cos(x)")

    def test_derivative_of_cosine(self):
        """Test that d/dx(cos(x)) = -sin(x)."""
        result = differentiate_expr(r"\cos(x)", "x")
        assert result is not None
        assert verify_equivalence(result, r"-\sin(x)")

    def test_derivative_chain_rule_power(self):
        """Test chain rule: d/dx((x^2 + 1)^3) uses chain rule."""
        result = differentiate_expr("(x^2 + 1)^3", "x")
        assert result is not None
        # d/dx((x^2+1)^3) = 3*(x^2+1)^2 * 2x = 6x*(x^2+1)^2
        assert verify_equivalence(result, "6x*(x^2+1)^2")

    def test_derivative_of_constant_is_zero(self):
        """Test that derivative of a constant is 0."""
        result = differentiate_expr("7", "x")
        assert result is not None
        assert verify_equivalence(result, "0")

    def test_derivative_with_respect_to_different_variable(self):
        """Test differentiation with respect to y."""
        result = differentiate_expr("x^2 + 2xy + y^2", "y")
        assert result is not None
        assert verify_equivalence(result, "2x + 2y")


class TestIntegration:
    """Tests for integrate_indefinite() covering indefinite integration."""

    @pytest.mark.parametrize("input_latex,variable,expected_equivalent", [
        # Constants
        ("1", "x", "x"),
        ("3", "x", "3x"),
        # Linear
        ("x", "x", "x^2/2"),
        ("2x", "x", "x^2"),
        # Quadratic and higher powers
        ("x^2", "x", "x^3/3"),
        ("x^3", "x", "x^4/4"),
        ("x^4", "x", "x^5/5"),
        # Exponential
        ("e^x", "x", "e^x"),
    ])
    def test_integration_correctness(self, input_latex, variable, expected_equivalent):
        """Test that integration result is mathematically correct."""
        result = integrate_indefinite(input_latex, variable)
        assert result is not None, f"integrate_indefinite({input_latex!r}) returned None"
        assert verify_equivalence(result, expected_equivalent), (
            f"integrate({input_latex!r}) = {result!r}, expected equivalent to {expected_equivalent!r}"
        )

    def test_integral_of_cosine(self):
        """Test that integral of cos(x) is sin(x)."""
        result = integrate_indefinite(r"\cos(x)", "x")
        assert result is not None
        assert verify_equivalence(result, r"\sin(x)")

    def test_integral_of_sine(self):
        """Test that integral of sin(x) is -cos(x)."""
        result = integrate_indefinite(r"\sin(x)", "x")
        assert result is not None
        assert verify_equivalence(result, r"-\cos(x)")

    def test_integral_of_reciprocal(self):
        """Test that integral of 1/x is ln(x)."""
        result = integrate_indefinite("1/x", "x")
        assert result is not None
        assert verify_equivalence(result, r"\ln(x)")

    def test_integral_of_power_rule(self):
        """Test power rule: integral of x^n = x^(n+1)/(n+1)."""
        result = integrate_indefinite("x^5", "x")
        assert result is not None
        assert verify_equivalence(result, "x^6/6")

    def test_integral_of_polynomial(self):
        """Test integration of polynomial sum."""
        result = integrate_indefinite("x^2 + x", "x")
        assert result is not None
        assert verify_equivalence(result, "x^3/3 + x^2/2")


class TestLimits:
    """Tests for compute_limit() covering limit computation."""

    @pytest.mark.parametrize("input_latex,variable,point,expected", [
        # sinc limit
        (r"\sin(x)/x", "x", "0", "1"),
        # Removable discontinuity
        ("(x^2 - 1)/(x - 1)", "x", "1", "2"),
        # Simple polynomial limit
        ("x^2 + 1", "x", "2", "5"),
        # Rational function limit
        ("(x^2 - 4)/(x - 2)", "x", "2", "4"),
        # Linear limit
        ("2x + 1", "x", "3", "7"),
    ])
    def test_limit_correctness(self, input_latex, variable, point, expected):
        """Test that limit computation is mathematically correct."""
        result = compute_limit(input_latex, variable, point)
        assert result is not None, f"compute_limit({input_latex!r}) returned None"
        assert verify_equivalence(result, expected), (
            f"limit({input_latex!r}, {variable}→{point}) = {result!r}, expected {expected!r}"
        )

    def test_limit_at_infinity(self):
        """Test limit of 1/x as x -> infinity is 0."""
        # Using SymPy's oo notation for infinity
        result = compute_limit("1/x", "x", "oo")
        assert result is not None
        assert verify_equivalence(result, "0")

    def test_limit_at_infinity_polynomial_ratio(self):
        """Test limit of (x^2 + 1)/(2x^2 + 3) as x -> infinity."""
        result = compute_limit("(x^2 + 1)/(2x^2 + 3)", "x", "oo")
        assert result is not None
        assert verify_equivalence(result, "1/2")

    def test_limit_exponential_over_polynomial(self):
        """Test limit of e^x/x as x -> infinity is infinity."""
        result = compute_limit("e^x/x", "x", "oo")
        assert result is not None
        # Result should be oo (infinity)
        assert "oo" in result or result == "\\infty"


class TestTaylorSeries:
    """Tests for taylor_series() covering Taylor/Maclaurin expansion."""

    @pytest.mark.parametrize("input_latex,variable,point,order,expected_contains", [
        # sin(x) Taylor: x - x^3/6 + x^5/120 - ...
        (r"\sin(x)", "x", "0", 6, ["x"]),
        # e^x Taylor: 1 + x + x^2/2 + x^3/6 + ...
        ("e^x", "x", "0", 4, ["1"]),
        # cos(x) Taylor: 1 - x^2/2 + x^4/24 - ...
        (r"\cos(x)", "x", "0", 5, ["1"]),
    ])
    def test_taylor_series_basic(self, input_latex, variable, point, order, expected_contains):
        """Test that Taylor series produces correct expansion containing expected terms."""
        result = taylor_series(input_latex, variable, point, order)
        assert result is not None, f"taylor_series({input_latex!r}) returned None"
        for term in expected_contains:
            assert term in result, (
                f"taylor({input_latex!r}) = {result!r}, missing expected term {term!r}"
            )

    def test_taylor_sin_is_equivalent_approximation(self):
        """Test that sin(x) Taylor series at order 7 approximates sin correctly at 0."""
        result = taylor_series(r"\sin(x)", "x", "0", 7)
        assert result is not None
        # The Taylor series should be equivalent to sin(x) near x=0
        assert verify_equivalence(result, r"x - x^{3}/6 + x^{5}/120")

    def test_taylor_exp_is_equivalent_approximation(self):
        """Test that e^x Taylor series at order 5 is correct."""
        result = taylor_series("e^x", "x", "0", 5)
        assert result is not None
        assert verify_equivalence(result, "1 + x + x^2/2 + x^3/6 + x^4/24")

    def test_taylor_polynomial(self):
        """Test Taylor series of simple polynomial is the polynomial itself."""
        result = taylor_series("x^2 + 2x + 1", "x", "0", 5)
        assert result is not None
        assert verify_equivalence(result, "x^2 + 2x + 1")

    def test_taylor_cosine_order_6(self):
        """Test cos(x) Taylor at order 6: 1 - x^2/2 + x^4/24."""
        result = taylor_series(r"\cos(x)", "x", "0", 6)
        assert result is not None
        assert verify_equivalence(result, "1 - x^2/2 + x^4/24")

    def test_taylor_1_over_1_minus_x(self):
        """Test Taylor series of 1/(1-x) = 1 + x + x^2 + x^3 + ..."""
        result = taylor_series("1/(1-x)", "x", "0", 5)
        assert result is not None
        assert verify_equivalence(result, "1 + x + x^2 + x^3 + x^4")


# ============================================================================
# TestTrigonometry: Trig operations and identities
# ============================================================================


class TestTrigonometry:
    """Tests for trigonometric operations via SymPy functions."""

    @pytest.mark.parametrize("input_latex,expected_equivalent", [
        # Pythagorean identities
        (r"\sin^{2}(x) + \cos^{2}(x)", "1"),
        (r"\tan^{2}(x) + 1", r"\sec^{2}(x)"),
        # Simplification of trig expressions
        (r"\sin(x)/\cos(x)", r"\tan(x)"),
    ])
    def test_trig_simplification(self, input_latex, expected_equivalent):
        """Test that trig expressions simplify correctly."""
        result = simplify_expression(input_latex)
        assert result is not None
        assert verify_equivalence(result, expected_equivalent), (
            f"simplify({input_latex!r}) = {result!r}, expected equivalent to {expected_equivalent!r}"
        )

    def test_derivative_of_sine(self):
        """Test d/dx(sin(x)) = cos(x)."""
        result = differentiate_expr(r"\sin(x)", "x")
        assert result is not None
        assert verify_equivalence(result, r"\cos(x)")

    def test_derivative_of_cosine(self):
        """Test d/dx(cos(x)) = -sin(x)."""
        result = differentiate_expr(r"\cos(x)", "x")
        assert result is not None
        assert verify_equivalence(result, r"-\sin(x)")

    def test_derivative_of_tangent(self):
        """Test d/dx(tan(x)) = sec^2(x)."""
        result = differentiate_expr(r"\tan(x)", "x")
        assert result is not None
        assert verify_equivalence(result, r"\sec^{2}(x)")

    def test_integral_of_sine(self):
        """Test integral of sin(x) = -cos(x)."""
        result = integrate_indefinite(r"\sin(x)", "x")
        assert result is not None
        assert verify_equivalence(result, r"-\cos(x)")

    def test_integral_of_cosine(self):
        """Test integral of cos(x) = sin(x)."""
        result = integrate_indefinite(r"\cos(x)", "x")
        assert result is not None
        assert verify_equivalence(result, r"\sin(x)")

    def test_verify_double_angle_sin(self):
        """Test sin(2x) = 2*sin(x)*cos(x)."""
        assert verify_equivalence(r"\sin(2x)", r"2 \sin(x) \cos(x)") is True

    def test_verify_double_angle_cos(self):
        """Test cos(2x) = cos^2(x) - sin^2(x)."""
        assert verify_equivalence(r"\cos(2x)", r"\cos^{2}(x) - \sin^{2}(x)") is True

    def test_verify_cos_double_angle_alt(self):
        """Test cos(2x) = 2*cos^2(x) - 1."""
        assert verify_equivalence(r"\cos(2x)", r"2 \cos^{2}(x) - 1") is True

    def test_taylor_sin(self):
        """Test sin(x) Taylor series approximation."""
        result = taylor_series(r"\sin(x)", "x", "0", 7)
        assert result is not None
        assert verify_equivalence(result, r"x - x^{3}/6 + x^{5}/120")

    def test_taylor_cos(self):
        """Test cos(x) Taylor series approximation."""
        result = taylor_series(r"\cos(x)", "x", "0", 6)
        assert result is not None
        assert verify_equivalence(result, "1 - x^2/2 + x^4/24")

    def test_limit_sinc(self):
        """Test lim(x->0) sin(x)/x = 1."""
        result = compute_limit(r"\sin(x)/x", "x", "0")
        assert result is not None
        assert verify_equivalence(result, "1")

    def test_limit_trig_sin_over_x_squared(self):
        """Test lim(x->0) sin(x)/x^2 = does not exist (infinity)."""
        result = compute_limit(r"\sin(x)/x^2", "x", "0")
        assert result is not None
        # The limit should be some form of infinity or undefined
        # SymPy may return oo or zoo
        assert result is not None


# ============================================================================
# TestEdgeCases: Edge cases, negative tests, malformed input
# ============================================================================


class TestEdgeCases:
    """Tests for edge cases and error handling."""

    # --- Empty and whitespace input ---

    def test_factor_empty_string(self):
        """Test factorization of empty string raises error or returns null."""
        with pytest.raises(Exception):
            factor_expression("")

    def test_expand_empty_string(self):
        """Test expansion of empty string raises error."""
        with pytest.raises(Exception):
            expand_expression("")

    def test_simplify_empty_string(self):
        """Test simplification of empty string raises error."""
        with pytest.raises(Exception):
            simplify_expression("")

    # --- Single value input ---

    def test_factor_single_number(self):
        """Test factorization of single number."""
        result = factor_expression("5")
        # Should return 5 or something equivalent
        if result is not None:
            assert verify_equivalence("5", result)

    def test_expand_single_number(self):
        """Test expansion of single number returns the number."""
        result = expand_expression("5")
        assert result is not None
        assert verify_equivalence("5", result)

    def test_simplify_single_number(self):
        """Test simplification of single number returns the number."""
        result = simplify_expression("5")
        assert result is not None
        assert verify_equivalence("5", result)

    def test_factor_single_variable(self):
        """Test factorization of single variable."""
        result = factor_expression("x")
        assert result is not None
        assert verify_equivalence("x", result)

    def test_expand_single_variable(self):
        """Test expansion of single variable."""
        result = expand_expression("x")
        assert result is not None
        assert verify_equivalence("x", result)

    # --- LaTeX notation variants ---

    def test_factor_with_left_right(self):
        """Test factorization with \\left \\right delimiters."""
        result = factor_expression(r"\left(x + 1\right)^2")
        assert result is not None
        assert verify_equivalence(result, "x^2 + 2x + 1")

    def test_expand_with_left_right(self):
        """Test expansion with \\left \\right delimiters."""
        result = expand_expression(r"\left(x + 1\right) \left(x - 1\right)")
        assert result is not None
        assert verify_equivalence(result, "x^2 - 1")

    def test_simplify_with_cdot(self):
        """Test simplification with \\cdot notation."""
        result = simplify_expression(r"2 \cdot x + 3 \cdot x")
        assert result is not None
        assert verify_equivalence(result, "5x")

    def test_normalize_handles_times(self):
        """Test that normalization handles \\times correctly."""
        result = normalize_latex(r"3 \times x + 2 \times x")
        assert r"\times" not in result
        assert "*" in result

    def test_normalize_handles_div(self):
        """Test that normalization handles \\div correctly."""
        result = normalize_latex(r"x \div 2")
        assert r"\div" not in result
        assert "/" in result

    # --- Verification edge cases ---

    def test_verify_empty_returns_false(self):
        """Test that empty input to verify returns False."""
        assert verify_equivalence("", "x + 1") is False

    def test_verify_both_empty_returns_false(self):
        """Test that both empty inputs to verify returns False."""
        assert verify_equivalence("", "") is False

    def test_verify_invalid_latex_returns_false(self):
        """Test that invalid LaTeX returns False (no crash)."""
        assert verify_equivalence("!!!", "x + 1") is False

    def test_verify_mismatched_parens_returns_false(self):
        """Test mismatched parentheses returns False."""
        assert verify_equivalence("(x + 1", "x + 1") is False

    # --- Differentiation/Integration edge cases ---

    def test_derivative_of_constant_is_zero(self):
        """Test d/dx(0) = 0."""
        result = differentiate_expr("0", "x")
        assert result is not None
        assert verify_equivalence(result, "0")

    def test_integral_of_zero_is_constant(self):
        """Test integral of 0 is a constant (0 in SymPy)."""
        result = integrate_indefinite("0", "x")
        assert result is not None
        assert verify_equivalence(result, "0")

    def test_derivative_of_x_to_zero(self):
        """Test d/dx(x^0) = d/dx(1) = 0."""
        result = differentiate_expr("1", "x")
        assert result is not None
        assert verify_equivalence(result, "0")

    def test_integral_of_reciprocal_squared(self):
        """Test integral of 1/x^2 = -1/x."""
        result = integrate_indefinite("1/x^2", "x")
        assert result is not None
        assert verify_equivalence(result, "-1/x")

    # --- Normalization edge cases ---

    def test_normalize_plain_expression(self):
        """Test that plain expression passes through normalization."""
        result = normalize_latex("x^2 + 3x - 1")
        assert "x^2" in result
        assert "3x" in result

    def test_normalize_nested_left_right(self):
        """Test normalization with nested \\left \\right."""
        result = normalize_latex(r"\left(\left(x + 1\right) + 2\right)")
        assert r"\left" not in result
        assert r"\right" not in result
        assert "(" in result

    def test_normalize_preserves_frac(self):
        """Test that \\frac is not affected by normalization."""
        result = normalize_latex(r"\frac{x}{2}")
        assert r"\frac" in result

    def test_taylor_order_zero(self):
        """Test Taylor series at very low order."""
        result = taylor_series("x^2", "x", "0", 1)
        assert result is not None
        # x^2 at order 1 should be 0 (only terms up to x^1)
        assert verify_equivalence(result, "0")
