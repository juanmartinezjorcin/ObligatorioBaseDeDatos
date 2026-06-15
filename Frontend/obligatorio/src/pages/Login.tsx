/*

import {useState} from 'react';
import { singInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { usuariosApi } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await singInWithEmailAndPassword(auth, email, password);
            const perfil = await usuariosApi.perfil();
            console.log('Perfil del usuario:', perfil);
        }
        catch (err) {
            setError('Error al iniciar sesión: ' + err.message);
        }  
    };

    */
