import React, { useCallback, useEffect, useRef, useState } from 'react';
import { quoteApi, referentialApi } from '../services/api';
import '../styles/admin.css';

const STATUS_CONFIG = {
  draft:     { label: 'Brouillon',  color: '#92400e', dot: '#f59e0b' },
  submitted: { label: 'Soumis',     color: '#1e40af', dot: '#3b82f6' },
  confirmed: { label: 'Confirmé',   color: '#065f46', dot: '#10b981' },
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit', year: 'numeric' });

const fmtMoney = (v) => `${Number(v).toLocaleString('fr-MA')} MAD`;
const fmtId    = (id) => `#${String(id).padStart(5, '0')}`;

// ─── Sous-composants ──────────────────────────────────────────────────────────

const DetailSection = ({ title, children }) => (
  <div className="adm-ds">
    <h3 className="adm-ds-title">{title}</h3>
    <div className="adm-ds-body">{children}</div>
  </div>
);

const Dr = ({ label, value }) => (
  <div className="adm-dr">
    <span className="adm-dr-label">{label}</span>
    <span className="adm-dr-value">{value}</span>
  </div>
);

// ─── Composant principal ──────────────────────────────────────────────────────

const AdminDashboard = ({ onLogout }) => {
  const [quotes, setQuotes]             = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [total, setTotal]               = useState(0);
  const [view, setView]                 = useState('list');
  const [selected, setSelected]         = useState(null);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType]     = useState('all');
  const [sortField, setSortField]       = useState('createdAt');
  const [sortDir, setSortDir]           = useState('desc');
  const [updatingId, setUpdatingId]     = useState(null);
  const [deletingId, setDeletingId]     = useState(null);
  const [toast, setToast]               = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const searchRef = useRef(null);

  const stats = {
    total,
    submitted: quotes.filter(q => q.statut === 'submitted').length,
    confirmed: quotes.filter(q => q.statut === 'confirmed').length,
    draft:     quotes.filter(q => q.statut === 'draft').length,
    auto:      quotes.filter(q => q.typeAssurance === 'auto').length,
    moto:      quotes.filter(q => q.typeAssurance === 'moto').length,
  };

  const load = useCallback(async (p) => {
    setLoading(true); setError(null);
    try {
      const res = await quoteApi.list(p, 50);
      setQuotes(res.data);
      setTotalPages(res.pages);
      setTotal(res.total);
    } catch {
      setError('Impossible de charger les devis. Vérifiez que le serveur API est démarré.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  useEffect(() => {
    let result = [...quotes];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.nom.toLowerCase().includes(q) ||
        r.prenom.toLowerCase().includes(q) ||
        r.telephone.includes(q) ||
        r.immatriculation.toLowerCase().includes(q) ||
        r.marqueVehicule.toLowerCase().includes(q) ||
        String(r.id).includes(q)
      );
    }
    if (filterStatus !== 'all') result = result.filter(r => r.statut === filterStatus);
    if (filterType !== 'all')   result = result.filter(r => r.typeAssurance === filterType);
    result.sort((a, b) => {
      let va = (a[sortField] ?? '').toString().toLowerCase();
      let vb = (b[sortField] ?? '').toString().toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    setFiltered(result);
  }, [quotes, search, filterStatus, filterType, sortField, sortDir]);

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const changeStatus = async (quote, newStatus) => {
    setUpdatingId(quote.id);
    try {
      const res = await quoteApi.update(quote.id, { ...quote, statut: newStatus });
      setQuotes(prev => prev.map(q => q.id === quote.id ? res.data : q));
      if (selected?.id === quote.id) setSelected(res.data);
      showToast(`Statut mis à jour : ${STATUS_CONFIG[newStatus].label}`, 'ok');
    } catch {
      showToast('Erreur lors de la mise à jour du statut.', 'err');
    } finally { setUpdatingId(null); }
  };

  const doDelete = async (quote) => {
    setDeletingId(quote.id); setConfirmDelete(null);
    try {
      await quoteApi.delete(quote.id);
      setQuotes(prev => prev.filter(q => q.id !== quote.id));
      setTotal(t => t - 1);
      if (selected?.id === quote.id) { setSelected(null); setView('list'); }
      showToast(`Devis ${fmtId(quote.id)} supprimé.`, 'ok');
    } catch {
      showToast('Erreur lors de la suppression.', 'err');
    } finally { setDeletingId(null); }
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => (
    <span style={{ marginLeft: 4, opacity: sortField === field ? 1 : 0.3, fontSize: 10 }}>
      {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  );

  const openDetail = (q) => { setSelected(q); setView('detail'); };

  return (
    <div className="adm-root">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <div>
            <a href="/" style={{ textDecoration: 'none' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--adm-accent, #6366f1)' }}>AssurDevis</div>
            </a>
            <div className="adm-brand-sub">Administration</div>
          </div>
        </div>

        <nav className="adm-nav">
          <button className={`adm-nav-item ${view === 'list' && filterStatus === 'all' && filterType === 'all' ? 'active' : ''}`}
            onClick={() => { setView('list'); setFilterStatus('all'); setFilterType('all'); }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="2" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <rect x="1" y="7" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <rect x="1" y="12" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            </svg>
            Tous les devis
            <span className="adm-nav-badge">{total}</span>
          </button>

          {['submitted', 'confirmed', 'draft'].map(s => (
            <button key={s} className={`adm-nav-item ${filterStatus === s ? 'active' : ''}`}
              onClick={() => { setFilterStatus(s); setView('list'); }}>
              <span className="adm-nav-dot" style={{ background: STATUS_CONFIG[s].dot }}/>
              {STATUS_CONFIG[s].label}
              <span className="adm-nav-badge">{stats[s]}</span>
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-divider"/>

        <nav className="adm-nav">
          <button className={`adm-nav-item ${filterType === 'auto' ? 'active' : ''}`}
            onClick={() => { setFilterType('auto'); setFilterStatus('all'); setView('list'); }}>
            🚗 Auto seulement
            <span className="adm-nav-badge">{stats.auto}</span>
          </button>
          <button className={`adm-nav-item ${filterType === 'moto' ? 'active' : ''}`}
            onClick={() => { setFilterType('moto'); setFilterStatus('all'); setView('list'); }}>
            🏍️ Moto seulement
            <span className="adm-nav-badge">{stats.moto}</span>
          </button>
        </nav>

        <div className="adm-sidebar-footer">
          <a href="/" className="adm-back-link">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Retour au formulaire
          </a>
          {onLogout && (
            <button
              onClick={onLogout}
              className="adm-back-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', marginTop: '8px', color: '#ef4444' }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M10 10l3-3-3-3M13 7H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Se déconnecter
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="adm-main">

        {/* Topbar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            {view === 'detail' && selected ? (
              <button className="adm-back-btn" onClick={() => setView('list')}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Retour à la liste
              </button>
            ) : (
              <h1 className="adm-page-title">
                {filterStatus !== 'all' ? `Devis ${STATUS_CONFIG[filterStatus].label}s`
                  : filterType !== 'all' ? `Devis ${filterType === 'auto' ? 'Auto' : 'Moto'}`
                  : 'Tous les devis'}
                <span className="adm-page-count">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
              </h1>
            )}
          </div>
          <button className="adm-refresh-btn" onClick={() => load(page)} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none"
              style={{ animation: loading ? 'adm-spin .7s linear infinite' : 'none' }}>
              <path d="M13 7.5A5.5 5.5 0 112.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
              <path d="M2.5 1.5v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            Actualiser
          </button>
        </header>

        {/* Stat cards */}
        {view === 'list' && (
          <div className="adm-stats">
            {[
              { label: 'Total',      value: total,           color: '#6366f1', icon: '📋' },
              { label: 'Soumis',     value: stats.submitted, color: '#3b82f6', icon: '📨' },
              { label: 'Confirmés',  value: stats.confirmed, color: '#10b981', icon: '✅' },
              { label: 'Brouillons', value: stats.draft,     color: '#f59e0b', icon: '✏️' },
              { label: 'Auto',       value: stats.auto,      color: '#8b5cf6', icon: '🚗' },
              { label: 'Moto',       value: stats.moto,      color: '#ec4899', icon: '🏍️' },
            ].map(s => (
              <div key={s.label} className="adm-stat-card" style={{ '--accent': s.color }}>
                <span className="adm-stat-icon">{s.icon}</span>
                <span className="adm-stat-value">{s.value}</span>
                <span className="adm-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="adm-error-banner">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M9 5v5M9 12.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
            <button onClick={() => load(page)} className="adm-error-retry">Réessayer</button>
          </div>
        )}

        {/* ══ VUE LISTE ══════════════════════════════════════════════════ */}
        {view === 'list' && (
          <>
            <div className="adm-toolbar">
              <div className="adm-search-wrap">
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none" className="adm-search-icon">
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <input ref={searchRef} className="adm-search" type="text"
                  placeholder="Nom, immatriculation, téléphone…"
                  value={search} onChange={e => setSearch(e.target.value)}/>
                {search && <button className="adm-search-clear" onClick={() => setSearch('')}>✕</button>}
              </div>
              <div className="adm-filters">
                <select className="adm-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="all">Tous les statuts</option>
                  <option value="submitted">Soumis</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="draft">Brouillon</option>
                </select>
                <select className="adm-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option value="all">Auto + Moto</option>
                  <option value="auto">Auto</option>
                  <option value="moto">Moto</option>
                </select>
                {(filterStatus !== 'all' || filterType !== 'all' || search) && (
                  <button className="adm-clear-filters"
                    onClick={() => { setSearch(''); setFilterStatus('all'); setFilterType('all'); }}>
                    ✕ Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="adm-loading"><div className="adm-spinner-lg"/><p>Chargement…</p></div>
            ) : filtered.length === 0 ? (
              <div className="adm-empty">
                <div className="adm-empty-icon">🔍</div>
                <p>Aucun devis ne correspond à vos critères.</p>
                <button className="adm-btn adm-btn-ghost"
                  onClick={() => { setSearch(''); setFilterStatus('all'); setFilterType('all'); }}>
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => toggleSort('id')}>Réf <SortIcon field="id"/></th>
                      <th className="sortable" onClick={() => toggleSort('nom')}>Client <SortIcon field="nom"/></th>
                      <th>Ville</th>
                      <th>Téléphone</th>
                      <th className="sortable" onClick={() => toggleSort('typeAssurance')}>Type <SortIcon field="typeAssurance"/></th>
                      <th>Véhicule / Immat.</th>
                      <th>Valeur vénale</th>
                      <th className="sortable" onClick={() => toggleSort('statut')}>Statut <SortIcon field="statut"/></th>
                      <th className="sortable" onClick={() => toggleSort('createdAt')}>Date <SortIcon field="createdAt"/></th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(q => {
                      const sc = STATUS_CONFIG[q.statut];
                      return (
                        <tr key={q.id} className={`adm-row ${selected?.id === q.id ? 'highlighted' : ''}`}
                          onClick={() => openDetail(q)}>
                          <td className="cell-ref">{fmtId(q.id)}</td>
                          <td className="cell-client">
                            <div className="client-avatar">{q.prenom[0]}{q.nom[0]}</div>
                            <span className="client-name">{q.prenom} {q.nom}</span>
                          </td>
                          <td className="cell-muted">{q.cityNom}</td>
                          <td className="cell-phone">{q.telephone}</td>
                          <td>
                            <span className={`adm-badge type-${q.typeAssurance}`}>
                              {q.typeAssurance === 'auto' ? '🚗 Auto' : '🏍️ Moto'}
                            </span>
                          </td>
                          <td>
                            <div className="cell-vehicle">
                              <span>{q.marqueVehicule}</span>
                              <code className="adm-code sm">{q.immatriculation}</code>
                            </div>
                          </td>
                          <td className="cell-money">{fmtMoney(q.valeurVenale)}</td>
                          <td>
                            <span className="adm-status-badge" style={{ color: sc.color, background: sc.color + '18' }}>
                              <span className="status-dot" style={{ background: sc.dot }}/>
                              {sc.label}
                            </span>
                          </td>
                          <td className="cell-date">{fmtDate(q.createdAt)}</td>
                          <td className="col-actions" onClick={e => e.stopPropagation()}>
                            <div className="adm-row-actions">
                              {q.statut !== 'confirmed' && (
                                <button className="adm-action-btn confirm" title="Confirmer"
                                  disabled={updatingId === q.id}
                                  onClick={() => changeStatus(q, 'confirmed')}>
                                  {updatingId === q.id ? <span className="adm-spinner-xs"/>
                                    : <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                                        <path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                  }
                                </button>
                              )}
                              {q.statut === 'confirmed' && (
                                <button className="adm-action-btn reject" title="Remettre en soumis"
                                  disabled={updatingId === q.id}
                                  onClick={() => changeStatus(q, 'submitted')}>
                                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                                    <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                                  </svg>
                                </button>
                              )}
                              <button className="adm-action-btn view" title="Voir le détail" onClick={() => openDetail(q)}>
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                  <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                                  <path d="M1 7s2-4.5 6-4.5S13 7 13 7s-2 4.5-6 4.5S1 7 1 7z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                                </svg>
                              </button>
                              <button className="adm-action-btn delete" title="Supprimer"
                                disabled={deletingId === q.id}
                                onClick={() => setConfirmDelete(q)}>
                                {deletingId === q.id ? <span className="adm-spinner-xs"/>
                                  : <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                      <path d="M2 3.5h10M5 3.5V2h4v1.5M3 3.5l.7 8h6.6l.7-8"
                                        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                                    </svg>
                                }
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="adm-pagination">
                <button className="adm-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Précédent</button>
                <div className="adm-page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`adm-page-num ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  ))}
                </div>
                <button className="adm-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Suivant →</button>
              </div>
            )}
          </>
        )}

        {/* ══ VUE DÉTAIL ════════════════════════════════════════════════ */}
        {view === 'detail' && selected && (() => {
          const sc = STATUS_CONFIG[selected.statut];
          return (
            <div className="adm-detail">
              <div className="adm-detail-hero">
                <div className="adm-detail-avatar">{selected.prenom[0]}{selected.nom[0]}</div>
                <div className="adm-detail-hero-info">
                  <h2 className="adm-detail-name">{selected.prenom} {selected.nom}</h2>
                  <div className="adm-detail-meta">
                    <span>{fmtId(selected.id)}</span><span className="sep">·</span>
                    <span>{selected.cityNom}</span><span className="sep">·</span>
                    <span>{selected.telephone}</span><span className="sep">·</span>
                    <span>Créé le {fmtDate(selected.createdAt)}</span>
                  </div>
                </div>
                <span className="adm-status-badge lg" style={{ color: sc.color, background: sc.color + '18' }}>
                  <span className="status-dot" style={{ background: sc.dot }}/>{sc.label}
                </span>
              </div>

              <div className="adm-detail-actions">
                <span className="adm-detail-actions-label">Changer le statut :</span>
                {['submitted', 'confirmed', 'draft'].map(s => (
                  <button key={s} className={`adm-status-btn ${selected.statut === s ? 'current' : ''}`}
                    style={selected.statut === s ? { background: STATUS_CONFIG[s].color + '18', borderColor: STATUS_CONFIG[s].color, color: STATUS_CONFIG[s].color } : {}}
                    disabled={updatingId === selected.id || selected.statut === s}
                    onClick={() => changeStatus(selected, s)}>
                    {updatingId === selected.id
                      ? <span className="adm-spinner-xs"/>
                      : <span className="status-dot sm" style={{ background: STATUS_CONFIG[s].dot }}/>
                    }
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
                <button className="adm-status-btn danger-btn" onClick={() => setConfirmDelete(selected)}>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M2 3.5h10M5 3.5V2h4v1.5M3 3.5l.7 8h6.6l.7-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                  </svg>
                  Supprimer
                </button>
              </div>

              <div className="adm-detail-grid">
                <DetailSection title="👤 Informations personnelles">
                  <Dr label="Nom complet"   value={`${selected.prenom} ${selected.nom}`}/>
                  <Dr label="Ville"          value={selected.cityNom}/>
                  <Dr label="Téléphone"      value={selected.telephone}/>
                </DetailSection>
                <DetailSection title="🪪 Conducteur">
                  <Dr label="Date de naissance" value={fmtDate(selected.dateNaissance)}/>
                  <Dr label="Date du permis"    value={fmtDate(selected.datePermis)}/>
                </DetailSection>
                <DetailSection title={`${selected.typeAssurance === 'auto' ? '🚗' : '🏍️'} Véhicule — ${selected.typeAssurance === 'auto' ? 'Automobile' : 'Moto'}`}>
                  <Dr label="Marque"              value={selected.marqueVehicule}/>
                  <Dr label="Carburant"            value={selected.typeCarburant}/>
                  <Dr label="Mise en circulation" value={fmtDate(selected.dateMiseEnCirculation)}/>
                  <Dr label="Nombre de places"    value={String(selected.nombrePlaces)}/>
                  <Dr label="Immatriculation"     value={<code className="adm-code">{selected.immatriculation}</code>}/>
                  {selected.typeAssurance === 'auto' && selected.puissanceFiscale && (
                    <Dr label="Puissance fiscale" value={`${selected.puissanceFiscale} CV`}/>
                  )}
                  {selected.typeAssurance === 'moto' && selected.cylindree && (
                    <Dr label="Cylindrée" value={`${selected.cylindree} cm³`}/>
                  )}
                </DetailSection>
                <DetailSection title="💰 Valeurs financières">
                  <Dr label="Valeur à neuf"  value={<strong>{fmtMoney(selected.valeurNeuf)}</strong>}/>
                  <Dr label="Valeur vénale"  value={<strong>{fmtMoney(selected.valeurVenale)}</strong>}/>
                </DetailSection>
                <DetailSection title="📌 Métadonnées">
                  <Dr label="Référence"  value={fmtId(selected.id)}/>
                  <Dr label="Créé le"    value={new Date(selected.createdAt).toLocaleString('fr-MA')}/>
                  <Dr label="Modifié le" value={new Date(selected.updatedAt).toLocaleString('fr-MA')}/>
                  <Dr label="Statut"     value={
                    <span className="adm-status-badge" style={{ color: sc.color, background: sc.color + '18' }}>
                      <span className="status-dot" style={{ background: sc.dot }}/>{sc.label}
                    </span>
                  }/>
                </DetailSection>
              </div>
            </div>
          );
        })()}
      </main>

      {/* ── Modale de confirmation ────────────────────────────────────── */}
      {confirmDelete && (
        <div className="adm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-icon">🗑️</div>
            <h3 className="adm-modal-title">Supprimer ce devis ?</h3>
            <p className="adm-modal-body">
              Vous êtes sur le point de supprimer le devis <strong>{fmtId(confirmDelete.id)}</strong> de{' '}
              <strong>{confirmDelete.prenom} {confirmDelete.nom}</strong>. Cette action est <strong>irréversible</strong>.
            </p>
            <div className="adm-modal-actions">
              <button className="adm-btn adm-btn-ghost" onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button className="adm-btn adm-btn-danger" onClick={() => doDelete(confirmDelete)}>Oui, supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`adm-toast ${toast.type === 'ok' ? 'adm-toast-ok' : 'adm-toast-err'}`}>
          {toast.type === 'ok'
            ? <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5 8l2.5 2.5 4-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            : <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
          }
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
