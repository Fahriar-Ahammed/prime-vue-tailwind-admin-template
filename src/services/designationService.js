import apiClient from '../api/client'; // Import your apiClient

const RESOURCE_ENDPOINT = '/designations'; // Define the API endpoint for designations

export const designationService = {
    /**
     * Fetches a list of designations from the API.
     * Extracts the 'designations' array from the response.
     * @returns {Promise<Array<Object>>} - A promise resolving to an array of designation objects.
     * @throws {Error} - If the API request fails.
     */
    async fetchDesignations() {
        try {
            const response = await apiClient.get(RESOURCE_ENDPOINT);
            // API response is { "designations": [...] } - extract the designations array
            return response.designations;
        } catch (error) {
            console.error("Error fetching designations:", error);
            throw error;
        }
    },

    /**
     * Fetches a single designation by its ID.
     * Extracts the designation object from the response.
     * @param {number|string} designationId - The ID of the designation to fetch.
     * @returns {Promise<Object>} - A promise resolving to a single designation object.
     * @throws {Error} - If the API request fails.
     */
    async fetchDesignationById(designationId) {
        try {
            const response = await apiClient.get(`${RESOURCE_ENDPOINT}/${designationId}`);
            // Assuming API returns a single designation object directly, or adjust if needed.
            return response;
        } catch (error) {
            console.error(`Error fetching designation with ID ${designationId}:`, error);
            throw error;
        }
    },

    /**
     * Creates a new designation.
     * Sends designation data in the format expected by the API.
     * @param {Object} designationData - Designation data object.
     * @returns {Promise<Object>} - A promise resolving to the newly created designation object.
     * @throws {Error} - If the API request fails.
     */
    async createDesignation(designationData) {
        try {
            const response = await apiClient.post(RESOURCE_ENDPOINT, designationData);
            return response;
        } catch (error) {
            console.error("Error creating designation:", error);
            throw error;
        }
    },

    /**
     * Updates an existing designation.
     * Sends designation data in the format expected by the API.
     * @param {number|string} designationId - The ID of the designation to update.
     * @param {Object} designationData - Updated designation data object.
     * @returns {Promise<Object>} - A promise resolving to the updated designation object.
     * @throws {Error} - If the API request fails.
     */
    async updateDesignation(designationId, designationData) {
        try {
            const response = await apiClient.put(`${RESOURCE_ENDPOINT}/${designationId}`, designationData); // or .patch()
            return response;
        } catch (error) {
            console.error(`Error updating designation with ID ${designationId}:`, error);
            throw error;
        }
    },

    /**
     * Deletes a designation by its ID.
     * @param {number|string} designationId - The ID of the designation to delete.
     * @returns {Promise<void>} - A promise that resolves when deletion is successful.
     * @throws {Error} - If the API request fails.
     */
    async deleteDesignation(designationId) {
        try {
            await apiClient.delete(`${RESOURCE_ENDPOINT}/${designationId}`);
            // No data to return on successful delete
        } catch (error) {
            console.error(`Error deleting designation with ID ${designationId}:`, error);
            throw error;
        }
    }
};