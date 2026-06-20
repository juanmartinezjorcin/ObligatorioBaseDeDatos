import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { entradasApi, transferenciasApi } from '../services/api';

const Transferencias = () => {
  const [misEntradas, setMisEntradas] = useState<any[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [pais, setPais] = useState('Uruguay');
  const [documento, setDocumento] = useState('');
  const [idConfirmar, setIdConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await entradasApi.validas();
        setMisEntradas(data);
      } catch (e) {
        setError('No se pudieron cargar tus entradas');
      } finally {
        setLoading(false);
      }
    };
    cargar();
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
      setMensaje(`Transferencia creada (ID ${res.id_venta}). El destinatario debe confirmarla.`);
      setSeleccionadas([]);
      setDocumento('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    try {
      await transferenciasApi.confirmar(Number(idConfirmar));
      setMensaje('Transferencia confirmada correctamente');
      setIdConfirmar('');
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

        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 1rem' }}>Transferir entradas</h2>

          {loading && <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Cargando tus entradas...</p>}

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

        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.25rem',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 1rem' }}>Confirmar transferencia recibida</h2>
          <form onSubmit={handleConfirmar} style={{ display: 'flex', gap: '8px' }}>
            <input
              placeholder="ID de transferencia"
              value={idConfirmar}
              onChange={e => setIdConfirmar(e.target.value)}
              style={{ flex: 1 }}
              required
            />
            <button type="submit">Confirmar</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Transferencias;