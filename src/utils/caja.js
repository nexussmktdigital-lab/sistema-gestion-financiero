// Utilidades para cálculo automático de caja diaria
// pesos_actual = pesos_inicial + Σ movimientos del día (ARS)
// dolares_actual = dolares_inicial + Σ movimientos del día (USD)

const today = () => new Date().toISOString().slice(0, 10)

const addDays = (dateStr, delta) => {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

// Movimientos que afectan caja para una fecha dada
export function movimientosDelDia({ cheques = [], divisas = [], creditos = [] }, fecha) {
  const movs = []

  // Cheques cobrados ese día → entra al flujo (+ARS)
  cheques
    .filter(c => c.estado === 'cobrado' && c.fechaCobro === fecha)
    .forEach(c => {
      movs.push({
        id: `cheque-${c.id}`,
        tipo: 'cheque',
        detalle: `Cheque Nº ${c.numeroCheque || '—'} cobrado`,
        pesos: Number(c.importe || 0) - Number(c.comision || 0),
        dolares: 0,
        ref: c,
      })
    })

  // Cheques con destino registrado ese día → sale de caja si destino = gasto/proveedor/credito
  cheques
    .filter(c => c.destino && c.fechaUso === fecha && ['gasto', 'proveedor', 'credito'].includes(c.destino))
    .forEach(c => {
      movs.push({
        id: `cheque-uso-${c.id}`,
        tipo: 'cheque-uso',
        detalle: `Cheque Nº ${c.numeroCheque || '—'} usado en ${c.destino}${c.destinoDetalle ? ' — ' + c.destinoDetalle : ''}`,
        pesos: -Number(c.importe || 0),
        dolares: 0,
        ref: c,
      })
    })

  // Divisas: compra = sale ARS, entra divisa | venta = entra ARS, sale divisa
  divisas
    .filter(d => d.fechaTransaccion === fecha)
    .forEach(d => {
      const monto = Number(d.monto || 0)
      const precio = d.tipoAccion === 'compra' ? Number(d.precioCompra || 0) : Number(d.precioVenta || 0)
      const totalArs = monto * precio
      const isUSD = d.divisa === 'USD'
      if (d.tipoAccion === 'compra') {
        movs.push({
          id: `divisa-${d.id}`,
          tipo: 'divisa-compra',
          detalle: `Compra ${monto} ${d.divisa} @ ${precio}`,
          pesos: -totalArs,
          dolares: isUSD ? monto : 0,
          ref: d,
        })
      } else {
        movs.push({
          id: `divisa-${d.id}`,
          tipo: 'divisa-venta',
          detalle: `Venta ${monto} ${d.divisa} @ ${precio}`,
          pesos: totalArs,
          dolares: isUSD ? -monto : 0,
          ref: d,
        })
      }
    })

  // Créditos emitidos ese día → sale ARS
  creditos
    .filter(c => c.fechaEmision === fecha)
    .forEach(c => {
      movs.push({
        id: `credito-${c.id}`,
        tipo: 'credito',
        detalle: `Crédito otorgado a ${c.nombre}`,
        pesos: -Number(c.importe || 0),
        dolares: 0,
        ref: c,
      })
    })

  return movs
}

// Busca caja del día; si no existe arrastra la del último día cargado
export function cajaParaFecha(cajas, fecha) {
  const match = cajas.find(c => c.fecha === fecha)
  if (match) return { ...match, esArrastre: false }

  // Buscar caja anterior más reciente
  const anteriores = cajas
    .filter(c => c.fecha < fecha)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  if (anteriores.length === 0) {
    return { fecha, pesosInicial: 0, dolaresInicial: 0, esArrastre: true, sinDatos: true }
  }

  // Arrastre: usar el saldo FINAL del día anterior (inicial + movimientos de ese día)
  return { fecha, pesosInicial: 0, dolaresInicial: 0, esArrastre: true, arrastreDe: anteriores[0].fecha }
}

// Calcula saldo final de un día (inicial + movimientos)
export function saldoFinalDelDia(state, fecha) {
  const caja = cajaParaFecha(state.cajas, fecha)
  const movs = movimientosDelDia(state, fecha)
  const deltaPesos = movs.reduce((s, m) => s + m.pesos, 0)
  const deltaDolares = movs.reduce((s, m) => s + m.dolares, 0)
  return {
    pesosInicial: Number(caja.pesosInicial || 0),
    dolaresInicial: Number(caja.dolaresInicial || 0),
    pesosFinal: Number(caja.pesosInicial || 0) + deltaPesos,
    dolaresFinal: Number(caja.dolaresInicial || 0) + deltaDolares,
    movimientos: movs,
    esArrastre: caja.esArrastre,
  }
}

// Saldo sugerido para un nuevo día: toma el saldo final del día anterior si existe
export function saldoSugerido(state) {
  const hoy = today()
  const ayer = addDays(hoy, -1)
  // Busca la caja más reciente ≤ ayer
  const cajasOrdenadas = [...state.cajas].sort((a, b) => b.fecha.localeCompare(a.fecha))
  const ultima = cajasOrdenadas.find(c => c.fecha <= ayer)
  if (!ultima) return { pesos: 0, dolares: 0, fechaReferencia: null }
  const saldo = saldoFinalDelDia(state, ultima.fecha)
  return {
    pesos: saldo.pesosFinal,
    dolares: saldo.dolaresFinal,
    fechaReferencia: ultima.fecha,
  }
}

export { today }
