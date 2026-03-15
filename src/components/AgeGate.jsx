import React, { useState, useEffect } from 'react';
import './AgeGate.css';

const AgeGate = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Clear old age gate consent to force reappearance for all users
        localStorage.removeItem('relax_lounge_age_check');

        const hasAccepted = localStorage.getItem('relax_lounge_age_check_v2');
        if (!hasAccepted) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('relax_lounge_age_check_v2', 'true');
        setIsVisible(false);
        document.body.style.overflow = 'auto';
    };

    const handleReject = () => {
        window.location.href = 'https://www.google.com';
    };

    if (!isVisible) return null;

    return (
        <div className="age-gate-overlay">
            <div className="age-gate-modal glass-panel animate-fade-in">
                <div className="age-gate-logo">
                    <span className="text-accent">FSK 18</span>
                </div>
                <h2>Altersprüfung</h2>
                <p>
                    Diese Webseite enthält Inhalte für Erwachsene.<br />
                    Bist du mindestens 18 Jahre alt?
                </p>
                <div className="age-gate-actions">
                    <button onClick={handleAccept} className="btn btn-primary">
                        Ja, ich bin 18+
                    </button>
                    <button onClick={handleReject} className="btn btn-outline">
                        Nein, verlassen
                    </button>
                </div>
                <div className="age-gate-footer">
                    Durch Betreten der Seite akzeptierst du unsere Nutzungsbedingungen.
                </div>
            </div>
        </div>
    );
};

export default AgeGate;
