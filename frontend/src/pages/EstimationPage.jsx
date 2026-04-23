import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { quoteApi } from "../services/api";
import logo from '../assets/logo.png';

// ─────────────────────────────────────────────
//  MOTEUR DE CALCUL (logique PDF Maroc)
// ─────────────────────────────────────────────
function calculerDevis(data) {
  const { vehicleType, horsePower, driverAge, licenseYears, city } = data;

  let base = 0, puissance = 0;

  if (vehicleType === "auto") {
    base = 2500;
    puissance = (horsePower || 0) * 200;
  } else {
    const cc = horsePower || 0;
    if (cc <= 125) { base = 1000; puissance = 100; }
    else if (cc <= 600) { base = 2000; puissance = 125; }
    else { base = 3500; puissance = 150; }
  }

  const age = driverAge < 25 ? 1.30 : driverAge > 60 ? 1.15 : 1.00;
  const years = parseInt(licenseYears) || 0;
  const permis = years < 2 ? 1.25 : years < 5 ? 1.10 : 1.00;
  const zones = { casablanca: 1.25, rabat: 1.10, marrakech: 1.10, rural: 0.90 };
  const zone = zones[String(city).toLowerCase()] ?? 1.00;
  const socle = (base + puissance) * age * permis * zone;

  return [
    {
      id: "rc",
      label: "Responsabilité Civile",
      tag: "Essentiel",
      coeff: 1.00,
      accentColor: "#1a56db",
      accentLight: "#eff6ff",
      accentBorder: "#bfdbfe",
      icon: "🛡️",
      description: "La couverture légale minimum obligatoire au Maroc.",
      garanties: [
        "Dommages corporels aux tiers",
        "Dommages matériels aux tiers",
        "Assistance routière de base",
      ],
      exclusions: ["Dommages propres au véhicule", "Vol & incendie"],
    },
    {
      id: "tiers",
      label: "Tiers Étendu",
      tag: "Recommandé",
      coeff: 1.40,
      accentColor: "#7c3aed",
      accentLight: "#f5f3ff",
      accentBorder: "#ddd6fe",
      icon: "⭐",
      description: "Protection renforcée contre les sinistres les plus fréquents.",
      garanties: [
        "Tout ce que couvre la RC",
        "Vol & tentative de vol",
        "Incendie & explosion",
        "Bris de glace",
        "Catastrophes naturelles",
      ],
      exclusions: ["Dommages accidentels propres"],
      highlight: true,
    },
    {
      id: "tous",
      label: "Tous Risques",
      tag: "Premium",
      coeff: 2.25,
      accentColor: "#059669",
      accentLight: "#ecfdf5",
      accentBorder: "#a7f3d0",
      icon: "💎",
      description: "Couverture totale pour une tranquillité d'esprit absolue.",
      garanties: [
        "Tout ce que couvre le Tiers Étendu",
        "Dommages accidentels propres",
        "Assistance 24h/24 & véhicule de remplacement",
        "Protection du conducteur",
        "Valeur à neuf (véhicule < 2 ans)",
      ],
      exclusions: [],
    },
  ].map((o) => ({
    ...o,
    prix: Math.round(socle * o.coeff),
    prixMensuel: Math.round((socle * o.coeff) / 12),
  }));
}

// ─────────────────────────────────────────────
//  CARTE OFFRE
// ─────────────────────────────────────────────
function OfferCard({ offer, onSelect, disabled }) {
  return (
    <div
      className={`est-card ${offer.highlight ? "est-card--highlight" : ""}`}
      style={{
        "--accent": offer.accentColor,
        "--accent-light": offer.accentLight,
        "--accent-border": offer.accentBorder,
      }}
    >
      {offer.highlight && (
        <div className="est-card__ribbon">Le plus choisi</div>
      )}

      <div className="est-card__header">
        <span className="est-card__icon">{offer.icon}</span>
        <div>
          <span className="est-card__tag">{offer.tag}</span>
          <h3 className="est-card__title">{offer.label}</h3>
          <p className="est-card__desc">{offer.description}</p>
        </div>
      </div>

      <div className="est-card__price">
        <div className="est-card__price-main">
          <span className="est-card__amount">{offer.prix.toLocaleString("fr-MA")}</span>
          <span className="est-card__unit"> DH / an</span>
        </div>
        <div className="est-card__price-monthly">
          soit ~{offer.prixMensuel.toLocaleString("fr-MA")} DH / mois
        </div>
      </div>

      <ul className="est-card__list">
        {offer.garanties.map((g) => (
          <li key={g} className="est-card__list-item est-card__list-item--ok">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6.5" fill="var(--accent)" opacity=".15" />
              <path d="M4 7l2 2 4-4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {g}
          </li>
        ))}
        {offer.exclusions.map((e) => (
          <li key={e} className="est-card__list-item est-card__list-item--no">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6.5" fill="#94a3b8" opacity=".15" />
              <path d="M5 5l4 4M9 5l-4 4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {e}
          </li>
        ))}
      </ul>

      <button className="est-card__cta" onClick={() => onSelect(offer)} disabled={disabled}>
        {disabled ? 'Enregistrement…' : 'Choisir cette offre'}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────
export default function EstimationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const data = location.state?.quoteData || {
    vehicleType: "auto", horsePower: 8, driverAge: 28, licenseYears: 3,
    city: "rabat", firstName: "Yassine", lastName: "El Alami",
    vehicleBrand: "Dacia", vehicleModel: "Logan",
  };
  const quoteId = location.state?.quoteId ?? null;
  console.log('STATE:', location.state);
console.log('quoteId:', quoteId);

  const offres = calculerDevis(data);

  const handleSelect = async (offer) => {
    setSaving(true);
    try {
      if (quoteId) {
        const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:8002/api';
        await fetch(`${BASE_URL}/quotes/${quoteId}/offre`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offreChoisie: offer.id,
            prixOffre: offer.prix,
            statut: 'confirmed',
          }),
        });
      }
    } catch (e) {
      console.warn('Offre non sauvegardée en base:', e);
    } finally {
      setSaving(false);
      setSelected(offer);
    }
  };

  // ── Confirmation après sélection ──
  if (selected) {
    return (
      <>
        <style>{CSS}</style>
        <div className="est-page">
          <div className="est-confirm">
            <div className="success-screen">
              <div className="success-icon" style={{ color: "#059669" }}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
                  <path d="M18 32l10 10 18-20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="success-title">Offre sélectionnée !</h2>
              <p className="success-message">
                Vous avez choisi <strong>{selected.label}</strong> à{" "}
                <strong>{selected.prix.toLocaleString("fr-MA")} DH / an</strong>.<br />
                Un conseiller vous contactera sous 24h pour finaliser votre contrat.
              </p>
              <div className="success-ref">
                Offre : <code>{selected.label.toUpperCase().replace(/ /g, "-")}</code>
              </div>
              <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn btn-secondary" onClick={() => setSelected(null)}>
                  ← Voir les autres offres
                </button>
                <button className="btn btn-primary" onClick={() => navigate("/")}>
                  Nouveau devis
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Vue principale ──
  return (
    <>
      <style>{CSS}</style>
      <div className="page-wrapper">

        {/* Header identique au formulaire */}
        <header className="app-header">
          <div className="header-inner">
            <div className="logo">
              <a href="/">
              <img src={logo} alt="AssurDevis" />
              </a>
            </div>
            <div className="header-meta">
              <span className="header-step-label">Votre estimation</span>
            </div>
          </div>
        </header>

        <main className={`est-main ${visible ? "est-main--visible" : ""}`}>

          {/* Bandeau intro */}
          <div className="est-intro">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
              ← Retour au récapitulatif
            </button>
            <div style={{ marginTop: 24 }}>
              <p className="est-eyebrow">Estimation personnalisée</p>
              <h1 className="est-heading">
                Bonjour {data.firstName}, voici vos offres
              </h1>
              <p className="est-subheading">
                Basé sur votre{" "}
                <strong>
                  {data.vehicleType === "auto" ? "voiture" : "moto"}{" "}
                  {data.vehicleBrand} {data.vehicleModel}
                </strong>
                {" "}— {data.horsePower} {data.vehicleType === "auto" ? "CV" : "cc"}{" "}
                — {data.city}
              </p>
            </div>
          </div>

          {/* Info box */}
          <div className="info-box est-infobox">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.4" />
              <path d="M9 8v5M9 6v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>
              Les prix ci-dessous sont des <strong>estimations indicatives</strong> calculées selon
              la tarification en vigueur au Maroc. Le prix définitif sera confirmé après examen de votre dossier.
            </span>
          </div>

          {/* Grille des offres */}
          <div className="est-grid">
            {offres.map((o) => (
              <OfferCard key={o.id} offer={o} onSelect={handleSelect} disabled={saving} />
            ))}
          </div>

        </main>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
//  CSS — hérite des variables de global.css
// ─────────────────────────────────────────────
const CSS = `
  .est-main {
    flex: 1;
    max-width: 1020px;
    margin: 0 auto;
    width: 100%;
    padding: 36px 24px 80px;
    opacity: 0;
    transform: translateY(14px);
    transition: opacity .4s ease, transform .4s ease;
  }
  .est-main--visible { opacity: 1; transform: translateY(0); }

  .est-intro { margin-bottom: 24px; }
  .est-eyebrow {
    font-size: .8rem;
    font-weight: 600;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--neutral-400);
    margin-bottom: 6px;
    margin-top: 20px;
  }
  .est-heading {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 700;
    color: var(--neutral-900);
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }
  .est-subheading { color: var(--neutral-500); font-size: .95rem; }
  .est-subheading strong { color: var(--neutral-700); }

  .est-infobox { max-width: 680px; margin-bottom: 32px; }

  /* Grille 3 colonnes */
  .est-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 860px) { .est-grid { grid-template-columns: 1fr; } }
  @media (min-width: 560px) and (max-width: 860px) { .est-grid { grid-template-columns: 1fr 1fr; } }

  /* Carte */
  .est-card {
    background: #fff;
    border: 1.5px solid var(--neutral-200);
    border-radius: var(--radius-xl);
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
  }
  .est-card:hover {
    border-color: var(--accent-border);
    box-shadow: var(--shadow-md);
    transform: translateY(-3px);
  }
  .est-card--highlight {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent), var(--shadow-md);
  }

  /* Ruban */
  .est-card__ribbon {
    position: absolute;
    top: 14px; right: -28px;
    background: var(--accent);
    color: #fff;
    font-size: .7rem;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    padding: 4px 36px;
    transform: rotate(35deg);
    box-shadow: 0 2px 6px rgba(0,0,0,.15);
  }

  /* Header carte */
  .est-card__header { display: flex; gap: 14px; align-items: flex-start; }
  .est-card__icon { font-size: 1.8rem; flex-shrink: 0; line-height: 1; }
  .est-card__tag {
    display: inline-block;
    background: var(--accent-light);
    color: var(--accent);
    border: 1px solid var(--accent-border);
    font-size: .7rem;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 99px;
    margin-bottom: 6px;
  }
  .est-card__title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--neutral-900);
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }
  .est-card__desc { font-size: .82rem; color: var(--neutral-500); line-height: 1.5; }

  /* Prix */
  .est-card__price {
    background: var(--accent-light);
    border: 1px solid var(--accent-border);
    border-radius: var(--radius-md);
    padding: 14px 16px;
  }
  .est-card__price-main { display: flex; align-items: baseline; gap: 2px; }
  .est-card__amount {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: -0.03em;
    line-height: 1;
  }
  .est-card__unit { font-size: .85rem; color: var(--accent); font-weight: 600; }
  .est-card__price-monthly { font-size: .78rem; color: var(--neutral-500); margin-top: 4px; }

  /* Liste garanties */
  .est-card__list { list-style: none; display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .est-card__list-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: .83rem;
    line-height: 1.4;
  }
  .est-card__list-item svg { flex-shrink: 0; margin-top: 1px; }
  .est-card__list-item--ok { color: var(--neutral-700); }
  .est-card__list-item--no { color: var(--neutral-400); text-decoration: line-through; }

  /* CTA */
  .est-card__cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 11px 20px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    font-size: .9rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: filter 150ms ease, transform 150ms ease;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent);
  }
  .est-card__cta:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .est-card__cta:active { transform: translateY(0); filter: brightness(.97); }

  /* Confirm */
  .est-page { min-height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg,#f0f4ff 0%,#f8fafc 50%,#f0fdf4 100%); }
  .est-confirm { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
  .est-confirm .success-screen {
    background: #fff;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    padding: 48px 40px;
    max-width: 520px;
    width: 100%;
  }
`;