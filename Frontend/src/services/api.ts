import { auth } from '../../firebase';
const BASE_URL = 'http://localhost:3000/api';

//funcion para agregar token a cada request

const request = async (endpoint: string, options: RequestInit = {}) => {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers, 
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error en la solicitud');

    }

    return res.json();
};

    //endpoint usuarios

    export const usuariosApi = {
        registro: (data:object) => request('/usuarios/registro', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        perfil: () => request('/usuarios/perfil'),
    };


