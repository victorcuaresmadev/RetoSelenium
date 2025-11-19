/**
 * Middleware de Autenticación
 * Maneja la verificación de tokens JWT para proteger rutas
 */

const jwt = require('jsonwebtoken'); // Librería para trabajar con JSON Web Tokens
const config = require('../config'); // Configuración de la aplicación

/**
 * Middleware para verificar token JWT (Autenticación Obligatoria)
 * Se usa en rutas que requieren que el usuario esté autenticado
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para pasar al siguiente middleware
 */
function authenticateToken(req, res, next) {
    // Obtener el header de autorización de la petición
    const authHeader = req.headers['authorization'];
    
    // Extraer el token del header (formato: "Bearer TOKEN")
    const token = authHeader && authHeader.split(' ')[1];

    // Si no hay token, retornar error 401 (No autorizado)
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    // Verificar que el token sea válido
    jwt.verify(token, config.jwtSecret, (err, user) => {
        if (err) {
            // Si el token es inválido o expiró, retornar error 403 (Prohibido)
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        
        // Si el token es válido, agregar la información del usuario a la petición
        req.user = user;
        
        // Continuar con el siguiente middleware o ruta
        next();
    });
}

/**
 * Middleware de Autenticación Opcional
 * No falla si no hay token, pero lo verifica si existe
 * Útil para rutas que funcionan con o sin autenticación
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para pasar al siguiente middleware
 */
function optionalAuth(req, res, next) {
    // Obtener el header de autorización
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Si hay token, intentar verificarlo
    if (token) {
        jwt.verify(token, config.jwtSecret, (err, user) => {
            if (!err) {
                // Si el token es válido, agregar usuario a la petición
                req.user = user;
            }
            // Si hay error, simplemente no agregamos el usuario (no falla)
        });
    }
    
    // Continuar siempre, haya o no token
    next();
}

// Exportar las funciones para usarlas en otras partes de la aplicación
module.exports = {
    authenticateToken,
    optionalAuth
};
