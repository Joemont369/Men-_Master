import React from 'react';
import '../../styles/button.css';

/**
 * Componente de botón reutilizable
 * @param {Object} props - Propiedades del botón
 * @returns {JSX.Element} - Botón personalizado
 */
function Button({ text, onClick, type = 'primary' }) {
    return (
        <button className={`btn ${type}`} onClick={onClick}>
            {text}
        </button>
    );
}

export default Button;
