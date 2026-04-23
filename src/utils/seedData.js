import { v4 as uuidv4 } from 'uuid'

export const getSeedData = () => ({
  clientes: [
    {
      id: uuidv4(),
      nombre: 'Martín García',
      telefono: '1145678901',
      email: 'martin.garcia@email.com',
      cuit: '20-12345678-9',
      direccion: 'Av. Corrientes 1234, CABA',
      notas: 'Cliente frecuente',
      createdAt: '2024-01-15',
    },
    {
      id: uuidv4(),
      nombre: 'Laura Fernández',
      telefono: '1156789012',
      email: 'laura.fernandez@email.com',
      cuit: '27-23456789-0',
      direccion: 'Belgrano 567, GBA',
      notas: '',
      createdAt: '2024-02-20',
    },
    {
      id: uuidv4(),
      nombre: 'Carlos Rodríguez',
      telefono: '1167890123',
      email: 'carlos.rodriguez@email.com',
      cuit: '20-34567890-1',
      direccion: 'San Martín 890, Rosario',
      notas: 'Empresario pyme',
      createdAt: '2024-03-10',
    },
  ],
  cheques: [],
  divisas: [],
  creditos: [],
  alertas: [],
})
