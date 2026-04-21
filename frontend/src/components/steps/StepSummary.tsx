import React from 'react';
import type {
  QuoteFormState,
  QuoteResponse,
} from '../../types/quote';
import { NavButtons } from '../UI';

interface Props {
  state: QuoteFormState;
  cities: { id: number; nom: string }[];
  onConfirm: () => void;
  onPrev: () => void;
  onEdit: (step: number) => void;
  savedQuote: QuoteResponse | null;
}

const SummaryRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="summary-row">
    <span className="summary-label">{label}</span>
    <span className="summary-value">{value || <em className="text-muted">—</em>}</span>
  </div>
);

const SummarySection: React.FC<{
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}> = ({ title, step, onEdit, children }) => (
  <div className="summary-section">
    <div className="summary-section-header">
      <h3 className="summary-section-title">{title}</h3>
      <button
        type="button"
        className="btn-edit"
        onClick={() => onEdit(step)}
        aria-label={`Modifier ${title}`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        Modifier
      </button>
    </div>
    <div className="summary-rows">{children}</div>
  </div>
);

const StepSummary: React.FC<Props> = ({
  state,
  cities,
  onConfirm,
  onPrev,
  onEdit,
  savedQuote,
}) => {
  const { personal, driver, insurance, vehicle, isSubmitting } = state;

  const cityName = cities.find((c) => c.id === personal.cityId)?.nom ?? `#${personal.cityId}`;

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-MA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (v: number | string | '') =>
    v !== '' ? `${Number(v).toLocaleString('fr-MA')} MAD` : '—';

  if (savedQuote) {
    return (
      <div className="step-container">
        <div className="success-screen">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
              <path
                d="M18 32l10 10 18-20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="success-title">Devis soumis avec succès !</h2>
          <p className="success-message">
            Votre devis <strong>#{savedQuote.id}</strong> a bien été enregistré. Notre équipe
            vous contactera sous 24h au <strong>{savedQuote.telephone}</strong> pour finaliser
            votre contrat.
          </p>
          <div className="success-ref">
            Référence : <code>DEVIS-{String(savedQuote.id).padStart(6, '0')}</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-icon">📋</span>
        <h2 className="step-title">Récapitulatif de votre devis</h2>
        <p className="step-subtitle">
          Vérifiez vos informations avant de soumettre votre demande.
        </p>
      </div>

      <div className="summary-container">
        {/* Étape 1 */}
        <SummarySection title="Informations personnelles" step={1} onEdit={onEdit}>
          <SummaryRow label="Nom complet" value={`${personal.prenom} ${personal.nom}`} />
          <SummaryRow label="Ville" value={cityName} />
          <SummaryRow label="Téléphone" value={personal.telephone} />
        </SummarySection>

        {/* Étape 2 */}
        <SummarySection title="Informations conducteur" step={2} onEdit={onEdit}>
          <SummaryRow label="Date de naissance" value={formatDate(driver.dateNaissance)} />
          <SummaryRow label="Date du permis" value={formatDate(driver.datePermis)} />
        </SummarySection>

        {/* Étape 3 */}
        <SummarySection title="Type d'assurance" step={3} onEdit={onEdit}>
          <SummaryRow
            label="Assurance souhaitée"
            value={
              <span className={`badge badge-${insurance.typeAssurance}`}>
                {insurance.typeAssurance === 'auto' ? '🚗 Assurance Auto' : '🏍️ Assurance Moto'}
              </span>
            }
          />
        </SummarySection>

        {/* Étape 4 */}
        <SummarySection title="Informations véhicule" step={4} onEdit={onEdit}>
          <SummaryRow label="Marque" value={vehicle.marqueVehicule} />
          <SummaryRow label="Carburant" value={vehicle.typeCarburant} />
          <SummaryRow label="Mise en circulation" value={formatDate(vehicle.dateMiseEnCirculation)} />
          <SummaryRow label="Nombre de places" value={vehicle.nombrePlaces} />
          <SummaryRow label="Valeur à neuf" value={formatCurrency(vehicle.valeurNeuf)} />
          <SummaryRow label="Valeur vénale" value={formatCurrency(vehicle.valeurVenale)} />
          <SummaryRow label="Immatriculation" value={vehicle.immatriculation} />
          {insurance.typeAssurance === 'auto' && (
            <SummaryRow
              label="Puissance fiscale"
              value={vehicle.puissanceFiscale ? `${vehicle.puissanceFiscale} CV` : '—'}
            />
          )}
          {insurance.typeAssurance === 'moto' && (
            <SummaryRow
              label="Cylindrée"
              value={vehicle.cylindree ? `${vehicle.cylindree} cm³` : '—'}
            />
          )}
        </SummarySection>
      </div>

      {state.errors && Object.keys(state.errors).length > 0 && (
        <div className="error-banner">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.4" />
            <path d="M9 5v5M9 12.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p>Des erreurs ont été détectées. Veuillez corriger les informations avant de confirmer.</p>
        </div>
      )}

      <NavButtons
        onPrev={onPrev}
        onSubmit={onConfirm}
        isLast
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default StepSummary;
