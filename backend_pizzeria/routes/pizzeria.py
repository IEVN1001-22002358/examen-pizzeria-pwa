from flask import Blueprint, jsonify, request
from flask_mysqldb import MySQL

pizzeria_bp = Blueprint('pizzeria', __name__)
mysql = MySQL()

PRECIOS_TAMANO = {'Chica': 40, 'Mediana': 80, 'Grande': 120}
PRECIO_INGREDIENTE = 10

DIAS_MAP = {
    'lunes': 2, 'martes': 3, 'miercoles': 4, 'miércoles': 4,
    'jueves': 5, 'viernes': 6, 'sabado': 7, 'sábado': 7, 'domingo': 1
}

MESES_MAP = {
    'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
    'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
}

@pizzeria_bp.route('/temporal', methods=['GET'])
def obtener_temporal():
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, tamano, ingredientes, num_pizzas, subtotal FROM detalle_temporal")
    filas = cur.fetchall()
    cur.close()
    carrito = [
        {'id': f[0], 'tamano': f[1], 'ingredientes': f[2], 'num_pizzas': f[3], 'subtotal': float(f[4])}
        for f in filas
    ]
    return jsonify(carrito)

@pizzeria_bp.route('/temporal', methods=['POST'])
def agregar_temporal():
    data = request.json
    tamano = data.get('tamano')
    ingredientes = data.get('ingredientes', [])
    num_pizzas = int(data.get('num_pizzas', 1))

    precio_base = PRECIOS_TAMANO.get(tamano, 0)
    costo_ing = len(ingredientes) * PRECIO_INGREDIENTE
    subtotal = (precio_base + costo_ing) * num_pizzas
    ing_str = ", ".join(ingredientes) if ingredientes else "Sin ingredientes"

    cur = mysql.connection.cursor()
    cur.execute(
        "INSERT INTO detalle_temporal (tamano, ingredientes, num_pizzas, subtotal) VALUES (%s, %s, %s, %s)",
        (tamano, ing_str, num_pizzas, subtotal)
    )
    mysql.connection.commit()
    cur.close()
    return jsonify({'mensaje': 'Pizza agregada al detalle', 'subtotal': subtotal}), 201

@pizzeria_bp.route('/temporal/<int:id>', methods=['DELETE'])
def quitar_temporal(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM detalle_temporal WHERE id = %s", (id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({'mensaje': 'Pizza eliminada del detalle'})


@pizzeria_bp.route('/pedidos/terminar', methods=['POST'])
def terminar_pedido():
    data = request.json
    nombre = data.get('nombre')
    direccion = data.get('direccion')
    telefono = data.get('telefono')
    fecha = data.get('fecha')

    cur = mysql.connection.cursor()
    cur.execute("SELECT tamano, ingredientes, num_pizzas, subtotal FROM detalle_temporal")
    items = cur.fetchall()

    if not items:
        cur.close()
        return jsonify({'error': 'No hay pizzas en el pedido actual'}), 400

    total = sum(float(item[3]) for item in items)

    cur.execute(
        "INSERT INTO pedidos (nombre, direccion, telefono, fecha, total) VALUES (%s, %s, %s, %s, %s)",
        (nombre, direccion, telefono, fecha, total)
    )
    pedido_id = cur.lastrowid

    for item in items:
        cur.execute(
            "INSERT INTO detalle_pedido (pedido_id, tamano, ingredientes, num_pizzas, subtotal) VALUES (%s, %s, %s, %s, %s)",
            (pedido_id, item[0], item[1], item[2], item[3])
        )

    cur.execute("TRUNCATE TABLE detalle_temporal")
    mysql.connection.commit()
    cur.close()

    return jsonify({
        'mensaje': f'Pedido confirmado exitosamente. Total a pagar: ${total:.2f}',
        'total': total,
        'pedido_id': pedido_id
    }), 201


@pizzeria_bp.route('/ventas', methods=['GET'])
def consultar_ventas():
    tipo = request.args.get('tipo', '').lower()
    valor = request.args.get('valor', '').lower().strip()

    cur = mysql.connection.cursor()
    ventas = []

    if tipo == 'dia' and valor in DIAS_MAP:
        num_dia = DIAS_MAP[valor]
        cur.execute("SELECT id, nombre, fecha, total FROM pedidos WHERE DAYOFWEEK(fecha) = %s", (num_dia,))
        ventas = cur.fetchall()
    elif tipo == 'mes' and valor in MESES_MAP:
        num_mes = MESES_MAP[valor]
        cur.execute("SELECT id, nombre, fecha, total FROM pedidos WHERE MONTH(fecha) = %s", (num_mes,))
        ventas = cur.fetchall()
    else:
        cur.execute("SELECT id, nombre, fecha, total FROM pedidos ORDER BY fecha DESC")
        ventas = cur.fetchall()

    cur.close()

    lista_ventas = [
        {'id': v[0], 'nombre': v[1], 'fecha': v[2].strftime('%Y-%m-%d'), 'total': float(v[3])}
        for v in ventas
    ]
    total_acumulado = sum(v['total'] for v in lista_ventas)

    return jsonify({'ventas': lista_ventas, 'total_acumulado': total_acumulado})

@pizzeria_bp.route('/ventas/<int:pedido_id>/detalle', methods=['GET'])
def detalle_venta(pedido_id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT tamano, ingredientes, num_pizzas, subtotal FROM detalle_pedido WHERE pedido_id = %s", (pedido_id,))
    detalles = cur.fetchall()
    cur.close()

    desglose = [
        {'tamano': d[0], 'ingredientes': d[1], 'num_pizzas': d[2], 'subtotal': float(d[3])}
        for d in detalles
    ]
    return jsonify(desglose)