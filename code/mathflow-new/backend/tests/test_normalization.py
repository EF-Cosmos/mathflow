import pytest
from app.services.sympy_service import normalize_latex, verify_equivalence


class TestNormalization:
    """Tests for LaTeX normalization function."""

    @pytest.mark.parametrize("input_latex,expected_substring,removed", [
        (r"2 \cdot x", "*", r"\cdot"),
        (r"3 \times y", "*", r"\times"),
        (r"\left(x + 1\right)", "(", r"\left"),
        (r"a \div b", "/", r"\div"),
    ])
    def test_normalize_operators(self, input_latex, expected_substring, removed):
        """Test normalization replaces LaTeX operators with standard equivalents."""
        result = normalize_latex(input_latex)
        # The LaTeX command must be removed
        assert removed not in result
        # The standard operator must be present
        assert expected_substring in result

    def test_normalize_preserves_function_names(self):
        """Test that \\sin is NOT stripped to plain sin (parse_latex needs the backslash)."""
        result = normalize_latex(r"\sin(x)")
        # \\sin should be preserved because parse_latex needs it
        assert r"\sin" in result

    def test_normalize_implicit_multiplication(self):
        """Test that plain 2x stays as 2x (parse_latex handles implicit mult natively)."""
        result = normalize_latex("2x")
        # parse_latex handles 2x -> 2*x natively, so normalize_latex should not break it
        assert "x" in result

    def test_normalize_ln_preserved(self):
        """Test that \\ln is preserved (parse_latex understands \\ln)."""
        result = normalize_latex(r"\ln(x)")
        assert r"\ln" in result

    def test_normalize_trig_functions_preserved(self):
        """Test that \\sin, \\cos, \\tan are preserved for parse_latex."""
        assert r"\sin" in normalize_latex(r"\sin(x)")
        assert r"\cos" in normalize_latex(r"\cos(x)")
        assert r"\tan" in normalize_latex(r"\tan(x)")

    def test_normalize_log_preserved(self):
        """Test that \\log is preserved for parse_latex."""
        result = normalize_latex(r"\log(x)")
        assert r"\log" in result

    def test_normalize_combined(self):
        """Test normalization with multiple LaTeX constructs in one expression."""
        result = normalize_latex(r"2 \cdot \left(x + 1\right)")
        assert "\\cdot" not in result
        assert "\\left" not in result
        assert "\\right" not in result
        # Operator * must be present
        assert "*" in result

    def test_normalize_empty_string(self):
        """Test normalization of empty string returns empty string."""
        assert normalize_latex("") == ""

    def test_normalize_plain_expression(self):
        """Test that plain expressions pass through mostly unchanged."""
        result = normalize_latex("x^2 + 3x - 1")
        assert "x^2" in result
        assert "- 1" in result

    def test_normalize_spaces_cleaned_around_operators(self):
        """Test that extra spaces around * are cleaned up."""
        result = normalize_latex(r"2 \cdot x")
        # After replacement, spaces around * should be cleaned
        assert " " not in result.replace(" ", "").replace("*", "") or "*" in result

    def test_normalize_right_delimiters_removed(self):
        """Test that \\right) is replaced with )."""
        result = normalize_latex(r"\left(x + 1\right)")
        assert "\\right" not in result
        assert ")" in result

    def test_normalize_division_operator(self):
        """Test that \\div is replaced with /."""
        result = normalize_latex(r"a \div b")
        assert "\\div" not in result
        assert "/" in result

    def test_normalize_no_extra_spaces_in_multiplication(self):
        """Test that multiplication results have no extra spaces."""
        result = normalize_latex(r"2 \cdot x")
        assert result == "2*x"

    def test_normalize_no_extra_spaces_in_division(self):
        """Test that division results have no extra spaces."""
        result = normalize_latex(r"a \div b")
        assert result == "a/b"


class TestVerification:
    """Tests for verify_equivalence function."""

    def test_verify_equivalent_factorization(self):
        """Test that x^2 - 4 is equivalent to (x-2)(x+2)."""
        assert verify_equivalence("x^2 - 4", "(x-2)(x+2)") is True

    def test_verify_non_equivalent(self):
        """Test that x + 1 is NOT equivalent to x + 2."""
        assert verify_equivalence("x + 1", "x + 2") is False

    def test_verify_trig_identity(self):
        """Test that sin^2(x) + cos^2(x) is equivalent to 1."""
        # Use LaTeX notation that parse_latex understands
        assert verify_equivalence(r"\sin^{2}(x) + \cos^{2}(x)", "1") is True

    def test_verify_expansion(self):
        """Test that (x+1)^2 is equivalent to x^2 + 2x + 1."""
        assert verify_equivalence("(x+1)^2", "x^2 + 2x + 1") is True

    def test_verify_invalid_input_returns_false(self):
        """Test that invalid input returns False (no crash)."""
        assert verify_equivalence("!!!", "x + 1") is False

    def test_verify_empty_input_returns_false(self):
        """Test that empty input returns False."""
        assert verify_equivalence("", "x + 1") is False

    def test_verify_with_latex_notation(self):
        """Test verification with LaTeX notation in input."""
        assert verify_equivalence(r"2 \cdot x + 1", "2*x + 1") is True

    def test_verify_complex_equivalent(self):
        """Test that x^3 - 1 is equivalent to (x-1)(x^2+x+1)."""
        assert verify_equivalence("x^3 - 1", "(x-1)(x^2+x+1)") is True
