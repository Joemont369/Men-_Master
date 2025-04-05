import React from 'react';
import '../../styles/modal.css';

/**
 * Componente de modal reutilizable
 * @param {Object} props - Propiedades del modal
 * @returns {JSX.Element} - Ventana emergente con contenido
 */
function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <button className="close-btn" onClick={onClose}>✖</button>
                {children}
            </div>
        </div>
    );
}

export default Modal;
