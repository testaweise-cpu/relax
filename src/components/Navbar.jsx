import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';
import logo from '../bilder/logo.png';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
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
    }, [location]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Damen', path: '/damen' },
        { name: 'Preise', path: '/preise' },
        { name: 'Ambiente & Vermietung', path: '/ambiente-vermietung' },
        { name: 'Anfahrt', path: '/anfahrt' },
    ];

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

                    {/* Quicklink WhatsApp/Phone */}
                    <a href="https://wa.me/4915224388301" target="_blank" rel="noopener noreferrer" className="nav-link quicklink-btn">
                        <MessageCircle size={18} />
                        Jetzt anfragen
                    </a>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="mobile-toggle desktop-hidden"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
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
                <a href="https://wa.me/4915224388301" target="_blank" rel="noopener noreferrer" className="mobile-link quicklink-btn-mobile">
                    <MessageCircle size={18} />
                    Jetzt anfragen
                </a>
            </div>
        </nav>
    );
};

export default Navbar;
