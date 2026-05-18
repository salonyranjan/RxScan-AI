/**
 * ============================================================
 * PRESCRIPTION SCANNER API — route.ts (Authoritative)
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

interface ApiResponse {
  medications: Medication[];
  interactions: DrugInteraction[];
  source: string;
  scannedAt: string;
}

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
    
    CRITICAL LOOKUP RULE: You MUST translate and convert all trade brand names, regional brand spellings, and brand extensions into their standard global GENERIC compound equivalent.
    
    Strict Examples:
    - "Betaloc" or "Betaloc Succinate" -> write strictly as "Metoprolol"
    - "Cimetidine" or "Cimetidine 400mg" -> write strictly as "Cimetidine"
    - "Dorzolanidum" or "Dorzolamide 2% Drops" -> write strictly as "Dorzolamide"

    The "drugName" field MUST contain only the pure generic name. Do not include strengths, unit weights, salt extensions (like succinate, maleate, hcl), or forms (like drops, tabs) in the "drugName" field. Put those details into "dosage" or "frequency".

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
      'Authorization': `Bearer ${apiKey}`,
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
async function simplifyWarningForPatient(drugA: string, drugB: string, medicalWarning: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return medicalWarning;

  try {
    const prompt = `
      You are an empathetic health assistant translating complex medical interaction text for a patient.
      Rewrite the description below into ONE short, clear, easy-to-understand sentence.
      
      Rules:
      - Never use clinical jargon or codes (avoid: CYP2D6, clearance, plasma concentrations, metabolic inhibitors).
      - Use plain language: "dizziness", "low heart rate", "severe bleeding risk", etc.
      - State clearly what might happen and what they should do (e.g. "contact your doctor immediately").
      - Keep it brief (under 30 words).
      
      Medications: ${drugA} + ${drugB}
      Official Medical Description: ${medicalWarning}
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
// STEP 3 — BULLETPROOF INTERACTION SEARCH TRAVERSAL (NIH RxNAV)
// ─────────────────────────────────────────────────────────────
async function checkForDrugInteractions(medications: Medication[]): Promise<DrugInteraction[]> {
  if (medications.length < 2) return [];

  try {
    const nihDrugIds: string[] = [];

    // Step A: Accumulate unique Concept IDs (RxCUIs)
    for (const med of medications) {
      const cleanGenericName = med.drugName
        .toLowerCase()
        .replace(/\b(succinate|maleate|fumarate|hcl|hydrochloride|sodium|potassium|tabs|caps|drops|2%)\b/gi, '')
        .trim();

      const lookupUrl = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(cleanGenericName)}&srchType=1`;
      const lookupResponse = await fetch(lookupUrl);

      if (lookupResponse.ok) {
        const lookupData = await lookupResponse.json();
        const nihId = lookupData?.idGroup?.rxnormId?.[0];
        if (nihId && !nihDrugIds.includes(nihId)) {
          nihDrugIds.push(nihId);
        }
      }
    }

    if (nihDrugIds.length < 2) return [];

    // Step B: Query the entire interaction list matrix
    const interactionUrl = `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${nihDrugIds.join('+')}`;
    const interactionResponse = await fetch(interactionUrl);
    if (!interactionResponse.ok) return [];

    const interactionData = await interactionResponse.json();
    const warnings: DrugInteraction[] = [];
    
    // De-duplicate tracking set to guarantee no identical pairs hit the UI map twice
    const capturedPairs = new Set<string>();

    // 🚀 MULTI-LAYER TRAVERSAL SHIELD: Deep parse both primary type groups AND secondary matrix arrays
    const typeGroups = interactionData?.fullInteractionTypeGroup ?? [];
    
    for (const group of typeGroups) {
      for (const interactionType of group.fullInteractionType || []) {
        for (const pair of interactionType.interactionPair || []) {
          
          const drugA = interactionType.minConcept?.[0]?.name ?? 'Unknown Drug';
          const drugB = interactionType.minConcept?.[1]?.name ?? 'Unknown Drug';
          
          const pairKey = [drugA, drugB].sort().join('-');
          if (capturedPairs.has(pairKey)) continue;
          capturedPairs.add(pairKey);

          const nihSeverity = pair.severity ?? '';
          const nihDescription = pair.description ?? 'Potential drug interaction detected.';
          const severity: 'critical' | 'caution' = nihSeverity.toLowerCase() === 'high' ? 'critical' : 'caution';

          const plainEnglishWarning = await simplifyWarningForPatient(drugA, drugB, nihDescription);
          warnings.push({ drugA, drugB, severity, plainEnglishWarning });
        }
      }
    }

    return warnings;
  } catch (error) {
    console.error('Core NIH database parsing exception:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// CONTROL ROUTE ROUTING AGENT
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const base64Image: string | undefined = body.imageData ?? body.image;

    if (!base64Image) {
      return NextResponse.json({ error: 'Missing image stream payload.' }, { status: 400 });
    }

    const medications = await extractMedicationsFromImage(base64Image);
    const interactions = await checkForDrugInteractions(medications);

    return NextResponse.json({
      medications,
      interactions,
      source: 'Groq Llama-4 Scout Core Vision (AI Standard Mapping) + US Federal NIH RxNav Active Matrix',
      scannedAt: new Date().toISOString(),
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({
      error: 'Server error',
      message: err.message === 'NOT_A_PRESCRIPTION' ? 'File structure could not be verified as a valid prescription layout.' : 'Internal pipeline runtime error.'
    }, { status: 500 });
  }
}