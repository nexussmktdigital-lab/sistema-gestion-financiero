import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { FileCheck, ArrowLeftRight, CreditCard, Bell, Users, TrendingUp, AlertCircle } from 'lucide-react'
import Header from '../layout/Header'
import { useApp } from '../../context/AppContext'
import { formatCurrency, formatDate, getDaysUntil } from '../../utils/formatters'
import clsx from 'clsx'

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA']

function StatCard({ icon: Icon, label, value, sub, color = 'blue', onClick }) {
  const colorMap = {
    blue: 'text-apple-blue bg-blue-50',
    green: 'text-apple-green bg-green-50',
    orange: 'text-apple-orange bg-orange-50',
    red: 'text-apple-red bg-red-50',
    purple: 'text-apple-purple bg-purple-50',
  }
  return (
    <div
      className={clsx('stat-card', onClick && 'cursor-pointer hover:shadow-apple-lg transition-shadow duration-200')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className={clsx('w-10 h-10 rounded-apple flex items-center justify-center', colorMap[color])}>
          <Icon size={20} />
        </div>
        <TrendingUp size={14} className="text-apple-gray-300" />
      </div>
      <div>
        <p className="text-xl md:text-2xl font-bold text-apple-gray-900">{value}</p>
        <p className="text-sm text-apple-gray-500">{label}</p>
        {sub && <p className="text-xs text-apple-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-apple-gray-100 rounded-apple shadow-apple px-3 py-2">
      <p className="text-xs font-semibold text-apple-gray-800 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' && entry.value > 100
            ? formatCurrency(entry.value)
            : entry.value}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { state } = useApp()
  const navigate = useNavigate()
  const { cheques, divisas, creditos, alertas, clientes } = state

  const stats = useMemo(() => {
    const totalCheques = cheques.reduce((s, c) => s + Number(c.importe || 0), 0)
    const totalDivisas = divisas.reduce((s, d) => {
      const monto = Number(d.monto || 0)
      const precio = d.tipoAccion === 'compra' ? Number(d.precioCompra || 0) : Number(d.precioVenta || 0)
      return s + monto * precio
    }, 0)
    const totalCreditos = creditos.filter(c => c.estado !== 'completado').reduce((s, c) => s + Number(c.importe || 0), 0)
    const pendingAlerts = alertas.filter(a => a.estado === 'pendiente').length
    return { totalCheques, totalDivisas, totalCreditos, pendingAlerts }
  }, [cheques, divisas, creditos, alertas])

  // Pie chart data
  const pieData = [
    { name: 'Cheques', value: stats.totalCheques },
    { name: 'Divisas', value: stats.totalDivisas },
    { name: 'Créditos', value: stats.totalCreditos },
  ].filter(d => d.value > 0)

  // Monthly evolution (last 6 months)
  const monthlyData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('es-AR', { month: 'short' })
      const chequeTotal = cheques.filter(c => c.fechaCobro?.startsWith(key)).reduce((s, c) => s + Number(c.importe || 0), 0)
      const divisaTotal = divisas.filter(d2 => d2.fechaTransaccion?.startsWith(key)).reduce((s, d2) => s + Number(d2.monto || 0) * Number(d2.precioVenta || d2.precioCompra || 0), 0)
      const creditoTotal = creditos.filter(c => c.fechaEmision?.startsWith(key)).reduce((s, c) => s + Number(c.importe || 0), 0)
      months.push({ mes: label, Cheques: chequeTotal, Divisas: divisaTotal, Créditos: creditoTotal })
    }
    return months
  }, [cheques, divisas, creditos])

  // Credits by status
  const creditosStatus = useMemo(() => {
    const map = { activo: 0, mora: 0, completado: 0 }
    creditos.forEach(c => { if (map[c.estado] !== undefined) map[c.estado]++ })
    return [
      { name: 'Activos', value: map.activo, fill: '#34C759' },
      { name: 'En mora', value: map.mora, fill: '#FF3B30' },
      { name: 'Completados', value: map.completado, fill: '#8E8E93' },
    ]
  }, [creditos])

  // Upcoming cheques (next 7 days)
  const upcomingCheques = useMemo(() =>
    cheques
      .filter(c => c.estado === 'pendiente')
      .map(c => ({ ...c, dias: getDaysUntil(c.fechaCobro) }))
      .filter(c => c.dias !== null && c.dias <= 7 && c.dias >= 0)
      .sort((a, b) => a.dias - b.dias)
      .slice(0, 5),
    [cheques]
  )

  // Upcoming credits (installments due soon)
  const creditosMora = creditos.filter(c => c.estado === 'mora').slice(0, 5)

  return (
    <div>
      <Header title="Dashboard" subtitle={`${new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`} />

      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={Users} label="Clientes" color="blue"
            value={clientes.length}
            sub="total registrados"
            onClick={() => navigate('/clientes')}
          />
          <StatCard
            icon={FileCheck} label="Cheques" color="orange"
            value={formatCurrency(stats.totalCheques)}
            sub={`${cheques.filter(c => c.estado === 'pendiente').length} pendientes`}
            onClick={() => navigate('/cheques')}
          />
          <StatCard
            icon={CreditCard} label="Créditos activos" color="green"
            value={formatCurrency(stats.totalCreditos)}
            sub={`${creditos.filter(c => c.estado === 'activo').length} créditos`}
            onClick={() => navigate('/creditos')}
          />
          <StatCard
            icon={Bell} label="Alertas pendientes" color="red"
            value={stats.pendingAlerts}
            sub="requieren atención"
            onClick={() => navigate('/alertas')}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Area chart */}
          <div className="card lg:col-span-2 p-5">
            <h3 className="text-sm font-semibold text-apple-gray-800 mb-4">Evolución mensual</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  {['#007AFF', '#34C759', '#FF9500'].map((color, i) => (
                    <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8E8E93' }} axisLine={false} tickLine={false} tickFormatter={v => v > 999 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="Cheques" stroke="#007AFF" fill="url(#grad0)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Divisas" stroke="#34C759" fill="url(#grad1)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Créditos" stroke="#FF9500" fill="url(#grad2)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="card p-5 flex flex-col">
            <h3 className="text-sm font-semibold text-apple-gray-800 mb-4">Distribución de capital</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-apple-gray-400">
                Sin datos aún
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cheques próximos */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-apple-gray-800">Cheques próximos (7 días)</h3>
              <button onClick={() => navigate('/cheques')} className="text-xs text-apple-blue hover:underline">Ver todos</button>
            </div>
            {upcomingCheques.length === 0 ? (
              <p className="text-sm text-apple-gray-400 text-center py-6">Sin cheques próximos a vencer</p>
            ) : (
              <div className="space-y-2">
                {upcomingCheques.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-apple-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-apple-gray-800">{c.nombreTrae}</p>
                      <p className="text-xs text-apple-gray-400">Nº {c.numeroCheque} · {formatDate(c.fechaCobro)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-apple-gray-900">{formatCurrency(c.importe)}</p>
                      <span className={clsx('text-xs font-medium', c.dias === 0 ? 'text-apple-red' : c.dias <= 2 ? 'text-apple-orange' : 'text-apple-green')}>
                        {c.dias === 0 ? 'Hoy' : `En ${c.dias} días`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Créditos barra */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-apple-gray-800">Estado de créditos</h3>
              <button onClick={() => navigate('/creditos')} className="text-xs text-apple-blue hover:underline">Ver todos</button>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={creditosStatus} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip cursor={{ fill: '#F5F5F7' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {creditosStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {creditosMora.length > 0 && (
              <div className="mt-3 pt-3 border-t border-apple-gray-50">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircle size={13} className="text-apple-red" />
                  <p className="text-xs font-semibold text-apple-red">Créditos en mora</p>
                </div>
                {creditosMora.map(c => (
                  <div key={c.id} className="flex justify-between text-xs py-1">
                    <span className="text-apple-gray-700">{c.nombre}</span>
                    <span className="text-apple-gray-500 font-medium">{formatCurrency(c.importe)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
