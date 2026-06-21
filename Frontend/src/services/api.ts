import { auth } from '../../firebase';
const BASE_URL = '/api';//funcion para agregar token a cada request

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
     throw new Error(error.error || error.message || 'Error en la solicitud');
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

    export const entradasApi = { 
        todas: () => request('/entradas'),
        validas: () => request('/entradas/validas'),
    };

    export const eventosApi = {
        listar: () => request('/eventos'),
        sectores: (id: number) => request(`/eventos/${id}/sectores`),
    };

    //endpoint admin - eventos
    export const adminEventosApi = {
        crear: (data: object) => request('/eventos/registro', {
        method: 'POST',
        body: JSON.stringify(data),
        }),
        habilitarSectores: (data: object) => request('/eventos/habilitar-sectores', {
        method: 'POST',
        body: JSON.stringify(data),
        }),
    };

    //endpoints admin - equipos - estadios
    export const adminEquiposApi = {
        listar: () => request('/equipos'),
    };

    export const adminEstadiosApi = {
        listar: () => request('/estadios/listar'),
    };
    
    //endpoint ventas
    export const ventasApi = {
        comprar: (data: object) => request('/ventas/comprar', {
        method: 'POST',
        body: JSON.stringify(data),
        }),
        confirmar: (id_venta: number) => request('/ventas/confirmar', {
        method: 'POST',
        body: JSON.stringify({ id_venta }),
        }),
    };  

    export const transferenciasApi = {
        crear: (data: object) => request('/transferencias/crear', {
         method: 'POST',
         body: JSON.stringify(data),
         }),
        confirmar: (id_transferencia: number) => request('/transferencias/confirmar', {
         method: 'POST',
        body: JSON.stringify({ id_transferencia }),
        }),
        listar: () => request('/transferencias/listar'),
    };

    //endpoint dispositivos
    export const dispositivosApi = {
        asociar: (id_dispositivo: number) => request('/dispositivos/asociar', {
        method: 'POST',
        body: JSON.stringify({ id_dispositivo }),
        }),
    };

    //endpoint entradas - QR y validación
    export const qrApi = {
        generar: (id_entrada: number) => request(`/entradas/qr?id_entrada=${id_entrada}`),
        validar: (qrData: object) => request('/entradas/validar', {
        method: 'POST',
        body: JSON.stringify({ qrData }),
        }),
    };