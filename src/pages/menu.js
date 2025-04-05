import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sincronizacion from '../ui/components/Sincronizacion';
import { sincronizarCambiosTemporales } from '../core/use-cases/menu_temporal';
import { guardarLocal, obtenerLocal } from '../infra/localstore/storage';
import { obtenerCocteles } from '../core/entities/cocteles';
import { obtenerCervezas } from '../core/entities/cervezas';
import { obtenerRefrescos } from '../core/entities/refrescos';
import TarjetaProducto from '../ui/components/TarjetaProducto';
import Modal from '../ui/components/Modal';
import Carrito from '../ui/components/Carrito';


export default function MenuPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [categoriaActual, setCategoriaActual] = useState('cocteles');
  const [productos, setProductos] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [carrito, setCarrito] = useState([]);

  // Inicializar dispositivo_id si no existe
  useEffect(() => {
    if (!obtenerLocal('dispositivo_id')) {
      guardarLocal('dispositivo_id', 'tablet-' + Math.random().toString(36).substring(2, 9));
    }

    // Verificar cambios temporales al cargar
    const verificarCambios = async () => {
      try {
        await sincronizarCambiosTemporales();
      } catch (error) {
        console.warn('Error al sincronizar cambios temporales:', error);
      } finally {
        setCargando(false);
      }
    };

    verificarCambios();
  }, []);


  useEffect(() => {
    const cargarProductos = async () => {
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
    };

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
      <Sincronizacion />
      <h1>Menú Digital</h1>

      {cargando ? (
        <div className="cargando">Cargando menú...</div>
      ) : (
        <>
          <p>Página principal del menú</p>
          <div className="botones-navegacion">
            <button className="btn primary" onClick={() => cambiarCategoria('cocteles')}>
              Cócteles
            </button>
            <button className="btn primary" onClick={() => cambiarCategoria('cervezas')}>
              Cervezas
            </button>
            <button className="btn primary" onClick={() => cambiarCategoria('refrescos')}>
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
        </>
      )}
    </div>
  );
}