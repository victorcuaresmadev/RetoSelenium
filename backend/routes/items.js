const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateItem, validateItemId } = require('../middleware/validation');

const router = express.Router();

// Mock items database with more realistic data
let items = [
    {
        id: 1,
        name: 'Laptop Dell XPS 15',
        description: 'High-performance laptop with Intel i7 processor and 16GB RAM',
        category: 'electronics',
        price: 1299.99,
        stock: 15,
        createdBy: 'admin',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
    },
    {
        id: 2,
        name: 'Wireless Mouse Logitech',
        description: 'Ergonomic wireless mouse with precision tracking',
        category: 'electronics',
        price: 29.99,
        stock: 50,
        createdBy: 'admin',
        createdAt: '2024-01-16T14:20:00Z',
        updatedAt: '2024-01-16T14:20:00Z'
    },
    {
        id: 3,
        name: 'Programming Book: Clean Code',
        description: 'Essential reading for software developers',
        category: 'books',
        price: 39.99,
        stock: 30,
        createdBy: 'testuser',
        createdAt: '2024-01-17T09:15:00Z',
        updatedAt: '2024-01-17T09:15:00Z'
    }
];

let nextId = 4;

/**
 * GET /api/items
 * Get all items (with optional filtering and pagination)
 */
router.get('/', optionalAuth, (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;
        
        let filteredItems = [...items];

        // Filter by category
        if (category) {
            filteredItems = filteredItems.filter(item => item.category === category);
        }

        // Filter by price range
        if (minPrice) {
            filteredItems = filteredItems.filter(item => item.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            filteredItems = filteredItems.filter(item => item.price <= parseFloat(maxPrice));
        }

        // Search by name or description
        if (search) {
            const searchLower = search.toLowerCase();
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(searchLower) ||
                item.description.toLowerCase().includes(searchLower)
            );
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedItems = filteredItems.slice(startIndex, endIndex);

        res.json({
            items: paginatedItems,
            pagination: {
                total: filteredItems.length,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(filteredItems.length / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/items/:id
 * Get a specific item by ID
 */
router.get('/:id', validateItemId, optionalAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const item = items.find(i => i.id === id);
    
    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
});

/**
 * POST /api/items
 * Create a new item (requires authentication)
 */
router.post('/', authenticateToken, validateItem, (req, res) => {
    try {
        const { name, description, category = 'other', price = 0, stock = 0 } = req.body;

        const newItem = {
            id: nextId++,
            name,
            description,
            category,
            price: parseFloat(price),
            stock: parseInt(stock),
            createdBy: req.user.username,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        items.push(newItem);
        
        res.status(201).json({
            message: 'Item created successfully',
            item: newItem
        });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * PUT /api/items/:id
 * Update an existing item (requires authentication)
 */
router.put('/:id', authenticateToken, validateItemId, validateItem, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = items.findIndex(i => i.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const existingItem = items[index];

        // Check if user owns the item or is admin
        if (existingItem.createdBy !== req.user.username && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You do not have permission to update this item' });
        }

        const { name, description, category, price, stock } = req.body;

        items[index] = {
            ...existingItem,
            name: name || existingItem.name,
            description: description || existingItem.description,
            category: category || existingItem.category,
            price: price !== undefined ? parseFloat(price) : existingItem.price,
            stock: stock !== undefined ? parseInt(stock) : existingItem.stock,
            updatedAt: new Date().toISOString()
        };

        res.json({
            message: 'Item updated successfully',
            item: items[index]
        });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * DELETE /api/items/:id
 * Delete an item (requires authentication)
 */
router.delete('/:id', authenticateToken, validateItemId, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = items.findIndex(i => i.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const item = items[index];

        // Check if user owns the item or is admin
        if (item.createdBy !== req.user.username && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You do not have permission to delete this item' });
        }

        const deletedItem = items.splice(index, 1)[0];
        
        res.json({
            message: 'Item deleted successfully',
            item: deletedItem
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/items/stats/summary
 * Get statistics about items (requires authentication)
 */
router.get('/stats/summary', authenticateToken, (req, res) => {
    try {
        const stats = {
            totalItems: items.length,
            categories: {},
            averagePrice: 0,
            totalValue: 0
        };

        items.forEach(item => {
            // Count by category
            stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
            
            // Calculate total value
            stats.totalValue += item.price * item.stock;
        });

        // Calculate average price
        if (items.length > 0) {
            stats.averagePrice = items.reduce((sum, item) => sum + item.price, 0) / items.length;
        }

        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
