import React from 'react';
import { Check } from 'lucide-react';
import './Prices.css';

const Prices = () => {
    return (
        <div className="prices-page theme-light">
            <section className="section page-header text-center" style={{ borderBottom: '1px solid rgba(139, 0, 0, 0.1)' }}>
                <div className="container animate-fade-in">
                    <h1 className="heading-lg" style={{ color: 'var(--color-light-accent)' }}>Unsere <span style={{ color: 'var(--color-light-text)' }}>Preise</span></h1>
                    <p className="page-subtitle" style={{ color: '#555', maxWidth: '800px', margin: '1.5rem auto 1rem', lineHeight: '1.6' }}>
                        Liebe Gäste! Bitte beachten Sie, dass die anwesenden Damen ihren Service alle selbständig anbieten und in keinem rechtlichen Tätigkeitsverhältnis zu Relax Lounge bei Kaisers stehen. Verbindliche Absprachen, bezüglich Art des Services, Höhe der Entgelts, finden ausschließlich zwischen den Damen und deren Gästen statt.
                    </p>
                    <p className="page-subtitle" style={{ color: 'var(--color-light-accent)', fontWeight: 'bold' }}>
                        Jedes Zimmer verfügt über eigenes Duschbad.
                    </p>
                </div>
            </section>

            <section className="section pricing-section">
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '3rem' }}>
                        <p style={{ fontSize: '1.2rem', color: '#333' }}>
                            Unsere Grundpreise inklusive Zimmermiete betragen:
                        </p>
                    </div>

                    <div className="pricing-cards">
                        {/* Pricing Card 1 */}
                        <div className="price-card glass-panel animate-fade-in">
                            <div className="price-header">
                                <h3>30 Minuten</h3>
                                <div className="price">
                                    <span className="amount">70</span>
                                    <span className="currency">EUR</span>
                                </div>
                            </div>
                            <ul className="price-features">
                                <li><Check size={18} className="text-accent" /> Inklusive Zimmermiete</li>
                            </ul>
                        </div>

                        {/* Pricing Card 2 */}
                        <div className="price-card glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className="price-header">
                                <h3>45 Minuten</h3>
                                <div className="price">
                                    <span className="amount">90</span>
                                    <span className="currency">EUR</span>
                                </div>
                            </div>
                            <ul className="price-features">
                                <li><Check size={18} className="text-accent" /> Inklusive Zimmermiete</li>
                                <li><Check size={18} className="text-accent" /> Duschen ohne Aufpreis</li>
                                <li><Check size={18} className="text-accent" /> Inkl. Duschtuch & Duschgel</li>
                            </ul>
                        </div>

                        {/* Pricing Card 3 */}
                        <div className="price-card glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="price-header">
                                <h3>60 Minuten</h3>
                                <div className="price">
                                    <span className="amount">120</span>
                                    <span className="currency">EUR</span>
                                </div>
                            </div>
                            <ul className="price-features">
                                <li><Check size={18} className="text-accent" /> Inklusive Zimmermiete</li>
                                <li><Check size={18} className="text-accent" /> Duschen ohne Aufpreis</li>
                                <li><Check size={18} className="text-accent" /> Inkl. Duschtuch & Duschgel</li>
                            </ul>
                        </div>
                    </div>

                    <div className="text-center" style={{ marginTop: '3rem' }}>
                        <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                            * alle Preise inklusive gesetzlicher MwSt.
                        </p>
                        <p style={{ fontSize: '1.2rem', color: 'var(--color-light-accent)', marginTop: '1.5rem', fontWeight: 'bold' }}>
                            Servicepreise erfragst du bitte bei der Dame deiner Wahl.
                        </p>
                    </div>
                </div>
            </section>

            <section className="section text-left" style={{ backgroundColor: 'rgba(139, 0, 0, 0.03)', padding: '4rem 0', borderTop: '1px solid rgba(139, 0, 0, 0.1)' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <h3 style={{ color: 'var(--color-light-text)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Allgemeine Hinweise!</h3>
                    <p style={{ color: '#555', lineHeight: '1.8', fontSize: '0.95rem', textAlign: 'justify' }}>
                        Bitte beachten Sie, dass die anwesenden Damen ihren Service als selbständige Unternehmerinnen anbieten und in keinem rechtlichen Tätigkeitsverhältnis zum Relax Lounge bei Kaisers stehen. Verbindliche Absprachen bezüglich Art des Services, Höhe der Vergütung sowie die Modalitäten der Bezahlung finden ausschließlich zwischen den Damen und deren Gästen statt. Die Dienstleistungen und Präsentationen erfolgen ausschließlich im Auftrag, auf eigenen Namen und Rechnung, der Damen. Es besteht zu keiner Zeit ein begründetes Vertragsverhältnis und keine geschäftliche Beziehung zur Relax Lounge bei Kaisers. Die Fotos der Damen, werden ausschließlich von den betreffenden Damen zur Verfügung gestellt. Diese sind allein verantwortlich für die Darstellung. Die gesamte Präsentation, der Damen auf den Internetseiten von Relax Lounge bei Kaisers, erfolgt ausschließlich im Auftrag, auf eigenen Namen und Rechnung, der Damen.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Prices;
