# ProbFlow Skill

Monte Carlo uncertainty engine for pipe flow physics. Claude orchestrates, doesn't calculate.

---

## Architecture

```
User Question --> Claude (parse intent) --> Adapter Registry --> Validated Calculator --> Result
```

```
probflow/                              testing-suite/
├── probflow/                          ├── tests/           (27 files, 459 tests)
│   ├── adapters/        (6 files)     │   ├── test_anti_hallucination.py
│   │   ├── universal_adapter.py       │   ├── test_boundary_conditions.py
│   │   ├── slurry_water_hammer_adapter│   ├── test_fluidflow_crossval.py
│   │   ├── llm_adapter.py            │   ├── test_poison_pill.py
│   │   ├── ground_truth.py           │   ├── test_unit_conversions.py
│   │   └── pytest_adapter.py         │   ├── test_validated_forward.py
│   ├── ui/              (74 files)    │   ├── test_transient_verification.py
│   │   ├── app.py                     │   └── test_sprint{5-14}_*.py
│   │   ├── qa_dashboard.py            ├── probflow/        (24 files)
│   │   ├── components/                │   ├── tests/test_adapters.py
│   │   │   └── mr_view/               │   └── benchmarks/
│   │   │       ├── workbench.py       ├── slutrans/        (slurry transport)
│   │   │       ├── helpers.py         ├── gastrans/        (gas / IAPWS)
│   │   │       └── tabs/ (15 tabs)    ├── heatx/           (heat exchangers)
│   │   └── network_viewer/            ├── valves/          (control/check/relief)
│   ├── reports/         (4 files)     ├── pump_it_up/      (pump curves)
│   │   ├── unified_report.py (2280L)  ├── pneumatic/       (conveying)
│   │   ├── report_helpers.py          ├── pfa/             (pulsation / API 674)
│   │   └── charts.py (Sprint 16)      ├── pd_pumps/        (PD pumps)
│   ├── analysis/        (14 files)    ├── gasslurrytrans/   (three-phase)
│   │   ├── parametric.py              ├── crossval/        (cross-validation refs)
│   │   ├── convergence.py             ├── run_all_tests.py (harness runner)
│   │   ├── cost_optimization.py       └── scripts/
│   │   ├── scenario_comparison.py
│   │   └── sensitivity.py
│   ├── core/            (8 files)
│   │   ├── results.py
│   │   ├── distributions.py
│   │   └── parameters.py
│   ├── compliance/      (4 files)
│   │   └── risk_register.py
│   ├── export/          (7 files)
│   ├── api/             (13 files)
│   ├── ml/              (9 files)
│   ├── sampling/        (6 files)
│   └── network/         (18 files)
└── docs/prds/           (sprint PRDs)
```

**Codebase:** 379 .py files (202 probflow + 177 testing-suite)
**Split:** 69% open source (NumPy/SciPy/DHLLDV/TSNet/IAPWS) + 31% Claude Code (UI, adapters, harness)

---

## Current State (Sprint 15)

| Metric | Value |
|--------|-------|
| Total tests | 459 (100% pass) |
| Literature benchmarks | 62 (100% source citations) |
| FluidFlow cross-validations | 20 |
| Poison pill tests | 16 |
| Boundary condition tests | 42 |
| Unit conversion round-trips | 39 |
| Anti-hallucination audits | 68 |
| Workbench tabs | 15 |
| Physics modules | 10 |

---

## Key Paths

| Component | Path |
|-----------|------|
| UI entry | `/Users/user/probflow/probflow/ui/app.py` |
| Adapters | `/Users/user/probflow/probflow/adapters/` |
| Reports | `/Users/user/probflow/probflow/reports/unified_report.py` |
| Report helpers | `/Users/user/probflow/probflow/reports/report_helpers.py` |
| Parametric | `/Users/user/probflow/probflow/analysis/parametric.py` |
| Convergence | `/Users/user/probflow/probflow/analysis/convergence.py` |
| Risk register | `/Users/user/probflow/probflow/compliance/risk_register.py` |
| MC results | `/Users/user/probflow/probflow/core/results.py` |
| Workbench | `/Users/user/probflow/probflow/ui/components/mr_view/workbench.py` |
| QA dashboard | `/Users/user/probflow/probflow/ui/qa_dashboard.py` |
| Tests | `/Users/user/testing-suite/tests/` |
| Test harness | `/Users/user/testing-suite/run_all_tests.py` |
| Benchmarks | `/Users/user/testing-suite/*/benchmarks/*.json` |
| PRDs | `/Users/user/probflow/docs/prds/` |

---

## Test Commands

```bash
# Full regression (459 tests)
cd /Users/user/testing-suite && PYTHONPATH=/Users/user/testing-suite:/Users/user/probflow \
  python3 -m pytest tests/ -v --tb=short

# Harness tests (105)
cd /Users/user/testing-suite && PYTHONPATH=/Users/user/testing-suite:/Users/user/probflow \
  python3 run_all_tests.py

# Sprint-specific
PYTHONPATH=/Users/user/testing-suite:/Users/user/probflow \
  python3 -m pytest tests/test_sprint{N}_*.py -v

# Compile check
cd /Users/user/probflow && python3 -c "
import py_compile
for f in ['probflow/reports/unified_report.py', 'probflow/analysis/parametric.py']:
    py_compile.compile(f, doraise=True); print(f'PASS: {f}')
"
```

---

## Test Import Pattern (CRITICAL)

Tests MUST use `_import_from_probflow()`, NOT `from probflow.x import y`:

```python
import importlib.util, sys

_PROBFLOW = '/Users/user/probflow/probflow'

def _import_from_probflow(module_path: str, module_name: str):
    spec = importlib.util.spec_from_file_location(module_name, module_path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = mod
    spec.loader.exec_module(mod)
    return mod
```

**Why:** testing-suite has its own `probflow/` directory that shadows the real package.

---

## MR Mode Quick Start

1. `cd /Users/user/probflow && streamlit run probflow/ui/app.py`
2. Sidebar: "MR View (Beta)"
3. Tab: "Monte Carlo" (Tab 0)
4. Select module, set parameters, click "Run Monte Carlo"

**Modules:** Slurry Transport, Water Hammer, Pneumatic, Pump Curves, Heat Exchangers
**15 Tabs:** Monte Carlo, Parametric, Sensitivity, Goal Seek, Optimizer, Comparison, Percentile, Design Feedback, Forward Test, Validation, DataFlow, Reports, Docs, Pressure Profile, Cost Optimization

---

## API Credentials

| Service | Detail |
|---------|--------|
| Google Sheets SA | `content-sync@fluidflow-content-sync.iam.gserviceaccount.com` |
| Credentials file | `/Users/user/Downloads/misc_archive/fluidflow-content-sync-f9e35cea9dd6.json` |
| Env file | `/Users/user/Downloads/agents/.env` |
| Injection script | `/Users/user/probflow/scripts/inject_calculator_verification.py` |
| Validations sheet | `1flld1sVJH4HepU-t340JCacreigaAw7727RVTkxCH64` |

---

## Sprint History

| Sprint | Focus | Tests | Total |
|--------|-------|-------|-------|
| 1-8 | Core physics, adapters, UI, cost optimizer | 159 | 159 |
| 9-12 | MC envelopes, grid sweeps, scenarios, evidence packs | 67 | 226 |
| 13 | Parametric dominance + report features | 48 | 274 |
| 14 | Architecture refactoring (facade pattern) | 0 | 274 |
| 15 | Test integrity + anti-hallucination | 185 | 459 |
| 16 | Report excellence + professional charting | ~30 | ~489 |

---

## Learnings & Gotchas

### Imports
- `_sibling_import()` with `spec_from_file_location` for facade modules
- Relative imports (`.sweep`) fail when loaded via spec_from_file_location
- Always clear `__pycache__` after creating new adapter files

### Testing
- Never claim pass rates without running actual tests
- Manual arithmetic verification on every benchmark
- First-principles: calculate from published formulas before comparing
- All benchmarks need citable references (standard, literature, cell ref)

### Common Bugs
- `gspread.exceptions.CellNotFound` does NOT exist — `ws.find()` returns None
- `gspread.utils.rowcol_to_a1()` never includes sheet name
- `pd.to_numeric`: always use `errors='coerce'` for mixed-type columns
- CTR: store as decimal (0.15), display as % (15%). Never x100 twice.
- XSS: all user strings in HTML must use `html.escape()`
- DoS: cartesian product sweeps need max_combinations limit (100K)
- Always `timeout=10` on `requests.post()` calls

### Physics
- IAPWS-IF97 may miss Regions 3/4 — check saturation + supercritical
- API 674 (pumps) != API 618 (compressors) — different physics
- Downloaded xlsx may be HTML 403 pages — verify with `file` command
- Benchmark JSON must include `source` and `tolerances` fields

---

## Competitors

| Tool | Strength | Gap vs ProbFlow |
|------|----------|-----------------|
| GoldSim | Regulatory pedigree, time-dependent sim | No pipe physics, no Sobol, $25K+ |
| @RISK | Excel integration, exceedance curves | No pipe physics, no validation suite |
| AFT Fathom | Pipe hydraulics, parametric sweeps | No MC, no GUM budget, no quasi-random |
| PIPE-FLO | CAD printouts, network diagrams | No MC, no sensitivity, no compliance |

---

## Pre-Sprint Checklist

- [ ] Search for existing partial implementations
- [ ] Verify resource files are real data (not HTTP errors)
- [ ] Count benchmark cases and identify gaps
- [ ] Confirm authoritative formula references
- [ ] List singularities, boundaries, phase transitions
- [ ] Check reusable existing functions
