import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PizzeriaService } from '../../services/pizzeria';

@Component({
  selector: 'app-ventas-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas-consulta.html'
})
export class VentasConsultaComponent implements OnInit {
  tipoFiltro: string = 'dia';
  valorFiltro: string = '';
  ventas: any[] = [];
  totalAcumulado: number = 0;

  ventaSeleccionada: any = null;
  desgloseVenta: any[] = [];

  constructor(private pizzeriaService: PizzeriaService) {}

  ngOnInit(): void {
    this.cargarVentas();
    this.pizzeriaService.ventasRefresh$.subscribe(() => {
      this.cargarVentas();
    });
  }

  cargarVentas(): void {
    this.pizzeriaService.consultarVentas(this.tipoFiltro, this.valorFiltro).subscribe(res => {
      this.ventas = res.ventas;
      this.totalAcumulado = res.total_acumulado;
      this.ventaSeleccionada = null;
      this.desgloseVenta = [];
    });
  }

  verDetalle(venta: any): void {
    this.ventaSeleccionada = venta;
    this.pizzeriaService.obtenerDetalleVenta(venta.id).subscribe(detalles => {
      this.desgloseVenta = detalles;
    });
  }
}