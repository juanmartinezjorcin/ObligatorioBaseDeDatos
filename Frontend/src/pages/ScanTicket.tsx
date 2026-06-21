import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { qrApi } from '../services/api';

const SCANNER_ID = 'qr-reader';

const ScanTicket = () => {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [escaneando, setEscaneando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const procesandoRef = useRef(false);

  const iniciarEscaneo = async () => {
    setResultado(null);
    setEscaneando(true);
    procesandoRef.current = false;

    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (procesandoRef.current) return;
          procesandoRef.current = true;
          await detenerEscaneo();
          await procesarQR(decodedText);
        },
        () => {
          // ignorar errores de frames sin QR detectado
        }
      );
    } catch (err: any) {
      setResultado({ ok: false, mensaje: 'No se pudo acceder a la cámara: ' + err.message });
      setEscaneando(false);
    }
  };

  const detenerEscaneo = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        // ya estaba detenido
      }
    }
    setEscaneando(false);
  };

 const procesarQR = async (decodedText: string) => {
    console.log('QR leído:', decodedText);
    try {
      const qrData = JSON.parse(decodedText);
      console.log('QR parseado:', qrData);
      const res = await qrApi.validar(qrData);
      console.log('Respuesta backend:', res);
      setResultado({ ok: true, mensaje: res.message || 'Entrada validada exitosamente' });
    } catch (err: any) {
      console.error('Error completo:', err);
      setResultado({ ok: false, mensaje: `${err.name}: ${err.message}` });
    }
  };
  useEffect(() => {
    return () => {
      detenerEscaneo();
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background-tertiary)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '420px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/funcionario')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="ti ti-arrow-left" style={{ fontSize: '16px' }} aria-hidden="true" />
            Volver
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>Escanear entrada</h1>
        </div>

        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.25rem',
        }}>
          <div
            id={SCANNER_ID}
            style={{
              width: '100%',
              minHeight: escaneando ? '280px' : '0',
              borderRadius: 'var(--border-radius-md)',
              overflow: 'hidden',
            }}
          />

          {!escaneando && !resultado && (
            <button onClick={iniciarEscaneo} style={{ width: '100%' }}>
              Iniciar escaneo
            </button>
          )}

          {resultado && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <i
                className={`ti ${resultado.ok ? 'ti-circle-check' : 'ti-circle-x'}`}
                style={{
                  fontSize: '32px',
                  color: resultado.ok ? 'var(--color-text-success)' : 'var(--color-text-danger)',
                }}
                aria-hidden="true"
              />
              <p style={{ fontWeight: 500, margin: '8px 0 16px' }}>{resultado.mensaje}</p>
              <button onClick={iniciarEscaneo} style={{ width: '100%' }}>
                Escanear otra entrada
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanTicket;