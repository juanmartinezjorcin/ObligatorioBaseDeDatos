import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { entradasApi, transferenciasApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Transfers = () => {
  const { user } = useAuth();
  const [misEntradas, setMisEntradas] = useState<any[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [pais, setPais] = useState('Uruguay');
  const [documento, setDocumento] = useState('');
  const [transferencias, setTransferencias] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const navigate = useNavigate();

  const cargarTodo = async () => {
    try {
      const [entradas, transferenciasRes] = await Promise.all([
        entradasApi.validas(),
        transferenciasApi.listar(),
      ]);
      setMisEntradas(entradas);
      setTransferencias(transferenciasRes.transferencias);
    } catch (e) {
      setError('No se pudieron cargar tus datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const toggleSeleccion = (id: number) => {
    setSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    if (seleccionadas.length === 0) {
      setError('Seleccioná al menos una entrada');
      return;
    }
    try {
      const res = await transferenciasApi.crear({
        pais_documento_destinatario: pais,
        documento_destinatario: documento,
        entradas: seleccionadas.map(id => ({ id_entrada: id })),
      });
      setMensaje(`Transferencia creada (ID ${res.id_transferencia}). El destinatario debe confirmarla.`);
      setSeleccionadas([]);
      setDocumento('');
      cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleConfirmar = async (id_transferencia: number) => {
    setError('');
    setMensaje('');
    setConfirmandoId(id_transferencia);
    try {
      await transferenciasApi.confirmar(id_transferencia);
      setMensaje('Transferencia confirmada correctamente');
      cargarTodo();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConfirmandoId(null);
    }
  };

  const recibidasPendientes = transferencias.filter(
    t => t.id_destinatario === user?.uid && t.estado_transferencia === 'pendiente'
  );
  const enviadas = transferencias.filter(t => t.id_ofertante === user?.uid);

  const badgeColor = (estado: string) => {
    if (estado === 'pendiente') return { bg: 'var(--color-background-warning)', text: 'var(--color-text-warning)' };
    if (estado === 'aceptada') return { bg: 'var(--color-background-success)', text: 'var(--color-text-success)' };
    return { bg: 'var(--color-background-secondary)', text: 'var(--color-text-secondary)' };
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background-tertiary)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/home')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="ti ti-arrow-left" style={{ fontSize: '16px' }} aria-hidden="true" />
            Volver
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>Transferencias</h1>
        </div>

        {mensaje && (
          <p style={{
            fontSize: '13px',
            color: 'var(--color-text-success)',
            background: 'var(--color-background-success)',
            border: '0.5px solid var(--color-border-success)',
            borderRadius: 'var(--border-radius-md)',
            padding: '8px 12px',
          }}>
            {mensaje}
          </p>
        )}
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

        {/* Transferencias pendientes de aceptar */}
        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 1rem' }}>Recibidas pendientes</h2>

          {loading && <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Cargando...</p>}

          {!loading && recibidasPendientes.length === 0 && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>No tenés transferencias pendientes</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recibidasPendientes.map((t) => (
              <div key={t.id_transferencia} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)',
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, margin: '0 0 2px' }}>
                    De {t.mail_ofertante}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                    {new Date(t.fecha_transferencia).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleConfirmar(t.id_transferencia)}
                  disabled={confirmandoId === t.id_transferencia}
                >
                  {confirmandoId === t.id_transferencia ? 'Confirmando...' : 'Aceptar'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Crear transferencia */}
        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 1rem' }}>Transferir entradas</h2>

          {!loading && misEntradas.length === 0 && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>No tenés entradas disponibles para transferir</p>
          )}

          {!loading && misEntradas.length > 0 && (
            <form onSubmit={handleCrear} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Elegí las entradas a transferir
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {misEntradas.map((entrada) => (
                    <label key={entrada.id_entrada} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      padding: '8px',
                      border: '0.5px solid var(--color-border-tertiary)',
                      borderRadius: 'var(--border-radius-md)',
                      cursor: 'pointer',
                    }}>
                      <input
                        type="checkbox"
                        checked={seleccionadas.includes(entrada.id_entrada)}
                        onChange={() => toggleSeleccion(entrada.id_entrada)}
                      />
                      Entrada #{entrada.id_entrada} — Sector {entrada.nombre_sector} (Evento #{entrada.id_evento})
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  País del documento del destinatario
                </label>
                <input value={pais} onChange={e => setPais(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Documento del destinatario
                </label>
                <input value={documento} onChange={e => setDocumento(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} required />
              </div>

              <button type="submit">Enviar transferencia</button>
            </form>
          )}
        </div>

        {/* Historial enviadas */}
        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.25rem',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 1rem' }}>Transferencias enviadas</h2>

          {!loading && enviadas.length === 0 && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>No enviaste transferencias todavía</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {enviadas.map((t) => {
              const colors = badgeColor(t.estado_transferencia);
              return (
                <div key={t.id_transferencia} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, margin: '0 0 2px' }}>
                      Para {t.mail_destinatario}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                      {new Date(t.fecha_transferencia).toLocaleString()}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    padding: '4px 10px',
                    borderRadius: 'var(--border-radius-md)',
                    background: colors.bg,
                    color: colors.text,
                  }}>
                    {t.estado_transferencia}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfers;