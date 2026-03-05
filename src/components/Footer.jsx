import React from 'react';
import './Footer.css';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../bilder/logo.png';

const Footer = () => {
    return (
        <footer className="footer theme-dark">
            <div className="container footer-content">
                <div className="footer-brand animate-fade-in">
                    <img src={logo} alt="Relax Lounge" className="footer-logo" />
                    <p className="footer-tagline">Dein exklusiver Club in Berlin Neukölln.</p>
                    <div className="contact-info">
                        <div className="info-item">
                            <Phone size={18} className="text-accent" />
                            <span>0151 51576857</span>
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
                    <h3>Navigation</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/damen">Damen</Link></li>
                        <li><Link to="/preise">Preise</Link></li>
                        <li><Link to="/ambiente-vermietung">Ambiente & Vermietung</Link></li>
                        <li><Link to="/anfahrt">Anfahrt</Link></li>
                    </ul>
                </div>

                <div className="footer-disclaimer animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <h3>Information</h3>
                    <p>
                        Wir möchten ausdrücklich darauf hinweisen, dass wir kein FKK-Club sind und keinen Eintritt erheben.
                    </p>
                    <div style={{ marginTop: '2rem' }}>
                        <Link to="/#impressum" className="text-accent">Impressum & Datenschutz</Link>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Relax Lounge bei Kaisers. Alle Rechte vorbehalten.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
