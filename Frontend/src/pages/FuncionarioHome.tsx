import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';

const FuncionarioHome = () => {
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
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

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
              <i className="ti ti-scan" style={{ fontSize: '20px', color: 'var(--color-text-info)' }} aria-hidden="true" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>Funcionario</h1>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>Validación de accesos</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-logout" style={{ fontSize: '16px' }} aria-hidden="true" />
            Salir
          </button>
        </div>

        <div
          onClick={() => navigate('/funcionario/escanear')}
          style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.25rem',
            cursor: 'pointer',
          }}
        >
          <i className="ti ti-qrcode" style={{ fontSize: '22px', color: 'var(--color-text-info)', display: 'block', marginBottom: '10px' }} aria-hidden="true" />
          <p style={{ fontWeight: 500, margin: '0 0 4px', fontSize: '15px' }}>Escanear entrada</p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Validar el acceso de un asistente
          </p>
        </div>
      </div>
    </div>
  );
};

export default FuncionarioHome;