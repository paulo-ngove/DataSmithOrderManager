const API_BASE_URL = 'https://localhost:7169/api';

const api = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        
        const isSuccess = response.status >= 200 && response.status <= 209;
        
        if (!isSuccess) {
            const error = await response.json().catch(() => ({ message: `HTTP ${response.status}: Something went wrong` }));
            throw new Error(error.message || `HTTP ${response.status}: Something went wrong`);
        }
        
        if (response.status === 204) return null;
        
        return response.json();
    },

    orders: {
        getAll: (filters = {}) => {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.supplierName) params.append('supplierName', filters.supplierName);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.orderNumber) params.append('orderNumber', filters.orderNumber);
            
            const queryString = params.toString();
            return api.request(`/orders${queryString ? `?${queryString}` : ''}`);
        },

        getById: (id) => api.request(`/orders/${id}`),

        create: (data) => api.request('/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

        update: (id, data) => api.request(`/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

        updateStatus: (id, data) => api.request(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

        delete: (id) => api.request(`/orders/${id}`, {
            method: 'DELETE',
        }),

        getLineItems: (orderId) => api.request(`/orders/${orderId}/items`),

        getStatuses: () => api.request('/orders/statuses'),

        getUnits: () => api.request('/orders/units'),
    },

    lineItems: {
        getAll: (orderId) => {
            const params = new URLSearchParams();
            if (orderId) params.append('orderId', orderId);
            const queryString = params.toString();
            return api.request(`/orderlineitems${queryString ? `?${queryString}` : ''}`);
        },

        getById: (id) => api.request(`/orderlineitems/${id}`),

        create: (data) => api.request('/orderlineitems', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

        update: (id, data) => api.request(`/orderlineitems/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

        delete: (id) => api.request(`/orderlineitems/${id}`, {
            method: 'DELETE',
        }),
    },
};