import apiClient from '../api/client'; // Import your apiClient

const RESOURCE_ENDPOINT = '/users'; // Define the API endpoint for users

export const userService = {
    /**
     * Fetches a list of users from the API.
     * @returns {Promise<Array>} - A promise that resolves to an array of user objects.
     * @throws {Error} - If the API request fails.
     */
    async fetchUsers() {
        try {
            const response = await apiClient.get(RESOURCE_ENDPOINT);
            return response.users; // apiClient interceptor returns response.data
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error; // Re-throw the error for component/store handling
        }
    },

    /**
     * Fetches a single user by their ID.
     * @param {number|string} userId - The ID of the user to fetch.
     * @returns {Promise<Object>} - A promise that resolves to a user object.
     * @throws {Error} - If the API request fails.
     */
    async fetchUserById(userId) {
        try {
            const response = await apiClient.get(`${RESOURCE_ENDPOINT}/${userId}`);
            return response;
        } catch (error) {
            console.error(`Error fetching user with ID ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Creates a new user.
     * @param {Object} userData - Data for the new user (should match API request body).
     * @returns {Promise<Object>} - A promise that resolves to the newly created user object.
     * @throws {Error} - If the API request fails.
     */
    async createUser(userData) {
        try {
            const response = await apiClient.post(RESOURCE_ENDPOINT, userData);
            return response;
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    },

    /**
     * Updates an existing user.
     * @param {number|string} userId - The ID of the user to update.
     * @param {Object} userData - Updated user data (should match API request body for updates).
     * @returns {Promise<Object>} - A promise that resolves to the updated user object.
     * @throws {Error} - If the API request fails.
     */
    async updateUser(userId, userData) {
        try {
            const response = await apiClient.put(`${RESOURCE_ENDPOINT}/${userId}`, userData); // or .patch() for partial updates
            return response;
        } catch (error) {
            console.error(`Error updating user with ID ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Deletes a user by their ID.
     * @param {number|string} userId - The ID of the user to delete.
     * @returns {Promise<void>} - A promise that resolves when deletion is successful.
     * @throws {Error} - If the API request fails.
     */
    async deleteUser(userId) {
        try {
            await apiClient.delete(`${RESOURCE_ENDPOINT}/${userId}`);
            // No data to return on successful delete (usually status 204 No Content)
        } catch (error) {
            console.error(`Error deleting user with ID ${userId}:`, error);
            throw error;
        }
    }
};