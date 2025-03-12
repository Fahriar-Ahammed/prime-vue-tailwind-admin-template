import apiClient from '../api/client'; // Import your apiClient

const RESOURCE_ENDPOINT = '/expenses'; // Define the API endpoint for expenses

export const expenseService = {
    /**
     * Fetches a list of expenses from the API.
     * Extracts the 'expenses' array from the response.
     * @returns {Promise<Array<Object>>} - A promise resolving to an array of expense objects.
     * @throws {Error} - If the API request fails.
     */
    async fetchExpenses() {
        try {
            const response = await apiClient.get(RESOURCE_ENDPOINT);
            // API response is assumed to be an array of expenses (based on your example)
            return response; // Or response.expenses if API wraps it in an object
        } catch (error) {
            console.error("Error fetching expenses:", error);
            throw error;
        }
    },

    /**
     * Fetches a single expense by its ID.
     * Extracts the expense object from the response.
     * @param {number|string} expenseId - The ID of the expense to fetch.
     * @returns {Promise<Object>} - A promise resolving to a single expense object.
     * @throws {Error} - If the API request fails.
     */
    async fetchExpenseById(expenseId) {
        try {
            const response = await apiClient.get(`${RESOURCE_ENDPOINT}/${expenseId}`);
            // Assuming API returns a single expense object directly
            return response;
        } catch (error) {
            console.error(`Error fetching expense with ID ${expenseId}:`, error);
            throw error;
        }
    },

    /**
     * Creates a new expense.
     * Sends expense data in the format expected by the API.
     * @param {Object} expenseData - Expense data object.
     * @returns {Promise<Object>} - A promise resolving to the newly created expense object.
     * @throws {Error} - If the API request fails.
     */
    async createExpense(expenseData) {
        try {
            const response = await apiClient.post(RESOURCE_ENDPOINT, expenseData);
            return response;
        } catch (error) {
            console.error("Error creating expense:", error);
            throw error;
        }
    },

    /**
     * Updates an existing expense.
     * Sends expense data in the format expected by the API.
     * @param {number|string} expenseId - The ID of the expense to update.
     * @param {Object} expenseData - Updated expense data object.
     * @returns {Promise<Object>} - A promise resolving to the updated expense object.
     * @throws {Error} - If the API request fails.
     */
    async updateExpense(expenseId, expenseData) {
        try {
            const response = await apiClient.put(`${RESOURCE_ENDPOINT}/${expenseId}`, expenseData); // or .patch()
            return response;
        } catch (error) {
            console.error(`Error updating expense with ID ${expenseId}:`, error);
            throw error;
        }
    },

    /**
     * Deletes an expense by its ID.
     * @param {number|string} expenseId - The ID of the expense to delete.
     * @returns {Promise<void>} - A promise that resolves when deletion is successful.
     * @throws {Error} - If the API request fails.
     */
    async deleteExpense(expenseId) {
        try {
            await apiClient.delete(`${RESOURCE_ENDPOINT}/${expenseId}`);
            // No data to return on successful delete
        } catch (error) {
            console.error(`Error deleting expense with ID ${expenseId}:`, error);
            throw error;
        }
    }
};