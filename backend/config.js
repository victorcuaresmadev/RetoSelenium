/**
 * Archivo de Configuración de la Aplicación
 * Centraliza todas las configuraciones importantes del servidor
 */

module.exports = {
    // Puerto en el que correrá el servidor (por defecto 3000)
    port: process.env.PORT || 3000,
    
    // Clave secreta para firmar los tokens JWT (CAMBIAR EN PRODUCCIÓN)
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    
    // Tiempo de expiración de los tokens JWT (24 horas)
    jwtExpiration: '24h',
    
    // Número de rondas para el hashing de contraseñas con bcrypt
    // Más rondas = más seguro pero más lento (10 es un buen balance)
    bcryptRounds: 10,
    
    // Configuración de Rate Limiting (límite de peticiones)
    rateLimit: {
        windowMs: 15 * 60 * 1000, // Ventana de tiempo: 15 minutos
        max: 100 // Máximo 100 peticiones por IP en la ventana de tiempo
    },
    
    // Configuración de CORS (Cross-Origin Resource Sharing)
    cors: {
        origin: process.env.CORS_ORIGIN || '*', // Orígenes permitidos (* = todos)
        credentials: true // Permitir envío de cookies y headers de autenticación
    }
};
