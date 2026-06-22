import { useEffect, useState } from 'react';
import { auditoriaApi } from '../services/api';

interface AuditoriaItem {
  id_entrada: number;
  id_funcionario: string;
  id_dispositivo: number | null;
  resultado_validacion: string;
}

const Auditoria = () => {
  const [data, setData] = useState<AuditoriaItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await auditoriaApi.listar();
        setData(res);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background-tertiary)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--color-background-info)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <i
                className="ti ti-list-search"
                style={{ fontSize: '20px', color: 'var(--color-text-info)' }}
              />
            </div>

            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>
                Auditoría del sistema
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                Validaciones de entradas QR
              </p>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
        }}>
          {data.map((item, index) => (
            <div
              key={index}
              style={{
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '1.25rem',
              }}
            >
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Resultado
                </p>
                <p style={{ fontWeight: 500, margin: 0 }}>
                  {item.resultado_validacion}
                </p>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Entrada
                </p>
                <p style={{ margin: 0 }}>{item.id_entrada}</p>
              </div>

              <div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Funcionario
                </p>
                <p style={{ margin: 0 }}>{item.id_funcionario}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Auditoria;