import pytest
from app.services.sympy_service import verify_equivalence


class TestVerifyEndpoint:
    """Tests for POST /api/verify endpoint."""

    def test_verify_endpoint_equivalent(self, client):
        """Test that the verify endpoint returns is_equivalent=True for equivalent expressions."""
        response = client.post("/api/verify", json={
            "input_latex": "x^2 - 4",
            "output_latex": "(x-2)(x+2)"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["is_equivalent"] is True

    def test_verify_endpoint_not_equivalent(self, client):
        """Test that the verify endpoint returns is_equivalent=False for non-equivalent expressions."""
        response = client.post("/api/verify", json={
            "input_latex": "x + 1",
            "output_latex": "x + 2"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["is_equivalent"] is False

    def test_verify_endpoint_trig_identity(self, client):
        """Test verify endpoint with trig identity."""
        response = client.post("/api/verify", json={
            "input_latex": r"\sin^{2}(x) + \cos^{2}(x)",
            "output_latex": "1"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["is_equivalent"] is True

    def test_verify_endpoint_invalid_input(self, client):
        """Test verify endpoint with invalid LaTeX returns is_equivalent=False."""
        response = client.post("/api/verify", json={
            "input_latex": "!!!",
            "output_latex": "x + 1"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["is_equivalent"] is False

    def test_verify_endpoint_with_latex_notation(self, client):
        """Test verify endpoint with LaTeX notation (requires normalization)."""
        response = client.post("/api/verify", json={
            "input_latex": r"2 \cdot x + 1",
            "output_latex": "2*x + 1"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["is_equivalent"] is True

    def test_verify_endpoint_expansion(self, client):
        """Test verify endpoint with expansion check."""
        response = client.post("/api/verify", json={
            "input_latex": "(x+1)^2",
            "output_latex": "x^2 + 2x + 1"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["is_equivalent"] is True


class TestExistingEndpointsStillWork:
    """Regression tests: existing endpoints must still work after normalization changes."""

    def test_factor_endpoint(self, client):
        """Test that factor endpoint still works."""
        response = client.post("/api/factor", json={"latex": "x^2 - 4"})
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        # x^2 - 4 should factor to (x - 2)(x + 2)
        assert verify_equivalence(data["result"], "(x-2)(x+2)") is True

    def test_expand_endpoint(self, client):
        """Test that expand endpoint still works."""
        response = client.post("/api/expand", json={"latex": "(x+1)^2"})
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert verify_equivalence(data["result"], "x^2 + 2x + 1") is True

    def test_simplify_endpoint(self, client):
        """Test that simplify endpoint still works."""
        response = client.post("/api/simplify", json={"latex": "x^2 + 2x + x - 3"})
        assert response.status_code == 200
        data = response.json()
        assert "result" in data

    def test_factor_with_latex_notation(self, client):
        """Test factor endpoint with LaTeX notation (requires normalization)."""
        response = client.post("/api/factor", json={"latex": r"x^2 - 2 \cdot x + 1"})
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
