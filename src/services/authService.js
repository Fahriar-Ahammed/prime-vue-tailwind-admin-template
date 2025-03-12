import apiClient from '../api/client'; // Import your apiClient

const RESOURCE_ENDPOINT = '/login'; // Or your auth endpoint base URL, adjust if needed

export const authService = {
    async login(credentials) {
        try {
            return await apiClient.post(`${RESOURCE_ENDPOINT}`, credentials);
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },

    async logout() {
        try {
            // await apiClient.post(`${RESOURCE_ENDPOINT}/logout`); // Assuming you have a logout endpoint
            localStorage.removeItem('accessToken'); // Clear token on logout
            localStorage.removeItem('userRole');    // Clear role on logout
        } catch (error) {
            console.error("Logout error:", error);
            // Consider whether to still clear token and role even if logout request fails from server side.
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            throw error; // Or you might choose to handle error silently and just clear local storage
        }
    },

    getAccessToken() {
        return localStorage.getItem('accessToken');
    },

    getUserRole() {
        return localStorage.getItem('userRole');
    },

    isAuthenticated() {
        return !!localStorage.getItem('accessToken'); // Check if access token exists
    }
};