import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { auditoriaApi, eventosApi } from '../services/api';

interface AuditoriaItem {
  id_auditoria: number;
  id_entrada: number;
  id_funcionario: string;
  id_dispositivo: number | null;
  codigo_qr_validado: string;
  fecha_hora_validacion: string;
  id_evento: number;
  id_estadio: number;
  nombre_sector: string;
  resultado_validacion: string;
}

const EXITOSO = 'EXITOSO';

const COLOR_EXITOSO = '#4ade80';
const COLORES_FALLO: Record<string, string> = {
  QR_INCOMPLETO: '#f87171',
  FIRMA_INVALIDA: '#fb923c',
  QR_EXPIRADO: '#facc15',
  NO_AUTORIZADO: '#a78bfa',
  SIN_ASIGNACION: '#60a5fa',
  DISPOSITIVO_INVALIDO: '#34d399',
  QR_INVALIDO: '#f472b6',
  YA_USADA: '#94a3b8',
  ERROR_INTERNO: '#ef4444',
};

const Auditoria = () => {
  const [data, setData] = useState<AuditoriaItem[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [eventoFiltro, setEventoFiltro] = useState<string>('');
  const [resultadoFiltro, setResultadoFiltro] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const [auditoria, evs] = await Promise.all([
          auditoriaApi.listar(),
          eventosApi.listar(),
        ]);
        setData(auditoria);
        setEventos(evs);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  // Datos filtrados para gráficas y tabla
  const datosFiltradosPorEvento = eventoFiltro
    ? data.filter(d => String(d.id_evento) === eventoFiltro)
    : data;

  const datosFiltrados = resultadoFiltro
    ? datosFiltradosPorEvento.filter(d => d.resultado_validacion === resultadoFiltro)
    : datosFiltradosPorEvento;

  // Pie chart — exitosos vs fallidos
  const exitosos = datosFiltradosPorEvento.filter(d => d.resultado_validacion === EXITOSO).length;
  const fallidos = datosFiltradosPorEvento.filter(d => d.resultado_validacion !== EXITOSO).length;
  const pieData = [
    { name: 'Exitosos', value: exitosos },
    { name: 'Fallidos', value: fallidos },
  ];

  // Bar chart — distribución de tipos de fallo
  const conteoResultados: Record<string, number> = {};
  datosFiltradosPorEvento.forEach(d => {
    conteoResultados[d.resultado_validacion] = (conteoResultados[d.resultado_validacion] || 0) + 1;
  });
  const barData = Object.entries(conteoResultados).map(([resultado, total]) => ({ resultado, total }));

  const resultadosUnicos = [...new Set(data.map(d => d.resultado_validacion))];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background-tertiary)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'var(--color-background-info)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="ti ti-list-search" style={{ fontSize: '20px', color: 'var(--color-text-info)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>Auditoría del sistema</h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>Validaciones de entradas QR</p>
          </div>
        </div>

        {/* FILTRO POR EVENTO */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
            Filtrar por evento
          </label>
          <select
            value={eventoFiltro}
            onChange={e => setEventoFiltro(e.target.value)}
            style={{ minWidth: '280px' }}
          >
            <option value="">Todos los eventos</option>
            {eventos.map(ev => (
              <option key={ev.id_evento} value={String(ev.id_evento)}>
                {ev.equipos} — {new Date(ev.fecha_y_hora).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* GRAFICAS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '2rem',
        }}>
          {/* Pie chart */}
          <div style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.25rem',
          }}>
            <p style={{ fontWeight: 500, fontSize: '14px', margin: '0 0 1rem' }}>Exitosos vs Fallidos</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  <Cell fill={COLOR_EXITOSO} />
                  <Cell fill="#f87171" />
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart */}
          <div style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.25rem',
          }}>
            <p style={{ fontWeight: 500, fontSize: '14px', margin: '0 0 1rem' }}>Distribución de resultados</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="resultado" tick={{ fontSize: 9 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.resultado === EXITOSO ? COLOR_EXITOSO : (COLORES_FALLO[entry.resultado] || '#94a3b8')}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FILTRO POR RESULTADO */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => setResultadoFiltro('')} style={{ opacity: resultadoFiltro === '' ? 1 : 0.5 }}>
            Todos
          </button>
          {resultadosUnicos.map(r => (
            <button key={r} onClick={() => setResultadoFiltro(r)} style={{ opacity: resultadoFiltro === r ? 1 : 0.5 }}>
              {r}
            </button>
          ))}
        </div>

        {/* TABLA */}
        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                {['Entrada', 'Sector', 'Funcionario', 'Dispositivo', 'Resultado', 'Fecha'].map(col => (
                  <th key={col} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontWeight: 500, color: 'var(--color-text-secondary)', fontSize: '12px',
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.map((item) => (
                <tr key={item.id_auditoria} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                  <td style={{ padding: '10px 14px' }}>#{item.id_entrada}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                    {item.nombre_sector ?? '-'}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                    {item.id_funcionario ? item.id_funcionario.slice(0, 10) + '...' : '-'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>{item.id_dispositivo ?? '-'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 500,
                      padding: '3px 8px', borderRadius: 'var(--border-radius-md)',
                      background: item.resultado_validacion === EXITOSO
                        ? 'var(--color-background-success)'
                        : 'var(--color-background-danger)',
                      color: item.resultado_validacion === EXITOSO
                        ? 'var(--color-text-success)'
                        : 'var(--color-text-danger)',
                    }}>
                      {item.resultado_validacion}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                    {item.fecha_hora_validacion
                      ? new Date(item.fecha_hora_validacion).toLocaleString()
                      : '-'}
                  </td>
                </tr>
              ))}
              {datosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    No hay registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;