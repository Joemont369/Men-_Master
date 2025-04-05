import React from 'react';
import '../../styles/table.css';

/**
 * Componente para mostrar productos en una tabla
 * @param {Object} props - Propiedades de la tabla
 * @returns {JSX.Element} - Tabla de productos
 */
function Table({ datos }) {
    return (
        <table className="table-container">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Categoría</th>
                </tr>
            </thead>
            <tbody>
                {datos.map((producto, index) => (
                    <tr key={index}>
                        <td>{producto.nombre}</td>
                        <td>${producto.precio}</td>
                        <td>{producto.categoria}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default Table;
