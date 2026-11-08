import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VentasConsulta } from './ventas-consulta';

describe('VentasConsulta', () => {
  let component: VentasConsulta;
  let fixture: ComponentFixture<VentasConsulta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasConsulta],
    }).compileComponents();

    fixture = TestBed.createComponent(VentasConsulta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
