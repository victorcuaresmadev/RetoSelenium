/**
 * Rutas de Autenticación
 * Maneja el registro, login y obtención de información del usuario
 */

// Importar dependencias necesarias
const express = require('express'); // Framework web
const bcrypt = require('bcryptjs'); // Librería para hashear contraseñas
const jwt = require('jsonwebtoken'); // Librería para crear y verificar tokens JWT
const { v4: uuidv4 } = require('uuid'); // Generador de IDs únicos
const config = require('../config'); // Configuración de la aplicación
const { validateRegistration, validateLogin } = require('../middleware/validation'); // Validadores

// Crear router de Express
const router = express.Router();

/**
 * BASE DE DATOS MOCK DE USUARIOS
 * En producción, esto debería ser una base de datos real (MongoDB, PostgreSQL, etc.)
 * Las contraseñas están hasheadas con bcrypt por seguridad
 */
const users = [
    {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        password: '$2a$10$HgbMCKo1VTRucaORGt1BC.BKpSWISy2eVW5QBjkiIZWmUiXnkGlcq', // Contraseña: 'Admin123!'
        role: 'admin' // Rol de administrador
    },
    {
        id: '2',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$zM.DnY5om8hw6A08cvrLbOmIJqqlCMWf4YRLCJOjrRfenRFhkGB3i', // Contraseña: 'Test123!'
        role: 'user' // Rol de usuario regular
    }
];

/**
 * POST /api/auth/register
 * Registrar un nuevo usuario en el sistema
 * 
 * Body esperado:
 * {
 *   "username": "string",
 *   "email": "string",
 *   "password": "string"
 * }
 */
router.post('/register', validateRegistration, async (req, res) => {
    try {
        // Extraer datos del cuerpo de la petición
        const { username, email, password } = req.body;

        // Verificar si el usuario ya existe (por username o email)
        const existingUser = users.find(u => u.username === username || u.email === email);
        if (existingUser) {
            // Si existe, retornar error 409 (Conflict)
            return res.status(409).json({ 
                error: 'User already exists',
                field: existingUser.username === username ? 'username' : 'email' // Indicar qué campo está duplicado
            });
        }

        // Hashear la contraseña usando bcrypt (nunca guardar contraseñas en texto plano)
        const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

        // Crear objeto del nuevo usuario
        const newUser = {
            id: uuidv4(), // Generar ID único
            username,
            email,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role },
            config.jwtSecret,
            { expiresIn: config.jwtExpiration }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            config.jwtSecret,
            { expiresIn: config.jwtExpiration }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', require('../middleware/auth').authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    });
});

module.exports = router;
