import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';

const Home = () => {
  const navigate = useNavigate();

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="ti ti-user" style={{ fontSize: '16px' }} aria-hidden="true" />
              Mi perfil
            </button>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="ti ti-logout" style={{ fontSize: '16px' }} aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
        }}>
          {[
            { icon: 'ti-ticket', label: 'Mis entradas', desc: 'Ver entradas asignadas', path: '/mis-entradas' },
            { icon: 'ti-transfer', label: 'Transferencias', desc: 'Enviar o recibir entradas', path: '/transfers' },
            { icon: 'ti-calendar-event', label: 'Eventos', desc: 'Ver partidos disponibles', path: '/events' },
          ].map(({ icon, label, desc, path }) => (
            <div
              key={label}
              onClick={() => navigate(path)}
              style={{
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '1rem 1.25rem',
                cursor: 'pointer',
              }}
            >
              <i className={`ti ${icon}`} style={{ fontSize: '20px', color: 'var(--color-text-info)', display: 'block', marginBottom: '8px' }} aria-hidden="true" />
              <p style={{ fontWeight: 500, margin: '0 0 2px', fontSize: '14px' }}>{label}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;