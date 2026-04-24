// ─── DB (snake_case) → App (camelCase) ──────────────────────────────────────

export const clienteFromDb = (r) => ({
  id: r.id,
  nombre: r.nombre,
  telefono: r.telefono ?? '',
  email: r.email ?? '',
  cuit: r.cuit ?? '',
  direccion: r.direccion ?? '',
  notas: r.notas ?? '',
  createdAt: r.created_at,
})

export const chequeFromDb = (r) => ({
  id: r.id,
  clienteId: r.cliente_id ?? '',
  nombre: r.nombre ?? '',
  telefono: r.telefono ?? '',
  fechaCobro: r.fecha_cobro ?? '',
  numeroCheque: r.numero_cheque ?? '',
  importe: Number(r.importe ?? 0),
  nombreTitular: r.nombre_titular ?? '',
  cuit: r.cuit ?? '',
  vigenciaCuenta: r.vigencia_cuenta ?? '',
  esDigital: r.es_digital ?? false,
  comision: Number(r.comision ?? 0),
  estado: r.estado ?? 'pendiente',
  destino: r.destino ?? '',
  destinoDetalle: r.destino_detalle ?? '',
  fechaUso: r.fecha_uso ?? '',
  notas: r.notas ?? '',
  createdAt: r.created_at,
})

export const cajaDiariaFromDb = (r) => ({
  id: r.id,
  fecha: r.fecha,
  pesosInicial: Number(r.pesos_inicial ?? 0),
  dolaresInicial: Number(r.dolares_inicial ?? 0),
  notas: r.notas ?? '',
  createdAt: r.created_at,
})

export const divisaFromDb = (r) => ({
  id: r.id,
  clienteId: r.cliente_id ?? '',
  nombre: r.nombre ?? '',
  telefono: r.telefono ?? '',
  divisa: r.divisa ?? 'USD',
  tipoAccion: r.tipo_accion ?? 'compra',
  precioCompra: Number(r.precio_compra ?? 0),
  precioVenta: Number(r.precio_venta ?? 0),
  monto: Number(r.monto ?? 0),
  fechaTransaccion: r.fecha_transaccion ?? '',
  notas: r.notas ?? '',
  createdAt: r.created_at,
})

export const creditoFromDb = (r) => ({
  id: r.id,
  clienteId: r.cliente_id ?? '',
  nombre: r.nombre,
  telefono: r.telefono ?? '',
  importe: Number(r.importe ?? 0),
  fechaEmision: r.fecha_emision ?? '',
  cuotas: Number(r.cuotas ?? 0),
  interes: Number(r.interes ?? 0),
  fechaFinalizar: r.fecha_finalizar ?? '',
  cuotasPagadas: Number(r.cuotas_pagadas ?? 0),
  estado: r.estado ?? 'activo',
  notas: r.notas ?? '',
  createdAt: r.created_at,
})

export const alertaFromDb = (r) => ({
  id: r.id,
  clienteId: r.cliente_id ?? '',
  nombre: r.nombre ?? '',
  telefono: r.telefono ?? '',
  monto: Number(r.monto ?? 0),
  fechaAlerta: r.fecha_alerta ?? '',
  descripcion: r.descripcion ?? '',
  tipo: r.tipo ?? 'otro',
  estado: r.estado ?? 'pendiente',
  referenciaId: r.referencia_id ?? '',
  createdAt: r.created_at,
})

// ─── App (camelCase) → DB (snake_case) ──────────────────────────────────────

export const clienteToDb = (c) => ({
  id: c.id,
  nombre: c.nombre,
  telefono: c.telefono || null,
  email: c.email || null,
  cuit: c.cuit || null,
  direccion: c.direccion || null,
  notas: c.notas || null,
  created_at: c.createdAt || undefined,
})

export const chequeToDb = (c) => ({
  id: c.id,
  cliente_id: c.clienteId || null,
  nombre: c.nombre || null,
  telefono: c.telefono || null,
  fecha_cobro: c.fechaCobro || null,
  numero_cheque: c.numeroCheque || null,
  importe: Number(c.importe) || 0,
  nombre_titular: c.nombreTitular || null,
  cuit: c.cuit || null,
  vigencia_cuenta: c.vigenciaCuenta || null,
  es_digital: Boolean(c.esDigital),
  comision: Number(c.comision) || 0,
  estado: c.estado || 'pendiente',
  destino: c.destino || null,
  destino_detalle: c.destinoDetalle || null,
  fecha_uso: c.fechaUso || null,
  notas: c.notas || null,
  created_at: c.createdAt || undefined,
})

export const cajaDiariaToDb = (c) => ({
  id: c.id,
  fecha: c.fecha,
  pesos_inicial: Number(c.pesosInicial) || 0,
  dolares_inicial: Number(c.dolaresInicial) || 0,
  notas: c.notas || null,
})

export const divisaToDb = (d) => ({
  id: d.id,
  cliente_id: d.clienteId || null,
  nombre: d.nombre || null,
  telefono: d.telefono || null,
  divisa: d.divisa,
  tipo_accion: d.tipoAccion,
  precio_compra: Number(d.precioCompra) || null,
  precio_venta: Number(d.precioVenta) || null,
  monto: Number(d.monto) || 0,
  fecha_transaccion: d.fechaTransaccion || null,
  notas: d.notas || null,
  created_at: d.createdAt || undefined,
})

export const creditoToDb = (c) => ({
  id: c.id,
  cliente_id: c.clienteId || null,
  nombre: c.nombre,
  telefono: c.telefono || null,
  importe: Number(c.importe) || 0,
  fecha_emision: c.fechaEmision || null,
  cuotas: Number(c.cuotas) || null,
  interes: Number(c.interes) || 0,
  fecha_finalizar: c.fechaFinalizar || null,
  cuotas_pagadas: Number(c.cuotasPagadas) || 0,
  estado: c.estado || 'activo',
  notas: c.notas || null,
  created_at: c.createdAt || undefined,
})

export const alertaToDb = (a) => ({
  id: a.id,
  cliente_id: a.clienteId || null,
  nombre: a.nombre || null,
  telefono: a.telefono || null,
  monto: Number(a.monto) || 0,
  fecha_alerta: a.fechaAlerta || null,
  descripcion: a.descripcion || null,
  tipo: a.tipo || 'otro',
  estado: a.estado || 'pendiente',
  referencia_id: a.referenciaId || null,
  created_at: a.createdAt || undefined,
})
