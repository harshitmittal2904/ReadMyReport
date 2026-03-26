# LabDecode — Your Lab Reports, Finally Understood

AI-powered lab report analyzer that translates complex medical reports into plain, understandable language. Upload any blood test, metabolic panel, or lab report — get instant, categorized insights organized by body system.

**Live:** [read-my-report.vercel.app](https://read-my-report.vercel.app)

## Features

- Upload PDF or capture with camera
- AI-powered analysis using Gemini 2.5 Flash
- Results grouped by organ system (Heart, Liver, Kidneys, Blood, Thyroid, etc.)
- Color-coded status: Excellent / Normal / Needs Attention / Review Recommended
- Visual range bars for every parameter
- Evidence-based lifestyle suggestions with medical source citations
- Works with lab reports from any country (auto-detects units)
- Unit conversion between Conventional (US) and SI (International)
- Multi-report comparison with trend charts
- Offline searchable glossary of 100+ health metrics
- Dark mode, large text, high contrast, and simple mode
- Multi-language support (English, Hindi, Spanish)
- No data stored on servers — privacy first

## Tech Stack

React 19 &bull; Tailwind CSS v4 &bull; Gemini API &bull; Vercel Serverless Functions &bull; PDF.js &bull; Recharts &bull; i18next

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Set the following in your Vercel project settings (or `.env.local` for development):

```
GEMINI_API_KEY=your_gemini_api_key
```

## Architecture

```
src/
  pages/          Landing, Upload, Analyzing, Dashboard, Lifestyle, History, Compare, Glossary, Settings
  components/     Header, Footer, CameraCapture, ParameterDetail, RangeBar, OrganSystemCard, etc.
  services/       claudeService.js (API), pdfService.js (PDF extraction)
  contexts/       ThemeContext (dark mode, accessibility)
  utils/          storage, unitConversion, referenceRanges, imageCompression
  data/           glossaryData (100+ medical terms)
  locales/        en.json, hi.json, es.json
api/
  analyze.js      Vercel serverless proxy to Gemini API
```

## Disclaimer

LabDecode is an educational health literacy tool. It does not diagnose, prescribe, or replace professional medical advice.

Built by [Harshit Mittal](https://linkedin.com/in/harshitmittal2904)
