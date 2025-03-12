// src/api/client.js
import axios from 'axios';
import { authService } from '../services/authService'; // Import authService

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // Use environment variable for base URL
    timeout: 10000, // Keep your timeout
    headers: {
        'Content-Type': 'application/json', // Keep content type
        'Accept': 'application/json',       // Add Accept header for JSON (good practice)
    }
});

// Request interceptor
apiClient.interceptors.request.use(config => {
    const accessToken = authService.getAccessToken(); // Get token from authService
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`; // Set Authorization header
    }
    return config;
});

// Response interceptor
apiClient.interceptors.response.use(
    response => {
        return response.data; // Return response.data for successful responses (as you were doing)
    },
    error => {
        if (error.response?.status === 401) {
            // Handle 401 Unauthorized - token expired or invalid
            console.log('API Error 401: Unauthorized. Logging out.');
            authService.logout(); // Clear token and role from localStorage
            // Optionally redirect to login page here if you have access to router
            // (You might need to import router or use window.location.href for redirect)
            // Example redirect (if you can access router here -  be careful of circular dependencies):
            // import router from '../router';
            // router.push('/login');
            // For a simpler approach without router in interceptor, you can just reload the page:
            // window.location.reload(); // Reload to effectively redirect to login page due to route guard
        }
        return Promise.reject(error.response?.data || error.message); // Reject with error data or message
    }
);

export default apiClient;