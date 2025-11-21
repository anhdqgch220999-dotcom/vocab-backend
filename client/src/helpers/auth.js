import { reactive } from 'vue'
import { api } from './api'

export const authStore = reactive({
    user: null,
    token: localStorage.getItem('token'),
    isLoggedIn: false,
    isInitialized: false,

    // Khởi tạo auth state
    async init() {
        if (this.token) {
            try {
                const userData = await api.get('/auth/profile');
                if (userData.success) {
                    this.user = userData.user;
                    this.isLoggedIn = true;
                } else {
                    this.logout();
                }
            } catch (error) {
                this.logout();
            }
        } else {
            this.user = null;
            this.isLoggedIn = false;
        }
    },

    // Đăng nhập
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials);
            
            if (response.success) {
                this.token = response.token;
                this.user = response.user;
                this.isLoggedIn = true;
                localStorage.setItem('token', response.token);
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message || 'Login failed' };
            }
        } catch (error) {
            return { success: false, message: error.message || 'Login failed' };
        }
    },

    // Đăng ký
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            
            if (response.success) {
                this.token = response.token;
                this.user = response.user;
                this.isLoggedIn = true;
                localStorage.setItem('token', response.token);
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message || 'Registration failed' };
            }
        } catch (error) {
            return { success: false, message: error.message || 'Registration failed' };
        }
    },

    // Đăng xuất
    logout() {
        this.user = null;
        this.token = null;
        this.isLoggedIn = false;
        this.isInitialized = false;
        localStorage.removeItem('token');
    }
});
