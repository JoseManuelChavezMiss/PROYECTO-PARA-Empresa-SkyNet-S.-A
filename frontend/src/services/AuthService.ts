import axiosClient from "./axiosCliente";

interface LoginData {
    email: string;
    password: string;
}

interface AuthResponse {
    type: string;
    token: string;
    mensaje?: string;
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