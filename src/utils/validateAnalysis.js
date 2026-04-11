import { classifyStatus, getAllRangeKeys } from './referenceRanges';

/**
 * Map of common parameter name variations to referenceRanges.js keys.
 * Keys are lowercase. Values are the canonical key in RANGES.
 */
const NAME_ALIASES = {
  // CBC
  'hemoglobin': 'hemoglobin', 'haemoglobin': 'hemoglobin', 'hb': 'hemoglobin', 'hgb': 'hemoglobin',
  'rbc': 'rbc', 'red blood cells': 'rbc', 'red blood cell count': 'rbc',
  'wbc': 'wbc', 'white blood cells': 'wbc', 'white blood cell count': 'wbc', 'total wbc': 'wbc', 'tlc': 'wbc',
  'platelets': 'platelets', 'platelet count': 'platelets', 'plt': 'platelets',
  'mcv': 'mcv', 'mean corpuscular volume': 'mcv',
  'mch': 'mch', 'mean corpuscular hemoglobin': 'mch', 'mean corpuscular haemoglobin': 'mch',
  'mchc': 'mchc',
  'rdw': 'rdw', 'rdw-cv': 'rdw', 'red cell distribution width': 'rdw',
  'esr': 'esr', 'erythrocyte sedimentation rate': 'esr', 'sed rate': 'esr',
  // Lipid
  'total cholesterol': 'cholesterol_total', 'cholesterol': 'cholesterol_total', 'cholesterol total': 'cholesterol_total', 'tc': 'cholesterol_total',
  'ldl': 'ldl', 'ldl cholesterol': 'ldl', 'ldl-c': 'ldl',
  'hdl': 'hdl', 'hdl cholesterol': 'hdl', 'hdl-c': 'hdl',
  'vldl': 'vldl', 'vldl cholesterol': 'vldl',
  'triglycerides': 'triglycerides', 'tg': 'triglycerides', 'trigs': 'triglycerides',
  // Liver
  'alt': 'alt', 'sgpt': 'alt', 'alanine aminotransferase': 'alt', 'alanine transaminase': 'alt',
  'ast': 'ast', 'sgot': 'ast', 'aspartate aminotransferase': 'ast', 'aspartate transaminase': 'ast',
  'alp': 'alp', 'alkaline phosphatase': 'alp',
  'ggt': 'ggt', 'gamma gt': 'ggt', 'gamma-glutamyl transferase': 'ggt',
  'bilirubin total': 'bilirubin_total', 'total bilirubin': 'bilirubin_total', 'bilirubin': 'bilirubin_total', 't. bilirubin': 'bilirubin_total',
  'bilirubin direct': 'bilirubin_direct', 'direct bilirubin': 'bilirubin_direct', 'd. bilirubin': 'bilirubin_direct',
  'albumin': 'albumin', 'alb': 'albumin',
  'total protein': 'total_protein', 'tp': 'total_protein',
  // Kidney
  'creatinine': 'creatinine', 'serum creatinine': 'creatinine', 'creat': 'creatinine',
  'bun': 'bun', 'blood urea nitrogen': 'bun', 'urea': 'bun',
  'egfr': 'egfr', 'gfr': 'egfr', 'estimated gfr': 'egfr',
  'uric acid': 'uric_acid', 'serum uric acid': 'uric_acid',
  'sodium': 'sodium', 'na': 'sodium', 'na+': 'sodium',
  'potassium': 'potassium', 'k': 'potassium', 'k+': 'potassium',
  'chloride': 'chloride', 'cl': 'chloride', 'cl-': 'chloride',
  'bicarbonate': 'bicarbonate', 'hco3': 'bicarbonate', 'co2': 'bicarbonate',
  // Thyroid
  'tsh': 'tsh', 'thyroid stimulating hormone': 'tsh',
  't3': 't3', 'triiodothyronine': 't3', 'total t3': 't3',
  't4': 't4', 'thyroxine': 't4', 'total t4': 't4',
  'free t3': 'free_t3', 'ft3': 'free_t3',
  'free t4': 'free_t4', 'ft4': 'free_t4',
  // Pancreas & Metabolism
  'fasting glucose': 'fasting_glucose', 'fasting blood sugar': 'fasting_glucose', 'fbs': 'fasting_glucose', 'glucose fasting': 'fasting_glucose', 'blood sugar fasting': 'fasting_glucose',
  'hba1c': 'hba1c', 'glycated hemoglobin': 'hba1c', 'glycosylated hemoglobin': 'hba1c', 'a1c': 'hba1c',
  'fasting insulin': 'fasting_insulin', 'insulin fasting': 'fasting_insulin',
  'amylase': 'amylase', 'serum amylase': 'amylase',
  'lipase': 'lipase', 'serum lipase': 'lipase',
  // Vitamins & Minerals
  'vitamin d': 'vitamin_d', 'vit d': 'vitamin_d', '25-oh vitamin d': 'vitamin_d', '25 hydroxy vitamin d': 'vitamin_d',
  'vitamin b12': 'vitamin_b12', 'vit b12': 'vitamin_b12', 'b12': 'vitamin_b12', 'cobalamin': 'vitamin_b12',
  'folate': 'folate', 'folic acid': 'folate', 'vitamin b9': 'folate',
  'iron': 'iron', 'serum iron': 'iron', 'fe': 'iron',
  'ferritin': 'ferritin', 'serum ferritin': 'ferritin',
  'tibc': 'tibc', 'total iron binding capacity': 'tibc',
  'calcium': 'calcium', 'serum calcium': 'calcium', 'ca': 'calcium',
  'phosphorus': 'phosphorus', 'phosphate': 'phosphorus', 'serum phosphorus': 'phosphorus',
  'magnesium': 'magnesium', 'serum magnesium': 'magnesium', 'mg': 'magnesium',
  // Hormones
  'testosterone': 'testosterone', 'total testosterone': 'testosterone',
  'cortisol': 'cortisol', 'serum cortisol': 'cortisol',
  // Inflammatory
  'crp': 'crp', 'c-reactive protein': 'crp', 'hs-crp': 'crp', 'high sensitivity crp': 'crp',
  'homocysteine': 'homocysteine', 'serum homocysteine': 'homocysteine',
};

/**
 * Normalize an AI-returned parameter name to a referenceRanges.js key.
 * Tries: abbreviation, name, lowercase variations.
 * Returns null if no match found (parameter not in local database).
 */
export function normalizeParamKey(name, abbreviation) {
  const rangeKeys = getAllRangeKeys();

  // Try abbreviation first (most specific)
  if (abbreviation) {
    const abbr = abbreviation.toLowerCase().trim();
    if (NAME_ALIASES[abbr]) return NAME_ALIASES[abbr];
    if (rangeKeys.includes(abbr)) return abbr;
  }

  // Try full name
  if (name) {
    const lower = name.toLowerCase().trim();
    if (NAME_ALIASES[lower]) return NAME_ALIASES[lower];

    // Try snake_case version
    const snaked = lower.replace(/[\s-]+/g, '_');
    if (rangeKeys.includes(snaked)) return snaked;
  }

  return null;
}

/**
 * Cross-validate AI-assigned statuses against local reference ranges.
 * Overrides status when the AI's classification contradicts hard math.
 * Does NOT change explanations, suggestions, or other AI-generated content.
 *
 * Mutates analysis.parameters in place and returns the analysis.
 */
export function validateAnalysis(analysis) {
  if (!analysis?.parameters) return analysis;

  const context = {
    sex: analysis.patient_sex?.toLowerCase() || undefined,
    age: parseInt(analysis.patient_age) || undefined,
  };

  for (const param of analysis.parameters) {
    const key = normalizeParamKey(param.name, param.abbreviation);
    if (!key) continue; // Unknown parameter — trust AI

    const numericValue = parseFloat(param.value);
    if (isNaN(numericValue)) continue; // Non-numeric value — trust AI

    const localStatus = classifyStatus(numericValue, key, context);
    if (localStatus !== param.status) {
      param._originalStatus = param.status;
      param.status = localStatus;
      param._statusOverride = true;
    }
  }

  return analysis;
}
