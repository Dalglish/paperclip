# Sprint 1 Coding Standards & Learnings

**Date:** 2026-02-01
**Context:** Karpathy Swarm implementation of hydraulic calculation modules

## Critical Errors Found

### 1. Documentation Before Verification
**Issue:** Haiku agent VL-002 created comprehensive documentation claiming "2/2 tests passing (100%)" while CHK-002 was actually failing with 72% error.

**Root Cause:** Agent wrote completion reports before running actual validation.

**Prevention:**
```bash
# ALWAYS run validation AFTER agent completes
python3 module/validate_module.py 2>&1 | tail -20
# Look for actual PASS/FAIL, not agent claims
```

### 2. Arithmetic Errors in Benchmark Notes
**Issue:** Benchmark file documented `sqrt(0.72/7.85) ≈ 1.0754` but actual value is `0.3028`.

**Root Cause:** Copy-paste error or miscalculation when creating benchmark.

**Prevention:**
```python
# Always verify arithmetic in benchmark files
import math
numerator = 2 * 0.04 * 1.8 * 5.0  # = 0.72
denominator = 1000 * 0.00785       # = 7.85
result = math.sqrt(numerator / denominator)
print(f"Actual: {result:.4f}")  # 0.3028, NOT 1.0754
```

### 3. Circular Validation Risk
**Issue:** Benchmarks could be set to match code output rather than authoritative sources.

**Prevention:** First-principles verification:
1. Calculate expected value from published formula
2. Compare to benchmark file
3. Compare to code output
4. All three must match

## Benchmark File Standards

### Required Fields
```json
{
  "name": "TEST-001: Descriptive Name",
  "source": "ISA-75.01 Section 5.2 Eq. 3",
  "inputs": { ... },
  "expected_outputs": { ... },
  "tolerances": { ... },
  "notes": "Show calculation: Cv = Q * sqrt(SG/dP) = 100 * sqrt(1/25) = 20.0"
}
```

### Source Traceability Requirements
| Type | Format |
|------|--------|
| Standard | "ISA-75.01 Eq. 3" |
| Textbook | "Miedema (2016) p.127 Table 4.3" |
| Spreadsheet | "filename.xls, Sheet1, cell C64" |
| Paper | "Author (Year), Eq. 15" |

## Formula Documentation Standard

```python
def calculate_cv_liquid(Q: float, P1: float, P2: float, SG: float = 1.0) -> float:
    """
    Calculate liquid Cv per ISA-75.01.

    Formula:
        Cv = Q × √(SG / ΔP)

    Reference: ISA-75.01 Section 5.2, Equation 3

    Args:
        Q: Flow rate (gpm for US, m³/h for SI)
        P1: Inlet pressure (psia/bar)
        P2: Outlet pressure (psia/bar)
        SG: Specific gravity (dimensionless)

    Returns:
        Cv: Flow coefficient (dimensionless)

    Example:
        >>> calculate_cv_liquid(100, 100, 75, 1.0)
        20.0  # Q=100gpm, dP=25psi, SG=1 → Cv=20
    """
```

## Agent Orchestration Protocol

### Opus Quality Gate Checklist
After Haiku agent completes:

- [ ] Run actual validation: `python3 module/validate.py`
- [ ] Check for FAILED tests in output
- [ ] Verify test count matches expectation
- [ ] Spot-check one formula manually
- [ ] Confirm benchmark sources are traceable

### Trust But Verify
```python
# Don't trust agent claims like:
# "Task VL-002 complete with 100% pass rate"

# Instead verify:
result = subprocess.run(['python3', 'validate.py'], capture_output=True)
if 'FAILED' in result.stdout.decode():
    print("Agent claim was incorrect - tests failing")
```

## Test Tolerance Guidelines

| Calculation Type | Tolerance | Justification |
|-----------------|-----------|---------------|
| Exact formulas (Cv, dP) | 1% | Algebraic, no approximation |
| Iterative methods | 2-5% | Convergence tolerance |
| Empirical correlations | 5-10% | Inherent scatter in data |
| Literature comparisons | 10-15% | Different correlation forms |

## Red Flags to Watch For

1. **Agent documentation before test execution**
2. **Round numbers in expected outputs** (0.5000 exactly vs 0.4987)
3. **Missing source references** in benchmark files
4. **Tolerance set to match observed error** rather than engineering requirements
5. **100% pass claims** without showing actual test output
