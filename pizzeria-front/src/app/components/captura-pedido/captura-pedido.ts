import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PizzeriaService } from '../../services/pizzeria';

@Component({
  selector: 'app-captura-pedido',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './captura-pedido.html'
})
export class CapturaPedidoComponent implements OnInit {
  pedidoForm!: FormGroup;

  constructor(private fb: FormBuilder, private pizzeriaService: PizzeriaService) {}

  ngOnInit(): void {
    const hoy = new Date().toISOString().split('T')[0];

    this.pedidoForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      fecha: [hoy, Validators.required],
      tamano: ['Chica', Validators.required],
      jamon: [false],
      pina: [false],
      champinones: [false],
      num_pizzas: [1, [Validators.required, Validators.min(1)]]
    });

    this.pedidoForm.valueChanges.subscribe(val => {
      this.pizzeriaService.datosCliente = {
        nombre: val.nombre,
        direccion: val.direccion,
        telefono: val.telefono,
        fecha: val.fecha
      };
    });
  }

  agregar(): void {
    if (this.pedidoForm.get('num_pizzas')?.invalid || this.pedidoForm.get('tamano')?.invalid) {
      alert('Selecciona un tamaño válido y al menos 1 pizza.');
      return;
    }

    const val = this.pedidoForm.value;
    const ingredientesSeleccionados: string[] = [];
    if (val.jamon) ingredientesSeleccionados.push('Jamon');
    if (val.pina) ingredientesSeleccionados.push('Piña');
    if (val.champinones) ingredientesSeleccionados.push('Champiñones');

    this.pizzeriaService.agregarPizza({
      tamano: val.tamano,
      ingredientes: ingredientesSeleccionados,
      num_pizzas: val.num_pizzas
    }).subscribe(() => {
      this.pedidoForm.patchValue({
        tamano: 'Chica',
        jamon: false,
        pina: false,
        champinones: false,
        num_pizzas: 1
      });
    });
  }
}