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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
                    {/* Image Section */}
                    <div className="model-detail-image-wrapper glass-panel" style={{ padding: '1rem', borderRadius: '16px' }}>
                        <img
                            src={model.hero.image}
                            alt={model.hero.name}
                            style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }}
                        />
                    </div>

                    {/* Details Section */}
                    <div className="model-detail-info">
                        <h1 className="heading-xl text-accent">
                            {model.hero.name}
                            {model.hero.verified && <span style={{ fontSize: '0.5em', marginLeft: '10px', verticalAlign: 'middle', background: 'var(--color-dark-accent)', padding: '2px 8px', borderRadius: '4px', color: '#fff' }}>Verifiziert</span>}
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: '#a0a0a0', marginBottom: '2rem' }}>
                            Standort: {model.hero.city} {model.hero.zip && `(${model.hero.zip})`}
                        </p>

                        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--color-dark-text)' }}>Details</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ color: '#888' }}>Alter</span>
                                    <span>{model.hero.age}</span>
                                </li>
                                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ color: '#888' }}>Maße</span>
                                    <span>{model.measurements}</span>
                                </li>
                                {model.languages && model.languages.length > 0 && (
                                    <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <span style={{ color: '#888' }}>Sprachen</span>
                                        <span>{model.languages.join(', ')}</span>
                                    </li>
                                )}
                                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                    <span style={{ color: '#888' }}>ID</span>
                                    <span>#{model.id}</span>
                                </li>
                            </ul>
                        </div>

                        {model.about && (
                            <div style={{ marginBottom: '2rem', lineHeight: '1.8' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Über mich</h3>
                                <p>{model.about}</p>
                            </div>
                        )}

                        {model.services && model.services.length > 0 && (
                            <div style={{ marginBottom: '2rem', lineHeight: '1.8' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Serviceleistungen</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {model.services.map((service, idx) => (
                                        <span key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>
                                            {service}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--color-dark-text)' }}>Preise</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {model.prices && model.prices.length > 0 ? (
                                    model.prices.map((price, idx) => (
                                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: idx < model.prices.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                                            <span style={{ color: '#bbb' }}>{price.label}</span>
                                            <span className="text-accent">{price.value}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li style={{ padding: '0.5rem 0', color: '#888', fontStyle: 'italic' }}>Auf Anfrage</li>
                                )}
                            </ul>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a href={model.permalink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                Auf Noble Atlas ansehen <ExternalLink size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            {/* Adding basic responsive style via inline style tag for quick demo */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 768px) {
                    .models-page > .container > div[style] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}} />
        </div>
    );
};

export default ModelDetail;
