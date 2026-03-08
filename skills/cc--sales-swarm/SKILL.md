# Sales Swarm Skill

FluidFlow B2B sales pipeline orchestrator — research, outreach, qualification, proposals, and deal progression with validated technical claims.

---

## Invocation

```bash
/sales proposal mining "Acme Corp"        # Custom proposal with ROI
/sales outreach chemical "Beta Inc"       # Cold outreach email sequence
/sales rfp "requirements.txt"             # RFP response
/sales sequence "slurry pipelines" mining # Drip email sequence
/sales qualify "lead.json"                # BANT qualification
/sales technical "Can you model X?"       # Technical capability check
```

---

## Agent Swarm Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SALES SWARM COORDINATOR                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  RESEARCH & QUALIFICATION          EXECUTION & DELIVERY             │
│  ───────────────────────            ─────────────────────           │
│                                                                      │
│  ┌──────────────────────┐           ┌──────────────────────┐        │
│  │ csm-research-agent   │──────────▶│  outreach-writer     │        │
│  │ B2B Lead Gen         │           │  Email/LinkedIn/Call │        │
│  └──────────────────────┘           └──────────────────────┘        │
│            │                                  │                      │
│            ▼                                  ▼                      │
│  ┌──────────────────────┐           ┌──────────────────────┐        │
│  │ sales-assistant      │◀─────────▶│  sequence-manager    │        │
│  │ Qualification        │           │  Cadence/Triggers    │        │
│  └──────────────────────┘           └──────────────────────┘        │
│            │                                  │                      │
│            ▼                                  ▼                      │
│  ┌──────────────────────┐           ┌──────────────────────┐        │
│  │ pricing-matrix       │──────────▶│  proposal-builder    │        │
│  │ Pricing/TCO          │           │  Custom Docs + ROI   │        │
│  └──────────────────────┘           └──────────────────────┘        │
│                                                                      │
│  TECHNICAL VALIDATION LAYER                                          │
│  ────────────────────────────                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐                 │
│  │ hydraulic-specialist │  │ guardrails-check     │                 │
│  │ Technical Knowledge  │  │ Capability Verify    │                 │
│  └──────────────────────┘  └──────────────────────┘                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Usage Examples

### 1. Proposal Generation

```bash
/sales proposal mining "MineFlow Industries"
```

**What it does:**
1. Query Verification Sources DB for mining references
2. Query Industry Pain Map for mining-specific pain points
3. Query Guardrail Registry (no competitor pricing comparisons)
4. Generate custom proposal with ROI calculations
5. Validate technical claims with hydraulic-specialist
6. Include 1 literature citation
7. Run Ralph Loop validation
8. Store in Agent Outputs DB (Swarm=Sales)

**Output:**
- `proposals/mineflow_proposal.md` — Full proposal document
- `proposals/mineflow_roi.md` — ROI calculator
- `proposals/mineflow_quote.md` — Pricing breakdown

---

### 2. Outreach Sequence

```bash
/sales outreach oil-gas "Apex Energy"
```

**What it does:**
1. Research company via csm-research-agent
2. Identify pain points from Industry Pain Map
3. Generate personalized 5-touch email sequence
4. Create LinkedIn connection + follow-ups
5. Generate call script
6. Validate all technical claims
7. Store in Agent Outputs DB

**Output:**
- `outreach/apex_emails.md` — Email sequence
- `outreach/apex_linkedin.md` — LinkedIn messages
- `outreach/apex_call.md` — Call script
- `outreach/apex_cadence.yaml` — Timing schedule

---

### 3. RFP Response

```bash
/sales rfp "rfp_requirements.txt"
```

**What it does:**
1. Parse RFP requirements
2. Map to FluidFlow capabilities (validated)
3. Flag out-of-scope items with alternatives
4. Generate response document
5. Include compliance matrix
6. Add relevant case studies
7. Store in Agent Outputs DB

**Output:**
- `rfp/response.md` — Full RFP response
- `rfp/compliance_matrix.md` — Requirement mapping

---

### 4. Drip Email Sequence

```bash
/sales sequence "slurry pipelines" mining
```

**What it does:**
1. Generate 5-touch sequence for slurry topic
2. Target mining industry pain points
3. Include technical credibility (Durand, Wilson-GIW)
4. Soft CTAs, no hard selling
5. Schedule with optimal timing
6. Store in Agent Outputs DB

**Output:**
- `sequences/slurry_mining.md` — Email sequence
- `sequences/slurry_mining_cadence.yaml` — Timing

---

### 5. Lead Qualification

```bash
/sales qualify lead.json
```

**lead.json:**
```json
{
  "company": "ABC Mining",
  "contact": "John Smith",
  "title": "Senior Process Engineer",
  "industry": "mining",
  "context": "Downloaded slurry guide, 500 employees"
}
```

**What it does:**
1. BANT assessment (Budget, Authority, Need, Timeline)
2. ICP fit scoring
3. Priority assignment (A1/A2/B1/B2/C)
4. License recommendation (Named/Network)
5. Objection forecast
6. Next action recommendation

**Output:**
- `qualification/abc_mining_bant.md` — Qualification report

---

### 6. Technical Capability Check

```bash
/sales technical "Can FluidFlow model settling slurry in 12-inch pipe?"
```

**What it does:**
1. Query hydraulic-specialist knowledge base
2. Check against In-Scope Capabilities
3. Validate correlation applicability (Durand, Wilson-GIW)
4. Provide technical response with:
   - YES/NO answer
   - Specific method used
   - Validity limits
   - Example talking points
5. Store in Verification Sources DB

**Output:**
- Technical response (Slack/Intercom/Email ready)

---

## Validation Gates

**Every output must:**

1. **Query Verification Sources DB** (27a089ac-b62f-4d94-bd5d-230aec9f1887)
   - Pull relevant references for claims
   - Cite literature (1 per output minimum)

2. **Query Industry Pain Map** (2eb8fb7c-51ac-81ba-8133-f3a792838271)
   - Industry-specific pain points
   - Validated value propositions

3. **Check Guardrail Registry** (3058fb7c-51ac-8122-8a7f-c80ece0615d7)
   - NO competitor pricing comparisons
   - NO invented features
   - NO out-of-scope claims

4. **Technical Validation** (hydraulic-specialist)
   - All capability claims validated
   - Correlations within validity limits
   - Terminology standards enforced

5. **Ralph Loop** (max 3 iterations)
   - Content accuracy
   - Tone appropriateness
   - CTA clarity
   - Technical correctness

6. **Store Output** (Agent Outputs DB: 3058fb7c-51ac-816e-bf68-d672f349ef48)
   - Tag with `Swarm=Sales`
   - Include validation status
   - Link to source research

---

## Pain Map by Industry

### Mining
- **Pain:** Slurry line blockages, pump wear, deposition velocity uncertainty
- **FluidFlow Solution:** Durand/Wilson-GIW correlations, critical velocity calculation
- **ROI:** Reduced unplanned downtime, optimized pump sizing

### Oil & Gas
- **Pain:** API RP 14E erosional velocity compliance, slug flow unpredictability
- **FluidFlow Solution:** Beggs-Brill correlations, erosional velocity checks
- **ROI:** Reduced pipe failures, compliance assurance

### Chemical
- **Pain:** Non-Newtonian behavior unpredictability, scale-up uncertainty
- **FluidFlow Solution:** Power Law, Bingham, Herschel-Bulkley models
- **ROI:** Faster scale-up, reduced trial batches

### Utilities (Water)
- **Pain:** Network optimization complexity, pressure zone design
- **FluidFlow Solution:** Hazen-Williams, system balancing
- **ROI:** Energy savings, capacity planning

### Pharmaceuticals
- **Pain:** PW/WFI loop compliance, CIP system validation
- **FluidFlow Solution:** Velocity verification, pressure drop validation
- **ROI:** FDA compliance, reduced validation time

### Fire Protection
- **Pain:** NFPA hydraulic calculations, sprinkler system design
- **FluidFlow Solution:** NFPA method compliance, fire pump sizing
- **ROI:** Code compliance, faster design approvals

---

## Objection Handling Library

### "It's too expensive"
**Response:**
"I understand. Let me ask — what's the cost of a calculation error on a slurry line? One blockage, one unplanned shutdown? FluidFlow typically pays for itself in 2-3 avoided incidents. Can I show you an ROI calculation based on your specific situation?"

### "We can do this in Excel"
**Response:**
"Absolutely, many of our customers started with Excel. The challenge is — Excel doesn't catch the errors that cause problems. No validation, no correlation limits, no warnings when you're outside valid ranges. What would happen if your Excel model gave a 20% wrong answer?"

### "Competitor X is cheaper"
**Response:**
"It might be. But can [competitor] handle settling slurry? Two-phase flow? Non-Newtonian fluids? If your work involves any of those, cheaper software becomes expensive when you can't model your actual system. What types of fluids do you work with?"

### "We need CFD, not 1D analysis"
**Response:**
"Good point. FluidFlow is designed for different questions — system-level behavior, not local flow details. Our users run FluidFlow first to size the system, set operating points, then use CFD for specific components if needed. It's complementary, not competing. What specific questions are you trying to answer?"

### "Does it handle [specific capability]?"
**If IN_SCOPE:**
"Yes, FluidFlow handles that. Let me show you exactly how it works in a demo."

**If OUT_OF_SCOPE:**
"That's outside FluidFlow's scope. FluidFlow is a 1D network solver — great for [what it does], but not designed for [what it doesn't]. For that, you'd need [alternative]. Would FluidFlow still solve your main problem?"

**If UNCERTAIN:**
"I want to make sure I give you accurate info. Let me check with our technical team and get back to you within 24 hours. In the meantime, can you tell me more about your specific use case?"

---

## Technical Capability Reference

### IN-SCOPE (validated claims)
✅ Single-phase liquid and gas flow in pipe networks
✅ Pressure drop calculations (Darcy-Weisbach, Hazen-Williams, Colebrook-White)
✅ Flow distribution in branched networks
✅ Pump and compressor performance curves
✅ Control valve sizing (IEC 60534, ISA)
✅ Gas-liquid two-phase flow (flow regime maps, correlations)
✅ Settling and non-settling slurry transport
✅ Non-Newtonian flow (Power Law, Bingham, Herschel-Bulkley)
✅ Basic thermal modeling and heat transfer
✅ Relief valve sizing (API 520/521)
✅ Fire protection system hydraulics (NFPA)

### OUT-OF-SCOPE (do NOT claim)
❌ Detailed velocity profiles within pipes
❌ Turbulence modeling (k-ε, LES, DNS)
❌ Separation, recirculation zones
❌ External aerodynamics
❌ Fluid-structure interaction (FSI)
❌ Combustion and chemical reactions
❌ Detailed mixing (concentration profiles)
❌ Open channel / free surface dynamics
❌ Individual particle tracking
❌ Viscoelasticity
❌ Time-dependent rheology (thixotropic, rheopectic)
❌ Water hammer / transient analysis (use FlowDesigner, launching 2026)

---

## Output Storage

All outputs stored in:
**Agent Outputs DB:** 3058fb7c-51ac-816e-bf68-d672f349ef48

**Required fields:**
- `Swarm`: "Sales"
- `Agent`: [specific agent name]
- `Industry`: [target industry]
- `Company`: [if applicable]
- `Validation Status`: PASSED/FAILED
- `Ralph Iterations`: [count]
- `Literature Citations`: [list]
- `Created`: [timestamp]

---

## Integration with Other Agents

| Agent | Integration Point |
|-------|------------------|
| `csmate/research_agent.md` | Company research (reference, don't absorb) |
| `pipeline-analyst` skill | Deal intelligence (Notion query) |
| Guardrail Registry (Notion) | Terminology, scope, safety validation |
| Ralph Loop (ralph-loop skill) | 6-point validation protocol |

---

## Anti-Hallucination Rules

1. **Never invent FluidFlow features**
2. **Never claim capabilities outside 1D pipe network analysis**
3. **Never fabricate correlation names or validity ranges**
4. **Never create fictional case studies with specific numbers**
5. **Never make up pricing without pricing matrix**
6. **When uncertain, defer to hydraulic-specialist**
7. **Always cite Verification Sources DB for claims**
8. **Run Ralph Loop until validation passes**

---

## Command Routing

```bash
/sales proposal [industry] "[company]"
  → proposal-builder
  → pricing matrix
  → hydraulic-specialist (validation)
  → Ralph Loop

/sales outreach [industry] "[company]"
  → csm-research-agent (company research)
  → outreach-writer (sequence generation)
  → sequence-manager (timing)
  → hydraulic-specialist (validation)
  → Ralph Loop

/sales rfp "[requirements]"
  → Parse requirements
  → hydraulic-specialist (capability mapping)
  → proposal-builder (response generation)
  → guardrails check (compliance check)
  → Ralph Loop

/sales sequence "[topic]" [industry]
  → outreach-writer (content)
  → sequence-manager (timing)
  → hydraulic-specialist (validation)
  → Ralph Loop

/sales qualify "[lead.json]"
  → sales-assistant (BANT assessment)
  → ICP scoring
  → Priority assignment

/sales technical "[question]"
  → hydraulic-specialist (knowledge query)
  → In-Scope check
  → Response generation
```

---

## Success Criteria

**Every output must:**
- ✅ Include 1+ literature citation from Verification Sources DB
- ✅ Reference Industry Pain Map for pain points
- ✅ Pass Guardrail Registry checks
- ✅ Pass hydraulic-specialist technical validation
- ✅ Pass Ralph Loop (max 3 iterations)
- ✅ Be stored in Agent Outputs DB with Swarm=Sales
- ✅ Include actionable next steps
- ✅ Be peer-to-peer engineer tone (NOT salesy)

---

## Example: Full Workflow

```bash
/sales proposal mining "MineFlow Industries"
```

**Execution:**

1. **Query Verification Sources DB**
   - Find mining-related references
   - Pull slurry transport literature

2. **Query Industry Pain Map**
   - Mining pain: blockages, pump wear, deposition velocity
   - Value prop: Durand/Wilson-GIW correlations

3. **Query Guardrail Registry**
   - Check: No competitor pricing comparisons ✓
   - Check: No invented features ✓

4. **Generate Proposal** (proposal-builder)
   - Executive summary
   - Understanding Your Challenges (pain points)
   - The FluidFlow Solution (validated claims)
   - Implementation Approach
   - Investment (from pricing matrix)
   - ROI Calculator (quantified benefits)

5. **Validate Technical Claims** (hydraulic-specialist)
   - Slurry modeling: Durand correlation ✓
   - Critical velocity: SVR ≥ 1.3 ✓
   - Pump sizing: Performance curves ✓

6. **Ralph Loop** (max 3 iterations)
   - Iteration 1: Technical accuracy ✓
   - Iteration 2: Pain map alignment ✓
   - Iteration 3: Tone check ✓
   - PASSED

7. **Store Output** (Agent Outputs DB)
   - Swarm: Sales
   - Agent: proposal-builder
   - Industry: mining
   - Company: MineFlow Industries
   - Validation Status: PASSED
   - Ralph Iterations: 3
   - Literature Citations: [Durand 1953, Wilson-GIW 2006]

8. **Deliver**
   - `proposals/mineflow_proposal.md`
   - `proposals/mineflow_roi.md`
   - `proposals/mineflow_quote.md`

---

## Contact

- Technical: support@fluidflowinfo.com
- Commercial: sales@fluidflowinfo.com

---

*Last updated: 2026-02-12*
*Source: /Users/user/ffagents26/agents/sales-swarm/*
