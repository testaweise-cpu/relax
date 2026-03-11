import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './CookieBanner.css';

const CookieBanner = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('relax_lounge_cookies');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = (type) => {
        localStorage.setItem('relax_lounge_cookies', type);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-banner-wrapper">
            <div className="cookie-banner glass-panel animate-fade-in-up">
                <div className="cookie-content">
                    <h3>Cookies & Privacy</h3>
                    <p>
                        {t('cookie.text')} {t('cookie.privacy_link')}{' '}
                        <Link to="/datenschutz">{t('datenschutz.title')}</Link>.
                    </p>
                    <div className="cookie-actions">
                        <button onClick={() => handleAccept('all')} className="btn btn-primary btn-sm">
                            {t('cookie.accept')}
                        </button>
                        <button onClick={() => handleAccept('necessary')} className="btn btn-outline btn-sm">
                            {t('cookie.necessary')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
