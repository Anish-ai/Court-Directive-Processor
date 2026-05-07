<div align="center">

# ⚖️ CDP — Court Directive Processor

**From Court Judgments to Verified Action Plans**

An AI-assisted judicial decision support system that reads court judgment PDFs, extracts critical legal directives through a multi-agent pipeline, generates party-specific action plans, and delivers only human-verified records to a trusted administrative dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)
[![Gemini](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?logo=google)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Multi-Agent Architecture](#-multi-agent-architecture)
- [RAG Legal Chatbot](#-rag-legal-chatbot)
- [Core Workflow](#-core-workflow)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Evaluation Criteria Mapping](#-evaluation-criteria-mapping)

---

## 🔍 Problem Statement

> **Theme 11 — Centre for e-Governance, Government of Maharashtra**

The Court Case Monitoring System (CCMS) receives court judgments from the High Court's CIS in PDF format. These judgments contain critical directives requiring timely administrative action — but:

| Challenge | Impact |
|---|---|
| Judgments are lengthy, unstructured PDF text | Officials must manually read entire documents |
| No directive highlighting or structuring | Critical actions are easily missed |
| No systematic deadline tracking | Compliance timelines are overlooked |
| No party-specific action breakdown | Unclear who must do what |
| No verification before action | Risk of acting on incorrect AI interpretations |

**Result:** Delays, inefficiencies, missed directives, and potential contempt proceedings.

---

## 💡 Solution Overview

CDP is **not** a fully automated system — it is an **AI-assisted decision support tool** that augments human judgment with intelligent extraction and analysis.

```
📄 PDF Upload → 🤖 7-Agent AI Pipeline → 👤 Human Review → 📊 Verified Dashboard
```

### Key Design Principles

| Principle | Implementation |
|---|---|
| **AI-Assisted, Not AI-Automated** | Every record is reviewed and approved by a human before it enters the dashboard |
| **Explainable Outputs** | All extracted fields include confidence scores, source references, and legal reasoning |
| **Party-Specific Intelligence** | Separate action plans for petitioner and respondent with distinct obligations |
| **Multi-Agent Decomposition** | 7 specialized agents instead of a single monolithic LLM call — each with a focused role |
| **Source-Grounded Chatbot** | RAG-powered assistant that answers questions with citations from the actual judgment |

---

## 🤖 Multi-Agent Architecture

The monolithic single-prompt approach is replaced by a **pipeline of 7 specialized AI agents**, each with a precise role, dedicated prompt, and structured JSON schema.

```
                          ┌──────────────────────────────────┐
                          │   📄 PDF Upload                  │
                          └──────────┬───────────────────────┘
                                     │
                          ┌──────────▼───────────────────────┐
                          │ Agent 1: Ingestion Agent          │
                          │ (Code-only — pdf-parse, no LLM)  │
                          │ Output: full_text, page_map       │
                          └──────────┬───────────────────────┘
                                     │
                          ┌──────────▼───────────────────────┐
                          │ Agent 2: Extraction Agent         │
                          │ (LLM — Case details, parties,    │
                          │  directions, statutes, outcome)   │
                          └──────────┬───────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │            PARALLEL              │
          ┌────────▼─────────┐             ┌─────────▼────────┐
          │ Agent 3: Legal    │             │ Agent 4: Timeline │
          │ Analyst           │             │ Agent              │
          │ (Obligations,     │             │ (Explicit +        │
          │  appeal analysis, │             │  inferred          │
          │  compliance risk) │             │  deadlines)        │
          └────────┬─────────┘             └─────────┬────────┘
                   │                                  │
                   └────────────────┬─────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │            PARALLEL            │
          ┌────────▼─────────┐           ┌─────────▼──────────┐
          │ Agent 5:          │           │ Agent 6:            │
          │ Petitioner        │           │ Respondent          │
          │ Action Agent      │           │ Action Agent        │
          │ (Enforcement,     │           │ (Compliance,        │
          │  monitoring,      │           │  appeal, financial, │
          │  protective)      │           │  departmental)      │
          └────────┬─────────┘           └─────────┬──────────┘
                   │                                │
                   └────────────────┬───────────────┘
                                    │
                          ┌─────────▼────────────────────────┐
                          │ Agent 7: Synthesis Agent          │
                          │ (Cross-validate, deduplicate,     │
                          │  calibrate confidence, unify)     │
                          └──────────┬───────────────────────┘
                                     │
                          ┌──────────▼───────────────────────┐
                          │   👤 Human Review Console         │
                          └──────────┬───────────────────────┘
                                     │
                          ┌──────────▼───────────────────────┐
                          │   📊 Verified Dashboard           │
                          └──────────────────────────────────┘
```

### Agent Details

| # | Agent | Type | Role | Key Output |
|---|---|---|---|---|
| 1 | **Ingestion Agent** | Code-only | PDF → text with page mapping | `full_text`, `page_map`, `page_count` |
| 2 | **Extraction Agent** | LLM | Deep structural extraction | Case details, parties (with types & advocates), directions, cited statutes, relief, outcome |
| 3 | **Legal Analyst Agent** | LLM | Legal reasoning & obligation mapping | Obligations, appeal analysis (forum, grounds, limitation), compliance risks, legal summary |
| 4 | **Timeline Agent** | LLM | Deadline extraction & inference | Explicit + inferred deadlines, urgency classification, days remaining |
| 5 | **Petitioner Action Agent** | LLM | Petitioner-specific action planning | Enforcement, monitoring, protective actions with deadlines and effort estimates |
| 6 | **Respondent Action Agent** | LLM | Respondent-specific action planning | Compliance, appeal, financial, departmental coordination actions with risk assessments |
| 7 | **Synthesis Agent** | LLM | Cross-validation & unification | Deduplicated actions, calibrated confidence, validation notes, overall confidence score |

**Performance optimization:** Agents 3+4 run in parallel, and Agents 5+6 run in parallel — reducing total pipeline time by ~40%.

---

## 💬 RAG Legal Chatbot

CDP includes a built-in **Retrieval-Augmented Generation (RAG) chatbot** available on the Review and Case Detail pages.

### Capabilities

- **Natural language queries** — Ask plain-language questions about the judgment
- **Source-grounded responses** — Every answer cites the specific page and paragraph from the original judgment
- **Intent-based routing** — Automatically routes questions about directions, deadlines, appeals, consequences, departments
- **Suggested questions** — Pre-built prompts for common queries
- **Context-aware** — Uses the full pipeline output (extraction, legal analysis, timeline, actions) as its knowledge base

### Example Interactions

| User Question | Chatbot Behavior |
|---|---|
| *"What are the key directions?"* | Lists all extracted directions with IDs and source references |
| *"What is the deadline for compliance?"* | Shows critical deadlines with days remaining |
| *"Should we file an appeal?"* | Presents appeal analysis with forum, grounds, and limitation period |
| *"What happens if the deadline is missed?"* | Shows compliance risks and consequences |
| *"Which departments need to be notified?"* | Lists all responsible departments from action plans |

---

## 🔄 Core Workflow

### 1. Extract (Understand the Judgment)

From the uploaded PDF, the pipeline extracts:
- **Case details** — number, type, court, bench, judge, filing statute
- **Parties** — petitioner & respondent with type classification and advocate names
- **Key directions** — exact quotes with mandatory/optional classification and confidence scores
- **Cited statutes** — referenced laws with context
- **Case outcome** — allowed, dismissed, partially allowed, remanded, etc.
- **Relief granted** — summary of court-granted relief

### 2. Analyse (Legal Intelligence)

The Legal Analyst and Timeline agents provide:
- **Obligation mapping** — who is obligated to do what, linked to specific directions
- **Appeal viability** — is it appealable, to which forum, on what grounds, limitation period
- **Compliance risk assessment** — severity and consequences of non-compliance
- **Timeline construction** — explicit dates + inferred statutory deadlines with urgency levels

### 3. Generate (Party-Specific Action Plans)

Separate action plans for each party:

**Petitioner Actions:**
- Enforcement of favorable directions
- Monitoring respondent compliance
- Protective/precautionary measures
- Filing execution petitions if needed

**Respondent Actions:**
- Compliance with court orders
- Appeal evaluation and filing
- Financial obligations (compensation, costs)
- Departmental coordination and notification

### 4. Verify (Human-in-the-Loop — Mandatory)

Before any data enters the dashboard:
- Side-by-side view: PDF source panel + extracted data
- Confidence scores on every field and action item
- Editable fields — reviewer can correct any extraction
- **Approve** / **Reject** controls
- Cross-validation notes from the Synthesis Agent
- RAG chatbot available for clarification

### 5. Dashboard (Trusted View Only)

Only approved records appear:
- Case cards with appeal recommendation badges
- Critical deadline countdowns
- Overall confidence scores
- Department-wise action breakdown
- Party-split action detail view
- Full case dossier with legal summary

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework with API routes |
| **Language** | TypeScript 5 | Type-safe development |
| **AI/LLM** | Google Gemini 2.5 Flash | Multi-agent prompt execution with JSON mode |
| **PDF Processing** | pdf-parse 2.x | PDF text extraction with page-level mapping |
| **Styling** | Tailwind CSS 4 | Utility-first CSS with dark mode support |
| **Icons** | Lucide React | Consistent icon system |
| **State Management** | React Context API | Client-side pipeline state |
| **Storage** | localStorage | Verified case registry (demo) |
| **Unique IDs** | uuid v14 | Case record identification |

---

## 📂 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── process/          # 🔧 Orchestrator — runs the full 7-agent pipeline
│   │   │   └── route.ts
│   │   ├── extract/           # (Legacy) Single extraction route
│   │   │   └── route.ts
│   │   └── generateAction/    # (Legacy) Single action generation route
│   │       └── route.ts
│   ├── case/
│   │   └── [id]/
│   │       └── page.tsx       # 📋 Case detail view with party-split actions
│   ├── review/
│   │   └── page.tsx           # 👤 Human verification console
│   ├── upload/
│   │   └── page.tsx           # 📄 PDF upload & pipeline trigger
│   ├── layout.tsx             # 🎨 Root layout with header & theme
│   ├── page.tsx               # 📊 Dashboard — verified case registry
│   └── providers.tsx          # 🔌 React Context for pipeline state
├── components/
│   ├── ActionCard.tsx         # Action item card with confidence & risk
│   ├── ExtractionPanel.tsx    # Editable extraction fields
│   ├── LegalChatbot.tsx       # 💬 RAG-powered legal assistant
│   ├── PDFViewer.tsx          # PDF source panel
│   ├── ProcessingPipeline.tsx # 7-stage pipeline progress visualizer
│   ├── ThemeProvider.tsx      # Dark/light mode provider
│   └── ThemeToggle.tsx        # Theme switch button
└── lib/
    └── agents/
        ├── llm.ts             # 🔗 Shared LLM utility (retry + model fallback)
        ├── ingestion.ts       # Agent 1 — PDF text extraction
        ├── extraction.ts      # Agent 2 — Structural extraction
        ├── legal-analyst.ts   # Agent 3 — Legal analysis
        ├── timeline.ts        # Agent 4 — Timeline mapping
        ├── petitioner.ts      # Agent 5 — Petitioner actions
        ├── respondent.ts      # Agent 6 — Respondent actions
        └── synthesis.ts       # Agent 7 — Cross-validation & synthesis
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or 22.x
- **npm** 9+
- A **Google Gemini API key** ([Get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Court-Directive-Processor

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and add your Gemini API key
```

### Running Locally

```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY="your-google-gemini-api-key-here"
```

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key for LLM agents |

---

## 📡 API Reference

### `POST /api/process`

The primary orchestrator endpoint. Accepts a PDF file, runs the full 7-agent pipeline, and returns all agent outputs.

**Request:**
```
Content-Type: multipart/form-data
Body: file (PDF)
```

**Response:**
```json
{
  "extraction": { ... },        // Agent 2 output
  "legalAnalysis": { ... },     // Agent 3 output
  "timeline": { ... },          // Agent 4 output
  "petitionerActions": { ... }, // Agent 5 output
  "respondentActions": { ... }, // Agent 6 output
  "synthesis": { ... }          // Agent 7 output (final unified plan)
}
```

**Pipeline Execution Order:**
```
Agent 1 (Ingestion) → Agent 2 (Extraction) → [Agent 3 ∥ Agent 4] → [Agent 5 ∥ Agent 6] → Agent 7 (Synthesis)
```

### Resilience Features

The shared LLM utility (`src/lib/agents/llm.ts`) includes:

- **Exponential backoff** — 3 retries per model with increasing delays
- **Model fallback chain** — `gemini-2.5-flash` → `gemini-2.0-flash-lite` → `gemini-1.5-flash`
- **Smart error classification** — retries on 503/429 (transient), skips on 404 (deprecated model)

---

## ✅ Evaluation Criteria Mapping

| Criteria | How CDP Addresses It |
|---|---|
| **Accuracy of extraction** | 7-agent pipeline with dedicated Extraction Agent, confidence scores on every field, cited statute extraction, case outcome classification |
| **Quality of action plan generation** | Separate petitioner/respondent action agents, obligation-linked actions, appeal analysis with legal grounds, timeline-aware deadlines with urgency |
| **Effectiveness of human verification** | Side-by-side PDF + extracted data view, editable fields, approve/reject controls, confidence indicators, cross-validation notes from Synthesis Agent |
| **Clarity and usability of dashboard** | Appeal recommendation badges, critical deadline countdowns, department-wise breakdown, party-split action view, overall confidence scores |

### Constraints Addressed

| Constraint | Solution |
|---|---|
| Must handle complex, inconsistent legal PDFs | pdf-parse v2 with page-level extraction; agents handle missing/null fields gracefully |
| Outputs must be explainable and verifiable | Confidence scores, source references, legal reasoning, direction-linked obligations |
| Focus on decision support, not full automation | Mandatory human-in-the-loop verification; zero unverified records in dashboard |

---

## 📄 License

This project is built for the **SIH / e-Governance Hackathon — Theme 11** challenge.

---

<div align="center">
  <strong>Built with ❤️ for Indian Legal & Administrative Modernization</strong>
</div>
