import React, { useEffect, useRef, useState } from 'react';

// ─── Auth helper (stockage session simple) ────────────────────────────────────

const AUTH_KEY = 'assurdevis_admin_auth';

export const isAuthenticated = () => {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const { token, exp } = JSON.parse(raw);
    return token && Date.now() < exp;
  } catch {
    return false;
  }
};

export const login = (token) => {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify({
    token,
    exp: Date.now() + 8 * 60 * 60 * 1000, // 8h
  }));
};

export const logout = () => sessionStorage.removeItem(AUTH_KEY);

// ─── Credentials par défaut (à remplacer par une vraie API) ───────────────────
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin2024' };

// ─── Canvas particles ─────────────────────────────────────────────────────────

const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = canvas.width  = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;

    const COUNT = 55;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${(1 - dist / 120) * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129,140,248,${p.alpha})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
};

// ─── Composant principal ──────────────────────────────────────────────────────

const AdminLogin = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [shake, setShake]       = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    // Simuler un appel API (délai réaliste)
    await new Promise(r => setTimeout(r, 900));

    if (
      username.trim() === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      login('adm_' + Math.random().toString(36).slice(2));
      onSuccess?.();
    } else {
      setLoading(false);
      setError('Identifiant ou mot de passe incorrect.');
      triggerShake();
      setPassword('');
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  return (
    <div className="login-root">

      {/* ── Panneau gauche (visuel) ────────────────────────────────────── */}
      <div className="login-visual">
        <ParticleCanvas />

        <div className="login-visual-content">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L24 7v9c0 5.5-4.5 9.5-10 11C8.5 25.5 4 21.5 4 16V7l10-5z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                <path d="M9 14l3.5 3.5 6.5-7" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="login-logo-name">Assurance Aksam</span>
          </div>

          {/* Headline */}
          <div className="login-headline">
            <h1 className="login-headline-title">
              Espace<br/>
              <span className="login-headline-accent">Administration</span>
            </h1>
            <p className="login-headline-sub">
              Plateforme de gestion des devis d'assurance auto et moto.
            </p>
          </div>

          {/* Stats déco */}
          <div className="login-stats">
            {[
              { label: 'Devis traités', value: '1 240+' },
              { label: 'Taux confirmation', value: '94 %' },
              { label: 'Clients actifs', value: '830+' },
            ].map(s => (
              <div key={s.label} className="login-stat">
                <span className="login-stat-value">{s.value}</span>
                <span className="login-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gradient overlay */}
        <div className="login-visual-overlay" />
      </div>

      {/* ── Panneau droit (formulaire) ─────────────────────────────────── */}
      <div className={`login-form-panel ${mounted ? 'mounted' : ''}`}>
        <div className="login-form-inner">

          {/* En-tête mobile */}
          <div className="login-mobile-logo">
            <div className="login-logo-icon sm">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L24 7v9c0 5.5-4.5 9.5-10 11C8.5 25.5 4 21.5 4 16V7l10-5z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                <path d="M9 14l3.5 3.5 6.5-7" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Assurance Aksam Admin</span>
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">Connexion</h2>
            <p className="login-form-subtitle">Accès réservé aux administrateurs</p>
          </div>

          <form
            className={`login-form ${shake ? 'shake' : ''}`}
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Erreur globale */}
            {error && (
              <div className="login-error" role="alert">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Identifiant */}
            <div className="login-field">
              <label className="login-label" htmlFor="username">Identifiant</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor"
                    strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                </svg>
                <input
                  id="username"
                  type="text"
                  className="login-input"
                  placeholder="Votre identifiant"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="login-field">
              <label className="login-label" htmlFor="password">Mot de passe</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
                  <circle cx="8" cy="11" r="1" fill="currentColor"/>
                </svg>
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPwd(v => !v)}
                  tabIndex={-1}
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPwd ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.5 6.6A3 3 0 009.4 9.5M3.5 4.6C2.2 5.7 1.3 7 1 8c1 3 4 5 7 5a7.7 7.7 0 003.5-.9M6 3.2C6.6 3.1 7.3 3 8 3c3 0 6 2 7 5-.3.9-.8 1.8-1.4 2.5"
                        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8c1-3 4-5 7-5s6 2 7 5c-1 3-4 5-7 5s-6-2-7-5z"
                        stroke="currentColor" strokeWidth="1.3" fill="none"/>
                      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Vérification…
                </>
              ) : (
                <>
                  Se connecter
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="login-footer">
            Assurance Aksam © {new Date().getFullYear()} — Accès sécurisé
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
