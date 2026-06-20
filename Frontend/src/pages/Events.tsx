import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventosApi } from '../services/api';

const Eventos = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<any>(null);
  const [sectores, setSectores] = useState<any[]>([]);
  const [cargandoSectores, setCargandoSectores] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await eventosApi.listar();
        setEventos(data);
      } catch (e: any) {
        setError('No se pudieron cargar los eventos');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const verSectores = async (evento: any) => {
    setEventoSeleccionado(evento);
    setCargandoSectores(true);
    try {
      const data = await eventosApi.sectores(evento.id_evento);
      setSectores(data.sectores);
    } catch (e) {
      setSectores([]);
    } finally {
      setCargandoSectores(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background-tertiary)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/home')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="ti ti-arrow-left" style={{ fontSize: '16px' }} aria-hidden="true" />
            Volver
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>Eventos</h1>
        </div>

        {loading && <p style={{ color: 'var(--color-text-secondary)' }}>Cargando...</p>}

        {error && (
          <p style={{
            fontSize: '13px',
            color: 'var(--color-text-danger)',
            background: 'var(--color-background-danger)',
            border: '0.5px solid var(--color-border-danger)',
            borderRadius: 'var(--border-radius-md)',
            padding: '8px 12px',
          }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {eventos.map((evento) => (
            <div key={evento.id_evento}>
              <div
                onClick={() => verSectores(evento)}
                style={{
                  background: 'var(--color-background-primary)',
                  border: eventoSeleccionado?.id_evento === evento.id_evento
                    ? '2px solid var(--color-border-info)'
                    : '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--border-radius-md)',
                    background: 'var(--color-background-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <i className="ti ti-calendar-event" style={{ fontSize: '18px', color: 'var(--color-text-secondary)' }} aria-hidden="true" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 500, margin: '0 0 2px', fontSize: '14px' }}>{evento.equipos}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                      {evento.estadio_pais} · {new Date(evento.fecha_y_hora).toLocaleString()}
                    </p>
                  </div>
                </div>
                <i className="ti ti-chevron-down" style={{ fontSize: '16px', color: 'var(--color-text-secondary)' }} aria-hidden="true" />
              </div>

              {eventoSeleccionado?.id_evento === evento.id_evento && (
                <div style={{
                  background: 'var(--color-background-secondary)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '12px',
                  marginTop: '8px',
                }}>
                  {cargandoSectores && <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>Cargando sectores...</p>}
                  {!cargandoSectores && sectores.length === 0 && (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>No hay sectores habilitados</p>
                  )}
                  {!cargandoSectores && sectores.map((sector) => (
                    <div key={sector.nombre} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 4px',
                      fontSize: '13px',
                      borderBottom: '0.5px solid var(--color-border-tertiary)',
                    }}>
                      <span>Sector {sector.nombre}</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        {sector.disponibles} / {sector.capacidad} disponibles
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Eventos;