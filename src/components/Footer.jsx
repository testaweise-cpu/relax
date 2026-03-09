import React from 'react';
import './Footer.css';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../bilder/logo.png';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="footer theme-dark">
            <div className="container footer-content">
                <div className="footer-brand animate-fade-in">
                    <img src={logo} alt="Relax Lounge" className="footer-logo" />
                    <p className="footer-tagline">{t('footer.tagline')}</p>
                    <div className="contact-info">
                        <div className="info-item">
                            <Phone size={18} className="text-accent" />
                            <span>030 - 8973 1112</span>
                        </div>
                        <div className="info-item">
                            <span className="text-accent" style={{ fontWeight: 'bold', fontSize: '10px' }}>WA</span>
                            <span>0152 - 1362 3235</span>
                        </div>
                        <div className="info-item">
                            <MapPin size={18} className="text-accent" />
                            <span>Lahnstraße 12 (Hinterhaus), 12055 Berlin</span>
                        </div>
                        <div className="info-item">
                            <Clock size={18} className="text-accent" />
                            <span>Mo-Sa: 10:00 - 22:00<br />So: 10:00 - 22:00</span>
                        </div>
                    </div>
                </div>

                <div className="footer-links animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <h3>{t('footer.navigation')}</h3>
                    <ul>
                        <li><Link to="/">{t('nav.home')}</Link></li>
                        <li><Link to="/damen">{t('nav.models')}</Link></li>
                        <li><Link to="/preise">{t('nav.prices')}</Link></li>
                        <li><Link to="/ambiente-vermietung">{t('nav.atmosphere')}</Link></li>
                        <li><Link to="/anfahrt">{t('nav.anfahrt')}</Link></li>
                    </ul>
                </div>

                <div className="footer-disclaimer animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <h3>{t('footer.information')}</h3>
                    <p>
                        {t('footer.fkk_disclaimer')}
                    </p>
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem' }}>
                        <Link to="/impressum" className="text-accent">{t('footer.impressum')}</Link>
                        <Link to="/datenschutz" className="text-accent">{t('footer.datenschutz')}</Link>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Relax Lounge bei Kaisers. {t('footer.rights')}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

