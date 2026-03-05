import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

const Button = ({ children, to, onClick, variant = 'primary', className = '', icon }) => {
    const baseClass = `custom-btn btn-${variant} ${className}`;

    if (to) {
        return (
            <Link to={to} className={baseClass}>
                {children} {icon && <span className="btn-icon">{icon}</span>}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={baseClass}>
            {children} {icon && <span className="btn-icon">{icon}</span>}
        </button>
    );
};

export default Button;
