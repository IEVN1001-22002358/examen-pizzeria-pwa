import { Component } from '@angular/core';
import { CapturaPedidoComponent } from './components/captura-pedido/captura-pedido';
import { DetalleTablaComponent } from './components/detalle-tabla/detalle-tabla';
import { VentasConsultaComponent } from './components/ventas-consulta/ventas-consulta';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CapturaPedidoComponent, DetalleTablaComponent, VentasConsultaComponent],
  templateUrl: './app.html'
})
export class App {}