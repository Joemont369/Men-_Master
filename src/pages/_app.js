
import React from 'react';
import Head from 'next/head';
import '../ui/styles/menu.css';
import '../ui/styles/button.css';
import '../ui/styles/modal.css';
import '../ui/styles/table.css';
import '../ui/styles/tarjetaProducto.css';
import '../ui/styles/carrito.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Menú Digital - Restaurante</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Menú digital para restaurantes y bares" />
        <link rel="icon" href="/favicon.ico" />
        <style jsx global>{`
          :root {
            --primary-color: #0d6efd;
            --secondary-color: #6c757d;
            --success-color: #28a745;
            --danger-color: #dc3545;
            --warning-color: #ffc107;
            --info-color: #17a2b8;
            --light-color: #f8f9fa;
            --dark-color: #343a40;
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #333;
            background-color: #f8f9fa;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 15px;
          }
          
          .btn-sincronizar {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #0d6efd;
            color: white;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s, background-color 0.3s;
            z-index: 1000;
          }
          
          .btn-sincronizar:hover {
            transform: scale(1.1);
            background-color: #0b5ed7;
          }
          
          .sincronizacion-container {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: white;
            padding: 10px 15px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            opacity: 0;
            transform: translateY(-10px);
            transition: opacity 0.3s, transform 0.3s;
            pointer-events: none;
          }
          
          .sincronizacion-container.visible {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
          }
          
          .sincronizando {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .icono-sincronizando {
            animation: girar 1.5s linear infinite;
          }
          
          @keyframes girar {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .menu-container {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-areas:
              "header"
              "content"
              "sidebar";
            gap: 20px;
            padding: 20px;
          }
          
          @media (min-width: 992px) {
            .menu-container {
              grid-template-columns: 3fr 1fr;
              grid-template-areas:
                "header header"
                "content sidebar";
            }
          }
          
          .menu-container h1 {
            grid-area: header;
            margin-top: 0;
          }
          
          .menu-content {
            grid-area: content;
          }
          
          .menu-sidebar {
            grid-area: sidebar;
          }
          
          .productos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
          }
          
          .botones-navegacion {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
          }
          
          .cargando {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
            font-size: 1.2rem;
            color: #6c757d;
          }
          
          .detalle-producto {
            padding: 20px;
          }
          
          .detalle-producto h2 {
            margin-top: 0;
          }
          
          .detalle-producto .descripcion {
            color: #6c757d;
            margin: 15px 0;
          }
          
          .detalle-producto .precio {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 20px;
          }
        `}</style>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
