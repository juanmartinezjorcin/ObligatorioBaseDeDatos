import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await cred.user.getIdTokenResult();
      const role = tokenResult.claims.role as string;

      if (role === 'administrador') {
        navigate('/admin');
      } else if (role === 'funcionario') {
        navigate('/funcionario');
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      setError('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-background-tertiary)',
    }}>
      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '2rem',
        width: '100%',
        maxWidth: '380px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--color-background-info)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <i className="ti ti-ticket" style={{ fontSize: '22px', color: 'var(--color-text-info)' }} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 500, margin: '0 0 4px' }}>Mundial 2026</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>Iniciá sesión para continuar</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
              required
            />
          </div>

          {error && (
            <p style={{
              fontSize: '13px',
              color: 'var(--color-text-danger)',
              background: 'var(--color-background-danger)',
              border: '0.5px solid var(--color-border-danger)',
              borderRadius: 'var(--border-radius-md)',
              padding: '8px 12px',
              margin: 0,
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: '4px' }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '1.5rem', marginBottom: 0 }}>
          ¿No tenés cuenta?{' '}
          <a href="/register" style={{ color: 'var(--color-text-info)' }}>Registrate</a>
        </p>
      </div>
    </div>
  );
};

export default Login;