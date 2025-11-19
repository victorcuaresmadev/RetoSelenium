# 📂 Scripts

## Descripción

Esta carpeta contiene scripts auxiliares y utilidades para el proyecto.

## Estructura

```
scripts/
└── generate-test-users.js    # Generador de usuarios de prueba
```

## Archivos

### `generate-test-users.js`

**Propósito:** Generar usuarios de prueba con passwords hasheados correctamente.

**Uso:**
```bash
node scripts/generate-test-users.js
```

**Salida:**
```
🔐 Generando usuarios de prueba...

Usuario: admin
Email: admin@example.com
Password: Admin123!
Password Hash: $2a$10$HgbMCKo1VTRucaORGt1BC.BKpSWISy2eVW5QBjkiIZWmUiXnkGlcq
Role: admin
------------------------------------------------------------
Usuario: testuser
Email: test@example.com
Password: Test123!
Password Hash: $2a$10$zM.DnY5om8hw6A08cvrLbOmIJqqlCMWf4YRLCJOjrRfenRFhkGB3i
Role: user
------------------------------------------------------------

✅ Usuarios generados correctamente

📝 Copia estos hashes al archivo backend/routes/auth.js
```

**Funcionalidad:**
1. Define usuarios de prueba
2. Hashea las contraseñas con bcrypt (10 rondas)
3. Muestra los hashes generados
4. Proporciona instrucciones para copiarlos

**Código:**
```javascript
const bcrypt = require('bcryptjs');

async function generateUsers() {
    const users = [
        {
            username: 'admin',
            email: 'admin@example.com',
            password: 'Admin123!',
            role: 'admin'
        },
        {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Test123!',
            role: 'user'
        }
    ];
    
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        console.log(`Usuario: ${user.username}`);
        console.log(`Password Hash: ${hashedPassword}`);
    }
}

generateUsers();
```

---

## Utilidad

### ¿Por qué este script?

**Problema:**
- Las contraseñas deben estar hasheadas en el código
- bcrypt genera hashes diferentes cada vez
- Necesitamos hashes consistentes para usuarios de prueba

**Solución:**
- Este script genera los hashes correctos
- Se pueden copiar directamente al código
- Asegura que los usuarios de prueba funcionen

---

## Usuarios de Prueba

### Usuario Administrador
```javascript
{
  username: 'admin',
  email: 'admin@example.com',
  password: 'Admin123!',  // Texto plano (solo para referencia)
  passwordHash: '$2a$10$HgbMCKo1VTRucaORGt1BC.BKpSWISy2eVW5QBjkiIZWmUiXnkGlcq',
  role: 'admin'
}
```

### Usuario Regular
```javascript
{
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123!',  // Texto plano (solo para referencia)
  passwordHash: '$2a$10$zM.DnY5om8hw6A08cvrLbOmIJqqlCMWf4YRLCJOjrRfenRFhkGB3i',
  role: 'user'
}
```

---

## Cómo Usar los Hashes Generados

### Paso 1: Ejecutar el Script
```bash
node scripts/generate-test-users.js
```

### Paso 2: Copiar los Hashes

Copiar los hashes generados (las cadenas largas que empiezan con `$2a$10$`)

### Paso 3: Actualizar el Código

Editar `backend/routes/auth.js`:

```javascript
const users = [
    {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        password: '$2a$10$HgbMCKo1VTRucaORGt1BC.BKpSWISy2eVW5QBjkiIZWmUiXnkGlcq', // Pegar aquí
        role: 'admin'
    },
    {
        id: '2',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$zM.DnY5om8hw6A08cvrLbOmIJqqlCMWf4YRLCJOjrRfenRFhkGB3i', // Pegar aquí
        role: 'user'
    }
];
```

---

## Tecnología

### bcryptjs
```json
{
  "bcryptjs": "^2.4.3"
}
```

**Características:**
- Hashing seguro de contraseñas
- Salt automático
- Configurable (rondas)
- Resistente a ataques de fuerza bruta

**Configuración:**
```javascript
const rounds = 10; // Número de rondas (más = más seguro pero más lento)
const hash = await bcrypt.hash(password, rounds);
```

---

## Scripts Futuros

### Ideas para Más Scripts

1. **`seed-database.js`**
   - Poblar base de datos con datos de prueba
   - Items de ejemplo
   - Usuarios adicionales

2. **`cleanup.js`**
   - Limpiar archivos temporales
   - Eliminar logs antiguos
   - Limpiar screenshots de pruebas

3. **`check-security.js`**
   - Verificar dependencias vulnerables
   - Comprobar configuración de seguridad
   - Validar variables de entorno

4. **`generate-docs.js`**
   - Generar documentación automática
   - Extraer comentarios del código
   - Crear diagramas

5. **`deploy.js`**
   - Script de despliegue
   - Build de producción
   - Verificaciones pre-deploy

6. **`backup.js`**
   - Backup de datos
   - Backup de configuración
   - Restauración

---

## Mejores Prácticas

### Estructura de un Script

```javascript
#!/usr/bin/env node

/**
 * Nombre del Script
 * Descripción de lo que hace
 */

// Imports
const dependency = require('dependency');

// Configuración
const config = {
    // ...
};

// Función principal
async function main() {
    try {
        console.log('Iniciando...');
        
        // Lógica del script
        
        console.log('✅ Completado');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Ejecutar
main();
```

### Convenciones

1. **Nombre:** kebab-case (generate-test-users.js)
2. **Shebang:** `#!/usr/bin/env node` (para ejecutar directamente)
3. **Logging:** Usar emojis y colores para claridad
4. **Errores:** Manejar con try/catch
5. **Exit codes:** 0 = éxito, 1 = error

---

## Ejecución

### Desde la Raíz del Proyecto
```bash
node scripts/generate-test-users.js
```

### Con npm Script
```json
{
  "scripts": {
    "generate-users": "node scripts/generate-test-users.js"
  }
}
```

```bash
npm run generate-users
```

### Hacer Ejecutable (Linux/Mac)
```bash
chmod +x scripts/generate-test-users.js
./scripts/generate-test-users.js
```

---

## Dependencias

Los scripts pueden usar las dependencias del proyecto:

```javascript
// Dependencias del proyecto
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Módulos nativos de Node.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
```

---

## Testing de Scripts

### Verificar que Funciona

```bash
# Ejecutar el script
node scripts/generate-test-users.js

# Verificar salida
# Debe mostrar usuarios y hashes
```

### Validar Hashes

```javascript
// Verificar que el hash es válido
const bcrypt = require('bcryptjs');

const password = 'Admin123!';
const hash = '$2a$10$HgbMCKo1VTRucaORGt1BC.BKpSWISy2eVW5QBjkiIZWmUiXnkGlcq';

bcrypt.compare(password, hash).then(result => {
    console.log('Hash válido:', result); // true
});
```

---

## Documentación

### Comentarios en el Código

```javascript
/**
 * Genera usuarios de prueba con passwords hasheados
 * 
 * @returns {Promise<void>}
 */
async function generateUsers() {
    // Implementación
}
```

### README en Scripts

Este archivo documenta:
- Qué hace cada script
- Cómo usarlo
- Qué salida produce
- Cómo integrar los resultados

---

## Seguridad

### Consideraciones

1. **No commitear passwords en texto plano**
   - Solo hashes en el código
   - Passwords en variables de entorno

2. **Usuarios de prueba solo en desarrollo**
   - No usar en producción
   - Cambiar passwords por defecto

3. **Hashes únicos**
   - Cada ejecución genera hashes diferentes
   - Usar los más recientes

---

## Contacto y Soporte

Para más información sobre scripts:
- Ver código en `scripts/generate-test-users.js`
- Consultar `../README.md` principal
- Revisar `../backend/routes/auth.js` para uso de hashes
