/**
 * ============================================================
 * PRESCRIPTION SCANNER API — route.ts
 * ============================================================
 * Fixes in this revision:
 *  1. Returns `nihError: true` when the NIH pass fails, so the
 *     frontend can distinguish "no interactions found" from
 *     "NIH was unreachable — safety unknown".
 *  2. Returns proper 200 with nihError flag instead of silently
 *     swallowing the failure, which previously caused a false
 *     "all clear" message in the UI.
 *  3. Drug name normalisation in the NIH loop is more robust.
 *  4. Exported POST handler returns nihError in the JSON body.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

interface Medication {
  drugName: string;
  dosage: string;
  frequency: string;
}

interface DrugInteraction {
  drugA: string;
  drugB: string;
  severity: 'critical' | 'caution';
  plainEnglishWarning: string;
}

// Local clinical overrides — always checked first, regardless of NIH availability
const CLINICAL_OVERRIDE_RULES = [
  {
    pair: ['metoprolol', 'cimetidine'],
    severity: 'caution' as const,
    warning:
      'Cimetidine may significantly increase Metoprolol levels in your body, which can lower your heart rate and cause dizziness. Monitor your pulse closely.',
  },
];

// ─────────────────────────────────────────────────────────────
// STEP 1 — MULTIMODAL IMAGE EXTRACTION (GROQ SCOUT)
// ─────────────────────────────────────────────────────────────
async function extractMedicationsFromImage(base64Image: string): Promise<Medication[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Server configuration error: GROQ_API_KEY environment variable is missing.');

  const rawBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

  const instructions = `
    You are a precise medical data extraction assistant specializing in multimodal clinical analysis.

    STEP 1 — VERIFY THE IMAGE:
    Analyze the image. If it is NOT a medical prescription slip, drug bottle label, or official clinical chart, return exactly this JSON: {"error": "NOT_A_PRESCRIPTION"}.

    STEP 2 — EXTRACT AND STANDARDIZE GENERIC DRUGS:
    If it is a valid prescription, extract all medications.

    CRITICAL LOOKUP RULE: You MUST translate and convert all trade brand names, regional brand spellings,
    and brand extensions into their standard global GENERIC compound equivalent.

    Strict Examples:
    - "Betaloc" or "Betaloc Succinate" -> write strictly as "Metoprolol"
    - "Cimetidine 400mg" -> write strictly as "Cimetidine"
    - "Dorzolanidum" or "Dorzolamide 2% Drops" -> write strictly as "Dorzolamide"

    The "drugName" field MUST contain only the pure generic name. Do not include strengths, unit weights,
    salt extensions (like succinate, maleate, hcl), or forms (like drops, tabs) in the "drugName" field.
    Put those details into "dosage" or "frequency".

    Return a JSON object matching this exact schema:
    {
      "medications": [
        {
          "drugName": "Pure Generic Compound Name Only",
          "dosage": "e.g. 100mg",
          "frequency": "e.g. Twice daily"
        }
      ]
    }

    IMPORTANT RULES:
    - Return ONLY raw JSON. No markdown enclosures, backticks, or text prose.
    - If a field is not visible, use an empty string "".
  `;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: instructions },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${rawBase64}` } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) throw new Error('Groq AI visual parsing matrix down.');

  const result = await response.json();
  const parsed = JSON.parse(result?.choices?.[0]?.message?.content ?? '{}');

  if (parsed.error === 'NOT_A_PRESCRIPTION') throw new Error('NOT_A_PRESCRIPTION');

  if (Array.isArray(parsed)) return parsed as Medication[];
  if (Array.isArray(parsed.medications)) return parsed.medications as Medication[];
  return [];
}

// ─────────────────────────────────────────────────────────────
// STEP 2 — PATIENT TRANSLATOR (GROQ CONVERSATIONAL COMPRESSION)
// ─────────────────────────────────────────────────────────────
async function simplifyWarningForPatient(
  drugA: string,
  drugB: string,
  medicalWarning: string,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return medicalWarning;

  try {
    const prompt = `
      You are an empathetic health assistant translating complex medical interaction text for a patient.
      Rewrite the description below into ONE short, clear, easy-to-understand sentence.

      Rules:
      - Never use clinical jargon (avoid: CYP2D6, clearance, plasma concentrations, metabolic inhibitors).
      - Use plain language: "dizziness", "low heart rate", "severe bleeding risk", etc.
      - State clearly what might happen and what they should do (e.g. "contact your doctor immediately").
      - Keep it brief (under 30 words).

      Medications: ${drugA} + ${drugB}
      Official Medical Description: ${medicalWarning}
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) return medicalWarning;
    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim() ?? medicalWarning;
  } catch {
    return medicalWarning;
  }
}

// ─────────────────────────────────────────────────────────────
// STEP 3 — INTERACTION TRAVERSAL WITH OVERRIDE SHIELD
// Returns { interactions, nihError }
// nihError=true means the NIH API was unreachable/failed —
// the frontend MUST NOT show "all clear" when nihError is true.
// ─────────────────────────────────────────────────────────────
async function checkForDrugInteractions(
  medications: Medication[],
): Promise<{ interactions: DrugInteraction[]; nihError: boolean }> {
  if (medications.length < 2) return { interactions: [], nihError: false };

  const warnings: DrugInteraction[] = [];
  const capturedPairs = new Set<string>();
  let nihError = false;

  // PATH A: Run local clinical override interceptor first
  const currentMedNames = medications.map(m => m.drugName.toLowerCase().trim());

  for (const rule of CLINICAL_OVERRIDE_RULES) {
    if (currentMedNames.includes(rule.pair[0]) && currentMedNames.includes(rule.pair[1])) {
      const nameA = rule.pair[0].charAt(0).toUpperCase() + rule.pair[0].slice(1);
      const nameB = rule.pair[1].charAt(0).toUpperCase() + rule.pair[1].slice(1);
      const pairKey = [rule.pair[0], rule.pair[1]].sort().join('-');
      capturedPairs.add(pairKey);
      warnings.push({
        drugA: nameA,
        drugB: nameB,
        severity: rule.severity,
        plainEnglishWarning: rule.warning,
      });
    }
  }

  // PATH B: NIH RxNav API
  try {
    const nihDrugIds: string[] = [];

    for (const med of medications) {
      const cleanGenericName = med.drugName
        .toLowerCase()
        .replace(
          /\b(succinate|maleate|fumarate|hcl|hydrochloride|sodium|potassium|tabs|caps|drops|2%)\b/gi,
          '',
        )
        .trim();

      const lookupUrl = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(cleanGenericName)}&srchType=1`;
      const lookupResponse = await fetch(lookupUrl, { signal: AbortSignal.timeout(8000) });

      if (lookupResponse.ok) {
        const lookupData = await lookupResponse.json();
        const nihId = lookupData?.idGroup?.rxnormId?.[0];
        if (nihId && !nihDrugIds.includes(nihId)) nihDrugIds.push(nihId);
      }
    }

    if (nihDrugIds.length >= 2) {
      const interactionUrl = `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${nihDrugIds.join('+')}`;
      const interactionResponse = await fetch(interactionUrl, { signal: AbortSignal.timeout(8000) });

      if (interactionResponse.ok) {
        const interactionData = await interactionResponse.json();
        const typeGroups = interactionData?.fullInteractionTypeGroup ?? [];

        for (const group of typeGroups) {
          for (const type of group.fullInteractionType || []) {
            for (const pair of type.interactionPair || []) {
              const drugA =
                pair.interactionConcept?.[0]?.minConcept?.name ??
                type.minConcept?.[0]?.name ??
                'Unknown Drug';
              const drugB =
                pair.interactionConcept?.[1]?.minConcept?.name ??
                type.minConcept?.[1]?.name ??
                'Unknown Drug';

              const pairKey = [drugA.toLowerCase(), drugB.toLowerCase()].sort().join('-');
              if (capturedPairs.has(pairKey)) continue;
              capturedPairs.add(pairKey);

              const nihSeverity = pair.severity ?? '';
              const nihDescription = pair.description ?? 'Potential drug interaction detected.';
              const severity: 'critical' | 'caution' =
                nihSeverity.toLowerCase() === 'high' ? 'critical' : 'caution';

              const plainEnglishWarning = await simplifyWarningForPatient(
                drugA,
                drugB,
                nihDescription,
              );
              warnings.push({ drugA, drugB, severity, plainEnglishWarning });
            }
          }
        }
      } else {
        // NIH returned a non-OK HTTP status — mark as uncertain
        console.error('NIH interaction endpoint returned non-OK status:', interactionResponse.status);
        nihError = true;
      }
    } else if (nihDrugIds.length < 2 && medications.length >= 2) {
      // We had meds but couldn't resolve ≥2 RxNorm IDs — NIH lookup failed
      console.warn('NIH RxNorm ID resolution returned fewer than 2 IDs for the given medications.');
      nihError = true;
    }
  } catch (error) {
    // Network failure, timeout, or parse error — mark as uncertain
    console.error('NIH network pass failed:', error);
    nihError = true;
  }

  return { interactions: warnings, nihError };
}

// ─────────────────────────────────────────────────────────────
// POST /api/analyze-prescription
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const base64Image: string | undefined = body.imageData ?? body.image;

    if (!base64Image) {
      return NextResponse.json({ error: 'Missing image stream payload.' }, { status: 400 });
    }

    const medications = await extractMedicationsFromImage(base64Image);
    const { interactions, nihError } = await checkForDrugInteractions(medications);

    return NextResponse.json(
      {
        medications,
        interactions,
        nihError,   // ← KEY FIX: frontend uses this to show advisory instead of false "all clear"
        source:
          'Groq Llama-4 Scout Vision (AI Extraction) + US Federal NIH RxNav Active Matrix',
        scannedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (err: any) {
    const isNotPrescription = err.message === 'NOT_A_PRESCRIPTION';
    return NextResponse.json(
      {
        error: 'Server error',
        message: isNotPrescription
          ? 'File structure could not be verified as a valid prescription layout.'
          : 'Internal pipeline runtime error.',
      },
      { status: 500 },
    );
  }
}