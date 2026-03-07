import React from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';
import './Location.css';
import Button from '../components/Button';

const Location = () => {
    return (
        <div className="location-page theme-dark">
            {/* Hero Section - Matching Home Page Style */}
            <section className="hero-section small-hero">
                <div className="hero-video-container">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="hero-video"
                    >
                        <source src="https://www.mona-roses.com/wp-content/uploads/2020/08/bockhaus_dancing.mp4" type="video/mp4" />
                    </video>
                </div>
                <div className="hero-overlay"></div>
                <div className="container hero-content animate-fade-in">
                    <h1 className="heading-lg">Dein Weg zur <br /><span className="text-accent">Relax Lounge</span></h1>
                    <p className="hero-subtitle">Mitten im Herzen von Berlin Neukölln.</p>
                </div>
            </section>

            <section className="section map-section">
                <div className="container">
                    <div className="location-grid">

                        {/* Info Panel - Premium Glass Style */}
                        <div className="info-panel glass-panel animate-fade-in">
                            <h2 className="heading-lg" style={{ fontSize: '2rem', marginBottom: '2.5rem' }}>Adresse & <span className="text-accent">Kontakt</span></h2>

                            <div className="info-block">
                                <div className="info-icon-wrapper">
                                    <MapPin className="text-accent" size={24} />
                                </div>
                                <div className="info-text-content">
                                    <h3>Standort</h3>
                                    <p>Lahnstraße 12</p>
                                    <p>12055 Berlin - Neukölln</p>
                                    <p className="hint">Eingang im Hinterhaus Souterrain</p>
                                </div>
                            </div>

                            <div className="info-block">
                                <div className="info-icon-wrapper">
                                    <Clock className="text-accent" size={24} />
                                </div>
                                <div className="info-text-content">
                                    <h3>Öffnungszeiten</h3>
                                    <p>Täglich von 10:00 - 22:00 Uhr</p>
                                    <p className="hint">Diskretion ist unsere Priorität</p>
                                </div>
                            </div>

                            <div className="info-block">
                                <div className="info-icon-wrapper">
                                    <Navigation className="text-accent" size={24} />
                                </div>
                                <div className="info-text-content">
                                    <h3>Anfahrt & Parken</h3>
                                    <p>Zentrale Lage in Neukölln.</p>
                                    <p>Gute Parkmöglichkeiten in der Nähe.</p>
                                </div>
                            </div>

                            <div className="info-actions" style={{ marginTop: '3rem' }}>
                                <Button
                                    to="https://www.google.com/maps/dir/?api=1&destination=Lahnstra%C3%9Fe+12,+12055+Berlin"
                                    variant="primary"
                                    style={{ width: '100%' }}
                                    external
                                >
                                    Route berechnen
                                </Button>
                            </div>
                        </div>

                        {/* Map Embed - Clean Styling */}
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
                                style={{ filter: 'grayscale(1) invert(0.9) contrast(1.2) brightness(0.9)', border: 'none' }}
                            ></iframe>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Location;
