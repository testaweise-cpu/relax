import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { fetchNobleAtlasSedcard } from '../services/nobleAtlasService';
import Button from '../components/Button';

const ModelDetail = () => {
    const { identifier } = useParams();
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadModel = async () => {
            try {
                setLoading(true);
                const data = await fetchNobleAtlasSedcard(identifier);
                if (data) {
                    setModel(data);
                } else {
                    setError('Model nicht gefunden.');
                }
            } catch (err) {
                console.error(err);
                setError('Fehler beim Laden der Modelldaten.');
            } finally {
                setLoading(false);
            }
        };

        if (identifier) {
            loadModel();
        }
    }, [identifier]);

    if (loading) {
        return (
            <div className="models-page theme-dark" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Lade Sedcard...</p>
                </div>
            </div>
        );
    }

    if (error || !model) {
        return (
            <div className="models-page theme-dark" style={{ minHeight: '100vh', paddingTop: '100px', textAlign: 'center' }}>
                <div className="container">
                    <h2 className="heading-lg text-accent">Entschuldigung</h2>
                    <p>{error || 'Das angefragte Modell konnte nicht gefunden werden.'}</p>
                    <div style={{ marginTop: '2rem' }}>
                        <Button to="/damen" variant="outline" icon={<ArrowLeft size={18} />}>
                            Zurück zur Übersicht
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="models-page theme-dark" style={{ minHeight: '100vh', paddingTop: '100px' }}>
            <div className="container">
                <Link to="/damen" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', marginBottom: '2rem' }}>
                    <ArrowLeft size={14} style={{ marginRight: '0.5rem' }} /> Zurück
                </Link>

                <div className="model-detail-container">
                    {/* Left: Hero Image */}
                    <div className="model-main-image glass-panel">
                        <img
                            src={model.hero.image}
                            alt={model.name}
                            className="img-fluid"
                        />
                        {model.verified && (
                            <div className="verified-status-badge">
                                <span>Verifiziert</span>
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="model-main-info">
                        <div className="model-title-section">
                            <h1 className="heading-xl text-accent">{model.name}</h1>
                            <div className="model-quick-meta">
                                {model.hero.age && <span>{model.hero.age} Jahre</span>}
                                {model.hero.origin && <span> • {model.hero.origin}</span>}
                                {model.hero.city && <span> • {model.hero.city}</span>}
                            </div>
                        </div>

                        <div className="model-about-section">
                            <h3 className="section-title">Über mich</h3>
                            <p className="model-description">{model.about}</p>
                        </div>

                        {(model.services?.length > 0 || model.languages?.length > 0) && (
                            <div className="model-tags-container">
                                {model.services?.length > 0 && (
                                    <div className="tag-group">
                                        <h4 className="small-label">Serviceleistungen</h4>
                                        <div className="tags">
                                            {model.services.map(s => <span key={s} className="tag">{s}</span>)}
                                        </div>
                                    </div>
                                )}
                                {model.languages?.length > 0 && (
                                    <div className="tag-group">
                                        <h4 className="small-label">Sprachen</h4>
                                        <div className="tags">
                                            {model.languages.map(l => <span key={l} className="tag">{l}</span>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="model-pricing-section glass-panel">
                            <h3 className="section-title">Preise</h3>
                            <div className="price-list">
                                {model.prices?.length > 0 ? (
                                    model.prices.map((p, i) => (
                                        <div key={i} className="price-row">
                                            <span className="price-label">{p.label}</span>
                                            <span className="price-value text-accent">{p.value}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-prices text-muted">Preise auf Anfrage.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery Section */}
                {model.gallery?.length > 1 && (
                    <section className="model-gallery-section" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
                        <h2 className="heading-lg" style={{ marginBottom: '2rem' }}>Galerie</h2>
                        <div className="model-gallery-grid">
                            {model.gallery.map((img, i) => (
                                <div key={i} className="gallery-item glass-panel">
                                    <img src={img.thumb} alt={`${model.name} Galerie ${i + 1}`} loading="lazy" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .model-detail-container {
                    display: grid;
                    grid-template-columns: 1fr 1.2fr;
                    gap: 3rem;
                    align-items: start;
                }
                .model-main-image {
                    position: relative;
                    padding: 10px;
                    border-radius: 20px;
                }
                .model-main-image img {
                    width: 100%;
                    border-radius: 12px;
                    display: block;
                }
                .verified-status-badge {
                    position: absolute;
                    top: 25px;
                    right: 25px;
                    background: #10B981;
                    color: white;
                    padding: 6px 15px;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: bold;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                .model-quick-meta {
                    color: #a0a0a0;
                    font-size: 1.2rem;
                    margin-top: 0.5rem;
                    margin-bottom: 2rem;
                }
                .section-title {
                    font-size: 1.4rem;
                    margin-bottom: 1rem;
                    color: var(--color-dark-text);
                }
                .model-description {
                    line-height: 1.8;
                    color: #d0d0d0;
                    margin-bottom: 2rem;
                    white-space: pre-line;
                }
                .tag-group {
                    margin-bottom: 1.5rem;
                }
                .small-label {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #666;
                    margin-bottom: 0.8rem;
                }
                .tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .tag {
                    background: rgba(255,255,255,0.05);
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    color: #ccc;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .price-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .price-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.8rem 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .price-row:last-child {
                    border-bottom: none;
                }
                .model-gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 1.5rem;
                }
                .gallery-item {
                    padding: 5px;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .gallery-item img {
                    width: 100%;
                    height: 250px;
                    object-fit: cover;
                    border-radius: 8px;
                    transition: transform 0.3s ease;
                }
                .gallery-item:hover img {
                    transform: scale(1.05);
                }
                @media (max-width: 992px) {
                    .model-detail-container {
                        grid-template-columns: 1fr;
                    }
                }
            ` }} />
        </div>
    );
};

export default ModelDetail;
