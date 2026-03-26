/**
 * Sample lab report analysis result for demo/preview purposes.
 * Matches the JSON structure returned by claudeService.js analyzeReport().
 */
const sampleReport = {
  report_date: "2026-03-15",
  lab_name: "CityMed Diagnostics",
  patient_name: "Alex Morgan",
  patient_age: "34",
  patient_sex: "Female",
  total_parameters: 18,
  summary: "Your complete blood count shows generally healthy red and white blood cell production, though your hemoglobin is below the typical female reference range and deserves a conversation with your doctor. Liver enzymes (ALT, AST) and kidney markers (creatinine, BUN) all fall within expected limits, suggesting both organs are functioning well. Your thyroid panel indicates normal thyroid hormone regulation, and fasting glucose along with HbA1c reflect healthy blood-sugar metabolism. Lipid-wise, your total cholesterol and HDL are in a favorable range, but LDL is mildly elevated, which is worth monitoring over time through diet and activity adjustments. Vitamin D is on the lower side, a very common finding that can be improved with sensible sun exposure and dietary changes. Inflammatory markers like CRP are reassuringly low, pointing to no significant systemic inflammation. Overall, this is a largely encouraging set of results with a couple of areas to discuss with your healthcare provider for proactive management.",
  parameters: [
    {
      name: "Hemoglobin",
      abbreviation: "Hb",
      value: 10.8,
      unit: "g/dL",
      reference_range: { low: 12.0, high: 15.5, unit: "g/dL" },
      status: "review_recommended",
      organ_system: "blood_immunity",
      explanation: "Hemoglobin is the protein inside your red blood cells that carries oxygen from your lungs to every tissue in your body. Your level of 10.8 g/dL is below the typical range for adult females, which means your blood may be carrying less oxygen than ideal. This can sometimes be related to iron intake, menstrual blood loss, or other nutritional factors. A healthcare professional can help pinpoint the cause with a few additional tests.",
      why_it_matters: "When hemoglobin drops, your body has to work harder to deliver oxygen to muscles and organs, which can lead to feelings of tiredness, shortness of breath, or pale skin.",
      influences: ["iron intake", "menstrual cycle", "diet", "hydration", "chronic conditions"],
      specialist: "Hematologist or General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "Include iron-rich foods such as lentils, spinach, fortified cereals, and lean red meat in your meals, and pair them with vitamin C sources to enhance absorption.",
          source: "WHO Guideline on Iron Supplementation (2023)"
        },
        {
          suggestion: "Discuss with your doctor whether an iron panel or ferritin test would help identify the underlying cause.",
          source: "JAMA Internal Medicine — Iron Deficiency Evaluation Guidelines"
        }
      ]
    },
    {
      name: "White Blood Cell Count",
      abbreviation: "WBC",
      value: 6.8,
      unit: "x10^3/uL",
      reference_range: { low: 4.0, high: 11.0, unit: "x10^3/uL" },
      status: "excellent",
      organ_system: "blood_immunity",
      explanation: "White blood cells are your body's defense force against infections and foreign invaders. Your count of 6.8 is comfortably within the normal range, reflecting a well-balanced immune system. This suggests your bone marrow is producing an appropriate number of infection-fighting cells. No action is needed here.",
      why_it_matters: "A balanced WBC count means your immune system is neither under-active (leaving you vulnerable) nor over-active (which can signal inflammation or infection).",
      influences: ["infection", "stress", "exercise", "sleep", "medication"],
      specialist: "General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "Maintain a balanced diet rich in fruits, vegetables, and whole grains to support ongoing immune health.",
          source: "NIH — Nutrition and Immunity (2024)"
        }
      ]
    },
    {
      name: "Platelet Count",
      abbreviation: "PLT",
      value: 245,
      unit: "x10^3/uL",
      reference_range: { low: 150, high: 400, unit: "x10^3/uL" },
      status: "normal",
      organ_system: "blood_immunity",
      explanation: "Platelets are tiny cell fragments that clump together to form clots and stop bleeding when you get a cut. Your count of 245 is well within the normal range, indicating healthy clotting ability. This value is produced by your bone marrow and is a good sign of overall blood health.",
      why_it_matters: "Platelets that are too low can cause excessive bleeding, while too many can increase clot risk. Your level is right where it should be.",
      influences: ["hydration", "infection", "medication", "bone marrow health"],
      specialist: "General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "Stay well-hydrated and maintain regular check-ups to keep platelet levels in this healthy range.",
          source: "AHA Cardiovascular Health Guidelines (2024)"
        }
      ]
    },
    {
      name: "Red Blood Cell Count",
      abbreviation: "RBC",
      value: 4.1,
      unit: "x10^6/uL",
      reference_range: { low: 3.8, high: 5.1, unit: "x10^6/uL" },
      status: "normal",
      organ_system: "blood_immunity",
      explanation: "Red blood cells are responsible for transporting oxygen throughout your body. Your count of 4.1 million per microliter is within the normal female range. While the count itself is fine, the lower hemoglobin noted above suggests each cell may be carrying slightly less hemoglobin than usual. Your doctor can clarify this relationship.",
      why_it_matters: "Red blood cells are the backbone of oxygen delivery. A normal count means your bone marrow is producing cells at a healthy rate.",
      influences: ["altitude", "hydration", "iron levels", "kidney function"],
      specialist: "General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "Continue eating a nutrient-dense diet with adequate protein, iron, and B-vitamins to support red blood cell production.",
          source: "NIH — Dietary Guidelines for Blood Health (2024)"
        }
      ]
    },
    {
      name: "Fasting Blood Glucose",
      abbreviation: "FBG",
      value: 88,
      unit: "mg/dL",
      reference_range: { low: 70, high: 100, unit: "mg/dL" },
      status: "excellent",
      organ_system: "pancreas_metabolism",
      explanation: "Fasting blood glucose measures the sugar level in your blood after not eating for at least 8 hours. Your value of 88 mg/dL sits comfortably in the normal range, indicating that your body is effectively regulating blood sugar. Your pancreas is releasing the right amount of insulin to keep glucose in check. This is a positive indicator for your metabolic health.",
      why_it_matters: "Blood sugar regulation is fundamental to energy, mood, and long-term health. Consistently normal fasting glucose reduces your risk of developing insulin resistance over time.",
      influences: ["diet", "physical activity", "sleep quality", "stress", "family history"],
      specialist: "Endocrinologist or General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "Continue prioritizing whole grains, lean proteins, and vegetables while limiting refined sugars to maintain this excellent glucose control.",
          source: "ADA Standards of Medical Care in Diabetes (2025)"
        }
      ]
    },
    {
      name: "Glycated Hemoglobin",
      abbreviation: "HbA1c",
      value: 5.2,
      unit: "%",
      reference_range: { low: 4.0, high: 5.6, unit: "%" },
      status: "excellent",
      organ_system: "pancreas_metabolism",
      explanation: "HbA1c reflects your average blood sugar levels over the past 2-3 months by measuring how much glucose has attached to your hemoglobin. Your value of 5.2% is well within the normal range, confirming consistent and healthy blood sugar management. This is one of the most reliable markers for long-term metabolic health. Combined with your fasting glucose, this paints a very reassuring picture.",
      why_it_matters: "Unlike a single glucose reading, HbA1c shows the bigger picture. A normal HbA1c means your body has been managing sugar effectively for months, not just on the day of the test.",
      influences: ["diet patterns", "exercise regularity", "sleep", "stress management"],
      specialist: "Endocrinologist or General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "Maintain regular physical activity — even 150 minutes of moderate exercise per week helps sustain excellent HbA1c levels.",
          source: "ADA Standards of Medical Care in Diabetes (2025)"
        }
      ]
    },
    {
      name: "Alanine Aminotransferase",
      abbreviation: "ALT",
      value: 22,
      unit: "U/L",
      reference_range: { low: 7, high: 35, unit: "U/L" },
      status: "normal",
      organ_system: "liver",
      explanation: "ALT is an enzyme found mainly in your liver cells. When liver cells are healthy, ALT stays inside them; it leaks into the blood when cells are stressed or damaged. Your value of 22 U/L is well within normal limits, suggesting your liver cells are in good shape. This enzyme is one of the first indicators doctors check for liver wellness.",
      why_it_matters: "The liver performs over 500 functions including filtering toxins, producing bile for digestion, and storing nutrients. A normal ALT means this vital organ is working smoothly.",
      influences: ["alcohol intake", "medications", "diet", "body weight", "exercise"],
      specialist: "Hepatologist or General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "Continue limiting alcohol consumption and maintaining a balanced diet to support long-term liver health.",
          source: "AASLD Practice Guidelines (2024)"
        }
      ]
    },
    {
      name: "Aspartate Aminotransferase",
      abbreviation: "AST",
      value: 19,
      unit: "U/L",
      reference_range: { low: 8, high: 33, unit: "U/L" },
      status: "normal",
      organ_system: "liver",
      explanation: "AST is an enzyme found in your liver, heart, and muscles. Like ALT, it rises when these tissues are under stress. Your level of 19 U/L is comfortably normal, which is a good sign for both liver and muscle health. When AST and ALT are both normal, it provides strong reassurance about liver function.",
      why_it_matters: "Together with ALT, AST helps create a complete picture of your liver's condition. Both being normal is an excellent indicator of hepatic well-being.",
      influences: ["exercise intensity", "alcohol", "medications", "muscle injury"],
      specialist: "Hepatologist or General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "If you exercise intensely, note that AST can temporarily rise after heavy workouts — this is normal and not a liver concern.",
          source: "JAMA — Exercise Effects on Liver Enzymes (2023)"
        }
      ]
    },
    {
      name: "Creatinine",
      abbreviation: "Cr",
      value: 0.82,
      unit: "mg/dL",
      reference_range: { low: 0.59, high: 1.04, unit: "mg/dL" },
      status: "normal",
      organ_system: "kidneys",
      explanation: "Creatinine is a waste product generated by normal muscle metabolism that your kidneys filter out of your blood. Your level of 0.82 mg/dL falls within the expected range, indicating that your kidneys are filtering waste efficiently. This is one of the most commonly used markers to assess kidney function. Consistent values here over time are particularly reassuring.",
      why_it_matters: "Your kidneys filter about 200 liters of blood daily. A normal creatinine confirms they are keeping up with their filtering workload effectively.",
      influences: ["hydration", "protein intake", "muscle mass", "medications"],
      specialist: "Nephrologist or General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "Drink adequate water throughout the day — about 2 to 2.5 liters — to support kidney filtration.",
          source: "NIH — Kidney Health Guidelines (2024)"
        }
      ]
    },
    {
      name: "Blood Urea Nitrogen",
      abbreviation: "BUN",
      value: 14,
      unit: "mg/dL",
      reference_range: { low: 6, high: 20, unit: "mg/dL" },
      status: "normal",
      organ_system: "kidneys",
      explanation: "BUN measures the amount of nitrogen in your blood from the waste product urea, which is created when your body breaks down protein. Your level of 14 mg/dL is within normal range, confirming that your kidneys and liver are processing protein waste appropriately. BUN can fluctuate with diet and hydration, so it is best interpreted alongside creatinine.",
      why_it_matters: "BUN gives a window into how well your kidneys are clearing protein waste. Combined with your normal creatinine, this indicates healthy kidney function.",
      influences: ["protein intake", "hydration", "kidney function", "liver function"],
      specialist: "Nephrologist or General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "Maintain balanced protein intake — about 0.8 g per kg of body weight daily for general health — and stay hydrated.",
          source: "WHO Protein Intake Recommendations (2024)"
        }
      ]
    },
    {
      name: "Thyroid Stimulating Hormone",
      abbreviation: "TSH",
      value: 2.1,
      unit: "mIU/L",
      reference_range: { low: 0.4, high: 4.0, unit: "mIU/L" },
      status: "excellent",
      organ_system: "thyroid",
      explanation: "TSH is released by your pituitary gland to tell your thyroid how much hormone to produce. Your value of 2.1 mIU/L is right in the sweet spot of the normal range, indicating your pituitary and thyroid are communicating effectively. A balanced TSH means your metabolism, energy levels, and temperature regulation are all well-supported. This is one of the most important hormonal markers checked in routine labs.",
      why_it_matters: "Your thyroid influences nearly every cell in your body — from heart rate to hair growth. A well-regulated TSH means this master gland is functioning optimally.",
      influences: ["iodine intake", "stress", "sleep", "medication", "autoimmune conditions"],
      specialist: "Endocrinologist",
      lifestyle_suggestions: [
        {
          suggestion: "Ensure adequate iodine through iodized salt, dairy, or seafood to continue supporting healthy thyroid function.",
          source: "Endocrine Society Clinical Practice Guidelines (2024)"
        }
      ]
    },
    {
      name: "Free Thyroxine",
      abbreviation: "FT4",
      value: 1.2,
      unit: "ng/dL",
      reference_range: { low: 0.8, high: 1.8, unit: "ng/dL" },
      status: "normal",
      organ_system: "thyroid",
      explanation: "Free T4 is the unbound, active form of the main thyroid hormone thyroxine. Your level of 1.2 ng/dL is well within normal limits, confirming that your thyroid is producing an appropriate amount of hormone. Together with your normal TSH, this indicates a healthy and balanced thyroid axis. FT4 is a more direct measure of thyroid output than total T4.",
      why_it_matters: "Free T4 drives your metabolic rate, energy production, and brain function. A normal FT4 alongside normal TSH provides double confirmation that your thyroid system is working well.",
      influences: ["iodine intake", "selenium levels", "medications", "pregnancy"],
      specialist: "Endocrinologist",
      lifestyle_suggestions: [
        {
          suggestion: "Brazil nuts are a natural source of selenium, which supports the conversion of T4 to the more active T3 hormone.",
          source: "The Lancet Diabetes & Endocrinology — Thyroid Nutrition Review (2023)"
        }
      ]
    },
    {
      name: "Total Cholesterol",
      abbreviation: "TC",
      value: 195,
      unit: "mg/dL",
      reference_range: { low: 0, high: 200, unit: "mg/dL" },
      status: "normal",
      organ_system: "heart_cardiovascular",
      explanation: "Total cholesterol is the sum of all cholesterol types in your blood, including LDL, HDL, and a portion of triglycerides. Your value of 195 mg/dL is just under the desirable threshold of 200, which is a good result. Cholesterol is actually essential — your body uses it to build cell membranes and make hormones. The key is keeping the balance between good and bad cholesterol favorable.",
      why_it_matters: "While cholesterol gets a bad reputation, your body needs it. What matters is the ratio between protective HDL and harmful LDL, and your total is in a healthy zone.",
      influences: ["diet", "exercise", "genetics", "body weight", "smoking"],
      specialist: "Cardiologist or General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "Focus on heart-healthy fats from olive oil, avocados, nuts, and fatty fish while reducing saturated fat from processed foods.",
          source: "AHA Dietary Guidelines for Cardiovascular Health (2024)"
        }
      ]
    },
    {
      name: "Low-Density Lipoprotein",
      abbreviation: "LDL",
      value: 138,
      unit: "mg/dL",
      reference_range: { low: 0, high: 130, unit: "mg/dL" },
      status: "needs_attention",
      organ_system: "heart_cardiovascular",
      explanation: "LDL is often called 'bad' cholesterol because when present in excess, it can deposit in your artery walls and contribute to plaque formation over time. Your value of 138 mg/dL is slightly above the optimal threshold of 130 mg/dL, though not dramatically so. This is very common and often responds well to dietary and lifestyle adjustments. Many factors including genetics, diet, and activity level influence LDL.",
      why_it_matters: "LDL is the primary cholesterol type that contributes to arterial plaque buildup. Keeping it in check is one of the most impactful things you can do for long-term heart health.",
      influences: ["saturated fat intake", "trans fats", "exercise", "genetics", "body weight"],
      specialist: "Cardiologist or General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "Add soluble fiber from oats, beans, lentils, and flaxseeds — studies show 5-10 grams daily can lower LDL by 5-10%.",
          source: "AHA/ACC Guideline on Management of Blood Cholesterol (2024)"
        },
        {
          suggestion: "Aim for at least 150 minutes of moderate-intensity aerobic activity per week, which has been shown to reduce LDL and raise HDL.",
          source: "ACC Cardiovascular Risk Reduction Guidelines (2024)"
        }
      ]
    },
    {
      name: "High-Density Lipoprotein",
      abbreviation: "HDL",
      value: 62,
      unit: "mg/dL",
      reference_range: { low: 50, high: 90, unit: "mg/dL" },
      status: "excellent",
      organ_system: "heart_cardiovascular",
      explanation: "HDL is known as 'good' cholesterol because it acts like a cleanup crew, carrying excess cholesterol away from your arteries back to your liver for disposal. Your value of 62 mg/dL is above the minimum protective threshold, which is great news. Higher HDL levels are associated with lower cardiovascular risk. Your HDL is doing a good job counterbalancing the mildly elevated LDL.",
      why_it_matters: "HDL is your cardiovascular system's natural defense mechanism. Having a solid HDL level helps protect your arteries even when LDL is slightly elevated.",
      influences: ["exercise", "healthy fats", "smoking cessation", "moderate alcohol", "genetics"],
      specialist: "Cardiologist or General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "Regular aerobic exercise is the single most effective lifestyle factor for raising HDL — keep up your activity levels.",
          source: "AHA Scientific Statement on HDL Cholesterol (2024)"
        }
      ]
    },
    {
      name: "Vitamin D, 25-Hydroxy",
      abbreviation: "25(OH)D",
      value: 22,
      unit: "ng/mL",
      reference_range: { low: 30, high: 100, unit: "ng/mL" },
      status: "needs_attention",
      organ_system: "vitamins_minerals",
      explanation: "Vitamin D is a hormone-like vitamin that your skin produces when exposed to sunlight, and it plays a crucial role in calcium absorption, bone health, and immune function. Your level of 22 ng/mL falls below the recommended threshold of 30, which is a very common finding — studies estimate that over 40% of adults have insufficient Vitamin D. This does not indicate a disease, but optimizing your level can improve energy, bone strength, and immune resilience.",
      why_it_matters: "Vitamin D supports over 200 genes involved in bone mineralization, immune defense, and mood regulation. Bringing it into the optimal range can have wide-reaching benefits for how you feel day-to-day.",
      influences: ["sun exposure", "skin tone", "latitude", "diet", "age", "body fat percentage"],
      specialist: "Endocrinologist or General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "Aim for 15-20 minutes of midday sun exposure on arms and face several times per week, when UV index permits.",
          source: "Endocrine Society Clinical Practice Guideline on Vitamin D (2024)"
        },
        {
          suggestion: "Include Vitamin D-rich foods like fatty fish (salmon, mackerel), egg yolks, and fortified dairy. Discuss supplementation (1000-2000 IU/day) with your doctor.",
          source: "NIH Office of Dietary Supplements — Vitamin D Fact Sheet (2024)"
        }
      ]
    },
    {
      name: "Vitamin B12",
      abbreviation: "B12",
      value: 480,
      unit: "pg/mL",
      reference_range: { low: 200, high: 900, unit: "pg/mL" },
      status: "normal",
      organ_system: "vitamins_minerals",
      explanation: "Vitamin B12 is essential for nerve function, red blood cell formation, and DNA synthesis. Your level of 480 pg/mL is solidly within the normal range, indicating good absorption and intake. B12 is primarily found in animal products, so vegetarians and vegans need to be especially mindful of this nutrient. Your healthy level supports proper neurological function and energy metabolism.",
      why_it_matters: "B12 deficiency can mimic many conditions — from fatigue and brain fog to tingling in hands and feet. Your healthy level means your nervous system has the building blocks it needs.",
      influences: ["diet", "gut absorption", "age", "medications like metformin or PPIs"],
      specialist: "General Physician",
      lifestyle_suggestions: [
        {
          suggestion: "Continue including B12-rich foods such as fish, poultry, eggs, and dairy in your regular diet.",
          source: "NIH Office of Dietary Supplements — Vitamin B12 Fact Sheet (2024)"
        }
      ]
    },
    {
      name: "C-Reactive Protein",
      abbreviation: "CRP",
      value: 0.4,
      unit: "mg/L",
      reference_range: { low: 0, high: 3.0, unit: "mg/L" },
      status: "excellent",
      organ_system: "inflammation_infection",
      explanation: "CRP is a protein produced by your liver in response to inflammation anywhere in your body. Your value of 0.4 mg/L is very low, which is an excellent finding indicating minimal systemic inflammation. High-sensitivity CRP is also used as a marker for cardiovascular risk assessment, and your low level is protective. This suggests your body is not fighting any significant inflammatory process.",
      why_it_matters: "Chronic low-grade inflammation is increasingly recognized as a contributor to heart disease, diabetes, and other conditions. Your very low CRP is a strong positive signal for overall health.",
      influences: ["diet", "exercise", "sleep quality", "stress", "infections", "body weight"],
      specialist: "General Physician or Rheumatologist",
      lifestyle_suggestions: [
        {
          suggestion: "Your anti-inflammatory profile is great. Continue with a Mediterranean-style diet rich in omega-3 fatty acids, fruits, and vegetables.",
          source: "NEJM — Mediterranean Diet and Inflammation (2023)"
        }
      ]
    }
  ],
  overall_lifestyle: [
    {
      category: "nutrition",
      suggestion: "Prioritize iron-rich foods (lentils, spinach, lean red meat) paired with vitamin C for absorption. Increase Vitamin D through fatty fish and fortified foods. Add soluble fiber from oats and beans to help manage LDL cholesterol. A Mediterranean-style dietary pattern supports nearly all of your lab markers.",
      source: "WHO Nutrition Guidelines (2024), AHA Dietary Guidelines (2024)",
      related_parameters: ["Hemoglobin", "Vitamin D, 25-Hydroxy", "Low-Density Lipoprotein"]
    },
    {
      category: "movement",
      suggestion: "Aim for at least 150 minutes of moderate-intensity aerobic exercise per week (brisk walking, cycling, swimming). This supports HDL cholesterol, helps lower LDL, improves insulin sensitivity, and promotes healthy blood cell production. Include 2 sessions of resistance training weekly for bone and metabolic health.",
      source: "AHA Physical Activity Guidelines (2024), ACC Cardiovascular Prevention (2024)",
      related_parameters: ["Low-Density Lipoprotein", "High-Density Lipoprotein", "Fasting Blood Glucose"]
    },
    {
      category: "sleep",
      suggestion: "Target 7-9 hours of quality sleep per night. Poor sleep has been linked to increased inflammation (CRP), impaired glucose regulation, and reduced immune function. Maintain a consistent sleep schedule and limit screen exposure 1 hour before bed.",
      source: "NIH Sleep and Health Guidelines (2024), The Lancet — Sleep and Cardiometabolic Risk (2023)",
      related_parameters: ["C-Reactive Protein", "Fasting Blood Glucose", "Thyroid Stimulating Hormone"]
    },
    {
      category: "hydration",
      suggestion: "Drink 2 to 2.5 liters of water daily to support kidney filtration, blood viscosity, and nutrient transport. Proper hydration also helps maintain accurate lab values and supports overall cellular function.",
      source: "NIH Hydration and Kidney Health (2024)",
      related_parameters: ["Creatinine", "Blood Urea Nitrogen", "Hemoglobin"]
    },
    {
      category: "supplements_to_discuss",
      suggestion: "Discuss the following with your healthcare provider: (1) Vitamin D3 supplementation of 1000-2000 IU/day given your level of 22 ng/mL, (2) An iron panel to investigate the cause of low hemoglobin before starting iron supplements. Do not self-supplement without medical guidance.",
      source: "Endocrine Society Vitamin D Guidelines (2024), WHO Iron Supplementation Guideline (2023)",
      related_parameters: ["Vitamin D, 25-Hydroxy", "Hemoglobin"]
    }
  ]
};

export default sampleReport;
