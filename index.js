// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare()
  .then(() => {
    const server = express();

    // Servir archivos estáticos
    server.use(express.static(path.join(__dirname, 'public')));

    // API para verificar estado de sincronización
    server.get('/api/sync-status', (req, res) => {
      res.json({
        online: true,
        timestamp: new Date().toISOString()
      });
    });

    // API Routes from original code (re-integrated)
    // Obtener órdenes
    server.get('/api/ordenes', async (req, res) => {
        try {
            const { obtenerOrdenes } = require('./src/core/ports/backendAPI');
            const ordenes = await obtenerOrdenes();
            res.json(ordenes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Agregar nueva orden
    server.post('/api/ordenes', express.json(), async (req, res) => {
        try {
            const { agregarOrden } = require('./src/core/use-cases/agregarOrden');
            const resultado = await agregarOrden(req.body);
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // API para sincronización del menú temporal
    server.get('/api/menu-temporal/sync', async (req, res) => {
        try {
            const { sincronizarCambiosTemporales } = require('./src/core/use-cases/menu_temporal');
            const resultado = await sincronizarCambiosTemporales();
            res.json(resultado);
        } catch (error) {
            res.status(500).json({ sincronizado: false, error: error.message });
        }
    });

    // API para estadísticas
    server.get('/api/estadisticas/:periodo', async (req, res) => {
        try {
            const { obtenerEstadisticas } = require('./src/core/use-cases/estadisticas');
            const periodo = req.params.periodo || 'semana';
            const estadisticas = await obtenerEstadisticas(periodo);
            res.json(estadisticas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });


    // Manejar todas las demás rutas con Next.js
    server.all('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(PORT, '0.0.0.0', (err) => {
      if (err) throw err;
      console.log(`> Servidor listo en http://0.0.0.0:${PORT}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });