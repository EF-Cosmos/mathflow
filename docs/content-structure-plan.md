---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 304502200ca42d6693115c8b99c6b2bc5be1920f658285db1ccd662c6f778b2807511ffe022100a3b4ea201fce466095564c859fd450da682abac288897fc4db433be1c3857f3c
    ReservedCode2: 3046022100b99456bb662aba3769ea54bfacfebf43bf7f03138b9a23ad9ebb827c25f10d7a022100ea33df875f90fe0f7dd6629c51a59ba07f3fce05080cbbe2545be96a7d63e332
---

# Content Structure Plan - AI Math Derivation Workbench

## 1. Material Inventory
**Core Functionality:**
- **Derivation Engine:** Interactive step-by-step logic (Manual + AI assisted).
- **Formula Editor:** Hybrid input (LaTeX syntax + Visual block selection).
- **AI Context:** Chat interface aware of the current derivation state.

**Data Structures:**
- `Workspaces`: Collections of derivations.
- `Derivation`: Ordered list of `Steps`.
- `Step`: Input Formula (LaTeX) + Operation Applied + Output Formula + Metadata (Is correct? AI verification).
- `KnowledgeBase`: Pre-defined math templates (Calculus, Linear Algebra).

## 2. Website Structure
**Type:** SPA (Single Page Application)
**Reasoning:** The application behaves like a desktop IDE (e.g., VS Code or Obsidian). State management (undo/redo, history, AI context) is complex and requires a persistent session without page reloads.

## 3. Page/Section Breakdown

### Page 1: The Workbench (Main Interface) (`/app/editor/[id]`)
**Purpose**: The primary workspace for performing mathematical derivations.
**Layout Strategy**: 3-Column IDE Layout (Left Sidebar, Center Canvas, Right Assistant).

**Content Mapping:**

| Section | Component Pattern | Data Source | Content to Extract | Visual Asset (Content) |
|---------|-------------------|-------------|-------------------|------------------------|
| **Left: Context** | File/Context Tree | `data/user_files.json` | Project structure, Variable definitions, Assumptions | - |
| **Top: Toolbar** | Action Bar | `data/operations.json` | Global actions: Undo, Redo, Export, Share, Theme Toggle | `icons/math-symbols.svg` |
| **Center: Canvas** | Infinite Scroll Steps | `state/derivation_flow` | The derivation steps (cards). Each card contains: Formula, Annotation, Status. | Rendered LaTeX (KaTeX) |
| **Bottom: Input** | Math Command Line | `state/input_buffer` | Active LaTeX input, "Next Step" suggestion | - |
| **Right: Toolkit** | Tabbed Panel | `data/tools.json` | **Tabs:**<br>1. **Operations**: (Factor, Expand, Differentiate)<br>2. **AI Chat**: Context-aware assistance<br>3. **History**: Version control | - |

### Page 2: Dashboard (`/dashboard`)
**Purpose**: File management and starting point.
**Layout Strategy**: Grid Card Layout.

| Section | Component Pattern | Data Source | Content to Extract | Visual Asset |
|---------|-------------------|-------------|-------------------|--------------|
| **Header** | Welcome Hero | `user_profile` | Greeting, "New Derivation" CTA | - |
| **Templates** | Card Grid | `data/templates.json` | Quick starts: "Indefinite Integral", "Matrix Inversion", "Limit Proof" | Thumbnail previews |
| **Recent** | List/Table | `data/recents.json` | Last edited files, modification dates | - |

## 4. Content Analysis
**Information Density:** High
- **Reasoning:** Mathematical notation is dense. The UI must accommodate long formulas, superscripts/subscripts, and explanatory text simultaneously.
**Content Balance:**
- **Primary:** Rendered Math (Visual/Symbolic) - 60%
- **Secondary:** Functional UI (Buttons, Tools) - 25%
- **Tertiary:** AI Text/Explanations - 15%
