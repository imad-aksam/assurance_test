import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import logo from '../assets/logo.png';

const features = [
  {
    icon: '⚡',
    title: 'Devis en 2 minutes',
    desc: 'Répondez à quelques questions et obtenez votre offre instantanément.',
  },
  {
    icon: '🛡️',
    title: 'Couverture complète',
    desc: 'Auto, habitation, santé — des garanties adaptées à votre profil.',
  },
  {
    icon: '💬',
    title: 'Sans engagement',
    desc: 'Comparez librement, sans être rappelé ni sollicité.',
  },
];

const steps = [
  { num: '01', label: 'Remplissez le formulaire' },
  { num: '02', label: 'Recevez vos offres' },
  { num: '03', label: 'Choisissez & souscrivez' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="hp-root">
      {/* NAV */}
      <nav className="hp-nav">
         <img src={logo} alt="AssurDevis" />
        <button className="hp-nav-cta" onClick={() => navigate('/devis')}>
          Obtenir un devis
        </button>
      </nav>

      {/* HERO */}
      <section className="hp-hero">
        <div className="hp-hero-badge">100% en ligne · Gratuit · Immédiat</div>
        <h1 className="hp-hero-title">
          Votre assurance,<br />
          <span className="hp-hero-accent">au juste prix.</span>
        </h1>
        <p className="hp-hero-sub">
          Comparez les meilleures offres du marché marocain en quelques clics,
          sans paperasse, sans attente.
        </p>
        <button className="hp-hero-btn" onClick={() => navigate('/devis')}>
          Commencer mon devis →
        </button>
        <p className="hp-hero-hint">Aucune carte bancaire requise</p>
      </section>

      {/* FEATURES */}
      <section className="hp-features">
        {features.map((f) => (
          <div className="hp-feature-card" key={f.title}>
            <div className="hp-feature-icon">{f.icon}</div>
            <h3 className="hp-feature-title">{f.title}</h3>
            <p className="hp-feature-desc">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section className="hp-steps">
        <h2 className="hp-steps-title">Comment ça marche</h2>
        <div className="hp-steps-row">
          {steps.map((s, i) => (
            <div className="hp-step" key={s.num}>
              <div className="hp-step-num">{s.num}</div>
              <div className="hp-step-label">{s.label}</div>
              {i < steps.length - 1 && <div className="hp-step-arrow">→</div>}
            </div>
          ))}
        </div>
        <button className="hp-steps-btn" onClick={() => navigate('/devis')}>
          Je démarre maintenant
        </button>
      </section>

      {/* FOOTER */}
      <footer className="hp-footer">
        <span>© 2025 Assurance Aksam — Tous droits réservés</span>
        <span>contact@assuranceaksam.ma</span>
      </footer>
    </div>
  );
}