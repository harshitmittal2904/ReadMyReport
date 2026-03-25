// Reference ranges database with age/sex/pregnancy adjustments
// All values in conventional units (mg/dL, g/dL, etc.)
// status thresholds: optimal (tighter), normal (lab range), attention (10-20% out), review (>20% out)

const RANGES = {
  // ── CBC ──
  hemoglobin: {
    unit: 'g/dL',
    male: { low: 13.5, high: 17.5, optimalLow: 14.0, optimalHigh: 16.5 },
    female: { low: 12.0, high: 16.0, optimalLow: 12.5, optimalHigh: 15.0 },
    pregnant: { low: 11.0, high: 14.0, optimalLow: 11.5, optimalHigh: 13.5 },
    default: { low: 12.0, high: 17.5, optimalLow: 13.0, optimalHigh: 16.0 },
  },
  rbc: {
    unit: 'million/µL',
    male: { low: 4.7, high: 6.1, optimalLow: 4.8, optimalHigh: 5.8 },
    female: { low: 4.2, high: 5.4, optimalLow: 4.3, optimalHigh: 5.1 },
    default: { low: 4.2, high: 6.1, optimalLow: 4.5, optimalHigh: 5.5 },
  },
  wbc: {
    unit: '×10³/µL',
    default: { low: 4.5, high: 11.0, optimalLow: 5.0, optimalHigh: 10.0 },
  },
  platelets: {
    unit: '×10³/µL',
    default: { low: 150, high: 400, optimalLow: 160, optimalHigh: 380 },
  },
  mcv: {
    unit: 'fL',
    default: { low: 80, high: 100, optimalLow: 82, optimalHigh: 98 },
  },
  mch: {
    unit: 'pg',
    default: { low: 27, high: 33, optimalLow: 28, optimalHigh: 32 },
  },
  mchc: {
    unit: 'g/dL',
    default: { low: 32, high: 36, optimalLow: 33, optimalHigh: 35 },
  },
  rdw: {
    unit: '%',
    default: { low: 11.5, high: 14.5, optimalLow: 12.0, optimalHigh: 14.0 },
  },
  esr: {
    unit: 'mm/hr',
    male: { low: 0, high: 15, optimalLow: 0, optimalHigh: 10 },
    female: { low: 0, high: 20, optimalLow: 0, optimalHigh: 15 },
    default: { low: 0, high: 20, optimalLow: 0, optimalHigh: 15 },
  },
  // ── Lipid Panel ──
  cholesterol_total: {
    unit: 'mg/dL',
    default: { low: 0, high: 200, optimalLow: 0, optimalHigh: 180 },
  },
  ldl: {
    unit: 'mg/dL',
    default: { low: 0, high: 100, optimalLow: 0, optimalHigh: 70 },
  },
  hdl: {
    unit: 'mg/dL',
    male: { low: 40, high: 100, optimalLow: 50, optimalHigh: 90 },
    female: { low: 50, high: 100, optimalLow: 55, optimalHigh: 90 },
    default: { low: 40, high: 100, optimalLow: 50, optimalHigh: 90 },
  },
  vldl: {
    unit: 'mg/dL',
    default: { low: 2, high: 30, optimalLow: 5, optimalHigh: 25 },
  },
  triglycerides: {
    unit: 'mg/dL',
    default: { low: 0, high: 150, optimalLow: 0, optimalHigh: 100 },
  },
  // ── Liver ──
  alt: {
    unit: 'U/L',
    male: { low: 7, high: 56, optimalLow: 10, optimalHigh: 40 },
    female: { low: 7, high: 45, optimalLow: 10, optimalHigh: 35 },
    default: { low: 7, high: 56, optimalLow: 10, optimalHigh: 40 },
  },
  ast: {
    unit: 'U/L',
    male: { low: 10, high: 40, optimalLow: 12, optimalHigh: 35 },
    female: { low: 9, high: 32, optimalLow: 10, optimalHigh: 28 },
    default: { low: 9, high: 40, optimalLow: 10, optimalHigh: 35 },
  },
  alp: {
    unit: 'U/L',
    default: { low: 44, high: 147, optimalLow: 50, optimalHigh: 130 },
  },
  ggt: {
    unit: 'U/L',
    male: { low: 0, high: 65, optimalLow: 5, optimalHigh: 50 },
    female: { low: 0, high: 45, optimalLow: 5, optimalHigh: 35 },
    default: { low: 0, high: 65, optimalLow: 5, optimalHigh: 50 },
  },
  bilirubin_total: {
    unit: 'mg/dL',
    default: { low: 0.1, high: 1.2, optimalLow: 0.2, optimalHigh: 1.0 },
  },
  bilirubin_direct: {
    unit: 'mg/dL',
    default: { low: 0, high: 0.3, optimalLow: 0, optimalHigh: 0.25 },
  },
  albumin: {
    unit: 'g/dL',
    default: { low: 3.5, high: 5.5, optimalLow: 4.0, optimalHigh: 5.0 },
  },
  total_protein: {
    unit: 'g/dL',
    default: { low: 6.0, high: 8.3, optimalLow: 6.5, optimalHigh: 8.0 },
  },
  // ── Kidney ──
  creatinine: {
    unit: 'mg/dL',
    male: { low: 0.7, high: 1.3, optimalLow: 0.8, optimalHigh: 1.2 },
    female: { low: 0.6, high: 1.1, optimalLow: 0.6, optimalHigh: 1.0 },
    default: { low: 0.6, high: 1.3, optimalLow: 0.7, optimalHigh: 1.2 },
  },
  bun: {
    unit: 'mg/dL',
    default: { low: 7, high: 20, optimalLow: 8, optimalHigh: 18 },
  },
  egfr: {
    unit: 'mL/min/1.73m²',
    default: { low: 90, high: 200, optimalLow: 100, optimalHigh: 200 },
  },
  uric_acid: {
    unit: 'mg/dL',
    male: { low: 3.4, high: 7.0, optimalLow: 3.5, optimalHigh: 6.5 },
    female: { low: 2.4, high: 6.0, optimalLow: 2.5, optimalHigh: 5.5 },
    default: { low: 2.4, high: 7.0, optimalLow: 3.0, optimalHigh: 6.5 },
  },
  sodium: {
    unit: 'mEq/L',
    default: { low: 136, high: 145, optimalLow: 137, optimalHigh: 144 },
  },
  potassium: {
    unit: 'mEq/L',
    default: { low: 3.5, high: 5.0, optimalLow: 3.8, optimalHigh: 4.8 },
  },
  chloride: {
    unit: 'mEq/L',
    default: { low: 96, high: 106, optimalLow: 98, optimalHigh: 104 },
  },
  bicarbonate: {
    unit: 'mEq/L',
    default: { low: 22, high: 29, optimalLow: 23, optimalHigh: 28 },
  },
  // ── Thyroid ──
  tsh: {
    unit: 'mIU/L',
    default: { low: 0.4, high: 4.0, optimalLow: 0.5, optimalHigh: 2.5 },
    elderly: { low: 0.4, high: 7.0, optimalLow: 0.5, optimalHigh: 5.0 },
    pregnant: { low: 0.1, high: 2.5, optimalLow: 0.2, optimalHigh: 2.0 },
  },
  t3: {
    unit: 'ng/dL',
    default: { low: 80, high: 200, optimalLow: 90, optimalHigh: 180 },
  },
  t4: {
    unit: 'µg/dL',
    default: { low: 5.1, high: 14.1, optimalLow: 6.0, optimalHigh: 12.0 },
  },
  free_t3: {
    unit: 'pg/mL',
    default: { low: 2.0, high: 4.4, optimalLow: 2.5, optimalHigh: 4.0 },
  },
  free_t4: {
    unit: 'ng/dL',
    default: { low: 0.82, high: 1.77, optimalLow: 0.9, optimalHigh: 1.5 },
  },
  // ── Pancreas & Metabolism ──
  fasting_glucose: {
    unit: 'mg/dL',
    default: { low: 70, high: 100, optimalLow: 72, optimalHigh: 90 },
  },
  hba1c: {
    unit: '%',
    default: { low: 4.0, high: 5.7, optimalLow: 4.2, optimalHigh: 5.4 },
  },
  fasting_insulin: {
    unit: 'µIU/mL',
    default: { low: 2.6, high: 24.9, optimalLow: 3.0, optimalHigh: 15.0 },
  },
  amylase: {
    unit: 'U/L',
    default: { low: 28, high: 100, optimalLow: 30, optimalHigh: 90 },
  },
  lipase: {
    unit: 'U/L',
    default: { low: 0, high: 160, optimalLow: 10, optimalHigh: 140 },
  },
  // ── Vitamins & Minerals ──
  vitamin_d: {
    unit: 'ng/mL',
    default: { low: 30, high: 100, optimalLow: 40, optimalHigh: 80 },
  },
  vitamin_b12: {
    unit: 'pg/mL',
    default: { low: 200, high: 900, optimalLow: 400, optimalHigh: 800 },
  },
  folate: {
    unit: 'ng/mL',
    default: { low: 2.7, high: 17.0, optimalLow: 5.0, optimalHigh: 15.0 },
  },
  iron: {
    unit: 'µg/dL',
    male: { low: 65, high: 175, optimalLow: 70, optimalHigh: 160 },
    female: { low: 50, high: 170, optimalLow: 60, optimalHigh: 150 },
    default: { low: 50, high: 175, optimalLow: 60, optimalHigh: 160 },
  },
  ferritin: {
    unit: 'ng/mL',
    male: { low: 12, high: 300, optimalLow: 30, optimalHigh: 200 },
    female: { low: 10, high: 150, optimalLow: 30, optimalHigh: 120 },
    default: { low: 10, high: 300, optimalLow: 30, optimalHigh: 150 },
  },
  tibc: {
    unit: 'µg/dL',
    default: { low: 250, high: 370, optimalLow: 260, optimalHigh: 360 },
  },
  calcium: {
    unit: 'mg/dL',
    default: { low: 8.5, high: 10.5, optimalLow: 9.0, optimalHigh: 10.2 },
  },
  phosphorus: {
    unit: 'mg/dL',
    default: { low: 2.5, high: 4.5, optimalLow: 2.8, optimalHigh: 4.2 },
  },
  magnesium: {
    unit: 'mg/dL',
    default: { low: 1.7, high: 2.2, optimalLow: 1.8, optimalHigh: 2.1 },
  },
  // ── Hormones ──
  testosterone: {
    unit: 'ng/dL',
    male: { low: 300, high: 1000, optimalLow: 400, optimalHigh: 800 },
    female: { low: 15, high: 70, optimalLow: 20, optimalHigh: 60 },
    default: { low: 15, high: 1000, optimalLow: 20, optimalHigh: 800 },
  },
  cortisol: {
    unit: 'µg/dL',
    default: { low: 6.2, high: 19.4, optimalLow: 7, optimalHigh: 16 },
  },
  // ── Inflammatory ──
  crp: {
    unit: 'mg/L',
    default: { low: 0, high: 3.0, optimalLow: 0, optimalHigh: 1.0 },
  },
  homocysteine: {
    unit: 'µmol/L',
    default: { low: 5, high: 15, optimalLow: 6, optimalHigh: 12 },
  },
};

export function getRange(paramKey, { sex, age, pregnant } = {}) {
  const param = RANGES[paramKey];
  if (!param) return null;

  let rangeSet;
  if (pregnant && param.pregnant) rangeSet = param.pregnant;
  else if (age > 65 && param.elderly) rangeSet = param.elderly;
  else if (sex === 'male' && param.male) rangeSet = param.male;
  else if (sex === 'female' && param.female) rangeSet = param.female;
  else rangeSet = param.default;

  return { ...rangeSet, unit: param.unit };
}

export function classifyStatus(value, paramKey, context = {}) {
  const range = getRange(paramKey, context);
  if (!range) return 'normal';

  const v = parseFloat(value);
  if (isNaN(v)) return 'normal';

  // Check optimal range first
  if (v >= range.optimalLow && v <= range.optimalHigh) return 'excellent';
  // Then standard range
  if (v >= range.low && v <= range.high) return 'normal';
  // Check mild deviation (within 10-20% outside)
  const rangeSpan = range.high - range.low;
  const deviation = v < range.low ? (range.low - v) : (v - range.high);
  const percentDeviation = (deviation / rangeSpan) * 100;
  if (percentDeviation <= 20) return 'needs_attention';
  return 'review_recommended';
}

export function getAllRangeKeys() {
  return Object.keys(RANGES);
}

export function getRangeUnit(paramKey) {
  return RANGES[paramKey]?.unit || '';
}

export default RANGES;
