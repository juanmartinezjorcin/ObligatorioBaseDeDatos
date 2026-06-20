import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuariosApi } from '../services/api';

const Perfil = () => {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await usuariosApi.perfil();
        setPerfil(data);
      } catch (e: any) {
        setError('No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    cargarPerfil();
  }, []);

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
          <h1 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>Mi perfil</h1>
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

        {perfil && (
          <div style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'var(--color-background-info)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 500,
                color: 'var(--color-text-info)',
              }}>
                {perfil.mail?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 500, margin: 0, fontSize: '16px' }}>{perfil.mail}</p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>Usuario general</p>
              </div>
            </div>

            <div style={{
              borderTop: '0.5px solid var(--color-border-tertiary)',
              paddingTop: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              {[
                { icon: 'ti-id', label: 'Documento', value: `${perfil.tipo_documento} ${perfil.numero_documento} (${perfil.pais_documento})` },
                { icon: 'ti-map-pin', label: 'Dirección', value: `${perfil.direccion_calle} ${perfil.direccion_numero}, ${perfil.direccion_localidad}, ${perfil.direccion_pais}` },
                { icon: 'ti-mailbox', label: 'Código postal', value: perfil.direccion_codigo_postal },
                { icon: 'ti-phone', label: 'Teléfonos', value: perfil.telefonos?.length ? perfil.telefonos.join(', ') : 'Sin teléfonos registrados' },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <i className={`ti ${icon}`} style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginTop: '2px' }} aria-hidden="true" />
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 2px' }}>{label}</p>
                    <p style={{ fontSize: '14px', margin: 0 }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;