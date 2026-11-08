import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PizzeriaService {
  private apiUrl = 'http://127.0.0.1:5000/api';

  private carritoSubject = new BehaviorSubject<any[]>([]);
  carrito$ = this.carritoSubject.asObservable();

  private ventasRefreshSubject = new BehaviorSubject<void>(undefined);
  ventasRefresh$ = this.ventasRefreshSubject.asObservable();

  datosCliente = {
    nombre: '',
    direccion: '',
    telefono: '',
    fecha: new Date().toISOString().split('T')[0]
  };

  constructor(private http: HttpClient) {
    this.cargarCarrito();
  }

  cargarCarrito(): void {
    this.http.get<any[]>(`${this.apiUrl}/temporal`).subscribe(data => {
      this.carritoSubject.next(data);
    });
  }

  agregarPizza(pizza: { tamano: string; ingredientes: string[]; num_pizzas: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/temporal`, pizza).pipe(
      tap(() => this.cargarCarrito())
    );
  }

  quitarPizza(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/temporal/${id}`).pipe(
      tap(() => this.cargarCarrito())
    );
  }

  terminarPedido(): Observable<any> {
    return this.http.post(`${this.apiUrl}/pedidos/terminar`, this.datosCliente).pipe(
      tap(() => {
        this.cargarCarrito();
        this.ventasRefreshSubject.next();
      })
    );
  }

  consultarVentas(tipo: string = '', valor: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}/ventas?tipo=${tipo}&valor=${valor}`);
  }

  obtenerDetalleVenta(pedidoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ventas/${pedidoId}/detalle`);
  }
}