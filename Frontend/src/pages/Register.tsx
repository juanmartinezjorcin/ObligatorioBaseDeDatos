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
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleRegistro}>
        <input name="mail" type="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} />
        <select name="tipo_documento" onChange={handleChange}>
          <option value="CI">CI</option>
          <option value="PASAPORTE">Pasaporte</option>
          <option value="DNI">DNI</option>
        </select>
        <input name="numero_documento" placeholder="Número de documento" onChange={handleChange} />
        <input name="pais_documento" placeholder="País del documento" onChange={handleChange} />
        <input name="direccion_pais" placeholder="País" onChange={handleChange} />
        <input name="direccion_localidad" placeholder="Localidad" onChange={handleChange} />
        <input name="direccion_calle" placeholder="Calle" onChange={handleChange} />
        <input name="direccion_numero" placeholder="Número" onChange={handleChange} />
        <input name="direccion_codigo_postal" placeholder="Código postal" onChange={handleChange} />
        <input name="telefono" placeholder="Teléfono" onChange={handleChange} />
        <button type="submit">Registrarse</button>
        {error && <p>{error}</p>}
      </form>
      <p>Si ya tenés cuenta <a href="/login">Iniciá sesión</a></p>
    </div>
  );
};

export default Registro;