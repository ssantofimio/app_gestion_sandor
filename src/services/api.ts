import AsyncStorage from '@react-native-async-storage/async-storage';

// IP y puerto reales del servidor FastAPI
const API_BASE_URL = 'http://144.217.12.198:8010';

// Helper para hacer peticiones con Bearer token automáticamente
async function apiFetch(path: string, options: RequestInit = {}) {
    const token = await AsyncStorage.getItem('token');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

export const authService = {
    login: async (username: string, password: string) => {
        try {
            console.log(`[AuthService] Intentando login para: ${username} en ${API_BASE_URL}/api/mobile/login`);
            const response = await apiFetch('/api/mobile/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });

            console.log(`[AuthService] Respuesta recibida: Status ${response.status}`);
            const data = await response.json();
            console.log(`[AuthService] Datos recibidos:`, data);

            if (!response.ok) {
                return {
                    success: false,
                    message: data.detail || 'Error de autenticación',
                };
            }

            const { token, user } = data;
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            return { success: true, user };
        } catch (error) {
            return { success: false, message: 'Error de conexión con el servidor' };
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    },

    getCurrentUser: async () => {
        const user = await AsyncStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: async () => {
        const token = await AsyncStorage.getItem('token');
        return !!token;
    },

    // Verifica que el token siga válido en el servidor
    fetchMe: async () => {
        try {
            const response = await apiFetch('/api/mobile/me');
            if (!response.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    },
};

export default apiFetch;