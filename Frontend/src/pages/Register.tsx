import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuariosApi } from '../services/api';

const Registro = () => {
  const [form, setForm] = useState({
    mail: '',
    password: '',
    tipo_documento: 'CI',
    numero_documento: '',
    pais_documento: 'Uruguay',
    direccion_pais: 'Uruguay',
    direccion_localidad: '',
    direccion_calle: '',
    direccion_numero: '',
    direccion_codigo_postal: '',
    telefono: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await usuariosApi.registro({
        ...form,
        telefonos: [form.telefono],
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
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
        maxWidth: '480px',
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
            <i className="ti ti-user-plus" style={{ fontSize: '22px', color: 'var(--color-text-info)' }} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 500, margin: '0 0 4px' }}>Crear cuenta</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>Mundial 2026</p>
        </div>

        <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Email</label>
            <input name="mail" type="email" placeholder="tu@email.com" value={form.mail} onChange={handleChange} style={{ width: '100%', boxSizing: 'border-box' }} required />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Contraseña</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} style={{ width: '100%', boxSizing: 'border-box' }} required />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Tipo de documento</label>
              <select name="tipo_documento" value={form.tipo_documento} onChange={handleChange} style={{ width: '100%' }}>
                <option value="CI">CI</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="DNI">DNI</option>
              </select>
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Número de documento</label>
              <input name="numero_documento" placeholder="12345678" value={form.numero_documento} onChange={handleChange} style={{ width: '100%', boxSizing: 'border-box' }} required />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>País del documento</label>
            <input name="pais_documento" placeholder="Uruguay" value={form.pais_documento} onChange={handleChange} style={{ width: '100%', boxSizing: 'border-box' }} required />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>País</label>
              <input name="direccion_pais" placeholder="Uruguay" value={form.direccion_pais} onChange={handleChange} style={{ width: '100%', boxSizing: 'border-box' }} required />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Localidad</label>
              <input name="direccion_localidad" placeholder="Montevideo" value={form.direccion_localidad} onChange={handleChange} style={{ width: '100%', boxSizing: 'border-box' }} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Calle</label>
              <input name="direccion_calle" placeholder="18 de Julio" value={form.direccion_calle} onChange={handleChange} style={{ width: '100%', boxSizing: 'border-box' }} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Número</label>
              <input name="direccion_numero" placeholder="1234" value={form.direccion_numero} onChange={handleChange} style={{ width: '100%', boxSizing: 'border-box' }} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Código postal</label>
              <input name="direccion_codigo_postal" placeholder="11000" value={form.direccion_codigo_postal} onChange={handleChange} style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Teléfono</label>
              <input name="telefono" placeholder="099123456" value={form.telefono} onChange={handleChange} style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
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

          <button type="submit" style={{ width: '100%', marginTop: '4px' }}>
            Registrarse
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '1.5rem', marginBottom: 0 }}>
          ¿Ya tenés cuenta?{' '}
          <a href="/login" style={{ color: 'var(--color-text-info)' }}>Iniciá sesión</a>
        </p>
      </div>
    </div>
  );
};

export default Registro;