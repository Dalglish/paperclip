# FluidFlow Specification Sheet - Complete Technical Extract

**Extracted:** 2026-02-17
**Source:** https://fluidflowinfo.com/spec-sheet/
**Latest Version:** v3.54

---

## Product Information

**Full Product Name:** Piping Systems FluidFlow (latest release v3.54)

**Company:** Flite Software Ltd (est. 1984)

**Location:** Block E Balliniska Business Park, Springtown Road, Londonderry, Northern Ireland, BT48 0LY

**Languages:** English, French, Spanish (with tools to translate interface to any language)

---

## Pricing & Licensing

**Annual Lease:** £3,240 – £9,990 per server seat per annum (includes SUM)

**Perpetual Licensing:** Available from 2 seats upwards (contact sales)

**License Types:** Annual, Quarterly, Perpetual, Named User

**License Installation:** Network License Installation Instructions provided

**License Activation:** Manual or automatic (instructions provided)

**License Use:** Global use included

**Trial Licenses:** Require online login, 14 full days, includes full professional features

---

## Software Overview

**Type:** Hydraulic Calculation Software

**Capabilities:** Model, design, or analyze any liquid, gas, two-phase, slurry or non-Newtonian pipe flow system from a single software solution

**Time Savings:** Up to 80% of design time

**Calculation Reliability:** Proven calculation reliability, tested and verified against published data & real-world systems. Library of 'Quality Assurance' test models included.

---

## Industry Applications

- Aerospace
- Automotive
- Aviation
- Aviation Fuel Systems
- Chemicals
- Educational Institution
- EPC
- Equipment Manufacturer
- Fire Protection
- FMCG
- Mining & Metals
- Oil & Energy
- Paper Processing
- Pharmaceutical
- Pulp & Paper
- Research Body
- Semi-Conductor Manufacturer
- Shipbuilding
- Space Exploration
- Standards Agency
- Utilities

---

## Modules

### 1. Liquid Module
**Systems Modeled:** Incompressible liquids (Newtonian)

**Capabilities:**
- Fast and accurate design for Newtonian fluids
- Determines system operating pressures, flow distribution, and fluid physical properties
- Models wide range of line equipment items
- Calculates pressure-driven systems
- Calculates gravity-driven systems
- Calculates pump-driven systems

### 2. Gas Module
**Systems Modeled:** Compressible vapor/gas systems

**Capabilities:**
- Accurate for both low and high-velocity gas flow systems
- Solves conservation equations and equation of state ensuring accurate solution
- Auto-detection of choked flow conditions
- Accurately models real gases
- Accurately models heat transfer
- Accurately models highly compressible (sonic and near sonic) systems

### 3. Two-Phase Module
**Systems Modeled:** Liquid-Vapor mixtures

**Capabilities:**
- Automatically tracks fluid phase-state
- Performs flash calculations
- Liquid holdup calculations
- Develops flow regime maps for each pipe segment
- Highly accurate results using "marching" solution algorithm
- Models fixed or changing vapor quality systems with heat transfer
- Calculates change in vapor fraction across piping length
- Users can perform fluid mixing using database fluids with physical properties based on Standard Mixing Rules

### 4. Slurry Module
**Systems Modeled:**
- Two-phase liquid-solid / slurries
- Non-Newtonian fluids
- Settling and non-settling slurries
- Pulp & Paper stock flow systems

**Capabilities:**
- Analyze liquid-solid flow systems for mineral hydro transport
- Metal concentrate pipelines, tailings, paste backfill systems
- Dredging, wastewater treatment
- Industry choice for designing, troubleshooting and optimizing slurry flow systems

### 5. Scripting Module
**Purpose:** For "Light" Dynamic Analysis, Multi Calc functionality and Back Calc Input Tool (Reverse Calculation Feature)

---

## Fluid Database

**Total Fluids:** 1,283 fluids in comprehensive database

**Custom Fluid Options (5 types):**
1. Simple Newtonian
2. Pure Newtonian
3. non-Newtonian Liquid
4. Gas (No Phase Change)
5. Petroleum Fraction or Crude

**Customizable:** Yes, users can add fluids to database

---

## Pipe Database

**Standard Pipe Sizes Database (14 types):**
1. Acrylonitrile-Butadiene-Styrene ABS Pipe
2. Aluminium Pipe or Duct
3. Asbestos Cement Pipe
4. Cast Iron Pipe
5. Concrete Pipe
6. Copper Pipe
7. Ductile Iron Pipe
8. Flexible Smooth or Corrugated Hose
9. Glass Pipe
10. Polyethylene (PE) Pipe or Duct
11. PolyVinylChloride (PVC) Pipe or Duct
12. PP or PFA Pipe or Duct
13. Stainless Steel Pipe or Duct
14. Steel Pipe or Duct

**Customizable:** Yes, users can supplement with new pipe size data for specific applications

---

## Physical Property Correlations

### Liquid Module
**Property Models:**
- Fixed properties (for simple Newtonian)
- Temperature correlation data
- Pure Newtonian via various equations of state:
  - **Peng-Robinson**
  - **Lee-Kesler**
  - **Benedict-Webb-Rubin-Han-Starling (BWRHS)**

### Gas Module
**Property Models:**
- No phase change gases based on temperature correlation data
- Pure Newtonian via various equations of state:
  - **Peng-Robinson**
  - **Lee-Kesler**
  - **Benedict-Webb-Rubin-Han-Starling (BWRHS)**
- **Hydrogen:** Includes NIST Density Estimation (version 3.53+)

**EOS Calculation Method:**
- Solves conservation equations and equation of state for small pressure loss increments
- Calculates gas thermophysical properties (enthalpy, density) as gas accelerates
- Makes no assumptions of gas ideality or adiabatic flowing conditions
- Dynamically splits pipe into segments based on incremental density change
- Method developed from paper: "Relief Line Sizing for Gases Part 1 and 2" by HA Duxbury (The Chemical Engineer, Dec 1979)

### Two-Phase Module
**Property Models:**
- Fluid mixing using database fluids
- Physical properties based on Standard Mixing Rules
- Two-phase properties determined for Pure Newtonian or Fluid mix
- Heat of vaporization (can be based on Literature or estimation)
- Surface tension (via linear function or estimation)

### Slurry Module
**Rheology Models (4 types):**
1. **Power Law**
2. **Bingham Plastic**
3. **Casson**
4. **Herschel Bulkley**

**Features:**
- Yield stress can be calculated or specified
- R² coefficient available for accuracy
- Expandable database with default data for common non-Newtonian liquids
- Solid physical properties for at least 11 common materials (metals processing, coal, sands handling)
- **16 pulp type options** for TAPPI Method
- Definable Moller K pulp property data

---

## Pressure Drop Correlations

### Liquid Module (4 models)
1. **Moody (Darcy-Weisbach)**
2. **Hazen Williams**
3. **Fixed Friction Factor (Darcy)**
4. **Shell – MIT**

### Gas Module
Uses conservation equations and equation of state approach (detailed above under Physical Properties)

**Equations of State:**
- Benedict-Webb-Rubin-Han-Starling
- Peng-Robinson
- Lee-Kesler

### Two-Phase Module (8 correlations)
1. **Whalley Criteria** (uses Friedel, Chisholm, or Lockhart-Martinelli)
2. **Drift Flux Model** (2007 correlations)
3. **Beggs and Brill** (Extended Regions)
4. **Friedel**
5. **Muller-Steinhagen and Heck**
6. **Chisholm Baroczy**
7. **Lockhart-Martinelli**
8. **Homogeneous Equilibrium Model**

**Flow Regime Maps:** Yes, generated for each pipe segment

### Slurry Module

**Non-Newtonian Friction Loss Methods:**
- Darby
- Chilton-Stainsby
- Converted Power Law

**Settling Slurry Friction Loss Correlations (8 methods):**
1. **Vsm Model**
2. **V50 Model**
3. **Four Component Method (4CM)**
4. **Durand**
5. **Wasp**
6. **WASC (Wilson-Addie-Sellgren-Clift) Method**
7. **Sellgren–Wilson Four-Component Model**
8. **Liu Dezhong**

**Vertical Piping Options (3 methods):**
1. **Vertical Pipe WASC Loss**
2. **4CM**
3. **Spelay, Gillies, Hashemi and Sanders 2017 Collisional Stress Model**

**Pulp & Paper:**
- Moller K Correlation
- TAPPI Pulp and Paper Stock Pressure Loss Correlation

---

## Deposition Velocity Modeling (Slurry Module)

### Maximum Deposition Limit Velocity (3 methods)
1. **WASC (Wilson-Addie-Sellgren-Clift) Generalized Relationship**
2. **As a function of particle size**
3. **GIW VSCALC**

### Correction for Non-Horizontal Flows (2 methods)
1. **Wilson – Tse 1984 Chart**
2. **Extended Wilson – Tse 1984 Chart**

### Characteristic Velocities Calculated
- **Oroskar and Turian Critical Velocity**
- **Schiller and Herbich Minimum Velocity**
- Maximum deposition limit velocities for:
  - Wilson–GIW
  - Thomas 1979
  - Thomas 2015
  - Wilson 1992 Models

---

## Centrifugal Pump Performance Modeling (Slurry Module)

**Performance Adjustment Methods (5 options):**
1. **RP King**
2. **HI Guidelines**
3. **ANSI 2021 Monosize**
4. **GIW 4CM**
5. **Fixed Deration**

**Purpose:** Adjusts for non-Newtonian viscosity effects and solids friction loss at pump internals

---

## Fitting Resistance Calculation Methods

**K-Factor Calculation Methods (4 options):**
1. **Idelchik** (more accurate compared to Crane)
2. **Miller** (more accurate compared to Crane)
3. **Crane**
4. **SAE**

**Database:** General Resistance elements database for any fitting or device. Users can supplement with new resistance elements and values.

---

## Heat Transfer Functionality

**Availability:** ALL modules include heat transfer functionality as standard

**Heat Exchanger Types Modeled:**
- Shell and tube exchangers
- Plate exchangers
- Coils
- Autoclaves

**Heat Transfer Options (5 modes):**
1. Buried pipe calculations
2. Pipe heat loss/gain calculation
3. Fixed heat transfer rate
4. Fixed temperature change
5. Ignore heat loss/gain

---

## Model Elements & Components

### Boundaries (4 types)
1. **Pressure**
2. **Flow**
3. **Tank or Vessel Reservoir** (source or destination only)
4. **Atmospheric Ends** (Sprinkler or Customized atmospheric discharge ends)

### Pipes
**Types:**
- Pipes (Standard)
- Rectangular or Annulus
- Hose (Flexible or Corrugated)

**Auto-Sizing Criteria (3 options):**
1. Economic velocity (using **Generaux equation**)
2. Standard velocity
3. Pressure gradient

**Features:**
- Pipe scaling can be applied (consider pipe degradation or current status)
- Heat effects can be ignored or calculated
- Heat effects modeled as:
  - Fixed temperature change
  - Fixed heat transfer rate
  - Buried pipe

### Junctions – Pumps
**Capabilities:**
- Auto-size pump based on desired flow or pressure rise
- Pump curves from several vendors in default database
- Heat loss/gain models customizable
- **Slurry pump solids derating** using:
  - Fixed Reduction
  - King
  - HI guidelines

**Data Entry Methods:**
1. Manual data entry
2. Pump curve database (multiple pump vendors)

### Junctions – Compressor / Blowers / Fans / Turbines
**Capabilities:**
- Auto-size compressors or blowers based on desired flow or pressure rise
- Curves from several vendors in default database
- Heat loss/gain models customizable

### Junctions – Fittings
**Types Modeled:**
- Connectors (no resistance)
- Bends
- Mitre bends
- Tees
- Symmetric Y-junctions
- Cross junctions

**Bend/Mitre Bend Methods:**
- Idelchik
- Miller
- Crane
- SAE

**Features:**
- R/D ratio customizable
- Heat loss/gain across bends can be modeled

**Size Changes:**
- Reducers and expanders
- Abrupt size changes
- Venturi's
- In-line nozzles

**Standards:**
- In-line nozzle: **Long radius** or **ISO 5167** equations
- Orifices: Thin or thick plates using **ISO 5167** equations

### Junctions – Valves
**Default Database Types:**
- Butterfly
- Diaphragm
- Ball
- Gate
- Globe
- Ball float
- Plug
- Pinch
- Y-globe
- Needle
- Slide valve
- Penstock
- 3-way
- Fire hydrant

**Check Valve Types:**
- Swing check
- Tilting disc
- Piston operated
- Spring loaded
- Foot operated

**Features:**
- Valve % opening customizable (0 – 100% in infinite increments)
- Several valve models available in database
- R/D ratio customizable
- Heat loss/gain across valves can be modeled

### Junctions – Control Valves
**Types:**
- Constant upstream and downstream pressure control valves:
  - Self-acting pressure reducer
  - Sustainer element
  - Pressure control valve
- Flow control valves
- Separate element for Gas control valves

**Capabilities:**
- Auto-sizing available
- Flow or pressure control valve type selectable when sizing
- Default database for several control valve vendors
- Heat loss/gain can be modeled
- **Cv values/Cv curve function** supported

### Junctions – General Resistance
**Pressure Loss Constants:**
- K values
- Kf values
- Kv values

**Specialized Components in Default Database:**
- Inline filter
- Packed bed
- Cyclone
- Labyrinth seal
- Centrifuge
- Expansion joint / stuffing box
- Coils
- Tube bundles
- Constant head loss

**Generic Element:** User defined general resistance using polynomial input

**Heat loss/gain:** Can be modeled

### Junctions – Relief Valves
**Modes:**
- Auto-size on
- Rating (Auto-size off)

**Device Types:**
- Relief valve
- Rupture discs

**Standards (2 options):**
1. **API RP 520**
2. **ISO 4126-1**

**Relief Valve Set Pressure Configurations:**
- 10% MAWP (Sole Device)
- 16% MAWP (Multiple Device)
- 21% MAWP (Fire)

**Database:**
- Default database for several Relief Valve vendors
- Default Kd (Discharge coefficient) values for Rupture disc types:
  - Sharp edge
  - Bellmouth
  - In-projecting
  - API
  - Liquid

**Heat loss/gain:** Can be modeled

### Junctions – Heat Exchangers
**Types:**
- **Shell and Tube (S&T)** Heat Exchangers
- **Plate and Frame (P&F)** Heat Exchangers

**Pressure Drop Models (3 options):**
1. Using tube (S&T) or plate (P&F) details
2. Polynomial expression using vendor pressure drop data
3. Fixed value

**Additional Elements:**
- **Knockout pot element:** For vaporization/phase separation
- **Jacketed vessel element:** For temperature increase modeling

**Heat loss/gain:** Can be modeled

---

## System Calculation Features

**Simple Systems:** Yes

**Advanced Fluid Networks:** Yes

**Flash / Phase Change Calculations:** Yes

**Phase Change Separation Calculations:** Yes (for Liquid-Vapor Mixtures)

**Transient Analysis:** Coming soon

**Customizable Calculations:** Yes
- Via Scripting Module (for "Light" Dynamic Analysis)
- Multi Calc functionality
- Back Calc Input Tool (Reverse Calculation Feature)

---

## Unit of Measurement (UOM)

**Major Unit Sets:**
- SI
- US Basic

**Customization:**
- Option to add preferred unit sets
- Change variable units individually per parameter in Data Palette
- Save as new Environment

---

## Automatic Equipment Sizing

**Auto-Sizing Available For:**
- Pumps (industry standards)
- Safety Relief Devices (industry standards)
- Fans (industry standards)
- Orifice Plates (industry standards)
- Control valves (industry standards)

---

## Calculation Methods & Standards

**Applicable to Factor Method:** Yes

**Applicable to Isometric Method:** Yes

---

## Calculation Results & Reporting

**Report Formats:**
- Configurable MS Excel results table
- Bill of Materials summary report
- Reports in English, French, and Spanish

**Calculation Alerts:** **Up to 118 calculation design alerts, warnings, and hints**

**Configurable Warning Criteria:**
- Liquid velocity limits (Minimum and Maximum)
- Vapor velocity limits (Minimum and Maximum)
- Two-phase velocity limits (Minimum and Maximum)
- Control valve opening (Minimum and Maximum)

**Troubleshooting:** FluidFlow's Help Section includes modeling hints and tips

---

## Data Management

**Features:**
- JSON format support for database editors
- **FlowDesigner compatibility** for file exports
- PCF enhancements for pipe diameter and length properties
- Improved Hydrogen by including NIST Density Estimation (version 3.53)

---

## UI & Navigation (Recent Enhancements)

**Toolbar:**
- Split flowsheet toolbar into Flowsheet Tools and Flowsheet Settings
- Separate dockable Input Editor window from Data Palette

**Enhanced Features:**
- Enhanced filter capabilities for Messages and Results lists
- Improved graphic objects with additional customization options

---

## Scenario Management

**Current:** None. Users need to save an additional file to create a new case/scenario.

**V3.52:** Includes Multi-Calc functionality

---

## Support & Resources

**Sales:** sales@fluidflowinfo.com

**Support Phone:** +1 888 711 3051

**Trial Support:** Live support during trial via chat and email

**Documentation:**
- Library of 'Quality Assurance' test models included
- Help Section with modeling hints and tips

---

## Key Technical Specifications Summary

### Database Counts
- **1,283 fluids** in comprehensive database
- **14 pipe material types** in standard database
- **5 custom fluid types** user-definable
- **16 pulp type options** for TAPPI Method
- **11+ solid materials** for slurry applications

### Correlation Counts
- **4 liquid pressure drop models**
- **3 equations of state** (Peng-Robinson, Lee-Kesler, BWRHS)
- **8 two-phase correlations**
- **4 rheology models** (non-Newtonian)
- **8 settling slurry friction correlations**
- **4 fitting resistance methods** (Idelchik, Miller, Crane, SAE)
- **5 pump performance adjustment methods** (slurry)
- **3 deposition velocity methods**
- **2 relief valve standards** (API RP 520, ISO 4126-1)

### Standard References
- **API RP 520** – Relief device sizing
- **ISO 4126-1** – Relief device sizing
- **ISO 5167** – Orifice and nozzle equations
- **ANSI 2021 Monosize** – Slurry pump performance
- **HI Guidelines** – Hydraulic Institute pump guidelines
- **TAPPI Method** – Pulp & Paper stock
- **SAE** – Automotive/aerospace fitting resistance

### Alert Count
- **118 calculation design alerts, warnings, and hints**

---

**End of Specification Sheet Extract**
