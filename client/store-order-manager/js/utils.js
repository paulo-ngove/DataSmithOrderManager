const utils = {
    formatDate: (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    },

    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
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
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle text-red-600 mr-2"></i>
                <p class="text-sm text-red-700">
                    ${message}
                </p>
            </div>
            <button onclick="location.reload()" class="mt-3 text-red-700 hover:text-red-800 font-medium text-sm">
                Try again
            </button>
        </div>
        `;
    },

    showErrorAlert: (message) => {
        const alert = document.createElement('div');
        alert.innerHTML = `
             <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-600 mr-2"></i>
                    <p class="text-sm text-red-700">
                        ${message}
                    </p>
                </div>
            </div>
        `;
  
        const content = document.getElementById('content');
        if (content) {
            content.insertBefore(alert, content.firstChild);
            setTimeout(() => alert.remove(), 6000);
        }
    },

    showSuccess: (message) => {
        const alert = document.createElement('div');
        alert.innerHTML = `
             <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-600 mr-2"></i>
                    <p class="text-sm text-green-700">
                        ${message}
                    </p>
                </div>
              </div>
        `;
        
        const content = document.getElementById('content');
        content.insertBefore(alert, content.firstChild);
        
        setTimeout(() => alert.remove(), 6000);
    },

    getUnitDisplayName(unitValue) {
        switch (unitValue) {
        case 0: return "Piece";
        case 1: return "Kilogram";
        case 2: return "Gram";
        case 3: return "Liter";
        case 4: return "Milliliter";
        case 5: return "Meter";
        case 6: return "Centimeter";
        case 7: return "Box";
        case 8: return "Pack";
        case 9: return "Pair";
        case 10: return "Dozen";
        case 11: return "Roll";
        case 12: return "Bottle";
        case 13: return "Can";
        case 14: return "Bag";
        case 15: return "Case";
        default: return `Unknown (${unitValue})`;
        }
    },

    getOrderStatusName(statusValue) {
        const statusNames = [
            "Draft",
            "Pending",
            "Approved",
            "Ordered",
            "Received",
            "PartiallyReceived",
            "Cancelled",
            "OnHold"
        ];
        
        return statusNames[statusValue] !== undefined 
            ? statusNames[statusValue] 
            : `Unknown (${statusValue})`;
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