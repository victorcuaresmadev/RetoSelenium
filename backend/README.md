# 📂 Backend

## Descripción

Esta carpeta contiene todo el código del servidor backend de la aplicación, construido con Node.js y Express.

## Estructura

```
backend/
├── server.js              # Servidor principal de Express
├── config.js              # Configuración de la aplicación
├── middleware/            # Middlewares personalizados
│   ├── auth.js           # Autenticación JWT
│   └── validation.js     # Validación de datos
└── routes/               # Rutas de la API
    ├── auth.js           # Rutas de autenticación
    └── items.js          # Rutas CRUD de items
```

## Archivos Principales

### `server.js`
**Propósito:** Punto de entrada del servidor backend.

**Funcionalidades:**
- Configuración de Express
- Middlewares de seguridad (Helmet.js)
- Rate limiting
- CORS
- Rutas de la API
- Manejo de errores global

**Tecnologías:**
- Express 4.18
- Helmet.js (seguridad)
- express-rate-limit
- CORS

### `config.js`
**Propósito:** Centralizar toda la configuración de la aplicación.

**Configuraciones:**
- Puerto del servidor (3000)
- JWT secret y expiración
- Rondas de bcrypt
- Rate limiting
- CORS

## Carpeta: `middleware/`

### `auth.js`
**Propósito:** Middleware de autenticación JWT.

**Funciones:**
- `authenticateToken()` - Verifica token JWT obligatorio
- `optionalAuth()` - Verifica token JWT opcional

**Uso:**
```javascript
// Ruta protegida
router.post('/items', authenticateToken, createItem);

// Ruta pública con auth opcional
router.get('/items', optionalAuth, getItems);
```

### `validation.js`
**Propósito:** Validación y sanitización de datos de entrada.

**Validadores:**
- `validateRegistration` - Registro de usuarios
- `validateLogin` - Login
- `validateItem` - Crear/actualizar items
- `validateItemId` - Validar ID de item

**Características:**
- Validación de tipos
- Sanitización HTML (previene XSS)
- Validación de longitud
- Validación de formato

## Carpeta: `routes/`

### `auth.js`
**Propósito:** Rutas de autenticación y gestión de usuarios.

**Endpoints:**
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

**Seguridad:**
- Passwords hasheados con bcrypt
- Tokens JWT con expiración
- Validación de datos

### `items.js`
**Propósito:** Rutas CRUD para gestión de items.

**Endpoints:**
- `GET /api/items` - Listar items (con filtros y paginación)
- `GET /api/items/:id` - Obtener item específico
- `POST /api/items` - Crear nuevo item (requiere auth)
- `PUT /api/items/:id` - Actualizar item (requiere auth)
- `DELETE /api/items/:id` - Eliminar item (requiere auth)
- `GET /api/items/stats/summary` - Estadísticas (requiere auth)

**Características:**
- Filtros por categoría
- Búsqueda por texto
- Paginación
- Validación de ownership
- Autorización basada en roles

## Tecnologías Utilizadas

### Dependencias Principales
```json
{
  "express": "^4.18.2",           // Framework web
  "helmet": "^7.1.0",             // Headers de seguridad
  "jsonwebtoken": "^9.0.2",       // Autenticación JWT
  "bcryptjs": "^2.4.3",           // Hashing de passwords
  "express-validator": "^7.0.1",  // Validación de datos
  "express-rate-limit": "^7.1.5", // Rate limiting
  "cors": "^2.8.5",               // CORS
  "uuid": "^9.0.1"                // Generación de IDs
}
```

## Características de Seguridad

### 1. Helmet.js
- 11 headers de seguridad configurados
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- HSTS

### 2. Autenticación JWT
- Tokens seguros con expiración (24h)
- Verificación en cada petición protegida
- Refresh token no implementado (mejora futura)

### 3. Hashing de Passwords
- bcrypt con 10 rondas
- Nunca se almacenan passwords en texto plano
- Comparación segura

### 4. Validación de Datos
- express-validator en todas las rutas
- Sanitización HTML
- Validación de tipos
- Límites de longitud

### 5. Rate Limiting
- 100 peticiones por 15 minutos por IP
- Previene ataques de fuerza bruta
- Aplicado a todas las rutas /api/

### 6. CORS
- Configurado apropiadamente
- Control de orígenes
- Credentials habilitados

## Base de Datos

**Nota:** Este proyecto usa datos mock en memoria para simplicidad.

**Estructura de datos:**

```javascript
// Usuarios
{
  id: 'uuid',
  username: 'string',
  email: 'string',
  password: 'hashed',
  role: 'admin' | 'user'
}

// Items
{
  id: number,
  name: 'string',
  description: 'string',
  category: 'electronics' | 'clothing' | 'food' | 'books' | 'other',
  price: number,
  stock: number,
  createdBy: 'username',
  createdAt: 'ISO date',
  updatedAt: 'ISO date'
}
```

## Flujo de Autenticación

```
1. Usuario → POST /api/auth/register
   ↓
2. Backend → Valida datos
   ↓
3. Backend → Hashea password con bcrypt
   ↓
4. Backend → Guarda usuario
   ↓
5. Backend → Genera token JWT
   ↓
6. Backend → Retorna token + datos de usuario
   ↓
7. Cliente → Guarda token en localStorage
   ↓
8. Cliente → Incluye token en header Authorization
   ↓
9. Backend → Verifica token en cada petición
```

## Flujo de una Petición Protegida

```
Cliente → Request con Authorization: Bearer <token>
   ↓
Middleware: Rate Limiting
   ↓
Middleware: CORS
   ↓
Middleware: Body Parser
   ↓
Middleware: authenticateToken (verifica JWT)
   ↓
Middleware: validateItem (valida datos)
   ↓
Route Handler (lógica de negocio)
   ↓
Response al Cliente
```

## Manejo de Errores

### Errores Manejados
- 400 - Bad Request (validación fallida)
- 401 - Unauthorized (sin token)
- 403 - Forbidden (token inválido)
- 404 - Not Found (recurso no existe)
- 409 - Conflict (usuario ya existe)
- 500 - Internal Server Error

### Ejemplo de Respuesta de Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "msg": "Username must be between 3 and 30 characters",
      "param": "username"
    }
  ]
}
```

## Logging

El servidor registra:
- Todas las peticiones HTTP
- Método y ruta
- Timestamp
- Errores (con stack trace en desarrollo)

## Variables de Entorno

```env
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=10
NODE_ENV=development
CORS_ORIGIN=*
```

## Comandos

```bash
# Iniciar servidor
npm start

# Iniciar con auto-reload (desarrollo)
npm run dev

# Ejecutar en producción
NODE_ENV=production npm start
```

## Mejoras Futuras

1. **Base de datos real** (MongoDB, PostgreSQL)
2. **Refresh tokens** para JWT
3. **Logging avanzado** (Winston)
4. **Tests unitarios** (Jest)
5. **Documentación API** (Swagger)
6. **Rate limiting por usuario**
7. **CSRF tokens**
8. **2FA (Two-Factor Authentication)**

## Notas de Seguridad

✅ **Implementado:**
- Helmet.js con 11 headers
- JWT con expiración
- bcrypt para passwords
- express-validator
- Rate limiting
- CORS configurado

⚠️ **Recomendaciones:**
- Cambiar JWT_SECRET en producción
- Usar HTTPS
- Implementar CSRF tokens
- Agregar logging de seguridad
- Implementar 2FA para admins

## Contacto y Documentación

Para más información sobre el backend:
- Ver código comentado en español
- Consultar `../README.md` principal
- Revisar `../docs/SECURITY-TESTING-GUIDE.md`
