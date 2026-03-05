import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchNobleAtlasSedcards } from '../services/nobleAtlasService';
import { ExternalLink, ArrowRight } from 'lucide-react';
import './Models.css';

const Models = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchNobleAtlasSedcards();
                setModels(data.items || []);
            } catch (error) {
                console.error("Failed to fetch sedcards", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="models-page theme-dark">
            <section className="section page-header text-center">
                <div className="container animate-fade-in">
                    <h1 className="heading-lg">Unsere <span className="text-accent">Damen</span></h1>
                    <p className="page-subtitle">
                        Wir sind ein Team ständig wechselnder Damen.<br />
                        Die individuelle Anwesenheit erfragst du bitte telefonisch.
                    </p>
                    <div className="noble-atlas-badge">
                        Direkt von <strong>Noble Atlas</strong> Sync
                    </div>
                </div>
            </section>

            <section className="section models-grid-section">
                <div className="container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Sedcards werden geladen...</p>
                        </div>
                    ) : (
                        <div className="models-grid">
                            {models.map((model, index) => (
                                <div
                                    key={model.id}
                                    className="model-card glass-panel animate-fade-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="model-image-wrapper">
                                        <img src={model.hero.image} alt={model.name} className="model-image" />
                                        {model.verified && (
                                            <div className="verified-badge" title="Echtheits-geprüft">
                                                <span>✓</span>
                                            </div>
                                        )}
                                        <div className="model-overlay">
                                            <Link to={`/damen/${model.slug}`} className="btn btn-outline btn-sm">
                                                Profil ansehen <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="model-info">
                                        <div className="model-header">
                                            <h3>{model.name}</h3>
                                            {model.hero.age && <span className="age-tag">{model.hero.age} Jahre</span>}
                                        </div>
                                        <div className="model-meta">
                                            {model.hero.origin && <span>{model.hero.origin}</span>}
                                            {model.hero.city && <span> • {model.hero.city}</span>}
                                        </div>
                                        <p className="model-bio">{model.about}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Light Theme Section for contrast */}
            <section className="section termindamen-section theme-light text-center">
                <div className="container">
                    <h2 className="heading-lg">Auf der Suche nach <span className="text-accent">Termindamen?</span></h2>
                    <p style={{ maxWidth: '600px', margin: '2rem auto' }}>
                        Diese Damen sind immer nur für kurze Zeit bei uns!
                        Alle Damen sind selbständig tätig. Auf Nachfrage werden auch Sonderwünsche erfüllt!
                    </p>
                    <button className="btn btn-primary">Termindamen ansehen</button>
                </div>
            </section>
        </div>
    );
};

export default Models;
