---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 30440220201c953de8ad1bafc50c2baa30f1d9c28643a4a4bf2c19c95e2eac168a24831d0220433a57ba020d439005504f5255bbf9d63ead2528b3d2d1b261eb68d3207e0592
    ReservedCode2: 304502206e18375d805f999f97547d3199363fd027443b1c3f6abe5d289332775e1b690a022100f0437979ff8028d045cdbd4d1cd69f1fc58b85ba463ce1d1fdd9df6576dac21b
---

# Design Specification - MathFlow AI

**Style Base:** Swiss Design (International Typographic Style)
**Philosophy:** "Rationality, Precision, Clarity." The interface acts as a transparent layer between the user and the logic.

## 1. Direction & Rationale
The design treats mathematical derivation as a structured narrative. We utilize a strong **grid system** and **asymmetric balance** to organize complex proofs. The aesthetic is strictly "Academic Professional"—avoiding gamification elements in favor of tools that feel powerful and precise.
- **Reference:** Notion (cleanliness), Linear (interaction density), Overleaf (utility).
- **Core Visual Metaphor:** "The Infinite Graph Paper."

## 2. Design Tokens

### Colors (System)
We use a high-contrast monochromatic base with semantic colors for mathematical logic.

| Role | Token | Light Value | Dark Value | Usage |
|------|-------|-------------|------------|-------|
| **Surface** | `bg-canvas` | `#FAFAFA` (Off-white) | `#0D0D0D` (Deep Carbon) | Main background |
| **Surface** | `bg-card` | `#FFFFFF` | `#171717` | Step cards, panels |
| **Text** | `text-primary` | `#111111` | `#EDEDED` | Formulas, primary UI |
| **Text** | `text-secondary` | `#666666` | `#A1A1A1` | Metadata, hints |
| **Brand** | `accent-math` | `#0055FF` (Klein Blue) | `#3B82F6` (Electric Blue) | Cursors, primary actions, selections |
| **Semantic** | `state-error` | `#DC2626` | `#EF4444` | Logic errors, invalid syntax |
| **Semantic** | `state-success` | `#059669` | `#10B981` | Verified steps |
| **Semantic** | `state-ai` | `#7C3AED` (Violet) | `#8B5CF6` | AI suggestions/ghost text |

### Typography
- **UI Font:** Inter or Helvetica Now (The essence of Swiss Style).
- **Math Font:** KaTeX Main (Times New Roman style serif) for all equations.
- **Code:** JetBrains Mono (for raw LaTeX editing).
- **Scale:** Major Third (1.25).
  - H1: 24px/32px (Bold) - File Titles
  - Body: 14px/20px (Regular) - UI Elements
  - Math Base: 18px (Scalable) - Readability focus

### Spacing & Layout (4pt Grid)
- **Compact Density:** Used for toolbars and lists (4px, 8px).
- **Comfort Density:** Used for derivation steps to separate logic (16px, 24px, 32px).
- **Radius:** Small (4px) or Medium (8px). No "Pill" shapes. Keep it crisp.

## 3. Components

### 3.1 The Derivation Step (Card)
The atomic unit of the interface.
- **Structure:** Vertical stack.
  1. **Operation Header:** Small pill badge showing the action applied (e.g., "Integrate by Parts").
  2. **Math Content:** The rendered formula. Centered or Left-aligned (configurable).
  3. **Action Gutter:** Hover-reveal buttons on the right (Edit, Delete, Ask AI).
- **Interaction:**
  - **Hover:** Highlights the "change" from the previous step (diff highlight).
  - **Click:** Enters "Focus Mode" for editing.
- **Tokens:** `bg-card`, `border-neutral-200`, `shadow-sm`.

### 3.2 The Math Input (Omni-Bar)
A hybrid command palette and text input, pinned to the bottom of the center column.
- **Visuals:** Floating panel, `shadow-lg`, `radius-8`.
- **Functionality:**
  - Typing raw LaTeX renders a real-time preview above.
  - Typing `/` triggers the **Operation Command Menu** (e.g., `/factor`, `/solve`).
  - "Ask AI" button integrated into the right side.

### 3.3 The Operator Toolkit (Right Panel)
- **Structure:** Accordion or Tabbed list of mathematical operations.
- **Visuals:** Dense list items. `text-secondary`, hover `bg-neutral-100`.
- **Categorization:** "Algebra", "Calculus", "Linear Algebra".
- **Drag & Drop:** Users can drag an operation onto a specific term in the formula.

### 3.4 AI Assistant Panel
- **Style:** Distinct from the main UI to signify "Dialogue" vs "Work".
- **Background:** Subtle tint (`bg-neutral-50` / `bg-neutral-900`).
- **Messages:**
  - **User:** Simple text bubble.
  - **AI:** Markdown supported, capable of rendering mini-formulas.
  - **Reference:** AI can quote specific steps (e.g., "In [Step 3], you missed a negative sign").

## 4. Layout & Responsive Patterns

### Desktop (Workbench)
- **Grid:** 12-column fluid grid.
- **Left Sidebar (2 col):** Navigation & Files. Collapsible.
- **Center Stage (7 col):** The derivation scroll. Max-width 800px for readability.
- **Right Sidebar (3 col):** Tools & AI. Collapsible.

### Mobile
- **Stacking:** Single column.
- **Navigation:** Bottom Tab Bar (Home, Editor, Tools, Profile).
- **Input:** Keyboard accessory bar for common math symbols (∫, ∂, ∑, π).
- **Panels:** Tools and AI slide up as Bottom Sheets (Modals).

## 5. Interaction & Animation
- **Performance:** `transform` based animations only.
- **Math Transitions:** When a step changes, use FLIP animation to smoothly move terms to their new positions (if library permits) or a subtle cross-fade.
- **Focus:** Active input field has a `ring-2 ring-accent-math`.
- **Loading:** Skeleton screens for AI responses. No spinners for math rendering (must be instant).
- **Shortcuts:**
  - `Shift + Enter`: New Step.
  - `Ctrl/Cmd + K`: Command Palette.
  - `Ctrl/Cmd + Z`: Undo.
