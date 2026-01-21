const utils = {
    formatDate: (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    },

    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    },

    showLoading: (element) => {
        element.innerHTML = `
            <div class="flex flex-col items-center justify-center p-8">
                <div class="spinner spinner-lg"></div>
                <p class="mt-4 text-gray-600">Loading...</p>
            </div>
        `;
    },

    showError: (element, message) => {
        element.innerHTML = `
            <div class="alert alert-error">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <p>${message}</p>
                </div>
                <button onclick="location.reload()" class="mt-3 text-red-700 hover:text-red-800 font-medium text-sm">
                    Try again
                </button>
            </div>
        `;
    },

    showErrorAlert: (message) => {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger mb-4';
        alert.innerHTML = `
            <div class="alert alert-danger mb-4 flex items-center">
                <i class="fas fa-exclamation-circle mr-2"></i>
                <p>${message}</p>
            </div>
        `;
        
        const content = document.getElementById('content');
        if (content) {
            content.insertBefore(alert, content.firstChild);
            setTimeout(() => alert.remove(), 4000);
        }
    },

    showSuccess: (message) => {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success mb-4';
        alert.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <p>${message}</p>
            </div>
        `;
        
        const content = document.getElementById('content');
        content.insertBefore(alert, content.firstChild);
        
        setTimeout(() => alert.remove(), 4000);
    },

    getStatusBadge: (status) => {
        const statusMap = {
            0: { class: 'badge-draft', text: 'Draft' },
            1: { class: 'badge-pending', text: 'Pending' },
            2: { class: 'badge-approved', text: 'Approved' },
            3: { class: 'badge-ordered', text: 'Ordered' },
            4: { class: 'badge-received', text: 'Received' },
            5: { class: 'badge badge-teal-100 text-teal-800', text: 'Partially Received' },
            6: { class: 'badge-cancelled', text: 'Cancelled' },
            7: { class: 'badge badge-orange-100 text-orange-800', text: 'On Hold' },
        };
        
        const config = statusMap[status] || { class: 'badge-draft', text: 'Unknown' };
        return `<span class="badge ${config.class}">${config.text}</span>`;
    },

    showConfirmation: (message, onConfirm) => {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
        dialog.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirm Action</h3>
                <p class="text-gray-600 mb-6">${message}</p>
                <div class="flex justify-end space-x-3">
                    <button id="cancelBtn" class="btn btn-secondary">Cancel</button>
                    <button id="confirmBtn" class="btn btn-danger">Confirm</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('#cancelBtn').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        dialog.querySelector('#confirmBtn').addEventListener('click', () => {
            onConfirm();
            document.body.removeChild(dialog);
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
            }
        });
    },
};