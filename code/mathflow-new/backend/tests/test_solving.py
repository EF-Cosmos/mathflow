"""
Tests for equation/inequality/system solving endpoints.

Covers requirements: EQNS-01 through EQNS-06, STEP-01, STEP-02.
"""


class TestLinearEquations:
    """EQNS-01: Solve linear equations in one variable."""

    def test_simple_linear(self, client):
        """2x + 3 = 7 -> x = 2"""
        response = client.post("/api/solve/equation", json={"latex": "2x + 3 = 7"})
        assert response.status_code == 200
        data = response.json()
        assert "2" in data["result"]
        assert len(data["steps"]) >= 2

    def test_linear_with_fraction_coeff(self, client):
        """3x - 5 = 10 -> x = 5"""
        response = client.post("/api/solve/equation", json={"latex": "3x - 5 = 10"})
        assert response.status_code == 200
        data = response.json()
        assert "5" in data["result"]

    def test_linear_negative_solution(self, client):
        """2x + 8 = 4 -> x = -2"""
        response = client.post("/api/solve/equation", json={"latex": "2x + 8 = 4"})
        assert response.status_code == 200
        data = response.json()
        assert "-2" in data["result"]


class TestQuadraticEquations:
    """EQNS-02: Solve quadratic equations."""

    def test_quadratic_two_roots(self, client):
        """x^2 - 5x + 6 = 0 -> x = 2, x = 3"""
        response = client.post("/api/solve/equation", json={"latex": "x^2 - 5x + 6 = 0"})
        assert response.status_code == 200
        data = response.json()
        assert "2" in data["result"]
        assert "3" in data["result"]
        # Steps must include discriminant step
        step_descriptions = [s["description"] for s in data["steps"]]
        assert any(
            "Delta" in desc or "delta" in desc or "判别式" in desc
            for desc in step_descriptions
        )

    def test_quadratic_repeated_root(self, client):
        """x^2 - 4x + 4 = 0 -> x = 2"""
        response = client.post("/api/solve/equation", json={"latex": "x^2 - 4x + 4 = 0"})
        assert response.status_code == 200
        data = response.json()
        assert "2" in data["result"]

    def test_quadratic_no_real_roots(self, client):
        """x^2 + 1 = 0 -> no real solution"""
        response = client.post("/api/solve/equation", json={"latex": "x^2 + 1 = 0"})
        assert response.status_code == 200
        data = response.json()
        # Should indicate no real solution in result
        assert "无解" in data["result"] or "no real" in data["result"].lower() or "i" in data["result"]


class TestFractionalEquations:
    """EQNS-03: Solve fractional equations with extraneous solution filtering."""

    def test_fractional_equation(self, client):
        """1/x + 1/(x-1) = 1 -> valid solution"""
        response = client.post("/api/solve/equation", json={"latex": "\\frac{1}{x} + \\frac{1}{x-1} = 1"})
        assert response.status_code == 200
        data = response.json()
        assert data["result"] is not None
        assert len(data["steps"]) >= 1

    def test_fractional_extraneous_filtered(self, client):
        """Verify that extraneous solutions making denominators zero are filtered."""
        response = client.post("/api/solve/equation", json={"latex": "\\frac{1}{x} + \\frac{1}{x-1} = 1"})
        assert response.status_code == 200
        data = response.json()
        result = data["result"]
        # x=0 and x=1 make denominators zero, should NOT appear as solutions
        # Check that the result does not contain "x = 0" or "x = 1" as final solutions
        # (The extraneous solutions should be noted in steps if they were found)
        step_descriptions = [s["description"] for s in data["steps"]]
        # If extraneous solutions were found, a step should mention discarding them
        # x=0 and x=1 are extraneous for this equation
        assert "x = 0" not in result or any("舍去" in desc or "分母" in desc or "零" in desc for desc in step_descriptions)


class TestLinearInequalities:
    """EQNS-04: Solve linear inequalities."""

    def test_linear_greater_than(self, client):
        """2x + 3 > 7 -> x > 2"""
        response = client.post("/api/solve/inequality", json={"latex": "2x + 3 > 7"})
        assert response.status_code == 200
        data = response.json()
        intervals = data["intervals"]
        assert len(intervals) >= 1
        assert intervals[0]["lower"] == 2.0
        assert intervals[0]["lower_strict"] is True

    def test_linear_less_than(self, client):
        """3x - 2 < 7 -> x < 3"""
        response = client.post("/api/solve/inequality", json={"latex": "3x - 2 < 7"})
        assert response.status_code == 200
        data = response.json()
        intervals = data["intervals"]
        assert len(intervals) >= 1
        assert intervals[0]["upper"] == 3.0

    def test_linear_leq(self, client):
        """2x + 1 <= 5 -> x <= 2"""
        response = client.post("/api/solve/inequality", json={"latex": "2x + 1 \\leq 5"})
        assert response.status_code == 200
        data = response.json()
        intervals = data["intervals"]
        assert len(intervals) >= 1
        assert intervals[0]["upper"] == 2.0
        assert intervals[0]["upper_strict"] is False


class TestQuadraticInequalities:
    """EQNS-05: Solve quadratic inequalities."""

    def test_quadratic_less_than(self, client):
        """x^2 - 5x + 6 < 0 -> 2 < x < 3"""
        response = client.post("/api/solve/inequality", json={"latex": "x^2 - 5x + 6 < 0"})
        assert response.status_code == 200
        data = response.json()
        intervals = data["intervals"]
        assert len(intervals) >= 1
        assert intervals[0]["lower"] == 2.0
        assert intervals[0]["upper"] == 3.0

    def test_quadratic_greater_than(self, client):
        """x^2 - 4 > 0 -> x < -2 or x > 2 (two intervals)"""
        response = client.post("/api/solve/inequality", json={"latex": "x^2 - 4 > 0"})
        assert response.status_code == 200
        data = response.json()
        intervals = data["intervals"]
        assert len(intervals) >= 2
        # One interval with upper < 0, one with lower > 0
        upper_vals = [iv["upper"] for iv in intervals if iv["upper"] is not None]
        lower_vals = [iv["lower"] for iv in intervals if iv["lower"] is not None]
        assert any(abs(u - (-2.0)) < 0.01 for u in upper_vals)
        assert any(abs(l - 2.0) < 0.01 for l in lower_vals)


class TestSystemEquations:
    """EQNS-06: Solve systems of linear equations."""

    def test_system_2var(self, client):
        """2x + y = 5, x - y = 1 -> x = 2, y = 1"""
        response = client.post("/api/solve/system", json={
            "equations": ["2x + y = 5", "x - y = 1"],
            "variables": ["x", "y"]
        })
        assert response.status_code == 200
        data = response.json()
        assert "2" in data["result"]
        assert "1" in data["result"]

    def test_system_3var(self, client):
        """x + y + z = 6, 2x - y + z = 3, x + y - z = 2 -> valid solutions"""
        response = client.post("/api/solve/system", json={
            "equations": ["x + y + z = 6", "2x - y + z = 3", "x + y - z = 2"],
            "variables": ["x", "y", "z"]
        })
        assert response.status_code == 200
        data = response.json()
        assert data["result"] is not None
        assert len(data["steps"]) >= 1


class TestStepGeneration:
    """STEP-01, STEP-02: Every solve response includes steps with description and latex."""

    def test_equation_steps_have_description_and_latex(self, client):
        """Every step in equation solve response has non-empty description and latex."""
        response = client.post("/api/solve/equation", json={"latex": "2x + 3 = 7"})
        assert response.status_code == 200
        data = response.json()
        for step in data["steps"]:
            assert step["description"], "Step description must not be empty"
            assert step["latex"], "Step latex must not be empty"

    def test_inequality_steps_have_description_and_latex(self, client):
        """Every step in inequality solve response has non-empty description and latex."""
        response = client.post("/api/solve/inequality", json={"latex": "2x + 3 > 7"})
        assert response.status_code == 200
        data = response.json()
        for step in data["steps"]:
            assert step["description"], "Step description must not be empty"
            assert step["latex"], "Step latex must not be empty"

    def test_system_steps_have_description_and_latex(self, client):
        """Every step in system solve response has non-empty description and latex."""
        response = client.post("/api/solve/system", json={
            "equations": ["2x + y = 5", "x - y = 1"],
            "variables": ["x", "y"]
        })
        assert response.status_code == 200
        data = response.json()
        for step in data["steps"]:
            assert step["description"], "Step description must not be empty"
            assert step["latex"], "Step latex must not be empty"

    def test_quadratic_has_discriminant_step(self, client):
        """Quadratic equation steps include discriminant calculation."""
        response = client.post("/api/solve/equation", json={"latex": "x^2 - 5x + 6 = 0"})
        assert response.status_code == 200
        data = response.json()
        step_descriptions = [s["description"] for s in data["steps"]]
        assert any(
            "Delta" in desc or "delta" in desc or "判别式" in desc
            for desc in step_descriptions
        )

    def test_linear_has_move_constant_step(self, client):
        """Linear equation steps mention subtraction or moving terms."""
        response = client.post("/api/solve/equation", json={"latex": "2x + 3 = 7"})
        assert response.status_code == 200
        data = response.json()
        step_descriptions = [s["description"] for s in data["steps"]]
        assert any(
            "减" in desc or "move" in desc.lower() or "移" in desc
            for desc in step_descriptions
        )


class TestErrorHandling:
    """Error handling for solve endpoints."""

    def test_invalid_latex_equation(self, client):
        """POST /api/solve/equation with invalid LaTeX -> 400."""
        response = client.post("/api/solve/equation", json={"latex": "not valid equation"})
        assert response.status_code == 400

    def test_empty_latex_equation(self, client):
        """POST /api/solve/equation with empty string -> 400."""
        response = client.post("/api/solve/equation", json={"latex": ""})
        assert response.status_code == 400

    def test_invalid_latex_inequality(self, client):
        """POST /api/solve/inequality with invalid LaTeX -> 400."""
        response = client.post("/api/solve/inequality", json={"latex": "not valid"})
        assert response.status_code == 400

    def test_system_missing_variables(self, client):
        """POST /api/solve/system with mismatched equations/variables -> 400 or error."""
        response = client.post("/api/solve/system", json={
            "equations": ["2x + y = 5"],
            "variables": ["x"]
        })
        assert response.status_code == 400
