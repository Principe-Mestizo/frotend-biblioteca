export interface IPrestamoResponse {
  prestamo_id:               string;
  libro_id:                  string;
  libro_titulo:              string;
  usuario_id:                string;
  usuario_nombre:            string;
  fecha_prestamo:            Date;
  fecha_devolucion_esperada: Date;
  fecha_devolucion_real:     null;
}
