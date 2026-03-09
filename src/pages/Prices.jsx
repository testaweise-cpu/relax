import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Prices.css';

const Prices = () => {
    const { t } = useTranslation();

    return (
        <div className="prices-page theme-light">
            <section className="section page-header text-center" style={{ borderBottom: '1px solid rgba(139, 0, 0, 0.1)' }}>
                <div className="container animate-fade-in">
                    <h1 className="heading-lg" style={{ color: 'var(--color-light-accent)' }}>{t('prices.title')} <span style={{ color: 'var(--color-light-text)' }}>{t('prices.title_accent')}</span></h1>
                    <p className="page-subtitle" style={{ color: '#555', maxWidth: '800px', margin: '1.5rem auto 1rem', lineHeight: '1.6' }}>
                        {t('prices.disclaimer_p1')}
                    </p>
                    <p className="page-subtitle" style={{ color: 'var(--color-light-accent)', fontWeight: 'bold' }}>
                        {t('prices.disclaimer_p2')}
                    </p>
                </div>
            </section>

            <section className="section pricing-section">
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '3rem' }}>
                        <p style={{ fontSize: '1.2rem', color: '#333' }}>
                            {t('prices.basic_prices')}
                        </p>
                    </div>

                    <div className="pricing-cards">
                        {/* Pricing Card 1 */}
                        <div className="price-card glass-panel animate-fade-in">
                            <div className="price-header">
                                <h3>{t('prices.min_30')}</h3>
                                <div className="price">
                                    <span className="amount">70</span>
                                    <span className="currency">EUR</span>
                                </div>
                            </div>
                            <ul className="price-features">
                                <li><Check size={18} className="text-accent" /> {t('prices.incl_room')}</li>
                            </ul>
                        </div>

                        {/* Pricing Card 2 */}
                        <div className="price-card glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className="price-header">
                                <h3>{t('prices.min_45')}</h3>
                                <div className="price">
                                    <span className="amount">90</span>
                                    <span className="currency">EUR</span>
                                </div>
                            </div>
                            <ul className="price-features">
                                <li><Check size={18} className="text-accent" /> {t('prices.incl_room')}</li>
                                <li><Check size={18} className="text-accent" /> {t('prices.incl_shower')}</li>
                                <li><Check size={18} className="text-accent" /> {t('prices.incl_towel')}</li>
                            </ul>
                        </div>

                        {/* Pricing Card 3 */}
                        <div className="price-card glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="price-header">
                                <h3>{t('prices.min_60')}</h3>
                                <div className="price">
                                    <span className="amount">120</span>
                                    <span className="currency">EUR</span>
                                </div>
                            </div>
                            <ul className="price-features">
                                <li><Check size={18} className="text-accent" /> {t('prices.incl_room')}</li>
                                <li><Check size={18} className="text-accent" /> {t('prices.incl_shower')}</li>
                                <li><Check size={18} className="text-accent" /> {t('prices.incl_towel')}</li>
                            </ul>
                        </div>
                    </div>

                    <div className="text-center" style={{ marginTop: '3rem' }}>
                        <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                            {t('prices.vat_included')}
                        </p>
                        <p style={{ fontSize: '1.2rem', color: 'var(--color-light-accent)', marginTop: '1.5rem', fontWeight: 'bold' }}>
                            {t('prices.ask_service')}
                        </p>
                    </div>
                </div>
            </section>

            <section className="section text-left" style={{ backgroundColor: 'rgba(139, 0, 0, 0.03)', padding: '4rem 0', borderTop: '1px solid rgba(139, 0, 0, 0.1)' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <h3 style={{ color: 'var(--color-light-text)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>{t('prices.general_title')}</h3>
                    <p style={{ color: '#555', lineHeight: '1.8', fontSize: '0.95rem', textAlign: 'justify' }}>
                        {t('prices.general_p')}
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Prices;

