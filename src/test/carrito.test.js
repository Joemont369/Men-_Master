import { agregarProducto, calcularTotal } from '../core/use-cases/carrito';

test('Agregar producto al carrito', () => {
    const carrito = [];
    agregarProducto(carrito, 'Tequila');
    expect(carrito).toContain('Tequila');
});

test('Calcular total del carrito', () => {
    const carrito = ['Tequila', 'Cerveza', 'Pizza'];
    const total = calcularTotal(carrito);
    expect(total).toBe(300); // Suponiendo precio ficticio de 100 por producto
});
