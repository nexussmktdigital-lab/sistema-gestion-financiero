import { v4 as uuidv4 } from 'uuid'

/**
 * Dado un { clienteId, nombre, telefono } del formulario,
 * si no hay clienteId pero hay nombre, crea el cliente y retorna el nuevo id.
 * Si ya hay clienteId retorna ese mismo.
 * Llama dispatch({ type: 'ADD_CLIENTE', payload }) si corresponde.
 */
export function resolveClienteId({ clienteId, nombre, telefono }, dispatch) {
  if (clienteId) return clienteId
  if (!nombre?.trim()) return ''

  const newId = uuidv4()
  dispatch({
    type: 'ADD_CLIENTE',
    payload: {
      id: newId,
      nombre: nombre.trim(),
      telefono: telefono || '',
      email: '',
      cuit: '',
      direccion: '',
      notas: 'Creado automáticamente desde formulario',
      createdAt: new Date().toISOString().slice(0, 10),
    },
  })
  return newId
}
