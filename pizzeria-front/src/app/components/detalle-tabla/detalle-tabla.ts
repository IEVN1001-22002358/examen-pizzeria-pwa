import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PizzeriaService } from '../../services/pizzeria';

@Component({
  selector: 'app-detalle-tabla',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-tabla.html'
})
export class DetalleTablaComponent implements OnInit {
  listaPizzas: any[] = [];
  idSeleccionado: number | null = null;
  mensajeFlash: string = '';

  constructor(private pizzeriaService: PizzeriaService) {}

  ngOnInit(): void {
    this.pizzeriaService.carrito$.subscribe(items => {
      this.listaPizzas = items;
      if (items.length > 0 && !this.idSeleccionado) {
        this.idSeleccionado = items[0].id;
      } else if (items.length === 0) {
        this.idSeleccionado = null;
      }
    });
  }

  seleccionarFila(id: number): void {
    this.idSeleccionado = id;
  }

  quitar(): void {
    if (!this.idSeleccionado) {
      alert('Selecciona una pizza de la tabla para quitar.');
      return;
    }
    this.pizzeriaService.quitarPizza(this.idSeleccionado).subscribe(() => {
      this.idSeleccionado = null;
    });
  }

  terminar(): void {
    const cliente = this.pizzeriaService.datosCliente;
    if (!cliente.nombre || !cliente.direccion || !cliente.telefono || !cliente.fecha) {
      alert('Por favor completa Nombre, Dirección, Teléfono y Fecha del cliente antes de terminar.');
      return;
    }

    if (this.listaPizzas.length === 0) {
      alert('Agrega al menos una pizza al pedido.');
      return;
    }

    const totalCalculado = this.listaPizzas.reduce((acc, item) => acc + item.subtotal, 0);
    const confirmar = confirm(`¿Confirmar pedido de ${cliente.nombre}?\nImporte total a pagar: $${totalCalculado}`);

    if (confirmar) {
      this.pizzeriaService.terminarPedido().subscribe({
        next: (res) => {
          this.mensajeFlash = res.mensaje;
          setTimeout(() => this.mensajeFlash = '', 6000);
        },
        error: (err) => alert(err.error?.error || 'Error al guardar el pedido')
      });
    }
  }
}