import React from 'react';
import { ArrowRight, Star, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import image5 from '../bilder/5.jpg'; // Import Ambiente image
import './Home.css';

const Home = () => {
    const { t } = useTranslation();

    return (
        <div className="home-page theme-dark">
            {/* Hero Section */}
            <section className="hero-section">
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
                    <h1 className="heading-xl">{t('home.welcome')}<br /><span className="text-accent">Relax Lounge</span></h1>
                    <p className="hero-subtitle">{t('home.subtitle')}</p>
                    <div className="hero-actions">
                        <Button to="/damen" variant="primary" icon={<ArrowRight size={18} />}>
                            {t('home.to_models')}
                        </Button>
                        <Button to="/ambiente-vermietung" variant="outline">
                            {t('home.discover_atmosphere')}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Intro Section - Light Theme (Dark Red on White) */}
            <section className="section intro-section theme-light">
                <div className="container">
                    <div className="intro-grid">
                        <div className="intro-text">
                            <h2 className="heading-lg">{t('home.intro_title')}</h2>
                            <p>
                                {t('home.intro_p1')}
                            </p>
                            <p>
                                {t('home.intro_p2')}
                            </p>
                            <ul className="feature-list">
                                <li><Star size={20} className="text-accent" /> {t('home.feature_fkk')}</li>
                                <li><Star size={20} className="text-accent" /> {t('home.feature_entry')}</li>
                                <li><Heart size={20} className="text-accent" /> {t('home.feature_vibe')}</li>
                            </ul>
                        </div>
                        <div className="intro-image glass-panel">
                            {/* Use one of the high-quality Ambiente images */}
                            <div style={{ height: '400px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `url(${image5}) center/cover`, borderRadius: '8px' }}>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Info Section - Dark Theme (Gold on Black) */}
            <section className="section quick-info-section theme-dark">
                <div className="container text-center">
                    <h2 className="heading-lg">{t('home.enjoy_stay')} <br /><span className="text-accent">{t('home.enjoy_stay_accent')}</span></h2>
                    <p style={{ maxWidth: '600px', margin: '2rem auto', color: '#a0a0a0' }}>
                        {t('home.p_outro')}
                    </p>
                    <Button to="/anfahrt" variant="primary">
                        {t('home.directions')}
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default Home;

