
import React, { useState, useEffect } from 'react';
import { guardarLocal, obtenerLocal } from '../../infra/localstore/storage';
import { agregarOrden } from '../../core/use-cases/agregarOrden';
import { sincronizarCambiosTemporales } from '../../core/use-cases/sincronizacion';

const Carrito = ({ items = [], setItems }) => {
  const [total, setTotal] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');
  const [clienteInfo, setClienteInfo] = useState({
    mesa: '',
    nombre: '',
    notas: ''
  });

  // Calcular el total cada vez que cambian los items
  useEffect(() => {
    const nuevoTotal = items.reduce((suma, item) => {
      const precio = item.precio || item.precio_copa || 0;
      return suma + precio;
    }, 0);
    setTotal(nuevoTotal);
    
    // Guardar el carrito en localStorage
    guardarLocal('carrito_actual', items);
  }, [items]);

  // Cargar carrito guardado al iniciar
  useEffect(() => {
    const carritoGuardado = obtenerLocal('carrito_actual');
    if (carritoGuardado && Array.isArray(carritoGuardado) && carritoGuardado.length > 0) {
      setItems(carritoGuardado);
    }
  }, []);

  const eliminarItem = (index) => {
    const nuevosItems = [...items];
    nuevosItems.splice(index, 1);
    setItems(nuevosItems);
  };

  const vaciarCarrito = () => {
    setItems([]);
    guardarLocal('carrito_actual', []);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClienteInfo({
      ...clienteInfo,
      [name]: value
    });
  };

  const finalizarOrden = async () => {
    if (items.length === 0) {
      setMensajeConfirmacion('El carrito está vacío');
      setTimeout(() => setMensajeConfirmacion(''), 3000);
      return;
    }

    if (!clienteInfo.mesa) {
      setMensajeConfirmacion('Por favor, indique el número de mesa');
      setTimeout(() => setMensajeConfirmacion(''), 3000);
      return;
    }

    setEnviando(true);
    
    // Intentar sincronizar antes de enviar la orden
    try {
      await sincronizarCambiosTemporales();
    } catch (error) {
      console.warn('No se pudo sincronizar antes de enviar la orden:', error);
      // Continuamos de todos modos
    }
    try {
      // Preparar datos de la orden
      const orden = {
        items: items.map(item => ({
          id: item.id,
          nombre: item.nombre,
          precio: item.precio || item.precio_copa,
          categoria: item.categoria || 'bebida'
        })),
        total,
        dispositivo_id: obtenerLocal('dispositivo_id'),
        fecha: new Date().toISOString(),
        mesa: clienteInfo.mesa,
        cliente: clienteInfo.nombre,
        notas: clienteInfo.notas,
        estado: 'pendiente'
      };

      // Intentar guardar en Supabase
      let resultado;
      try {
        resultado = await agregarOrden(orden);
      } catch (error) {
        console.warn('Error al guardar orden en Supabase:', error);
        // Guardar localmente para sincronizar después
        const ordenesLocales = obtenerLocal('ordenes_locales') || [];
        ordenesLocales.push({...orden, pendiente: true});
        guardarLocal('ordenes_locales', ordenesLocales);
        
        resultado = {id: 'local-' + Date.now()};
      }

      // Vaciar carrito después de enviar
      setItems([]);
      guardarLocal('carrito_actual', []);
      
      // Mostrar confirmación
      setMensajeConfirmacion(`¡Orden #${resultado?.id || 'pendiente'} enviada con éxito!`);
      setTimeout(() => setMensajeConfirmacion(''), 5000);
      
      // Limpiar formulario
      setClienteInfo({
        mesa: '',
        nombre: '',
        notas: ''
      });
    } catch (error) {
      console.error('Error al finalizar orden:', error);
      setMensajeConfirmacion('Error al enviar la orden. Intente nuevamente.');
      setTimeout(() => setMensajeConfirmacion(''), 3000);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="carrito-container">
      <h2>Tu Orden</h2>
      
      {mensajeConfirmacion && (
        <div className={`mensaje-confirmacion ${mensajeConfirmacion.includes('Error') ? 'error' : 'exito'}`}>
          {mensajeConfirmacion}
        </div>
      )}
      
      {items.length === 0 ? (
        <p className="carrito-vacio">El carrito está vacío</p>
      ) : (
        <>
          <ul className="items-lista">
            {items.map((item, index) => (
              <li key={index} className="item-carrito">
                <div className="item-info">
                  <span className="item-nombre">{item.nombre}</span>
                  <span className="item-precio">${item.precio || item.precio_copa}</span>
                </div>
                <button 
                  className="btn-eliminar" 
                  onClick={() => eliminarItem(index)}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
          
          <div className="carrito-total">
            <span>Total:</span>
            <span className="precio-total">${total.toFixed(2)}</span>
          </div>
          
          <div className="carrito-acciones">
            <button 
              className="btn secondary" 
              onClick={vaciarCarrito}
              disabled={enviando}
            >
              Vaciar
            </button>
          </div>
        </>
      )}
      
      <div className="formulario-cliente">
        <h3>Datos de la orden</h3>
        
        <div className="form-group">
          <label htmlFor="mesa">Mesa #:</label>
          <input
            type="text"
            id="mesa"
            name="mesa"
            value={clienteInfo.mesa}
            onChange={handleInputChange}
            placeholder="Obligatorio"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={clienteInfo.nombre}
            onChange={handleInputChange}
            placeholder="Opcional"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="notas">Notas especiales:</label>
          <textarea
            id="notas"
            name="notas"
            value={clienteInfo.notas}
            onChange={handleInputChange}
            placeholder="Instrucciones especiales"
            rows="2"
          ></textarea>
        </div>
      </div>
      
      <button 
        className="btn primary btn-finalizar" 
        onClick={finalizarOrden}
        disabled={enviando || items.length === 0}
      >
        {enviando ? 'Enviando...' : 'Finalizar Orden'}
      </button>
    </div>
  );
};

export default Carrito;
