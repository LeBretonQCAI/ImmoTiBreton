'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { RESULT_SPLIT_SEPARATOR } from './config/aiPrompt';

interface FormData {
  address: string;
  propertyType: string;
  surface?: number | '';
  yearBuilt?: number | '';
  notes: string;
  extraContext: string;
  detailLevel: 'standard' | 'detailed';
}

const defaultData: FormData = {
  address: '',
  propertyType: 'Appartement',
  surface: '',
  yearBuilt: '',
  notes: '',
  extraContext: '',
  detailLevel: 'standard',
};

export default function HomePage() {
  const [formData, setFormData] = useState<FormData>(defaultData);
  const [report, setReport] = useState<string>('');
  const [marketSummary, setMarketSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Charger les données depuis le localStorage
  useEffect(() => {
    const cached = window.localStorage.getItem('tibreton-form');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as FormData;
        setFormData({ ...defaultData, ...parsed });
      } catch (e) {
        console.warn('Impossible de charger les données locales', e);
      }
    }
  }, []);

  // Sauvegarder les données
  useEffect(() => {
    window.localStorage.setItem('tibreton-form', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (
    field: keyof FormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setReport('');
    setMarketSummary('');

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          surface: formData.surface === '' ? null : Number(formData.surface),
          yearBuilt: formData.yearBuilt === '' ? null : Number(formData.yearBuilt),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || 'Erreur inconnue');
        return;
      }

      /**
       * L’assistant renvoie le rapport complet et la synthèse de marché séparés par
       * un séparateur clair (RESULT_SPLIT_SEPARATOR). On découpe ici pour alimenter
       * les deux onglets de l’UI. Si le séparateur n’est pas trouvé, on place tout
       * dans le rapport complet.
       */
      const [reportPart, marketPart] = (data.result as string).split(RESULT_SPLIT_SEPARATOR);
      setReport((reportPart || '').trim());
      setMarketSummary((marketPart || '').trim());
    } catch (e) {
      console.error(e);
      setError(
        "Une erreur est survenue lors de la génération du rapport. Vérifiez votre connexion et la clé OPENAI_API_KEY côté serveur.",
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = useMemo(
    () => formData.address.trim() !== '' && formData.notes.trim() !== '' && formData.propertyType !== '',
    [formData.address, formData.notes, formData.propertyType],
  );

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Échec de la copie', e);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <p className="text-sm uppercase tracking-wide text-blue-700 font-semibold">TiBreton Immo Expert</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
            Générateur de rapports d’expertise immobilière
          </h1>
          <p className="text-slate-600 mt-3">
            Générez vos rapports d’expertise à partir de vos notes de visite et d’une analyse de marché localisée.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="address">Adresse du bien *</label>
                  <input
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Ex : 12 rue de Bretagne, 35000 Rennes"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="propertyType">Type de bien *</label>
                  <select
                    id="propertyType"
                    value={formData.propertyType}
                    onChange={(e) => handleChange('propertyType', e.target.value)}
                  >
                    <option>Appartement</option>
                    <option>Maison</option>
                    <option>Local commercial</option>
                    <option>Terrain</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="surface">Surface approximative (m²)</label>
                  <input
                    id="surface"
                    type="number"
                    min={0}
                    value={formData.surface}
                    onChange={(e) => handleChange('surface', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ex : 120"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="yearBuilt">Année de construction approximative</label>
                  <input
                    id="yearBuilt"
                    type="number"
                    min={1800}
                    max={new Date().getFullYear()}
                    value={formData.yearBuilt}
                    onChange={(e) => handleChange('yearBuilt', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ex : 1998"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="notes">Notes de visite, commentaires ou transcription vocale *</label>
                <textarea
                  id="notes"
                  required
                  rows={6}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Coller ici vos notes brutes, bullet points, transcription vocale, etc."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="extraContext">Commentaires supplémentaires / Contexte (facultatif)</label>
                <textarea
                  id="extraContext"
                  rows={3}
                  value={formData.extraContext}
                  onChange={(e) => handleChange('extraContext', e.target.value)}
                  placeholder="Contexte client, contraintes, éléments à approfondir..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Niveau de détail du rapport</label>
                <div className="flex gap-4">
                  {[
                    { value: 'standard', label: 'Standard' },
                    { value: 'detailed', label: 'Très détaillé' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        name="detail"
                        value={option.value}
                        checked={formData.detailLevel === option.value}
                        onChange={(e) => handleChange('detailLevel', e.target.value as FormData['detailLevel'])}
                        className="h-4 w-4 border-slate-300"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="border border-rose-200 bg-rose-50 text-rose-700 rounded-md px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                >
                  {loading ? 'Génération en cours...' : "Générer le rapport d’expertise"}
                </button>
                {loading && <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />}
              </div>
            </form>

            <div className="bg-blue-50 border border-blue-100 text-blue-900 rounded-xl p-4 text-sm leading-relaxed">
              <h3 className="font-semibold text-blue-800 mb-1">Astuces de préparation</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Ajoutez vos points clés de visite, même en vrac ou en bullet points.</li>
                <li>Indiquez l’adresse exacte pour contextualiser la synthèse de marché.</li>
                <li>Complétez le contexte client pour des recommandations plus pertinentes.</li>
                <li>L’outil assiste votre expertise, il ne remplace pas votre jugement professionnel.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-5 h-full flex flex-col">
              <div className="flex gap-3 border-b border-slate-200 pb-4 mb-4">
                <div className="flex flex-col flex-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Onglet 1</p>
                  <h2 className="text-xl font-semibold text-slate-900">Rapport d’expertise complet</h2>
                </div>
                <div className="flex flex-col flex-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Onglet 2</p>
                  <h2 className="text-xl font-semibold text-slate-900">Synthèse de marché localisée</h2>
                </div>
              </div>

              {report ? (
                <div className="grid grid-cols-1 gap-4">
                  <section className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-900">Rapport d’expertise complet</h3>
                      <button
                        type="button"
                        onClick={() => handleCopy(report)}
                        className="text-sm text-blue-700 font-semibold hover:underline"
                      >
                        Copier le rapport
                      </button>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown>{report}</ReactMarkdown>
                    </div>
                  </section>

                  <section className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-900">Synthèse de marché localisée</h3>
                      <button
                        type="button"
                        onClick={() => handleCopy(marketSummary || report)}
                        className="text-sm text-blue-700 font-semibold hover:underline"
                      >
                        Copier la synthèse de marché
                      </button>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown>{marketSummary || '_La synthèse n’a pas été séparée, voici le texte complet._'}</ReactMarkdown>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="flex-1 bg-slate-50 border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-600">
                  Le rapport généré s’affichera ici après analyse de vos notes.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
