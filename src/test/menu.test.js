import { agregarProducto, confirmarOrden } from '../core/use-cases/menu';

test('Agregar producto a la orden', () => {
    const nuevaOrden = [];
    agregarProducto(nuevaOrden, 'Ron');
    expect(nuevaOrden).toContain('Ron');
});

test('Confirmar orden correctamente', async () => {
    const orden = {
        usuario: 'Joel',
        productos: ['Tequila', 'Pizza'],
        total: 200,
        fecha: new Date().toISOString()
    };

    const resultado = await confirmarOrden(orden);
    expect(resultado).toBeTruthy(); // Verifica que la orden se guardó correctamente
});
