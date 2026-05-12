import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ADMETProfile {
  absorption: {
    rating: string;
    description: string;
    score: "safe" | "caution" | "risk";
  };
  distribution: {
    bbb_penetration: string;
    protein_binding: string;
    score: "safe" | "caution" | "risk";
  };
  metabolism: {
    cyp3a4_interaction: string;
    other_pathways: string;
    score: "safe" | "caution" | "risk";
  };
  excretion: {
    half_life: string;
    clearance: string;
    score: "safe" | "caution" | "risk";
  };
  toxicity: {
    herg: {
      rating: "low" | "moderate" | "high";
      description: string;
    };
    ames: {
      rating: "negative" | "positive";
      description: string;
    };
    dili: {
      rating: "low" | "moderate" | "high";
      description: string;
    };
  };
  verdict: "safe" | "caution" | "risk";
  clinical_summary: string;
}

export async function analyzeDrugADMET(drugData: {
  name: string;
  smiles: string;
  formula: string;
  weight: number;
  iupacName: string;
}): Promise<ADMETProfile> {
  const prompt = `Analyze the pharmacokinetic (ADMET) and safety profile for the drug ${drugData.name} (${drugData.iupacName}) with chemical formula ${drugData.formula}, molecular weight ${drugData.weight} and SMILES string: ${drugData.smiles}.
  
  Provide a detailed, medically accurate analysis. Categorize scores as "safe", "caution", or "risk" based on clinical data.
  
  Absorption: Rate its oral bioavailability and absorption characteristics.
  Distribution: Discuss Blood-Brain Barrier (BBB) penetration and plasma protein binding.
  Metabolism: Specifically mention CYP3A4 enzyme interactions and other primary metabolism pathways.
  Excretion: Mention expected half-life and clearance mechanisms.
  Toxicity: 
    - hERG: Cardiotoxicity risk (low/moderate/high).
    - AMES: Mutagenicity risk (negative/positive).
    - DILI: Drug-Induced Liver Injury risk (low/moderate/high).
  
  Verdict: An overall safety verdict (safe/caution/risk).
  Clinical Summary: A 2-3 sentence plain-English summary of the clinical implications.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          absorption: {
            type: Type.OBJECT,
            properties: {
              rating: { type: Type.STRING },
              description: { type: Type.STRING },
              score: { type: Type.STRING, enum: ["safe", "caution", "risk"] },
            },
            required: ["rating", "description", "score"],
          },
          distribution: {
            type: Type.OBJECT,
            properties: {
              bbb_penetration: { type: Type.STRING },
              protein_binding: { type: Type.STRING },
              score: { type: Type.STRING, enum: ["safe", "caution", "risk"] },
            },
            required: ["bbb_penetration", "protein_binding", "score"],
          },
          metabolism: {
            type: Type.OBJECT,
            properties: {
              cyp3a4_interaction: { type: Type.STRING },
              other_pathways: { type: Type.STRING },
              score: { type: Type.STRING, enum: ["safe", "caution", "risk"] },
            },
            required: ["cyp3a4_interaction", "other_pathways", "score"],
          },
          excretion: {
            type: Type.OBJECT,
            properties: {
              half_life: { type: Type.STRING },
              clearance: { type: Type.STRING },
              score: { type: Type.STRING, enum: ["safe", "caution", "risk"] },
            },
            required: ["half_life", "clearance", "score"],
          },
          toxicity: {
            type: Type.OBJECT,
            properties: {
              herg: {
                type: Type.OBJECT,
                properties: {
                  rating: { type: Type.STRING, enum: ["low", "moderate", "high"] },
                  description: { type: Type.STRING },
                },
                required: ["rating", "description"],
              },
              ames: {
                type: Type.OBJECT,
                properties: {
                  rating: { type: Type.STRING, enum: ["negative", "positive"] },
                  description: { type: Type.STRING },
                },
                required: ["rating", "description"],
              },
              dili: {
                type: Type.OBJECT,
                properties: {
                  rating: { type: Type.STRING, enum: ["low", "moderate", "high"] },
                  description: { type: Type.STRING },
                },
                required: ["rating", "description"],
              },
            },
            required: ["herg", "ames", "dili"],
          },
          verdict: { type: Type.STRING, enum: ["safe", "caution", "risk"] },
          clinical_summary: { type: Type.STRING },
        },
        required: [
          "absorption",
          "distribution",
          "metabolism",
          "excretion",
          "toxicity",
          "verdict",
          "clinical_summary",
        ],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to receive AI analysis");
  }

  return JSON.parse(response.text);
}
