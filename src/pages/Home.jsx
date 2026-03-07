import React from 'react';
import { ArrowRight, Star, Heart } from 'lucide-react';
import Button from '../components/Button';
import image5 from '../bilder/5.jpg'; // Import Ambiente image
import './Home.css';

const Home = () => {
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
                    <h1 className="heading-xl">Willkommen in der<br /><span className="text-accent">Relax Lounge</span></h1>
                    <p className="hero-subtitle">Dein exklusiver Treffpunkt in Berlin Neukölln.</p>
                    <div className="hero-actions">
                        <Button to="/damen" variant="primary" icon={<ArrowRight size={18} />}>
                            Zu den Damen
                        </Button>
                        <Button to="/ambiente-vermietung" variant="outline">
                            Ambiente entdecken
                        </Button>
                    </div>
                </div>
            </section>

            {/* Intro Section - Light Theme (Dark Red on White) */}
            <section className="section intro-section theme-light">
                <div className="container">
                    <div className="intro-grid">
                        <div className="intro-text">
                            <h2 className="heading-lg">Entspanne in purer Eleganz</h2>
                            <p>
                                Wir begrüßen Dich herzlich in der Relax Lounge bei Kaisers.
                                Erlebe unvergessliche Momente in einer stressfreien und diskreten Atmosphäre.
                            </p>
                            <p>
                                Jetzt auch Sonntags von 10 Uhr bis 22 Uhr für euch da!
                            </p>
                            <ul className="feature-list">
                                <li><Star size={20} className="text-accent" /> Kein FKK-Club</li>
                                <li><Star size={20} className="text-accent" /> Kein Eintritt</li>
                                <li><Heart size={20} className="text-accent" /> Familiäre Atmosphäre</li>
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
                    <h2 className="heading-lg">Wir wünschen Ihnen einen <br /><span className="text-accent">schönen Aufenthalt</span></h2>
                    <p style={{ maxWidth: '600px', margin: '2rem auto', color: '#a0a0a0' }}>
                        Lass den Alltag hinter dir und genieße die Zeit bei uns.
                        Unser Team aus ständig wechselnden, bezaubernden Damen freut sich auf deinen Besuch.
                    </p>
                    <Button to="/anfahrt" variant="primary">
                        Wegbeschreibung
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default Home;
