import API from './api';

const vehicleService = {
    // Get all vehicles
    getAll: async () => {
        try {
            const response = await API.get('/vehicles');
            return response.data;
        } catch (error) {
            console.error('API Error:', error.response || error);
            throw error.response?.data || { message: 'Failed to fetch vehicles' };
        }
    },

    // Create new vehicle
    create: async (vehicleData) => {
        try {
            const response = await API.post('/vehicles', vehicleData);
            return response.data;
        } catch (error) {
            console.error('API Error:', error.response || error);
            throw error.response?.data || { message: 'Failed to create vehicle' };
        }
    },

    // Update vehicle status
    updateStatus: async (id, status) => {
        try {
            const response = await API.put(`/vehicles/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('API Error:', error.response || error);
            throw error.response?.data || { message: 'Failed to update status' };
        }
    },

    // Delete vehicle
    delete: async (id) => {
        try {
            const response = await API.delete(`/vehicles/${id}`);
            return response.data;
        } catch (error) {
            console.error('API Error:', error.response || error);
            throw error.response?.data || { message: 'Failed to delete vehicle' };
        }
    }
};

export default vehicleService;