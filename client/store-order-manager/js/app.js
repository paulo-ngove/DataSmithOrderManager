document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    loadPage();
    setupNavigation();
});

function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuButton.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.className = 'fas fa-bars text-xl';
            } else {
                icon.className = 'fas fa-times text-xl';
            }
        });
    }
}

function setupNavigation() {
    document.addEventListener('click', (e) => {
        if (e.target.matches('.nav-link, .mobile-nav-link') || 
            e.target.closest('.nav-link, .mobile-nav-link')) {
            e.preventDefault();
            const link = e.target.closest('.nav-link, .mobile-nav-link');
            const page = link.getAttribute('href');
            loadPage(page);
            
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(el => {
                el.classList.remove('active');
            });
            link.classList.add('active');
        }
    });
}

function loadPage(page = null) {
    if (!page) {
        page = window.location.hash.substring(1) || 'dashboard';
    }
    
    const content = document.getElementById('content');
    
    let pageName = page;
    let params = {};
    
    if (page.includes('?')) {
        const parts = page.split('?');
        pageName = parts[0];
        const queryString = parts[1];
        const urlParams = new URLSearchParams(queryString);
        params = Object.fromEntries(urlParams.entries());
    }
    
    switch(pageName) {
        case 'dashboard':
            loadDashboard(content);
            break;
        case 'orders':
        case 'orders.html':
            loadOrders(content);
            break;
        case 'create-order':
        case 'create-order.html':
            loadCreateOrder(content);
            break;
        case 'edit-order':
            const editId = params.id ? parseInt(params.id) : null;
            if (editId) {
                loadEditOrder(content, editId);
            } else {
                loadOrders(content);
            }
            break;
        case 'order-detail':
            const id = params.id ? parseInt(params.id) : null;
            if (id) {
                loadOrderDetail(content, id);
            } else {
                loadOrders(content);
            }
            break;
        default:
            loadDashboard(content);
    }
    
    if (!page.includes('.html')) {
        window.history.pushState({}, '', `#${page}`);
    }
}

function viewOrder(orderId) {
    loadPage(`order-detail?id=${orderId}`);
}

function editOrder(orderId) {
    loadPage(`edit-order?id=${orderId}`);
}

async function loadDashboard(container) {
    utils.showLoading(container);
    
    try {
        const orders = await api.orders.getAll();
        
        const stats = {
            total: orders.length,
            pending: orders.filter(o => o.status === 1).length,
            approved: orders.filter(o => o.status === 2).length,
            received: orders.filter(o => o.status === 4).length,
            totalAmount: orders.reduce((sum, o) => sum + o.totalAmount, 0),
        };
        
        container.innerHTML = `
            <div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p class="text-gray-600 mb-8">Welcome to Store Orders Management System</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="card">
                        <div class="flex items-center">
                            <div class="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                                <i class="fas fa-shopping-cart text-xl"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Total Orders</p>
                                <p class="text-2xl font-bold">${stats.total}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="flex items-center">
                            <div class="p-3 rounded-lg bg-yellow-100 text-yellow-600 mr-4">
                                <i class="fas fa-clock text-xl"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Pending</p>
                                <p class="text-2xl font-bold">${stats.pending}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="flex items-center">
                            <div class="p-3 rounded-lg bg-green-100 text-green-600 mr-4">
                                <i class="fas fa-check-circle text-xl"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Received</p>
                                <p class="text-2xl font-bold">${stats.received}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="flex items-center">
                            <div class="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
                                <i class="fas fa-dollar-sign text-xl"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Total Amount</p>
                                <p class="text-2xl font-bold">${utils.formatCurrency(stats.totalAmount)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-lg font-semibold text-gray-900">Recent Orders</h2>
                        <a href="#orders" class="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            View All →
                        </a>
                    </div>
                    
                   ${orders.length > 0 ? `
                    <div class="table-container">
                        <table class="min-w-full border border-gray-300 bg-white rounded-lg shadow-md">
                            <thead>
                                <tr>
                                    <th class="w-1/6 px-6 py-3">Order #</th>
                                    <th class="w-1/4 px-6 py-3">Supplier</th>
                                    <th class="w-1/6 px-6 py-3">Date</th>
                                    <th class="w-1/6 px-6 py-3">Status</th>
                                    <th class="w-1/6 px-6 py-3">Total</th>
                                    <th class="w-1/6 px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orders.slice(0, 5).map(order => `
                                    <tr>
                                        <td class="font-medium px-6 py-4">${order.orderNumber}</td>
                                        <td class="px-6 py-4">${order.supplierName}</td>
                                        <td class="px-6 py-4">${utils.formatDate(order.orderDate)}</td>
                                        <td class="px-6 py-4">${utils.getStatusBadge(order.status)}</td>
                                        <td class="px-6 py-4 font-semibold">${utils.formatCurrency(order.totalAmount)}</td>
                                        <td class="px-6 py-4">
                                            <div class="table-actions">
                                                <button onclick="viewOrder(${order.id})" class="text-blue-600 hover:text-blue-700" title="View">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button onclick="deleteOrder(${order.id})" class="text-red-600 hover:text-red-700 ml-2" title="Delete">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ` : `
                        <div class="text-center py-8">
                            <i class="fas fa-box text-gray-300 text-4xl mb-4"></i>
                            <p class="text-gray-500">No orders found</p>
                            <a href="#create-order" class="btn btn-primary mt-4 inline-block">Create First Order</a>
                        </div>
                    `}
                </div>
            </div>
        `;
    } catch (error) {
        utils.showError(container, error.message);
    }
}

async function loadOrders(container, filters = {}) {
    utils.showLoading(container);
    
    try {
        const orders = await api.orders.getAll(filters);
        
        container.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Purchase Orders</h1>
                        <p class="text-gray-600">Manage your store purchase orders</p>
                    </div>
                    <a href="#create-order" class="btn btn-primary flex items-center space-x-2">
                        <i class="fas fa-plus"></i>
                        <span>New Order</span>
                    </a>
                </div>
                
                <div class="card mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                    <form id="filterForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                            <input type="text" name="orderNumber" class="input-field" placeholder="Search...">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                            <input type="text" name="supplierName" class="input-field" placeholder="Supplier name">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select name="status" class="input-field">
                                <option value="">All Statuses</option>
                                <option value="0">Draft</option>
                                <option value="1">Pending</option>
                                <option value="2">Approved</option>
                                <option value="3">Ordered</option>
                                <option value="4">Received</option>
                                <option value="6">Cancelled</option>
                            </select>
                        </div>
                        <div class="flex items-end">
                            <button type="submit" class="btn btn-primary w-full">Apply Filters</button>
                        </div>
                    </form>
                </div>
                
                <div class="card">
                    ${orders.length > 0 ? `
                        <div class="table-container">
                            <table class="min-w-full border border-gray-300 bg-white rounded-lg shadow-md">
                                <thead>
                                    <tr>
                                        <th class="w-1/6 px-6 py-3">Order #</th>
                                        <th class="w-1/6 px-6 py-3">Supplier</th>
                                        <th class="w-1/6 px-6 py-3">Date</th>
                                        <th class="w-1/6 px-6 py-3">Expected Delivery</th>
                                        <th class="w-1/6 px-6 py-3">Status</th>
                                        <th class="w-1/6 px-6 py-3">Total</th>
                                        <th class="w-1/6 px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${orders.map(order => `
                                        <tr>
                                            <td class="font-medium px-6 py-4">${order.orderNumber}</td>
                                            <td class="px-6 py-4">${order.supplierName}</td>
                                            <td class="px-6 py-4">${utils.formatDate(order.orderDate)}</td>
                                            <td class="px-6 py-4">${order.expectedDeliveryDate ? utils.formatDate(order.expectedDeliveryDate) : 'N/A'}</td>
                                            <td class="px-6 py-4">${utils.getStatusBadge(order.status)}</td>
                                            <td class="font-semibold px-6 py-4">${utils.formatCurrency(order.totalAmount)}</td>
                                            <td class="px-6 py-4">
                                                <div class="table-actions">
                                                    <button onclick="viewOrder(${order.id})" class="text-blue-600 hover:text-blue-700" title="View">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                    <button onclick="editOrder(${order.id})" class="text-green-600 hover:text-green-700 ml-2" title="Edit">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button onclick="deleteOrder(${order.id})" class="text-red-600 hover:text-red-700 ml-2" title="Delete">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="text-center py-12">
                            <i class="fas fa-box text-gray-300 text-5xl mb-4"></i>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                            <p class="text-gray-600 mb-6">Get started by creating your first purchase order.</p>
                            <a href="#create-order" class="btn btn-primary">Create Order</a>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        const filterForm = document.getElementById('filterForm');
        if (filterForm) {
            filterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(filterForm);
                const filters = Object.fromEntries(formData.entries());
                Object.keys(filters).forEach(key => {
                    if (!filters[key]) delete filters[key];
                });
                loadOrders(container, filters);
            });
        }
        
    } catch (error) {
        utils.showError(container, error.message);
    }
}

function loadCreateOrder(container) {
    container.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <a href="#orders" class="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                <i class="fas fa-arrow-left mr-2"></i>
                Back to Orders
            </a>
            
            <div class="card">
                <div class="mb-8">
                    <h1 class="text-2xl font-bold text-gray-900">Create New Purchase Order</h1>
                    <p class="text-gray-600">Fill in the details below to create a new purchase order</p>
                </div>
                
                <form id="createOrderForm">
                    <input type="hidden" name="orderNumber" value="">
                    <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div class="flex items-center">
                            <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                            <p class="text-sm text-blue-700">
                                Order number will be auto-generated when you submit the form.
                            </p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Order Date *</label>
                            <input type="date" name="orderDate" class="input-field" required value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                            <input type="text" name="supplierName" class="input-field" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Contact</label>
                            <input type="text" name="supplierContact" class="input-field">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Email</label>
                            <input type="email" name="supplierEmail" class="input-field">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
                            <input type="date" name="expectedDeliveryDate" class="input-field">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select name="status" class="input-field">
                                <option value="0">Draft</option>
                                <option value="1">Pending</option>
                                <option value="2">Approved</option>
                            </select>
                        </div>
                        
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea name="notes" class="input-field" rows="3"></textarea>
                        </div>
                    </div>
                    
                    <div class="mb-8">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-lg font-semibold text-gray-900">Order Line Items</h2>
                            <button type="button" onclick="addLineItem()" class="btn btn-secondary">
                                <i class="fas fa-plus mr-2"></i> Add Item
                            </button>
                        </div>
                        
                        <div id="lineItemsContainer" class="space-y-4">
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3">
                        <a href="#orders" class="btn btn-secondary">Cancel</a>
                        <button type="submit" class="btn btn-primary">
                            <span id="submitText">Create Order</span>
                            <span id="submitSpinner" class="hidden">
                                <i class="fas fa-spinner fa-spin ml-2"></i>
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    addLineItem();
    
    const form = document.getElementById('createOrderForm');
    form.addEventListener('submit', handleCreateOrder);
}

function addLineItem() {
    const container = document.getElementById('lineItemsContainer');
    const index = container.children.length;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'card';
    itemDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div class="md:col-span-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" name="lineItems[${index}].productName" class="input-field" required>
            </div>
            
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Product Code</label>
                <input type="text" name="lineItems[${index}].productCode" class="input-field">
            </div>
            
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input type="number" name="lineItems[${index}].quantity" class="input-field" step="0.001" min="0.001" required>
            </div>
            
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select name="lineItems[${index}].unit" class="input-field">
                    <option value="0">Piece</option>
                    <option value="1">Kilogram</option>
                    <option value="2">Gram</option>
                    <option value="3">Liter</option>
                    <option value="4">Milliliter</option>
                    <option value="7">Box</option>
                    <option value="8">Pack</option>
                    <option value="9">Pair</option>
                    <option value="10">Dozen</option>
                </select>
            </div>
            
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                <input type="number" name="lineItems[${index}].unitPrice" class="input-field" step="0.01" min="0" required>
            </div>
            
            <div class="md:col-span-12 flex justify-end">
                <button type="button" onclick="removeLineItem(this)" class="text-red-600 hover:text-red-700">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(itemDiv);
}

function removeLineItem(button) {
    const container = document.getElementById('lineItemsContainer');
    if (container.children.length > 1) {
        button.closest('.card').remove();
        Array.from(container.children).forEach((child, index) => {
            child.querySelectorAll('input, select').forEach(input => {
                const name = input.getAttribute('name');
                if (name) {
                    input.setAttribute('name', name.replace(/\[\d+\]/, `[${index}]`));
                }
            });
        });
    }
}

async function handleCreateOrder(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitText = submitBtn.querySelector('#submitText');
    const submitSpinner = submitBtn.querySelector('#submitSpinner');
    
    submitText.classList.add('hidden');
    submitSpinner.classList.remove('hidden');
    
    try {
        const formData = new FormData(form);
        const data = {
            orderNumber: formData.get('orderNumber') || 'temp-order-number',
            orderDate: formData.get('orderDate'),
            supplierName: formData.get('supplierName'),
            supplierContact: formData.get('supplierContact') || undefined,
            supplierEmail: formData.get('supplierEmail') || undefined,
            status: parseInt(formData.get('status')),
            expectedDeliveryDate: formData.get('expectedDeliveryDate') || undefined,
            notes: formData.get('notes') || undefined,
            orderLineItems: []
        };
        
        const lineItemCount = document.getElementById('lineItemsContainer').children.length;
        for (let i = 0; i < lineItemCount; i++) {
            const item = {
                productName: formData.get(`lineItems[${i}].productName`),
                productCode: formData.get(`lineItems[${i}].productCode`) || undefined,
                quantity: parseFloat(formData.get(`lineItems[${i}].quantity`)),
                unit: utils.getUnitDisplayName(parseInt(formData.get(`lineItems[${i}].unit`))),
                unitPrice: parseFloat(formData.get(`lineItems[${i}].unitPrice`))
            };
            data.orderLineItems.push(item);
        }
        
        await api.orders.create(data);
        
        utils.showSuccess('Order created successfully!');
        setTimeout(() => loadPage('orders'), 1500);
        
    } catch (error) {
        utils.showErrorAlert(error.message || 'Failed to create order');
    } finally {
        submitText.classList.remove('hidden');
        submitSpinner.classList.add('hidden');
    }
}

async function loadOrderDetail(container, orderId) {
    utils.showLoading(container);
    
    try {
        const order = await api.orders.getById(orderId);
        const lineItems = await api.orders.getLineItems(orderId);
        
        container.innerHTML = `
            <div>
                <div class="flex items-center justify-between mb-8">
                    <a href="#orders" class="flex items-center text-gray-600 hover:text-gray-900">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Back to Orders
                    </a>
                    
                    <div class="flex space-x-3">
                        <button onclick="editOrder(${order.id})" class="btn btn-secondary">
                            <i class="fas fa-edit mr-2"></i> Edit
                        </button>
                        <button onclick="deleteOrder(${order.id})" class="btn btn-danger">
                            <i class="fas fa-trash mr-2"></i> Delete
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div class="lg:col-span-2">
                        <div class="card">
                            <div class="flex justify-between items-start mb-6">
                                <div>
                                    <h1 class="text-2xl font-bold text-gray-900">${order.orderNumber}</h1>
                                    <p class="text-gray-600">${order.supplierName}</p>
                                </div>
                                ${utils.getStatusBadge(order.status)}
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 class="text-sm font-medium text-gray-500 mb-2">Order Details</h3>
                                    <div class="space-y-2">
                                        <p><span class="font-medium">Order Date:</span> ${utils.formatDate(order.orderDate)}</p>
                                        ${order.expectedDeliveryDate ? `
                                            <p><span class="font-medium">Expected Delivery:</span> ${utils.formatDate(order.expectedDeliveryDate)}</p>
                                        ` : ''}
                                        ${order.receivedDate ? `
                                            <p><span class="font-medium">Received Date:</span> ${utils.formatDate(order.receivedDate)}</p>
                                        ` : ''}
                                        ${order.createdBy ? `
                                            <p><span class="font-medium">Created By:</span> ${order.createdBy}</p>
                                        ` : ''}
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 class="text-sm font-medium text-gray-500 mb-2">Supplier Information</h3>
                                    <div class="space-y-2">
                                        ${order.supplierContact ? `<p><span class="font-medium">Contact:</span> ${order.supplierContact}</p>` : ''}
                                        ${order.supplierEmail ? `<p><span class="font-medium">Email:</span> ${order.supplierEmail}</p>` : ''}
                                        ${order.supplierPhone ? `<p><span class="font-medium">Phone:</span> ${order.supplierPhone}</p>` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            ${order.notes ? `
                                <div class="mb-6">
                                    <h3 class="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                                    <p class="text-gray-700 bg-gray-50 p-3 rounded-lg">${order.notes}</p>
                                </div>
                            ` : ''}
                            
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Line Items</h3>
                                
                                ${lineItems.length > 0 ? `
                                    <div class="table-container">
                                        <table class="min-w-full border border-gray-300 bg-white rounded-lg shadow-md">
                                            <thead>
                                                <tr>
                                                    <th class="w-2/5 px-6 py-3">Product</th>
                                                    <th class="w-1/5 px-6 py-3 text-right">Quantity</th>
                                                    <th class="w-1/5 px-6 py-3 text-right">Unit Price</th>
                                                    <th class="w-1/5 px-6 py-3 text-right">Line Total</th>
                                                    <th class="w-1/5 px-6 py-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${lineItems.map(item => `
                                                    <tr>
                                                        <td class="px-6 py-4">
                                                            <div class="font-medium">${item.productName}</div>
                                                            ${item.productCode ? `
                                                                <div class="text-sm text-gray-500 mt-1">Code: ${item.productCode}</div>
                                                            ` : ''}
                                                        </td>
                                                        <td class="px-6 py-4 text-right">
                                                            <div class="font-medium">${item.quantity}</div>
                                                            <div class="text-sm text-gray-500">${item.unitDisplay}</div>
                                                        </td>
                                                        <td class="px-6 py-4 text-right">${utils.formatCurrency(item.unitPrice)}</td>
                                                        <td class="px-6 py-4 text-right font-semibold">${utils.formatCurrency(item.lineTotal)}</td>
                                                        <td class="px-6 py-4">
                                                            <div class="table-actions">
                                                                <button onclick="editLineItem(${item.id})" class="text-blue-600 hover:text-blue-700" title="Edit">
                                                                    <i class="fas fa-edit"></i>
                                                                </button>
                                                                <button onclick="deleteLineItem(${item.id}, ${order.id})" class="text-red-600 hover:text-red-700 ml-2" title="Delete">
                                                                    <i class="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                            <tfoot class="bg-gray-50">
                                                <tr>
                                                    <td colspan="3" class="px-6 py-3 text-right font-medium text-gray-900">Total Amount:</td>
                                                    <td class="px-6 py-3 text-right font-bold text-gray-900">${utils.formatCurrency(order.totalAmount)}</td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                ` : `
                                    <div class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                        <i class="fas fa-box text-gray-300 text-4xl mb-4"></i>
                                        <p class="text-gray-500">No line items in this order</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div class="card mb-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Order Number:</span>
                                    <span class="font-medium">${order.orderNumber}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Status:</span>
                                    ${utils.getStatusBadge(order.status)}
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Total Items:</span>
                                    <span class="font-medium">${lineItems.length}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Total Amount:</span>
                                    <span class="font-bold text-lg">${utils.formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                            <div class="space-y-3">
                                <select id="statusSelect" class="input-field">
                                    <option value="0" ${order.status === 0 ? 'selected' : ''}>Draft</option>
                                    <option value="1" ${order.status === 1 ? 'selected' : ''}>Pending</option>
                                    <option value="2" ${order.status === 2 ? 'selected' : ''}>Approved</option>
                                    <option value="3" ${order.status === 3 ? 'selected' : ''}>Ordered</option>
                                    <option value="4" ${order.status === 4 ? 'selected' : ''}>Received</option>
                                    <option value="6" ${order.status === 6 ? 'selected' : ''}>Cancelled</option>
                                </select>
                                <textarea id="statusNotes" class="input-field" placeholder="Status notes..." rows="3"></textarea>
                                <button onclick="updateOrderStatus(${order.id})" class="btn btn-primary w-full">
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        utils.showError(container, error.message);
    }
}

function deleteOrder(orderId) {
    utils.showConfirmation('Are you sure you want to delete this order? This action cannot be undone.', async () => {
        try {
            await api.orders.delete(orderId);
            utils.showSuccess('Order deleted successfully!');
            setTimeout(() => loadPage('orders'), 1000);
        } catch (error) {
            utils.showErrorAlert(error.message || 'Failed to delete order');
        }
    });
}

async function updateOrderStatus(orderId) {
    const statusSelect = document.getElementById('statusSelect');
    const notes = document.getElementById('statusNotes');
    
    try {
        await api.orders.updateStatus(orderId, {
            status: parseInt(statusSelect.value),
            notes: notes.value || undefined
        });
        
        utils.showSuccess('Order status updated successfully!');
        setTimeout(() => viewOrder(orderId), 1000);
    } catch (error) {
        utils.showErrorAlert(error.message || 'Failed to update order status');
    }
}

async function loadEditOrder(container, orderId) {
    utils.showLoading(container);
    
    try {
        const order = await api.orders.getById(orderId);
        const lineItems = await api.orders.getLineItems(orderId);
        
        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <a href="#order-detail?id=${orderId}" class="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Back to Order Details
                </a>
                
                <div class="card">
                    <div class="mb-8">
                        <h1 class="text-2xl font-bold text-gray-900">Edit Purchase Order</h1>
                        <p class="text-gray-600">Update the details for order: ${order.orderNumber}</p>
                    </div>
                    
                    <form id="editOrderForm" data-order-id="${orderId}">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Order Number *</label>
                                <input type="text" name="orderNumber" class="input-field" value="${order.orderNumber}" required>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Order Date *</label>
                                <input type="date" name="orderDate" class="input-field" value="${order.orderDate.split('T')[0]}" required>
                            </div>
                            
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                                <input type="text" name="supplierName" class="input-field" value="${order.supplierName}" required>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Contact</label>
                                <input type="text" name="supplierContact" class="input-field" value="${order.supplierContact || ''}">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Email</label>
                                <input type="email" name="supplierEmail" class="input-field" value="${order.supplierEmail || ''}">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Phone</label>
                                <input type="tel" name="supplierPhone" class="input-field" value="${order.supplierPhone || ''}">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
                                <input type="date" name="expectedDeliveryDate" class="input-field" 
                                    value="${order.expectedDeliveryDate ? order.expectedDeliveryDate.split('T')[0] : ''}">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" class="input-field">
                                    <option value="0" ${order.status === 0 ? 'selected' : ''}>Draft</option>
                                    <option value="1" ${order.status === 1 ? 'selected' : ''}>Pending</option>
                                    <option value="2" ${order.status === 2 ? 'selected' : ''}>Approved</option>
                                    <option value="3" ${order.status === 3 ? 'selected' : ''}>Ordered</option>
                                    <option value="4" ${order.status === 4 ? 'selected' : ''}>Received</option>
                                    <option value="5" ${order.status === 5 ? 'selected' : ''}>Partially Received</option>
                                    <option value="6" ${order.status === 6 ? 'selected' : ''}>Cancelled</option>
                                    <option value="7" ${order.status === 7 ? 'selected' : ''}>On Hold</option>
                                </select>
                            </div>
                            
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea name="notes" class="input-field" rows="3">${order.notes || ''}</textarea>
                            </div>
                        </div>
                        
                        <div class="mb-8">
                            <div class="flex justify-between items-center mb-4">
                                <h2 class="text-lg font-semibold text-gray-900">Order Line Items</h2>
                                <button type="button" onclick="addEditLineItem()" class="btn btn-secondary">
                                    <i class="fas fa-plus mr-2"></i> Add Item
                                </button>
                            </div>
                            
                            <div id="editLineItemsContainer" class="space-y-4">
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-3">
                            <a href="#order-detail?id=${orderId}" class="btn btn-secondary">Cancel</a>
                            <button type="submit" class="btn btn-primary">
                                <span id="editSubmitText">Update Order</span>
                                <span id="editSubmitSpinner" class="hidden">
                                    <i class="fas fa-spinner fa-spin ml-2"></i>
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        loadEditLineItems(lineItems);
        
        const form = document.getElementById('editOrderForm');
        form.addEventListener('submit', handleEditOrder);
        
    } catch (error) {
        utils.showError(container, error.message);
    }
}

function loadEditLineItems(lineItems) {
    const container = document.getElementById('editLineItemsContainer');
    container.innerHTML = '';
    
    lineItems.forEach((item, index) => {
        addEditLineItem(item, index);
    });
    
    if (lineItems.length === 0) {
        addEditLineItem();
    }
}

function addEditLineItem(item = null, index = null) {
    const container = document.getElementById('editLineItemsContainer');
    if (index === null) {
        index = container.children.length;
    }
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'card';
    itemDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <input type="hidden" name="lineItems[${index}].id" value="${item ? item.id : ''}">
            <div class="md:col-span-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" name="lineItems[${index}].productName" class="input-field" 
                    value="${item ? item.productName : ''}" required>
            </div>
            
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Product Code</label>
                <input type="text" name="lineItems[${index}].productCode" class="input-field" 
                    value="${item ? item.productCode || '' : ''}">
            </div>
            
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input type="number" name="lineItems[${index}].quantity" class="input-field" 
                    step="0.001" min="0.001" value="${item ? item.quantity : ''}" required>
            </div>
            
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select name="lineItems[${index}].unit" class="input-field">
                    <option value="0" ${item && item.unit === 0 ? 'selected' : ''}>Piece</option>
                    <option value="1" ${item && item.unit === 1 ? 'selected' : ''}>Kilogram</option>
                    <option value="2" ${item && item.unit === 2 ? 'selected' : ''}>Gram</option>
                    <option value="3" ${item && item.unit === 3 ? 'selected' : ''}>Liter</option>
                    <option value="4" ${item && item.unit === 4 ? 'selected' : ''}>Milliliter</option>
                    <option value="5" ${item && item.unit === 5 ? 'selected' : ''}>Meter</option>
                    <option value="6" ${item && item.unit === 6 ? 'selected' : ''}>Centimeter</option>
                    <option value="7" ${item && item.unit === 7 ? 'selected' : ''}>Box</option>
                    <option value="8" ${item && item.unit === 8 ? 'selected' : ''}>Pack</option>
                    <option value="9" ${item && item.unit === 9 ? 'selected' : ''}>Pair</option>
                    <option value="10" ${item && item.unit === 10 ? 'selected' : ''}>Dozen</option>
                    <option value="11" ${item && item.unit === 11 ? 'selected' : ''}>Roll</option>
                    <option value="12" ${item && item.unit === 12 ? 'selected' : ''}>Bottle</option>
                    <option value="13" ${item && item.unit === 13 ? 'selected' : ''}>Can</option>
                    <option value="14" ${item && item.unit === 14 ? 'selected' : ''}>Bag</option>
                    <option value="15" ${item && item.unit === 15 ? 'selected' : ''}>Case</option>
                </select>
            </div>
            
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                <input type="number" name="lineItems[${index}].unitPrice" class="input-field" 
                    step="0.01" min="0" value="${item ? item.unitPrice : ''}" required>
            </div>
            
            <div class="md:col-span-12 flex justify-end space-x-3">
                ${item ? `
                    <button type="button" onclick="deleteLineItem(${item.id}, ${item.orderId})" 
                        class="text-red-600 hover:text-red-700" title="Delete from database">
                        <i class="fas fa-trash-alt"></i> Delete Permanently
                    </button>
                ` : ''}
                <button type="button" onclick="removeEditLineItem(this)" class="text-red-600 hover:text-red-700">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(itemDiv);
}

function removeEditLineItem(button) {
    const container = document.getElementById('editLineItemsContainer');
    if (container.children.length > 1) {
        button.closest('.card').remove();
        Array.from(container.children).forEach((child, index) => {
            child.querySelectorAll('input, select').forEach(input => {
                const name = input.getAttribute('name');
                if (name) {
                    input.setAttribute('name', name.replace(/\[\d+\]/, `[${index}]`));
                }
            });
        });
    }
}

async function handleEditOrder(e) {
    e.preventDefault();
    
    const form = e.target;
    const orderId = form.getAttribute('data-order-id');
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitText = submitBtn.querySelector('#editSubmitText');
    const submitSpinner = submitBtn.querySelector('#editSubmitSpinner');
    
    submitText.classList.add('hidden');
    submitSpinner.classList.remove('hidden');
    
    try {
        const formData = new FormData(form);
        const data = {
            supplierContact: formData.get('supplierContact') || undefined,
            supplierEmail: formData.get('supplierEmail') || undefined,
            supplierPhone: formData.get('supplierPhone') || undefined,
            status: utils.getOrderStatusName(parseInt(formData.get('status'))),
            expectedDeliveryDate: formData.get('expectedDeliveryDate') || undefined,
            notes: formData.get('notes') || undefined
        };
        
        await api.orders.update(orderId, data);
        
        const lineItemCount = document.getElementById('editLineItemsContainer').children.length;
        for (let i = 0; i < lineItemCount; i++) {
            const itemId = formData.get(`lineItems[${i}].id`);
            const itemData = {
                productName: formData.get(`lineItems[${i}].productName`),
                productCode: formData.get(`lineItems[${i}].productCode`) || undefined,
                quantity: parseFloat(formData.get(`lineItems[${i}].quantity`)),
                unit: utils.getUnitDisplayName(parseInt(formData.get(`lineItems[${i}].unit`))),               
                unitPrice: parseFloat(formData.get(`lineItems[${i}].unitPrice`))
            };
            
            if (itemId) {
                await api.lineItems.update(itemId, itemData);
            } else {
                await api.lineItems.create({
                    ...itemData,
                    orderId: parseInt(orderId)
                });
            }
        }
        
        utils.showSuccess('Order updated successfully!');
        setTimeout(() => loadPage(`order-detail?id=${orderId}`), 1500);
        
    } catch (error) {
        utils.showErrorAlert(error.message || 'Failed to update order');
    } finally {
        submitText.classList.remove('hidden');
        submitSpinner.classList.add('hidden');
    }
}

async function deleteLineItem(lineItemId, orderId) {
    utils.showConfirmation('Are you sure you want to delete this line item?', async () => {
        try {
            await api.lineItems.delete(lineItemId);
            utils.showSuccess('Line item deleted successfully!');
            const currentPage = window.location.hash.substring(1);
            if (currentPage.includes('order-detail')) {
                loadPage(`order-detail?id=${orderId}`);
            } else if (currentPage.includes('edit-order')) {
                loadPage(`edit-order?id=${orderId}`);
            }
        } catch (error) {
            utils.showErrorAlert(error.message || 'Failed to delete line item');
        }
    });
}

async function editLineItem(lineItemId) {
    try {
        const item = await api.lineItems.getById(lineItemId);
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Edit Line Item</h3>
                
                <form id="editLineItemForm" data-line-item-id="${item.id}">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                            <input type="text" name="productName" class="input-field" value="${item.productName}" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Product Code</label>
                            <input type="text" name="productCode" class="input-field" value="${item.productCode || ''}">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                            <input type="number" name="quantity" class="input-field" step="0.001" min="0.001" value="${item.quantity}" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <select name="unit" class="input-field">
                                <option value="0" ${item.unit === 0 ? 'selected' : ''}>Piece</option>
                                <option value="1" ${item.unit === 1 ? 'selected' : ''}>Kilogram</option>
                                <option value="2" ${item.unit === 2 ? 'selected' : ''}>Gram</option>
                                <option value="3" ${item.unit === 3 ? 'selected' : ''}>Liter</option>
                                <option value="4" ${item.unit === 4 ? 'selected' : ''}>Milliliter</option>
                                <option value="5" ${item.unit === 5 ? 'selected' : ''}>Meter</option>
                                <option value="6" ${item.unit === 6 ? 'selected' : ''}>Centimeter</option>
                                <option value="7" ${item.unit === 7 ? 'selected' : ''}>Box</option>
                                <option value="8" ${item.unit === 8 ? 'selected' : ''}>Pack</option>
                                <option value="9" ${item.unit === 9 ? 'selected' : ''}>Pair</option>
                                <option value="10" ${item.unit === 10 ? 'selected' : ''}>Dozen</option>
                                <option value="11" ${item.unit === 11 ? 'selected' : ''}>Roll</option>
                                <option value="12" ${item.unit === 12 ? 'selected' : ''}>Bottle</option>
                                <option value="13" ${item.unit === 13 ? 'selected' : ''}>Can</option>
                                <option value="14" ${item.unit === 14 ? 'selected' : ''}>Bag</option>
                                <option value="15" ${item.unit === 15 ? 'selected' : ''}>Case</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                            <input type="number" name="unitPrice" class="input-field" step="0.01" min="0" value="${item.unitPrice}" required>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 mt-6">
                        <button type="button" onclick="closeModal(this)" class="btn btn-secondary">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const form = modal.querySelector('#editLineItemForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                productName: formData.get('productName'),
                productCode: formData.get('productCode') || undefined,
                quantity: parseFloat(formData.get('quantity')),
                unit: parseInt(formData.get('unit')),
                unitPrice: parseFloat(formData.get('unitPrice'))
            };
            
            try {
                await api.lineItems.update(lineItemId, data);
                utils.showSuccess('Line item updated successfully!');
                closeModal(modal);
                
                const currentPage = window.location.hash.substring(1);
                if (currentPage.includes('order-detail')) {
                    loadPage(`order-detail?id=${item.orderId}`);
                } else if (currentPage.includes('edit-order')) {
                    loadPage(`edit-order?id=${item.orderId}`);
                }
                
            } catch (error) {
                utils.showErrorAlert(error.message || 'Failed to update line item');
            }
        });
        
    } catch (error) {
        utils.showErrorAlert(error.message || 'Failed to load line item');
    }
}

function closeModal(element) {
    const modal = element.closest('.fixed.inset-0') || element;
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
}

window.addEventListener('popstate', () => {
    loadPage();
});