
const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();
    
    // API Routes
    server.get('/api/ordenes', async (req, res) => {
        try {
            const { obtenerOrdenes } = require('./src/core/ports/backendAPI');
            const ordenes = await obtenerOrdenes();
            res.json(ordenes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Manejar todas las demás rutas con Next.js
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, '0.0.0.0', (err) => {
        if (err) throw err;
        console.log(`> Servidor listo en http://0.0.0.0:${PORT}`);
    });
});
