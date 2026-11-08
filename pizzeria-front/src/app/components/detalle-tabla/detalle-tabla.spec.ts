import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleTabla } from './detalle-tabla';

describe('DetalleTabla', () => {
  let component: DetalleTabla;
  let fixture: ComponentFixture<DetalleTabla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleTabla],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleTabla);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
