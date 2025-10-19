import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast'; // <-- IMPORTANTE
import { useState } from 'react';
import { login } from '../services/AuthService';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { toast, showToast } = useToast();

    const handleLogin = async () => {
        try {
            const response = await login({ email, password });
            console.log(response);
            if (response.token) {
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('role', response.user.rol.nombre);
                localStorage.setItem('idUser', String(response.user.id));
                showToast({
                    severity: 'success',
                    summary: 'Login exitoso',
                    detail: 'Bienvenido',
                    life: 3000,
                });
                // Redirigir según el rol
                if (response.user.rol.nombre === 'Administrador') {
                    navigate('/usuarios');
                } else if (response.user.rol.nombre === 'Supervisor') {
                    navigate('/visitas-supervisor');
                }
                else if (response.user.rol.nombre === 'Tecnico') {
                    navigate('/visitas-tecnico');
                }
            } else {
                showToast({
                    severity: 'error',
                    summary: 'Error',
                    detail: response.mensaje,
                    life: 3000,
                });
            }
        } catch (error: any) {
            // Intenta extraer el mensaje personalizado del servidor
            let detail = 'Error de inicio de sesión';
            if (error?.response?.data?.mensaje) {
                detail = error.response.data.mensaje;
            } else if (error?.mensaje) {
                detail = error.mensaje;
            }
            showToast({
                severity: 'error',
                summary: 'Error',
                detail,
                life: 3000,
            });
        }
    }
    return (
        <div className="flex justify-content-center align-items-center h-screen bg-light-blue" style={{ backgroundColor: '#fdfdfdff' }}>
            <Toast ref={toast} />
            <div className="card">
                <div className="flex flex-column md:flex-row">
                    <div className="w-full md:w-5 flex flex-column align-items-center justify-content-center gap-3 py-5">
                        <div className="flex flex-wrap justify-content-center align-items-center gap-2">
                            <label className="w-6rem">Username</label>
                            <InputText id="username" type="text" className="w-12rem" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="flex flex-wrap justify-content-center align-items-center gap-2">
                            <label className="w-6rem">Password</label>
                            <InputText id="password" type="password" className="w-12rem" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <Button label="Login" icon="pi pi-user" className="w-10rem mx-auto" onClick={handleLogin}></Button>
                    </div>
                    <div className="w-full md:w-2">
                        <Divider layout="vertical" className="hidden md:flex">
                            <b>OR</b>
                        </Divider>
                        <Divider layout="horizontal" className="flex md:hidden" align="center">
                            <b>OR</b>
                        </Divider>
                    </div>
                    <div className="w-full md:w-5 flex align-items-center justify-content-center py-5">
                        <Button label="Sign Up" icon="pi pi-user-plus" severity="success" className="w-10rem"></Button>
                    </div>
                </div>
            </div>
        </div>
    );
}