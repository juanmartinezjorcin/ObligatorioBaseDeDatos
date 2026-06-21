import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { qrApi } from '../services/api';

const MyTicketQR = () => {
  const { id } = useParams();
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cargarQR = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await qrApi.generar(Number(id));
      setQrCode(data.qrCode);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarQR();
  }, [id]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background-tertiary)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '420px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/mis-entradas')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="ti ti-arrow-left" style={{ fontSize: '16px' }} aria-hidden="true" />
            Volver
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>Entrada #{id}</h1>
        </div>

        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.5rem',
          textAlign: 'center',
        }}>
          {loading && <p style={{ color: 'var(--color-text-secondary)' }}>Generando QR...</p>}

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

          {!loading && qrCode && (
            <>
              <img src={qrCode} alt="QR de la entrada" style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }} />
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '12px' }}>
                Este código expira a los 40 segundos. Generá uno nuevo si pasa el tiempo.
              </p>
              <button onClick={cargarQR} style={{ marginTop: '8px' }}>
                Regenerar código
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTicketQR;