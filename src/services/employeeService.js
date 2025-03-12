import apiClient from '../api/client'; // Import your apiClient

const RESOURCE_ENDPOINT = '/employees'; // Define the API endpoint for employees

export const employeeService = {
    /**
     * Fetches a list of employees from the API.
     * Extracts the 'employees' array from the response.
     * @returns {Promise<Array<Object>>} - A promise resolving to an array of employee objects.
     * @throws {Error} - If the API request fails.
     */
    async fetchEmployees() {
        try {
            const response = await apiClient.get(RESOURCE_ENDPOINT);
            // API response is { "employees": [...] } - extract the employees array
            return response.employees;
        } catch (error) {
            console.error("Error fetching employees:", error);
            throw error;
        }
    },

    /**
     * Fetches a single employee by their ID.
     * Extracts the employee object from the response.
     * @param {number|string} employeeId - The ID of the employee to fetch.
     * @returns {Promise<Object>} - A promise resolving to a single employee object.
     * @throws {Error} - If the API request fails.
     */
    async fetchEmployeeById(employeeId) {
        try {
            const response = await apiClient.get(`${RESOURCE_ENDPOINT}/${employeeId}`);
            // Assuming API returns a single employee object directly, or adjust if needed.
            return response;
        } catch (error) {
            console.error(`Error fetching employee with ID ${employeeId}:`, error);
            throw error;
        }
    },

    /**
     * Creates a new employee.
     * Sends employee data in the format expected by the API.
     * @param {Object} employeeData - Employee data object.
     * @returns {Promise<Object>} - A promise resolving to the newly created employee object.
     * @throws {Error} - If the API request fails.
     */
    async createEmployee(employeeData) {
        try {
            const response = await apiClient.post(RESOURCE_ENDPOINT, employeeData);
            return response;
        } catch (error) {
            console.error("Error creating employee:", error);
            throw error;
        }
    },

    /**
     * Updates an existing employee.
     * Sends employee data in the format expected by the API.
     * @param {number|string} employeeId - The ID of the employee to update.
     * @param {Object} employeeData - Updated employee data object.
     * @returns {Promise<Object>} - A promise resolving to the updated employee object.
     * @throws {Error} - If the API request fails.
     */
    async updateEmployee(employeeId, employeeData) {
        try {
            const response = await apiClient.put(`${RESOURCE_ENDPOINT}/${employeeId}`, employeeData); // or .patch()
            return response;
        } catch (error) {
            console.error(`Error updating employee with ID ${employeeId}:`, error);
            throw error;
        }
    },

    /**
     * Deletes an employee by their ID.
     * @param {number|string} employeeId - The ID of the employee to delete.
     * @returns {Promise<void>} - A promise that resolves when deletion is successful.
     * @throws {Error} - If the API request fails.
     */
    async deleteEmployee(employeeId) {
        try {
            await apiClient.delete(`${RESOURCE_ENDPOINT}/${employeeId}`);
            // No data to return on successful delete
        } catch (error) {
            console.error(`Error deleting employee with ID ${employeeId}:`, error);
            throw error;
        }
    }
};