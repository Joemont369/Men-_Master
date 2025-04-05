
import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <h1>Menú Digital - Restaurante</h1>
      <div className="menu-opciones">
        <Link href="/menu">
          <a className="btn primary">Ver Menú</a>
        </Link>
        <Link href="/admin">
          <a className="btn secondary">Administración</a>
        </Link>
      </div>
    </div>
  );
}
