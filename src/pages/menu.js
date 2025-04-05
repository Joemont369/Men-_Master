
import React, { useState, useEffect } from 'react';
import { obtenerCocteles } from '../core/entities/cocteles';
import { obtenerCervezas } from '../core/entities/cervezas';
import { obtenerRefrescos } from '../core/entities/refrescos';
import TarjetaProducto from '../ui/components/TarjetaProducto';
import Modal from '../ui/components/Modal';
import Carrito from '../ui/components/Carrito';

export default function MenuPage() {
  const [categoriaActual, setCategoriaActual] = useState('cocteles');
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    async function cargarProductos() {
      setCargando(true);
      let data = [];
      
      switch (categoriaActual) {
        case 'cocteles':
          data = await obtenerCocteles();
          break;
        case 'cervezas':
          data = await obtenerCervezas();
          break;
        case 'refrescos':
          data = await obtenerRefrescos();
          break;
        default:
          data = [];
      }
      
      setProductos(data);
      setCargando(false);
    }
    
    cargarProductos();
  }, [categoriaActual]);

  const cambiarCategoria = (categoria) => {
    setCategoriaActual(categoria);
  };

  const abrirModal = (producto) => {
    setProductoSeleccionado(producto);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoSeleccionado(null);
  };

  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto]);
  };

  return (
    <div className="menu-container">
      <div className="menu-categorias">
        <button 
          className={`btn ${categoriaActual === 'cocteles' ? 'primary' : 'secondary'}`}
          onClick={() => cambiarCategoria('cocteles')}
        >
          Cócteles
        </button>
        <button 
          className={`btn ${categoriaActual === 'cervezas' ? 'primary' : 'secondary'}`}
          onClick={() => cambiarCategoria('cervezas')}
        >
          Cervezas
        </button>
        <button 
          className={`btn ${categoriaActual === 'refrescos' ? 'primary' : 'secondary'}`}
          onClick={() => cambiarCategoria('refrescos')}
        >
          Refrescos
        </button>
      </div>

      <div className="menu-content">
        {cargando ? (
          <p>Cargando productos...</p>
        ) : (
          <div className="productos-grid">
            {productos.map((producto) => (
              <TarjetaProducto 
                key={producto.id}
                producto={producto}
                onVerDetalles={() => abrirModal(producto)}
                onAgregarCarrito={() => agregarAlCarrito(producto)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="menu-sidebar">
        <Carrito items={carrito} setItems={setCarrito} />
      </div>

      <Modal isOpen={modalAbierto} onClose={cerrarModal}>
        {productoSeleccionado && (
          <div className="detalle-producto">
            <h2>{productoSeleccionado.nombre}</h2>
            {productoSeleccionado.video_url && (
              <video controls width="100%">
                <source src={productoSeleccionado.video_url} type="video/mp4" />
                Tu navegador no soporta videos.
              </video>
            )}
            <p className="descripcion">{productoSeleccionado.descripcion || 'Sin descripción disponible'}</p>
            <div className="precio">
              Precio: ${productoSeleccionado.precio || productoSeleccionado.precio_copa}
            </div>
            <button 
              className="btn primary" 
              onClick={() => {
                agregarAlCarrito(productoSeleccionado);
                cerrarModal();
              }}
            >
              Agregar al carrito
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
