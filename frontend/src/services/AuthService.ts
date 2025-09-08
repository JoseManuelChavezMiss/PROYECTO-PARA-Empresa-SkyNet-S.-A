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

const login = async (data: LoginData): Promise<AuthResponse> => {
    const response = await  axiosClient.post<AuthResponse>('/api/auth/login', data);
    if (response.status !== 200) {
        throw new Error('Login failed');
    }else{
        return response.data;
    }
}

export { login };