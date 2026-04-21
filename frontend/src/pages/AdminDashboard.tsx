import React, { useCallback, useEffect, useState } from 'react';
import { quoteApi } from '../services/api';
import type { QuoteResponse } from '../types/quote';

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  draft:     { label: 'Brouillon',  class: 'badge-draft' },
  submitted: { label: 'Soumis',     class: 'badge-submitted' },
  confirmed: { label: 'Confirmé',   class: 'badge-confirmed' },
};

const AdminDashboard: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<QuoteResponse | null>(null);

  const loadQuotes = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await quoteApi.list(p, 10);
      setQuotes(res.data);
      setTotalPages(res.pages);
      setTotal(res.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQuotes(page); }, [page, loadQuotes]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="admin-header-inner">
          <h1 className="admin-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
              <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
              <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
              <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
            </svg>
            Administration — Devis
          </h1>
          <span className="admin-count">{total} devis au total</span>
        </div>
      </header>

      <div className="admin-content">
        {loading ? (
          <div className="loading-state">
            <span className="spinner spinner-lg" />
            <p>Chargement des devis…</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Client</th>
                    <th>Ville</th>
                    <th>Téléphone</th>
                    <th>Type</th>
                    <th>Véhicule</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr key={q.id} className={selected?.id === q.id ? 'row-selected' : ''}>
                      <td className="cell-id">#{String(q.id).padStart(4, '0')}</td>
                      <td className="cell-name">
                        <strong>{q.prenom} {q.nom}</strong>
                      </td>
                      <td>{q.cityNom}</td>
                      <td>{q.telephone}</td>
                      <td>
                        <span className={`badge badge-type-${q.typeAssurance}`}>
                          {q.typeAssurance === 'auto' ? '🚗 Auto' : '🏍️ Moto'}
                        </span>
                      </td>
                      <td>{q.marqueVehicule}</td>
                      <td>
                        <span className={`badge ${STATUS_LABELS[q.statut]?.class ?? ''}`}>
                          {STATUS_LABELS[q.statut]?.label ?? q.statut}
                        </span>
                      </td>
                      <td className="cell-date">{formatDate(q.createdAt)}</td>
                      <td>
                        <button
                          className="btn-icon"
                          onClick={() => setSelected(selected?.id === q.id ? null : q)}
                          title="Voir le détail"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" fill="none" />
                            <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3" fill="none" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {quotes.length === 0 && (
                    <tr>
                      <td colSpan={9} className="empty-row">Aucun devis trouvé.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Précédent
                </button>
                <span className="page-info">Page {page} / {totalPages}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}

        {/* Détail d'un devis */}
        {selected && (
          <div className="detail-panel">
            <div className="detail-panel-header">
              <h2>Devis #{String(selected.id).padStart(6, '0')}</h2>
              <button className="btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="detail-grid">
              {Object.entries({
                'Nom complet': `${selected.prenom} ${selected.nom}`,
                'Ville': selected.cityNom,
                'Téléphone': selected.telephone,
                'Naissance': selected.dateNaissance,
                'Permis': selected.datePermis,
                'Type assurance': selected.typeAssurance,
                'Marque': selected.marqueVehicule,
                'Carburant': selected.typeCarburant,
                'Immatriculation': selected.immatriculation,
                'Valeur à neuf': `${Number(selected.valeurNeuf).toLocaleString('fr-MA')} MAD`,
                'Valeur vénale': `${Number(selected.valeurVenale).toLocaleString('fr-MA')} MAD`,
                'Puissance fiscale': selected.puissanceFiscale ? `${selected.puissanceFiscale} CV` : '—',
                'Cylindrée': selected.cylindree ? `${selected.cylindree} cm³` : '—',
                'Statut': selected.statut,
                'Créé le': new Date(selected.createdAt).toLocaleString('fr-MA'),
              }).map(([k, v]) => (
                <div key={k} className="detail-row">
                  <span className="detail-label">{k}</span>
                  <span className="detail-value">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
