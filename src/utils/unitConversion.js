// Unit conversion factors: parameter -> { factor, conventionalUnit, siUnit }
const CONVERSION_MAP = {
  glucose: { factor: 18.016, conventional: 'mg/dL', si: 'mmol/L' },
  fasting_glucose: { factor: 18.016, conventional: 'mg/dL', si: 'mmol/L' },
  cholesterol_total: { factor: 38.67, conventional: 'mg/dL', si: 'mmol/L' },
  ldl: { factor: 38.67, conventional: 'mg/dL', si: 'mmol/L' },
  hdl: { factor: 38.67, conventional: 'mg/dL', si: 'mmol/L' },
  vldl: { factor: 38.67, conventional: 'mg/dL', si: 'mmol/L' },
  triglycerides: { factor: 88.57, conventional: 'mg/dL', si: 'mmol/L' },
  creatinine: { factor: 88.42, conventional: 'mg/dL', si: 'µmol/L' },
  bun: { factor: 2.801, conventional: 'mg/dL', si: 'mmol/L' },
  urea: { factor: 2.801, conventional: 'mg/dL', si: 'mmol/L' },
  bilirubin_total: { factor: 17.1, conventional: 'mg/dL', si: 'µmol/L' },
  bilirubin_direct: { factor: 17.1, conventional: 'mg/dL', si: 'µmol/L' },
  bilirubin_indirect: { factor: 17.1, conventional: 'mg/dL', si: 'µmol/L' },
  calcium: { factor: 4.008, conventional: 'mg/dL', si: 'mmol/L' },
  uric_acid: { factor: 59.48, conventional: 'mg/dL', si: 'µmol/L' },
  phosphorus: { factor: 3.097, conventional: 'mg/dL', si: 'mmol/L' },
  magnesium: { factor: 2.431, conventional: 'mg/dL', si: 'mmol/L' },
  iron: { factor: 0.1791, conventional: 'µg/dL', si: 'µmol/L' },
  sodium: { factor: 1, conventional: 'mEq/L', si: 'mmol/L' },
  potassium: { factor: 1, conventional: 'mEq/L', si: 'mmol/L' },
  chloride: { factor: 1, conventional: 'mEq/L', si: 'mmol/L' },
};

export function toSI(value, parameterKey) {
  const conv = CONVERSION_MAP[parameterKey];
  if (!conv) return { value, unit: '' };
  return {
    value: parseFloat((value / conv.factor).toFixed(2)),
    unit: conv.si,
  };
}

export function toConventional(value, parameterKey) {
  const conv = CONVERSION_MAP[parameterKey];
  if (!conv) return { value, unit: '' };
  return {
    value: parseFloat((value * conv.factor).toFixed(2)),
    unit: conv.conventional,
  };
}

export function convertValue(value, parameterKey, targetSystem) {
  if (targetSystem === 'si') return toSI(value, parameterKey);
  return toConventional(value, parameterKey);
}

export function getConversionInfo(parameterKey) {
  return CONVERSION_MAP[parameterKey] || null;
}

export function detectUnit(unit) {
  const u = (unit || '').toLowerCase().trim();
  if (['mg/dl', 'µg/dl', 'ng/ml', 'pg/ml', 'meq/l', 'miu/ml', 'iu/l', 'g/dl'].includes(u)) return 'conventional';
  if (['mmol/l', 'µmol/l', 'nmol/l', 'pmol/l'].includes(u)) return 'si';
  return 'conventional';
}
