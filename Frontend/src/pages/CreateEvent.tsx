import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminEquiposApi, adminEstadiosApi, adminEventosApi } from '../services/api';

const CrearEvento = () => {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [estadios, setEstadios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  // Paso 1: crear evento
  const [fechaHora, setFechaHora] = useState('');
  const [idEstadio, setIdEstadio] = useState('');
  const [idLocal, setIdLocal] = useState('');
  const [idVisitante, setIdVisitante] = useState('');
  const [idEventoCreado, setIdEventoCreado] = useState<number | null>(null);

  // Paso 2: habilitar sectores
  const [sectoresTexto, setSectoresTexto] = useState('A,B,C');
  const [precio, setPrecio] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const [eq, est] = await Promise.all([adminEquiposApi.listar(), adminEstadiosApi.listar()]);
        setEquipos(eq);
        setEstadios(est);
      } catch (e: any) {
        setError('No se pudieron cargar equipos o estadios');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const handleCrearEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    if (idLocal === idVisitante) {
      setError('El equipo local y visitante no pueden ser el mismo');
      return;
    }
    try {
      const res = await adminEventosApi.crear({
        fecha_y_hora: fechaHora,
        id_estadio: Number(idEstadio),
        id_equipo_local: Number(idLocal),
        id_equipo_visitante: Number(idVisitante),
      });
      setIdEventoCreado(res.id_evento);
      setMensaje(`Evento creado correctamente (ID ${res.id_evento}). Ahora habilitá los sectores.`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleHabilitarSectores = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    const sectores = sectoresTexto.split(',').map(s => s.trim()).filter(Boolean);
    try {
      await adminEventosApi.habilitarSectores({
        id_evento: idEventoCreado,
        nombre_sectores: sectores,
        precio: Number(precio),
      });
      setMensaje('Sectores habilitados correctamente. El evento ya está disponible para la venta.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background-tertiary)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="ti ti-arrow-left" style={{ fontSize: '16px' }} aria-hidden="true" />
            Volver
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>Crear evento</h1>
        </div>

        {mensaje && (
          <p style={{
            fontSize: '13px', color: 'var(--color-text-success)',
            background: 'var(--color-background-success)',
            border: '0.5px solid var(--color-border-success)',
            borderRadius: 'var(--border-radius-md)', padding: '8px 12px',
          }}>
            {mensaje}
          </p>
        )}
        {error && (
          <p style={{
            fontSize: '13px', color: 'var(--color-text-danger)',
            background: 'var(--color-background-danger)',
            border: '0.5px solid var(--color-border-danger)',
            borderRadius: 'var(--border-radius-md)', padding: '8px 12px',
          }}>
            {error}
          </p>
        )}

        {loading && <p style={{ color: 'var(--color-text-secondary)' }}>Cargando...</p>}

        {!loading && (
          <>
            <div style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              opacity: idEventoCreado ? 0.6 : 1,
            }}>
              <h2 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 1rem' }}>1. Datos del evento</h2>
              <form onSubmit={handleCrearEvento} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Fecha y hora
                  </label>
                  <input
                    type="datetime-local"
                    value={fechaHora}
                    onChange={e => setFechaHora(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    disabled={!!idEventoCreado}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Estadio
                  </label>
                  <select value={idEstadio} onChange={e => setIdEstadio(e.target.value)} style={{ width: '100%' }} disabled={!!idEventoCreado} required>
                    <option value="">Seleccionar estadio</option>
                    {estadios.map((est: any) => (
                      <option key={est.id_estadio} value={est.id_estadio}>
                        Estadio #{est.id_estadio} — {est.pais}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Equipo local
                    </label>
                    <select value={idLocal} onChange={e => setIdLocal(e.target.value)} style={{ width: '100%' }} disabled={!!idEventoCreado} required>
                      <option value="">Seleccionar</option>
                      {equipos.map((eq: any) => (
                        <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Equipo visitante
                    </label>
                    <select value={idVisitante} onChange={e => setIdVisitante(e.target.value)} style={{ width: '100%' }} disabled={!!idEventoCreado} required>
                      <option value="">Seleccionar</option>
                      {equipos.map((eq: any) => (
                        <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={!!idEventoCreado}>
                  {idEventoCreado ? 'Evento creado' : 'Crear evento'}
                </button>
              </form>
            </div>

            <div style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.25rem',
              opacity: idEventoCreado ? 1 : 0.5,
            }}>
              <h2 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 1rem' }}>2. Habilitar sectores y precio</h2>
              <form onSubmit={handleHabilitarSectores} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Sectores (separados por coma)
                  </label>
                  <input
                    value={sectoresTexto}
                    onChange={e => setSectoresTexto(e.target.value)}
                    placeholder="A,B,C"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    disabled={!idEventoCreado}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Precio por entrada
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={precio}
                    onChange={e => setPrecio(e.target.value)}
                    placeholder="50.00"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    disabled={!idEventoCreado}
                  />
                </div>
                <button type="submit" disabled={!idEventoCreado}>Habilitar sectores</button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CrearEvento;