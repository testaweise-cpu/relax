import React from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';
import './Location.css';
import Button from '../components/Button';

const Location = () => {
    return (
        <div className="location-page theme-light">
            <section className="section page-header text-center" style={{ borderBottom: '1px solid rgba(139, 0, 0, 0.1)' }}>
                <div className="container animate-fade-in">
                    <h1 className="heading-lg" style={{ color: 'var(--color-light-accent)' }}>Dein <span style={{ color: 'var(--color-light-text)' }}>Weg zu uns</span></h1>
                    <p className="page-subtitle" style={{ color: '#555' }}>
                        Zentral gelegen in Berlin Neukölln. <br />
                        Der Eingang befindet sich im Hinterhaus Souterrain.
                    </p>
                </div>
            </section>

            <section className="section map-section">
                <div className="container">
                    <div className="location-grid">

                        {/* Info Panel - Dark Theme */}
                        <div className="info-panel theme-dark glass-panel animate-fade-in">
                            <h2 className="heading-lg" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Adresse & <span className="text-accent">Kontakt</span></h2>

                            <div className="info-block">
                                <MapPin className="text-accent info-icon" size={24} />
                                <div>
                                    <h3>Standort</h3>
                                    <p>Lahnstraße 12</p>
                                    <p>12055 Berlin - Neukölln</p>
                                    <p className="hint">Eingang im Hinterhaus Souterrain</p>
                                </div>
                            </div>

                            <div className="info-block">
                                <Clock className="text-accent info-icon" size={24} />
                                <div>
                                    <h3>Öffnungszeiten</h3>
                                    <p>Montag - Samstag: 10:00 - 22:00 Uhr</p>
                                    <p>Sonntag: 10:00 - 22:00 Uhr</p>
                                </div>
                            </div>

                            <div className="info-block">
                                <Navigation className="text-accent info-icon" size={24} />
                                <div>
                                    <h3>Parken</h3>
                                    <p>Normale Parkplatzsituation.</p>
                                    <p>In der Nähe bekannter Supermarkt.</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem' }}>
                                <a
                                    href="https://www.openstreetmap.org/?mlat=52.469298&mlon=13.454414#map=19/52.469298/13.454414"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    Größere Karte anzeigen
                                </a>
                            </div>
                        </div>

                        {/* Map Embed */}
                        <div className="map-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight="0"
                                marginWidth="0"
                                title="Lahnstraße 12 Map"
                                src="https://www.openstreetmap.org/export/embed.html?bbox=13.451414,52.467298,13.457414,52.471298&layer=mapnik&marker=52.469298,13.454414"
                                style={{ border: '1px solid rgba(139, 0, 0, 0.2)', borderRadius: '8px' }}
                            ></iframe>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Location;
