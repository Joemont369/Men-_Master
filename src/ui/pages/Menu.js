import React, { useState, useEffect } from 'react';
import { enviarOrden, cargarOrdenes } from '../../ports/frontendAPI.js';
import '../../styles/menu.css';
import BotonAgregar from '../components/BotonAgregar';
import Modal from '../components/Modal';
import Table from '../components/Table';
import TarjetaProducto from '../components/TarjetaProducto';
import IconoSubCategoria from '../components/IconoSubCategoria';

function Menu() {
    const [ordenes, setOrdenes] = useState([]);
    const [nuevaOrden, setNuevaOrden] = useState([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    // Cargar órdenes al montar el componente
    useEffect(() => {
        async function obtenerDatos() {
            const datos = await cargarOrdenes();
            setOrdenes(datos);
        }
        obtenerDatos();
    }, []);

    // Manejar la selección de productos
    const agregarProducto = (producto) => {
        setNuevaOrden([...nuevaOrden, producto]);
    };

    // Abrir modal con información del producto seleccionado
    const abrirModal = (producto) => {
        setProductoSeleccionado(producto);
        setModalAbierto(true);
    };

    // Cerrar el modal
    const cerrarModal = () => {
        setModalAbierto(false);
        setProductoSeleccionado(null);
    };

    // Enviar la orden a Supabase
    const confirmarOrden = async () => {
        if (nuevaOrden.length === 0) return;

        const orden = {
            usuario: 'Joel',
            productos: nuevaOrden,
            total: nuevaOrden.length * 100, // Suponiendo precio ficticio
            fecha: new Date().toISOString()
        };

        const resultado = await enviarOrden(orden);
        if (resultado) {
            setOrdenes([...ordenes, orden]);
            setNuevaOrden([]);
        }
    };

    return (
        <div className="menu-container">
            <h1>Menú Digital</h1>

            <div className="productos">
                {['Tequila', 'Pizza', 'Cerveza', 'Ron'].map((producto) => (
                    <TarjetaProducto 
                        key={producto}
                        nombre={producto}
                        imagen={`ruta/${producto}.jpg`} // Ajusta la ruta de imágenes
                        precio={100} // Precio ficticio
                        onAgregar={agregarProducto}
                    />
                ))}
            </div>

            <div className="orden">
                <h2>Tu orden:</h2>
                <ul>
                    {nuevaOrden.map((producto, index) => (
                        <li key={index}>
                            {producto} <IconoSubCategoria categoria={producto.toLowerCase()} />
                        </li>
                    ))}
                </ul>
                <BotonAgregar text="Confirmar Orden" onClick={confirmarOrden} />
            </div>

            <div className="historial">
                <h2>Órdenes anteriores:</h2>
                <Table datos={ordenes} />
            </div>

            <Modal isOpen={modalAbierto} onClose={cerrarModal}>
                {productoSeleccionado && (
                    <div>
                        <h2>{productoSeleccionado}</h2>
                        <p>Más información sobre {productoSeleccionado}...</p>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Menu;
