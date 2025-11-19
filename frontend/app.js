/**
 * APLICACIÓN FRONTEND - MASTER-DETAIL
 * Maneja toda la lógica del cliente: autenticación, CRUD de items, filtros, etc.
 */

// ============================================================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================================================

// URL base de la API
const API_BASE = '/api';

// Token de autenticación JWT (se guarda en localStorage para persistencia)
let authToken = localStorage.getItem('authToken');

// Usuario actualmente autenticado
let currentUser = null;

// Item actualmente seleccionado en el detalle
let currentItem = null;

// Página actual de la paginación
let currentPage = 1;

// Filtros aplicados actualmente (categoría, búsqueda, etc.)
let currentFilters = {};

// ============================================================================
// REFERENCIAS A ELEMENTOS DEL DOM
// ============================================================================

// Elementos del modal de autenticación
const authModal = document.getElementById('auth-modal'); // Modal completo
const authForm = document.getElementById('auth-form'); // Formulario de login/registro
const authTitle = document.getElementById('auth-title'); // Título del modal
const authUsername = document.getElementById('auth-username'); // Input de username
const authEmail = document.getElementById('auth-email'); // Input de email
const authPassword = document.getElementById('auth-password'); // Input de password
const authError = document.getElementById('auth-error'); // Mensaje de error
const authSubmitBtn = document.getElementById('auth-submit-btn'); // Botón de submit
const authToggleBtn = document.getElementById('auth-toggle-btn'); // Botón para cambiar entre login/registro
const emailGroup = document.getElementById('email-group'); // Grupo del campo email

// Elementos de información del usuario
const userInfo = document.getElementById('user-info'); // Contenedor de info del usuario
const usernameDisplay = document.getElementById('username-display'); // Muestra el nombre de usuario
const logoutBtn = document.getElementById('logout-btn'); // Botón de cerrar sesión

// Elementos de la lista de items (Master)
const itemsList = document.getElementById('items-list'); // Lista de items
const detailSection = document.getElementById('detail-section'); // Sección de detalles
const itemForm = document.getElementById('item-form'); // Formulario de item
const formError = document.getElementById('form-error'); // Mensaje de error del formulario
const addItemBtn = document.getElementById('add-item-btn'); // Botón para agregar item
const cancelBtn = document.getElementById('cancel-btn'); // Botón de cancelar
const deleteBtn = document.getElementById('delete-btn'); // Botón de eliminar

// Elementos de filtros
const filterCategory = document.getElementById('filter-category'); // Select de categoría
const filterSearch = document.getElementById('filter-search'); // Input de búsqueda
const applyFiltersBtn = document.getElementById('apply-filters-btn'); // Botón aplicar filtros
const clearFiltersBtn = document.getElementById('clear-filters-btn'); // Botón limpiar filtros

// Otros elementos
const itemMetadata = document.getElementById('item-metadata'); // Metadatos del item
const toast = document.getElementById('toast'); // Notificación toast

// ============================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================================

/**
 * Inicializar la aplicación cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', init);

/**
 * Función de inicialización principal
 * Verifica si hay un token guardado y configura los event listeners
 */
function init() {
    // Si hay un token guardado, verificar que sea válido
    if (authToken) {
        verifyToken();
    } else {
        // Si no hay token, mostrar el modal de login
        showAuthModal();
    }
    
    // Configurar todos los event listeners
    setupEventListeners();
}

/**
 * Configurar todos los event listeners de la aplicación
 * Conecta los elementos del DOM con sus funciones correspondientes
 */
function setupEventListeners() {
    // Event listeners de autenticación
    authForm.addEventListener('submit', handleAuth); // Submit del formulario de login/registro
    authToggleBtn.addEventListener('click', toggleAuthMode); // Cambiar entre login y registro
    logoutBtn.addEventListener('click', logout); // Cerrar sesión
    
    // Event listeners de items
    addItemBtn.addEventListener('click', showNewItemForm); // Mostrar formulario para nuevo item
    itemForm.addEventListener('submit', saveItem); // Guardar item (crear o actualizar)
    cancelBtn.addEventListener('click', hideDetailSection); // Cancelar edición
    deleteBtn.addEventListener('click', deleteItem); // Eliminar item
    
    // Event listeners de filtros
    applyFiltersBtn.addEventListener('click', applyFilters); // Aplicar filtros
    clearFiltersBtn.addEventListener('click', clearFilters); // Limpiar filtros
    
    // Permitir aplicar filtros con Enter en el campo de búsqueda
    filterSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyFilters();
    });
}

// ============================================================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================================================

/**
 * Manejar el envío del formulario de autenticación (Login o Registro)
 * 
 * @param {Event} e - Evento del formulario
 */
async function handleAuth(e) {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    authError.textContent = ''; // Limpiar mensajes de error previos
    
    // Determinar si es login o registro según el texto del botón
    const isLogin = authSubmitBtn.textContent === 'Login';
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    // Preparar los datos a enviar
    const data = {
        username: authUsername.value,
        password: authPassword.value
    };
    
    // Si es registro, incluir también el email
    if (!isLogin) {
        data.email = authEmail.value;
    }
    
    try {
        // Hacer la petición al servidor
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        // Obtener la respuesta en formato JSON
        const result = await response.json();
        
        // Si la autenticación fue exitosa
        if (response.ok) {
            authToken = result.token; // Guardar el token JWT
            currentUser = result.user; // Guardar información del usuario
            localStorage.setItem('authToken', authToken); // Persistir token en localStorage
            hideAuthModal(); // Ocultar el modal de login
            showUserInfo(); // Mostrar información del usuario en el header
            loadItems(); // Cargar la lista de items
            showToast(`Welcome, ${currentUser.username}!`, 'success'); // Mostrar notificación
        } else {
            // Si hubo error, mostrar el mensaje
            authError.textContent = result.error || 'Authentication failed';
        }
    } catch (error) {
        // Si hubo error de red, mostrar mensaje genérico
        authError.textContent = 'Network error. Please try again.';
        console.error('Auth error:', error);
    }
}

function toggleAuthMode() {
    const isLogin = authSubmitBtn.textContent === 'Login';
    
    if (isLogin) {
        authTitle.textContent = 'Register';
        authSubmitBtn.textContent = 'Register';
        authToggleBtn.textContent = 'Login';
        emailGroup.style.display = 'block';
        authEmail.required = true;
    } else {
        authTitle.textContent = 'Login';
        authSubmitBtn.textContent = 'Login';
        authToggleBtn.textContent = 'Register';
        emailGroup.style.display = 'none';
        authEmail.required = false;
    }
    
    authError.textContent = '';
    authForm.reset();
}

async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            hideAuthModal();
            showUserInfo();
            loadItems();
        } else {
            logout();
        }
    } catch (error) {
        console.error('Token verification error:', error);
        logout();
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    hideUserInfo();
    showAuthModal();
    itemsList.innerHTML = '';
    hideDetailSection();
}

function showAuthModal() {
    authModal.style.display = 'flex';
}

function hideAuthModal() {
    authModal.style.display = 'none';
}

function showUserInfo() {
    usernameDisplay.textContent = `👤 ${currentUser.username} (${currentUser.role})`;
    userInfo.classList.remove('hidden');
    addItemBtn.classList.remove('hidden');
}

function hideUserInfo() {
    userInfo.classList.add('hidden');
    addItemBtn.classList.add('hidden');
}

// Items Functions
async function loadItems(page = 1) {
    try {
        const params = new URLSearchParams({
            page,
            limit: 10,
            ...currentFilters
        });
        
        const headers = {};
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(`${API_BASE}/items?${params}`, { headers });
        const data = await response.json();
        
        renderItems(data.items);
        renderPagination(data.pagination);
        currentPage = page;
    } catch (error) {
        console.error('Error loading items:', error);
        showToast('Error loading items', 'error');
    }
}

function renderItems(items) {
    itemsList.innerHTML = '';
    
    if (items.length === 0) {
        itemsList.innerHTML = '<li class="no-items">No items found</li>';
        return;
    }
    
    items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'item-card';
        li.innerHTML = `
            <div class="item-header">
                <h3>${escapeHtml(item.name)}</h3>
                <span class="item-price">$${item.price.toFixed(2)}</span>
            </div>
            <p class="item-description">${escapeHtml(item.description)}</p>
            <div class="item-footer">
                <span class="item-category">${item.category}</span>
                <span class="item-stock">Stock: ${item.stock}</span>
            </div>
        `;
        li.addEventListener('click', () => showItemDetails(item));
        itemsList.appendChild(li);
    });
}

function renderPagination(pagination) {
    const paginationDiv = document.getElementById('pagination');
    
    if (pagination.totalPages <= 1) {
        paginationDiv.classList.add('hidden');
        return;
    }
    
    paginationDiv.classList.remove('hidden');
    paginationDiv.innerHTML = '';
    
    // Previous button
    if (pagination.page > 1) {
        const prevBtn = createPaginationButton('← Previous', () => loadItems(pagination.page - 1));
        paginationDiv.appendChild(prevBtn);
    }
    
    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${pagination.page} of ${pagination.totalPages}`;
    pageInfo.className = 'page-info';
    paginationDiv.appendChild(pageInfo);
    
    // Next button
    if (pagination.page < pagination.totalPages) {
        const nextBtn = createPaginationButton('Next →', () => loadItems(pagination.page + 1));
        paginationDiv.appendChild(nextBtn);
    }
}

function createPaginationButton(text, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = 'btn-secondary';
    btn.addEventListener('click', onClick);
    return btn;
}

async function showItemDetails(item) {
    try {
        const headers = {};
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(`${API_BASE}/items/${item.id}`, { headers });
        const fullItem = await response.json();
        
        // Highlight selected item
        document.querySelectorAll('.item-card').forEach(card => {
            card.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        
        // Populate form
        document.getElementById('item-id').value = fullItem.id;
        document.getElementById('item-name').value = fullItem.name;
        document.getElementById('item-description').value = fullItem.description;
        document.getElementById('item-category').value = fullItem.category || 'other';
        document.getElementById('item-price').value = fullItem.price || 0;
        document.getElementById('item-stock').value = fullItem.stock || 0;
        
        // Show metadata
        if (fullItem.createdBy) {
            document.getElementById('created-by').textContent = fullItem.createdBy;
            document.getElementById('created-at').textContent = new Date(fullItem.createdAt).toLocaleString();
            document.getElementById('updated-at').textContent = new Date(fullItem.updatedAt).toLocaleString();
            itemMetadata.classList.remove('hidden');
        }
        
        detailSection.classList.remove('hidden');
        formError.textContent = '';
        currentItem = fullItem;
    } catch (error) {
        console.error('Error loading item details:', error);
        showToast('Error loading item details', 'error');
    }
}

function showNewItemForm() {
    document.querySelectorAll('.item-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    itemForm.reset();
    document.getElementById('item-id').value = '';
    document.getElementById('item-category').value = 'other';
    itemMetadata.classList.add('hidden');
    detailSection.classList.remove('hidden');
    formError.textContent = '';
    currentItem = null;
}

function hideDetailSection() {
    detailSection.classList.add('hidden');
    document.querySelectorAll('.item-card').forEach(card => {
        card.classList.remove('selected');
    });
    currentItem = null;
}

async function saveItem(e) {
    e.preventDefault();
    formError.textContent = '';
    
    const itemData = {
        name: document.getElementById('item-name').value,
        description: document.getElementById('item-description').value,
        category: document.getElementById('item-category').value,
        price: parseFloat(document.getElementById('item-price').value),
        stock: parseInt(document.getElementById('item-stock').value)
    };
    
    try {
        const isUpdate = currentItem !== null;
        const url = isUpdate 
            ? `${API_BASE}/items/${currentItem.id}` 
            : `${API_BASE}/items`;
        const method = isUpdate ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(itemData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast(result.message, 'success');
            loadItems(currentPage);
            hideDetailSection();
        } else {
            formError.textContent = result.error || 'Error saving item';
            if (result.details) {
                formError.textContent += ': ' + result.details.map(d => d.msg).join(', ');
            }
        }
    } catch (error) {
        console.error('Error saving item:', error);
        formError.textContent = 'Network error. Please try again.';
    }
}

async function deleteItem() {
    if (!currentItem) return;
    
    if (!confirm(`Are you sure you want to delete "${currentItem.name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/items/${currentItem.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast(result.message, 'success');
            loadItems(currentPage);
            hideDetailSection();
        } else {
            showToast(result.error || 'Error deleting item', 'error');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

// Filter Functions
function applyFilters() {
    currentFilters = {};
    
    if (filterCategory.value) {
        currentFilters.category = filterCategory.value;
    }
    
    if (filterSearch.value.trim()) {
        currentFilters.search = filterSearch.value.trim();
    }
    
    loadItems(1);
}

function clearFilters() {
    filterCategory.value = '';
    filterSearch.value = '';
    currentFilters = {};
    loadItems(1);
}

// Utility Functions
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
