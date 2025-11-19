/**
 * Servidor Principal de la Aplicación
 * Configura Express con todas las medidas de seguridad y rutas necesarias
 */

// Importar dependencias necesarias
const express = require('express'); // Framework web para Node.js
const cors = require('cors'); // Middleware para habilitar CORS
const helmet = require('helmet'); // Middleware de seguridad (headers HTTP)
const rateLimit = require('express-rate-limit'); // Limitar peticiones por IP
const config = require('./config'); // Configuración de la aplicación
const authRoutes = require('./routes/auth'); // Rutas de autenticación
const itemsRoutes = require('./routes/items'); // Rutas de items

// Crear la aplicación Express
const app = express();

/**
 * MIDDLEWARE DE SEGURIDAD
 * Helmet configura varios headers HTTP para proteger la aplicación
 */
app.use(helmet({
    // Content Security Policy - Previene ataques XSS
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"], // Solo permitir recursos del mismo origen
            scriptSrc: ["'self'", "'unsafe-inline'"], // Scripts del mismo origen + inline
            styleSrc: ["'self'", "'unsafe-inline'"], // Estilos del mismo origen + inline
            imgSrc: ["'self'", "data:", "https:"], // Imágenes del mismo origen, data URIs y HTTPS
        },
    },
    // HTTP Strict Transport Security - Fuerza HTTPS
    hsts: {
        maxAge: 31536000, // 1 año en segundos
        includeSubDomains: true, // Aplicar a todos los subdominios
        preload: true // Permitir inclusión en listas de preload de navegadores
    }
}));

/**
 * RATE LIMITING
 * Limita el número de peticiones por IP para prevenir ataques de fuerza bruta
 */
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter); // Aplicar solo a rutas de API

/**
 * CONFIGURACIÓN DE CORS
 * Permite peticiones desde otros dominios (necesario para APIs)
 */
app.use(cors(config.cors));

/**
 * BODY PARSER
 * Permite leer el cuerpo de las peticiones en formato JSON y URL-encoded
 */
app.use(express.json({ limit: '10mb' })); // Parsear JSON con límite de 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parsear formularios

/**
 * MIDDLEWARE DE LOGGING
 * Registra todas las peticiones en la consola para debugging
 */
app.use((req, res, next) => {
    const timestamp = new Date().toISOString(); // Obtener timestamp actual
    console.log(`[${timestamp}] ${req.method} ${req.path}`); // Imprimir método y ruta
    next(); // Continuar con el siguiente middleware
});

/**
 * RUTAS DE LA API
 * Conectar las rutas de autenticación e items
 */
app.use('/api/auth', authRoutes); // Rutas de login, registro, etc.
app.use('/api/items', itemsRoutes); // Rutas CRUD de items

/**
 * ENDPOINT DE HEALTH CHECK
 * Permite verificar que el servidor está funcionando correctamente
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy', // Estado del servidor
        timestamp: new Date().toISOString(), // Hora actual
        uptime: process.uptime(), // Tiempo que lleva corriendo el servidor
        environment: process.env.NODE_ENV || 'development' // Entorno (dev/prod)
    });
});

/**
 * SERVIR ARCHIVOS ESTÁTICOS
 * Sirve los archivos del frontend (HTML, CSS, JS)
 */
app.use(express.static('frontend'));

/**
 * RUTA PRINCIPAL
 * Sirve el archivo HTML principal de la aplicación
 */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../frontend/index.html');
});

/**
 * MANEJADOR DE 404
 * Captura todas las rutas que no existen
 */
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}` // Indicar método y ruta no encontrada
    });
});

/**
 * MANEJADOR GLOBAL DE ERRORES
 * Captura todos los errores no manejados en la aplicación
 */
app.use((err, req, res, next) => {
    console.error('Error:', err); // Imprimir error en consola
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        // Solo mostrar stack trace en desarrollo (no en producción por seguridad)
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

/**
 * INICIAR EL SERVIDOR
 * Escuchar en el puerto configurado
 */
app.listen(config.port, () => {
    console.log('='.repeat(60));
    console.log(`🚀 Professional Master-Detail Application`);
    console.log(`📡 Server running on http://localhost:${config.port}`);
    console.log(`🔒 Security features enabled`);
    console.log(`⏰ Started at ${new Date().toISOString()}`);
    console.log('='.repeat(60));
});

// Exportar la aplicación para poder usarla en tests
module.exports = app;