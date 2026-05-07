# LabDecode — Your Lab Reports, Finally Understood

AI-powered lab report analyzer that translates complex medical reports into plain, understandable language. Upload any blood test, metabolic panel, or lab report — get instant, categorized insights organized by body system.

**Live:** [read-my-report.vercel.app](https://read-my-report.vercel.app)
**Portfolio:** [harshitmittal.dev/projects/labdecode](https://harshitmittal2904.github.io/portfolio/projects/labdecode)

---

## The Problem

Lab reports are written for doctors, not patients. Millions of people receive blood tests, metabolic panels, and health reports they can't understand. Reference ranges vary by age, sex, and country. There's no product that translates medical lab data into plain, actionable language — without overstepping into diagnosis.

## What LabDecode Does

LabDecode reads any medical lab report and translates every parameter into plain, understandable language. Results are grouped by organ system with color-coded status indicators and evidence-based lifestyle suggestions. It does NOT diagnose. It does NOT prescribe. It helps you understand your own health data.

---

## Features

- **Multi-input upload** — PDF, camera capture (mobile), or image upload (JPG, PNG, HEIC) with drag-and-drop
- **AI-powered analysis** — Gemini 2.5 Flash with Groq (Llama 3.3 70B) text-only fallback
- **10 organ system views** — Heart, Liver, Kidneys, Blood, Thyroid, Metabolism, Vitamins, Bones, Hormones, Inflammation
- **4-level status system** — Excellent / Normal / Needs Attention / Review Recommended
- **Visual range bars** — Color-coded bars showing where your value falls within the reference range
- **Evidence-based suggestions** — Lifestyle recommendations citing AHA, WHO, NIH, and peer-reviewed research
- **Unit auto-detection** — Works with reports from any country, toggle between US and SI units
- **Age & sex adjusted ranges** — Optional pre-analysis form adjusts reference ranges
- **Multi-report comparison** — Upload multiple reports over time, track trends with charts
- **Offline searchable glossary** — 100+ health metrics explained in plain language
- **Accessibility** — Dark mode, large text, high contrast, simple mode, read aloud
- **Multi-language** — English, Hindi, Spanish
- **Privacy first** — No data stored on servers, everything stays in your browser

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS v4 |
| AI (Primary) | Gemini 2.5 Flash API (Vision + Text, structured JSON output) |
| AI (Fallback) | Groq API with Llama 3.3 70B |
| PDF Processing | PDF.js |
| Charts | Recharts |
| i18n | i18next |
| Deploy | Vercel Edge Functions |
| Fonts | Sora, DM Sans, JetBrains Mono |

## Architecture

```
src/
  pages/          Landing, Upload, Analyzing, Dashboard, Lifestyle, History, Compare, Glossary, Settings
  components/     Header, Footer, CameraCapture, ParameterDetail, RangeBar, OrganSystemCard, etc.
  services/       claudeService.js (API), pdfService.js (PDF extraction)
  contexts/       ThemeContext (dark mode, accessibility)
  utils/          storage, unitConversion, referenceRanges, imageCompression
  data/           glossaryData (100+ medical terms), sampleReport
  locales/        en.json, hi.json, es.json
api/
  analyze.js      Vercel Edge Function — proxies to Gemini API with Groq fallback
```

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

```
GEMINI_API_KEY=your_gemini_api_key
```

## Safety by Design

- LabDecode is an educational health literacy tool
- It does not diagnose, prescribe, or replace professional medical advice
- Every analysis includes 7 strategically placed disclaimers
- No user data is stored on any server

---

Built by [Harshit Mittal](https://linkedin.com/in/harshitmittal2904)
