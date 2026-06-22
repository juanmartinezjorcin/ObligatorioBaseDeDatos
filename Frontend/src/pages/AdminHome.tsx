import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';

const AdminHome = () => {
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
              background: 'var(--color-background-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <i className="ti ti-shield-check" style={{ fontSize: '20px', color: 'var(--color-text-warning)' }} aria-hidden="true" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>Panel de administrador</h1>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>Mundial 2026</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-logout" style={{ fontSize: '16px' }} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}>
          <div
            onClick={() => navigate('/admin/create-event')}
            style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.25rem',
              cursor: 'pointer',
            }}
          >
            <i className="ti ti-calendar-plus" style={{ fontSize: '22px', color: 'var(--color-text-info)', display: 'block', marginBottom: '10px' }} aria-hidden="true" />
            <p style={{ fontWeight: 500, margin: '0 0 4px', fontSize: '15px' }}>Crear evento</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Programar un partido y habilitar sus sectores
            </p>
          </div>

          <div
            onClick={() => navigate('/events')}
            style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.25rem',
              cursor: 'pointer',
            }}
          >
            <i className="ti ti-calendar-event" style={{ fontSize: '22px', color: 'var(--color-text-info)', display: 'block', marginBottom: '10px' }} aria-hidden="true" />
            <p style={{ fontWeight: 500, margin: '0 0 4px', fontSize: '15px' }}>Ver eventos</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Listado de partidos programados
            </p>
          </div>

          {/* NUEVA CARD - AUDITORÍA */}
          <div
            onClick={() => navigate('/admin/auditoria')}
            style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '1.25rem',
              cursor: 'pointer',
            }}
          >
            <i
              className="ti ti-list-search"
              style={{
                fontSize: '22px',
                color: 'var(--color-text-info)',
                display: 'block',
                marginBottom: '10px'
              }}
              aria-hidden="true"
            />
            <p style={{ fontWeight: 500, margin: '0 0 4px', fontSize: '15px' }}>
              Auditoría
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Ver validaciones de entradas QR
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminHome;