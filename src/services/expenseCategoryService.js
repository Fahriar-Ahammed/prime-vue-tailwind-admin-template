import apiClient from '../api/client'; // Import your apiClient

const RESOURCE_ENDPOINT = '/expense-categories'; // Define the API endpoint for expense categories

export const expenseCategoryService = {
    /**
     * Fetches a list of expense categories from the API.
     * Extracts the 'expenseCategories' array from the response.
     * @returns {Promise<Array<Object>>} - A promise resolving to an array of expense category objects.
     * @throws {Error} - If the API request fails.
     */
    async fetchExpenseCategories() {
        try {
            const response = await apiClient.get(RESOURCE_ENDPOINT);
            // API response is assumed to be an array of expense categories (based on your example)
            return response; // Or response.expenseCategories if API wraps it in an object
        } catch (error) {
            console.error("Error fetching expense categories:", error);
            throw error;
        }
    },

    /**
     * Fetches a single expense category by its ID.
     * Extracts the expense category object from the response.
     * @param {number|string} expenseCategoryId - The ID of the expense category to fetch.
     * @returns {Promise<Object>} - A promise resolving to a single expense category object.
     * @throws {Error} - If the API request fails.
     */
    async fetchExpenseCategoryById(expenseCategoryId) {
        try {
            const response = await apiClient.get(`${RESOURCE_ENDPOINT}/${expenseCategoryId}`);
            // Assuming API returns a single expense category object directly
            return response;
        } catch (error) {
            console.error(`Error fetching expense category with ID ${expenseCategoryId}:`, error);
            throw error;
        }
    },

    /**
     * Creates a new expense category.
     * Sends expense category data in the format expected by the API.
     * @param {Object} expenseCategoryData - Expense category data object.
     * @returns {Promise<Object>} - A promise resolving to the newly created expense category object.
     * @throws {Error} - If the API request fails.
     */
    async createExpenseCategory(expenseCategoryData) {
        try {
            const response = await apiClient.post(RESOURCE_ENDPOINT, expenseCategoryData);
            return response;
        } catch (error) {
            console.error("Error creating expense category:", error);
            throw error;
        }
    },

    /**
     * Updates an existing expense category.
     * Sends expense category data in the format expected by the API.
     * @param {number|string} expenseCategoryId - The ID of the expense category to update.
     * @param {Object} expenseCategoryData - Updated expense category data object.
     * @returns {Promise<Object>} - A promise resolving to the updated expense category object.
     * @throws {Error} - If the API request fails.
     */
    async updateExpenseCategory(expenseCategoryId, expenseCategoryData) {
        try {
            const response = await apiClient.put(`${RESOURCE_ENDPOINT}/${expenseCategoryId}`, expenseCategoryData); // or .patch()
            return response;
        } catch (error) {
            console.error(`Error updating expense category with ID ${expenseCategoryId}:`, error);
            throw error;
        }
    },

    /**
     * Deletes an expense category by its ID.
     * @param {number|string} expenseCategoryId - The ID of the expense category to delete.
     * @returns {Promise<void>} - A promise that resolves when deletion is successful.
     * @throws {Error} - If the API request fails.
     */
    async deleteExpenseCategory(expenseCategoryId) {
        try {
            await apiClient.delete(`${RESOURCE_ENDPOINT}/${expenseCategoryId}`);
            // No data to return on successful delete
        } catch (error) {
            console.error(`Error deleting expense category with ID ${expenseCategoryId}:`, error);
            throw error;
        }
    }
};