import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import './Rooms.css';

// Import Ambiente images
import img5 from '../bilder/5.jpg';
import img6 from '../bilder/6.jpg';
import img7 from '../bilder/7.jpg';
import img8 from '../bilder/8.jpg';

const Rooms = () => {
    const { t } = useTranslation();

    return (
        <div className="rooms-page theme-dark">
            <section className="section page-header text-center">
                <div className="container animate-fade-in">
                    <h1 className="heading-lg">{t('rooms.title')} <span className="text-accent">{t('rooms.title_accent')}</span></h1>
                    <p className="page-subtitle">
                        {t('rooms.subtitle')}
                    </p>
                </div>
            </section>

            <section className="section rooms-split-section">
                <div className="container">
                    <div className="split-layout">
                        <div className="split-text animate-fade-in">
                            <h2 className="heading-lg">{t('rooms.your_workspace')}</h2>
                            <p>
                                {t('rooms.p1')}
                            </p>
                            <p>
                                {t('rooms.p2')}
                            </p>
                            <div style={{ marginTop: '2rem' }}>
                                <Button to="/anfahrt" variant="primary">{t('rooms.come_by')}</Button>
                            </div>
                        </div>
                        <div className="split-image glass-panel animate-fade-in" style={{ animationDelay: '0.2s', padding: '1.5rem' }}>
                            <div className="rooms-image-grid">
                                <img src={img5} alt="Relax Lounge Ambiente 1" />
                                <img src={img6} alt="Relax Lounge Ambiente 2" />
                                <img src={img7} alt="Relax Lounge Ambiente 3" />
                                <img src={img8} alt="Relax Lounge Ambiente 4" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Seitensprung Section - Light Theme for contrast */}
            <section className="section theme-light seitensprung-section">
                <div className="container text-center">
                    <h2 className="heading-lg">{t('rooms.adventure_title')} <span className="text-accent">{t('rooms.adventure_accent')}</span></h2>
                    <h3 style={{ fontSize: '1.5rem', marginTop: '1rem', color: '#555' }}>{t('rooms.need_place')}</h3>
                    <p style={{ maxWidth: '600px', margin: '2rem auto' }}>
                        {t('rooms.discrete_p')}
                    </p>
                    <Button variant="outline" onClick={() => window.location.href = 'tel:015151576857'}>
                        {t('rooms.call_for_details')}
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default Rooms;

