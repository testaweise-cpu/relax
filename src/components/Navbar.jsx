import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logo from '../bilder/logo.png';
import './Navbar.css';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setIsOpen(false);
        setLangMenuOpen(false);
    }, [location]);

    const navLinks = [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.models'), path: '/damen' },
        { name: t('nav.prices'), path: '/preise' },
        { name: t('nav.atmosphere'), path: '/ambiente-vermietung' },
        { name: t('nav.anfahrt'), path: '/anfahrt' },
    ];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setLangMenuOpen(false);
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-content">
                <Link to="/" className="brand">
                    <img src={logo} alt="Relax Lounge" className="navbar-logo" />
                </Link>

                {/* Desktop Nav */}
                <div className="nav-links desktop-only">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="lang-switcher">
                        <button
                            className="nav-link lang-btn"
                            onClick={() => setLangMenuOpen(!langMenuOpen)}
                            aria-label="Change language"
                        >
                            <Globe size={18} />
                            <span>{i18n.language?.toUpperCase()?.substring(0, 2) || 'DE'}</span>
                        </button>
                        {langMenuOpen && (
                            <div className="lang-dropdown glass-panel">
                                <button onClick={() => changeLanguage('de')} className={i18n.language.startsWith('de') ? 'active' : ''}>Deutsch</button>
                                <button onClick={() => changeLanguage('en')} className={i18n.language.startsWith('en') ? 'active' : ''}>English</button>
                            </div>
                        )}
                    </div>

                    {/* Quicklink WhatsApp/Phone */}
                    <a href="https://wa.me/4915213623235" target="_blank" rel="noopener noreferrer" className="nav-link quicklink-btn">
                        <MessageCircle size={18} />
                        {t('nav.contact_now')}
                    </a>
                </div>

                {/* Mobile Toggle */}
                <div className="mobile-actions desktop-hidden">
                    <button
                        className="mobile-lang-btn"
                        onClick={() => changeLanguage(i18n.language.startsWith('de') ? 'en' : 'de')}
                    >
                        {i18n.language.startsWith('de') ? 'EN' : 'DE'}
                    </button>
                    <button
                        className="mobile-toggle"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <div className={`mobile-menu ${isOpen ? 'open' : ''} desktop-hidden`}>
                {navLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                    >
                        {link.name}
                    </Link>
                ))}

                {/* Mobile Quicklink */}
                <a href="https://wa.me/4915213623235" target="_blank" rel="noopener noreferrer" className="mobile-link quicklink-btn-mobile">
                    <MessageCircle size={18} />
                    {t('nav.contact_now')}
                </a>
            </div>
        </nav>
    );
};

export default Navbar;

