import React from 'react';
import '../../styles/iconoSubCategoria.css';

/**
 * Componente para mostrar un ícono de subcategoría
 * @param {Object} props - Propiedades del ícono
 * @returns {JSX.Element} - Ícono de la subcategoría
 */
function IconoSubCategoria({ categoria }) {
    const iconos = {
        tequila: '🍹',
        whisky: '🥃',
        cerveza: '🍺',
        ron: '🍾',
        comida: '🍽️'
    };

    return (
        <span className="icono-subcategoria">
            {iconos[categoria] || '❓'}
        </span>
    );
}

export default IconoSubCategoria;
