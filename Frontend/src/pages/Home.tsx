import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { usuariosApi } from '../services/api';

const Home = () => {
  const [perfil, setPerfil] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await usuariosApi.perfil();
        setPerfil(data);
      } catch (e) {
        console.error(e);
      }
    };
    cargarPerfil();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background-tertiary)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

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
              <i className="ti ti-ticket" style={{ fontSize: '20px', color: 'var(--color-text-info)' }} aria-hidden="true" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>Mundial 2026</h1>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>Sistema de ticketing</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-logout" style={{ fontSize: '16px' }} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>

        {perfil && (
          <>
            <div style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--color-background-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                }}>
                  {perfil.mail?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 500, margin: 0 }}>{perfil.mail}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>Usuario general</p>
                </div>
              </div>

              <div style={{
                borderTop: '0.5px solid var(--color-border-tertiary)',
                paddingTop: '1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}>
                {[
                  { icon: 'ti-id', label: 'Documento', value: `${perfil.tipo_documento} ${perfil.numero_documento}` },
                  { icon: 'ti-map-pin', label: 'País', value: perfil.direccion_pais },
                  { icon: 'ti-building', label: 'Localidad', value: perfil.direccion_localidad },
                  { icon: 'ti-phone', label: 'Teléfonos', value: perfil.telefonos?.join(', ') || '-' },
                ].map(({ icon, label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 2px' }}>
                      <i className={`ti ${icon}`} style={{ fontSize: '13px', marginRight: '4px' }} aria-hidden="true" />
                      {label}
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
            }}>
              {[
                { icon: 'ti-ticket', label: 'Mis entradas', desc: 'Ver entradas asignadas' },
                { icon: 'ti-shopping-cart', label: 'Mis compras', desc: 'Historial de compras' },
                { icon: 'ti-transfer', label: 'Transferencias', desc: 'Enviar o recibir entradas' },
                { icon: 'ti-calendar-event', label: 'Eventos', desc: 'Ver partidos disponibles' },
              ].map(({ icon, label, desc }) => (
                <div key={label} style={{
                  background: 'var(--color-background-primary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                }}>
                  <i className={`ti ${icon}`} style={{ fontSize: '20px', color: 'var(--color-text-info)', display: 'block', marginBottom: '8px' }} aria-hidden="true" />
                  <p style={{ fontWeight: 500, margin: '0 0 2px', fontSize: '14px' }}>{label}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;