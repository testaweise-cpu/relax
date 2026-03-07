import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieBanner.css';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('relax_lounge_cookies');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('relax_lounge_cookies', 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-banner glass-panel animate-fade-in-up">
            <div className="cookie-content">
                <p>
                    Wir verwenden Cookies, um die Nutzererfahrung zu verbessern.
                    Details finden Sie in unserer <Link to="/datenschutz">Datenschutzerklärung</Link>.
                </p>
                <div className="cookie-actions">
                    <button onClick={handleAccept} className="btn btn-primary btn-sm">
                        Akzeptieren
                    </button>
                    <button onClick={handleAccept} className="btn btn-outline btn-sm">
                        Nur Notwendige
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
