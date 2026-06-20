import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventosApi, ventasApi } from '../services/api';

const BuyTickets = () => {
  const { id } = useParams();
  const [evento, setEvento] = useState<any>(null);
  const [sectores, setSectores] = useState<any[]>([]);
  const [sectorElegido, setSectorElegido] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reserva, setReserva] = useState<{ id_venta: number; expira: number } | null>(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      try {
        const eventos = await eventosApi.listar();
        const ev = eventos.find((e: any) => String(e.id_evento) === id);
        setEvento(ev);
        const data = await eventosApi.sectores(Number(id));
        setSectores(data.sectores);
      } catch (e) {
        setError('No se pudo cargar el evento');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  useEffect(() => {
    if (!reserva) return;
    const interval = setInterval(() => {
      const restante = Math.max(0, Math.floor((reserva.expira - Date.now()) / 1000));
      setSegundosRestantes(restante);
      if (restante === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [reserva]);

  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await ventasApi.comprar({
        id_evento: Number(id),
        nombre_sector: sectorElegido,
        cantidad_entradas: cantidad,
      });
      setReserva({ id_venta: res.id_venta, expira: Date.now() + 3 * 60 * 1000 });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleConfirmar = async () => {
    if (!reserva) return;
    setConfirmando(true);
    setError('');
    try {
      await ventasApi.confirmar(reserva.id_venta);
      setConfirmado(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConfirmando(false);
    }
  };

  const formatTiempo = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background-tertiary)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/events')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="ti ti-arrow-left" style={{ fontSize: '16px' }} aria-hidden="true" />
            Volver
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>Comprar entradas</h1>
        </div>

        {loading && <p style={{ color: 'var(--color-text-secondary)' }}>Cargando...</p>}

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

        {!loading && evento && (
          <div style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.25rem',
          }}>
            <p style={{ fontWeight: 500, fontSize: '15px', margin: '0 0 2px' }}>{evento.equipos}</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 1.25rem' }}>
              {evento.estadio_pais} · {new Date(evento.fecha_y_hora).toLocaleString()}
            </p>

            {!reserva && !confirmado && (
              <form onSubmit={handleReservar} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Sector
                  </label>
                  <select value={sectorElegido} onChange={e => setSectorElegido(e.target.value)} style={{ width: '100%' }} required>
                    <option value="">Seleccionar sector</option>
                    {sectores.map((s: any) => (
                      <option key={s.nombre} value={s.nombre} disabled={s.disponibles <= 0}>
                        Sector {s.nombre} — {s.disponibles} disponibles
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Cantidad (máximo 5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={cantidad}
                    onChange={e => setCantidad(Number(e.target.value))}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <button type="submit">Reservar entradas</button>
              </form>
            )}

            {reserva && !confirmado && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Tenés que confirmar el pago antes de que expire la reserva
                </p>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  margin: '8px 0 16px',
                  color: segundosRestantes < 30 ? 'var(--color-text-danger)' : 'var(--color-text-primary)',
                }}>
                  {formatTiempo(segundosRestantes)}
                </p>
                {segundosRestantes > 0 ? (
                  <button onClick={handleConfirmar} disabled={confirmando} style={{ width: '100%' }}>
                    {confirmando ? 'Confirmando...' : 'Confirmar pago'}
                  </button>
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-danger)' }}>
                    La reserva expiró. Volvé a intentarlo.
                  </p>
                )}
              </div>
            )}

            {confirmado && (
              <div style={{ textAlign: 'center' }}>
                <i className="ti ti-circle-check" style={{ fontSize: '32px', color: 'var(--color-text-success)' }} aria-hidden="true" />
                <p style={{ fontWeight: 500, margin: '8px 0 4px' }}>Compra confirmada</p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                  Tus entradas ya están disponibles
                </p>
                <button onClick={() => navigate('/mis-entradas')} style={{ width: '100%' }}>
                  Ver mis entradas
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyTickets;