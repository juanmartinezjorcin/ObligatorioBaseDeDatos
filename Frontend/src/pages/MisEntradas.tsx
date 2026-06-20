import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { entradasApi, eventosApi } from '../services/api';

const MisEntradas = () => {
  const [entradas, setEntradas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      try {
        const [misEntradas, eventos] = await Promise.all([
          entradasApi.todas(),
          eventosApi.listar(),
        ]);

        // aca se cruza cada entrada con los datos de el correspondiente evento
        const enriquecidas = misEntradas.map((entrada: any) => {
          const evento = eventos.find((e: any) => e.id_evento === entrada.id_evento);
          return { ...entrada, evento };
        });

        setEntradas(enriquecidas);
      } catch (e: any) {
        setError('No se pudieron cargar entradas');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

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
          <h1 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>Mis entradas</h1>
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

        {!loading && !error && entradas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <i className="ti ti-ticket-off" style={{ fontSize: '32px', color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '12px' }}>Sin entradas que mostrar</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entradas.map((entrada) => (
            <div key={entrada.id_entrada} style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--border-radius-md)',
                  background: 'var(--color-background-info)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <i className="ti ti-ticket" style={{ fontSize: '18px', color: 'var(--color-text-info)' }} aria-hidden="true" />
                </div>
                <div>
                  <p style={{ fontWeight: 500, margin: '0 0 2px', fontSize: '14px' }}>
                    {entrada.evento?.equipos || `Evento #${entrada.id_evento}`}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Sector {entrada.nombre_sector} · {entrada.evento?.estadio_pais || ''}
                    {entrada.evento?.fecha_y_hora && ` · ${new Date(entrada.evento.fecha_y_hora).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 500,
                padding: '4px 10px',
                borderRadius: 'var(--border-radius-md)',
                background: entrada.validez ? 'var(--color-background-success)' : 'var(--color-background-secondary)',
                color: entrada.validez ? 'var(--color-text-success)' : 'var(--color-text-secondary)',
              }}>
                {entrada.validez ? 'Válida' : 'Consumida'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MisEntradas;