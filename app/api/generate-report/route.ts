import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { RESULT_SPLIT_SEPARATOR, SYSTEM_PROMPT } from '@/app/config/aiPrompt';

interface GenerateRequest {
  address: string;
  propertyType: string;
  surface?: number | null;
  yearBuilt?: number | null;
  notes: string;
  extraContext?: string;
  detailLevel: 'standard' | 'detailed';
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'Clé API manquante. Configurez OPENAI_API_KEY côté serveur.' },
      { status: 500 },
    );
  }

  const body = (await request.json()) as Partial<GenerateRequest>;

  if (!body.address || !body.notes || !body.propertyType || !body.detailLevel) {
    return NextResponse.json(
      { error: 'Adresse, type de bien, niveau de détail et notes sont requis.' },
      { status: 400 },
    );
  }

  const userMessage = `Voici les informations brutes sur le bien et la visite. Génère le rapport d’expertise complet et la synthèse de marché conformément au prompt système.

Adresse du bien : ${body.address}
Type de bien : ${body.propertyType}
Surface approximative : ${body.surface ?? 'Non précisée'} m²
Année de construction approximative : ${body.yearBuilt ?? 'Non précisée'}
Notes de visite : ${body.notes}
Contexte supplémentaire : ${body.extraContext || 'Aucun'}
Niveau de détail souhaité : ${body.detailLevel === 'detailed' ? 'Très détaillé' : 'Standard'}

Structure la réponse en deux parties, séparées par le séparateur clair "${RESULT_SPLIT_SEPARATOR}" :
1) Rapport d’expertise complet
2) Synthèse de marché localisée`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
    });

    const message = completion.choices[0]?.message?.content;

    if (!message) {
      return NextResponse.json(
        { error: 'Réponse vide du modèle.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ result: message });
  } catch (error) {
    console.error('Erreur OpenAI', error);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la génération du rapport. Vérifiez votre connexion et la clé OPENAI_API_KEY côté serveur.",
      },
      { status: 500 },
    );
  }
}
