import React from 'react';
import '../../styles/tarjetaProducto.css';

/**
 * Componente para mostrar un producto con imagen y precio
 * @param {Object} props - Propiedades del producto
 * @returns {JSX.Element} - Tarjeta con información del producto
 */
function TarjetaProducto({ nombre, imagen, precio, onAgregar }) {
    return (
        <div className="tarjeta-producto">
            <img src={imagen} alt={nombre} className="producto-imagen" />
            <h3>{nombre}</h3>
            <p className="producto-precio">${precio}</p>
            <button className="agregar-btn" onClick={() => onAgregar(nombre)}>Agregar</button>
        </div>
    );
}

export default TarjetaProducto;
