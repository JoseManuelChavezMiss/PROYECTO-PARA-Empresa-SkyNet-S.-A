import axiosClient from "./axiosCliente";

interface LoginData {
    email: string;
    password: string;
}

interface Rol {
  id: number;
  nombre: string;
}

interface AuthUser {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
}

interface AuthResponse {
  status: number;        // viene en el JSON (200)
  mensaje: string;       // "Login exitoso"
  type: string;          // "Bearer"
  token: string;         // JWT / token
  user: AuthUser;        // objeto usuario completo
}

interface LogoutResponse {
  mensaje: string;
}

const login = async (data: LoginData): Promise<AuthResponse> => {
    const response = await  axiosClient.post<AuthResponse>('/api/auth/login', data);
    if (response.status !== 200) {
        throw new Error('Login failed');
    }else{
        return response.data;
    }
}

const logout = async (): Promise<{ ok: boolean; mensaje: string }> => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) return { ok: true, mensaje: 'Sesión ya cerrada' }
    await axiosClient.get<LogoutResponse>('/api/logout', {
      headers: { Authorization: `Bearer ${token}` }
    })

    localStorage.removeItem('auth_token')
    return { ok: true, mensaje: 'Logout exitoso' }
  } catch (e: any) {
    if (e?.response?.status === 401) {
      localStorage.removeItem('auth_token')
      return { ok: true, mensaje: 'Token inválido. Sesión cerrada.' }
    }
    return { ok: false, mensaje: e?.response?.data?.mensaje ?? 'Error al cerrar sesión' }
  }
}

//metodo para verificar si el usuario Supervisor Tecnico Cliente

const getUserRole = (): string | null => {
  const user = localStorage.getItem('role');
  return user
  
}

const isAdministrador = (): boolean => {
  console.log('Role:', getUserRole());
  return getUserRole() === 'Administrador';
}

const isSupervisor = (): boolean => {
  return getUserRole() === 'Supervisor';
}

const isTecnico = (): boolean => {
  return getUserRole() === 'Tecnico';
}

export { login, logout, getUserRole, isAdministrador, isSupervisor, isTecnico };