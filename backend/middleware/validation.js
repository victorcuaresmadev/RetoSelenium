/**
 * Middleware de Validación de Datos
 * Valida y sanitiza los datos de entrada para prevenir vulnerabilidades
 */

const { body, param, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 * Verifica si hubo errores en las validaciones anteriores
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para pasar al siguiente middleware
 */
const handleValidationErrors = (req, res, next) => {
    // Obtener los resultados de las validaciones
    const errors = validationResult(req);
    
    // Si hay errores, retornar respuesta 400 (Bad Request)
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Validation failed', // Mensaje general
            details: errors.array() // Array con todos los errores específicos
        });
    }
    
    // Si no hay errores, continuar con el siguiente middleware
    next();
};

/**
 * Reglas de validación para el registro de usuarios
 * Asegura que los datos del nuevo usuario cumplan con los requisitos de seguridad
 */
const validateRegistration = [
    // Validación del nombre de usuario
    body('username')
        .trim() // Eliminar espacios al inicio y final
        .isLength({ min: 3, max: 30 }) // Longitud entre 3 y 30 caracteres
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/) // Solo letras, números y guión bajo
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    // Validación del email
    body('email')
        .trim() // Eliminar espacios
        .isEmail() // Verificar que sea un email válido
        .withMessage('Must be a valid email address')
        .normalizeEmail(), // Normalizar el formato del email
    
    // Validación de la contraseña
    body('password')
        .isLength({ min: 8 }) // Mínimo 8 caracteres
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) // Debe tener mayúscula, minúscula y número
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    // Ejecutar el manejador de errores al final
    handleValidationErrors
];

/**
 * Reglas de validación para el login
 * Verifica que se proporcionen las credenciales necesarias
 */
const validateLogin = [
    // Validar que el username no esté vacío
    body('username')
        .trim() // Eliminar espacios
        .notEmpty() // No puede estar vacío
        .withMessage('Username is required'),
    
    // Validar que la contraseña no esté vacía
    body('password')
        .notEmpty() // No puede estar vacía
        .withMessage('Password is required'),
    
    handleValidationErrors
];

/**
 * Reglas de validación para crear/actualizar items
 * Previene XSS y asegura que los datos sean válidos
 */
const validateItem = [
    // Validación del nombre del item
    body('name')
        .trim() // Eliminar espacios
        .notEmpty() // No puede estar vacío
        .withMessage('Name is required')
        .isLength({ max: 100 }) // Máximo 100 caracteres
        .withMessage('Name must be less than 100 characters')
        .escape(), // Sanitizar HTML para prevenir XSS
    
    // Validación de la descripción
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 500 }) // Máximo 500 caracteres
        .withMessage('Description must be less than 500 characters')
        .escape(), // Sanitizar HTML
    
    // Validación de la categoría (opcional)
    body('category')
        .optional() // Este campo es opcional
        .trim()
        .isIn(['electronics', 'clothing', 'food', 'books', 'other']) // Solo valores permitidos
        .withMessage('Invalid category'),
    
    // Validación del precio (opcional)
    body('price')
        .optional()
        .isFloat({ min: 0 }) // Debe ser un número positivo
        .withMessage('Price must be a positive number'),
    
    handleValidationErrors
];

/**
 * Reglas de validación para el ID de un item
 * Previene SQL Injection y asegura que el ID sea válido
 */
const validateItemId = [
    // Validar que el ID sea un número entero positivo
    param('id')
        .isInt({ min: 1 }) // Entero mayor o igual a 1
        .withMessage('Invalid item ID'),
    
    handleValidationErrors
];

// Exportar todas las funciones de validación
module.exports = {
    validateRegistration,
    validateLogin,
    validateItem,
    validateItemId,
    handleValidationErrors
};
