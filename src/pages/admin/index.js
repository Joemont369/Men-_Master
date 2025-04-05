
import React, { useState, useEffect } from 'react';
import { iniciarSesion, obtenerSesion } from '../../infra/auth/authManager';
import { sincronizarCambiosTemporales } from '../../core/use-cases/menu_temporal';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [error, setError] = useState('');
  const [sincronizacion, setSincronizacion] = useState(null);

  useEffect(() => {
    async function verificarSesion() {
      const { session, error } = await obtenerSesion();
      if (session && !error) {
        setAutenticado(true);
        
        // Verifica si hay cambios temporales para sincronizar
        const resultadoSync = await sincronizarCambiosTemporales();
        setSincronizacion(resultadoSync);
      }
      setCargando(false);
    }
    
    verificarSesion();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const { user, error } = await iniciarSesion(email, password);
      
      if (error) {
        setError('Credenciales incorrectas. Intenta de nuevo.');
        return;
      }
      
      setAutenticado(true);
      
      // Sincroniza cambios temporales al iniciar sesión
      const resultadoSync = await sincronizarCambiosTemporales();
      setSincronizacion(resultadoSync);
    } catch (err) {
      setError('Error al iniciar sesión. Intenta más tarde.');
      console.error(err);
    }
  };

  if (cargando) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="admin-container">
      {!autenticado ? (
        <div className="login-form">
          <h1>Acceso Administrador</h1>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn primary">
              Iniciar Sesión
            </button>
          </form>
        </div>
      ) : (
        <div className="admin-dashboard">
          <h1>Panel de Administración</h1>
          
          {sincronizacion && (
            <div className="sync-info">
              {sincronizacion.sincronizado ? (
                <p className="success">
                  {sincronizacion.cantidadCambios > 0 
                    ? `Se sincronizaron ${sincronizacion.cantidadCambios} cambios correctamente.` 
                    : 'No hay cambios nuevos para sincronizar.'}
                </p>
              ) : (
                <p className="error">Error al sincronizar: {sincronizacion.error}</p>
              )}
            </div>
          )}
          
          <div className="admin-menu">
            <div className="admin-section">
              <h2>Gestión de Menú</h2>
              <ul>
                <li><a href="/admin/bebidas">Editar Bebidas</a></li>
                <li><a href="/admin/alimentos">Editar Alimentos</a></li>
              </ul>
            </div>
            
            <div className="admin-section">
              <h2>Gestión de Órdenes</h2>
              <ul>
                <li><a href="/admin/ordenes">Ver Órdenes</a></li>
                <li><a href="/admin/estadisticas">Estadísticas</a></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
