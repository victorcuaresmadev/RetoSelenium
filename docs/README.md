# 📂 Docs (Documentación)

## Descripción

Esta carpeta contiene la documentación técnica del proyecto, especialmente relacionada con pruebas de seguridad.

## Estructura

```
docs/
└── SECURITY-TESTING-GUIDE.md    # Guía completa de pruebas de seguridad
```

## Archivos

### `SECURITY-TESTING-GUIDE.md`

**Propósito:** Guía exhaustiva de pruebas de seguridad con Burp Suite Community y OWASP ZAP.

**Tamaño:** ~500 líneas

**Contenido:**

#### 1. Introducción
- Descripción de las pruebas de seguridad
- Herramientas utilizadas
- Vulnerabilidades comunes (OWASP Top 10)

#### 2. Pruebas Automatizadas
- Script: `tests/security-test.js`
- Comando: `npm run test:security`
- 11 vulnerabilidades probadas
- Resultados esperados

#### 3. Burp Suite Community

**Instalación:**
- Enlace de descarga
- Pasos de instalación
- Requisitos del sistema

**Configuración del Proxy:**
- Chrome/Edge: FoxyProxy
- Firefox: Configuración manual
- Verificación de conexión

**Pruebas Realizadas:**

a) **Interceptación de Tráfico**
```http
POST /api/auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123!"
}
```

b) **Análisis de Autenticación**
- Verificar token JWT
- Validar credenciales inválidas
- Comprobar que no se exponen datos sensibles

c) **Prueba de Autorización**
- Sin token → 401 Unauthorized
- Token inválido → 403 Forbidden
- Token válido → 200 OK

d) **Fuzzing de Parámetros**
- Payloads XSS:
  - `<script>alert(1)</script>`
  - `<img src=x onerror=alert(1)>`
  - `<svg onload=alert(1)>`

- Payloads SQL Injection:
  - `' OR '1'='1`
  - `'; DROP TABLE users--`
  - `' UNION SELECT NULL--`

e) **Análisis de Respuestas**
- Headers de seguridad
- Información sensible
- Errores reveladores

**Resultados:**

| Vulnerabilidad | Estado | Severidad | Notas |
|----------------|--------|-----------|-------|
| XSS Reflejado | ✅ No encontrado | - | Inputs sanitizados |
| XSS Almacenado | ✅ No encontrado | - | Validación server-side |
| SQL Injection | ✅ No encontrado | - | Validación de tipos |
| CSRF | ⚠️ Parcial | Media | JWT en headers |
| Clickjacking | ✅ Protegido | - | X-Frame-Options |
| Información Sensible | ✅ No expuesta | - | Passwords no retornados |

#### 4. OWASP ZAP

**Instalación:**
- Windows: Descarga directa
- Linux: `sudo apt install zaproxy`
- macOS: `brew install --cask owasp-zap`

**Configuración Inicial:**
- Automated Scan vs Manual Explore
- Target: `http://localhost:3000`
- Configuración de políticas

**Escaneo Automatizado:**

**Paso 1: Spider (Rastreo)**
```
Tools → Spider
Starting Point: http://localhost:3000
Click "Start Scan"
```

**URLs Descubiertas:**
- `http://localhost:3000/`
- `http://localhost:3000/api/health`
- `http://localhost:3000/api/items`
- `http://localhost:3000/api/auth/login`
- `http://localhost:3000/api/auth/register`

**Paso 2: Active Scan**
```
Click derecho en el sitio
"Attack" → "Active Scan"
Policy: Default
Technology: All
Click "Start Scan"
```

**Pruebas Realizadas:**
- SQL Injection (todos los parámetros)
- XSS (reflejado y almacenado)
- Path Traversal
- Remote File Inclusion
- Command Injection
- CRLF Injection
- XXE (XML External Entity)

**Paso 3: Análisis de Resultados**
```
Ir a "Alerts" tab
Revisar por severidad:
- 🔴 High (Crítico)
- 🟠 Medium (Medio)
- 🟡 Low (Bajo)
- 🔵 Informational (Informativo)
```

**Resultados:**

**🔴 Alertas Críticas (High):** 0 ✅

**🟠 Alertas Medias (Medium):**
1. Content Security Policy Header Not Set
   - **Estado:** ✅ Corregido
   - **Solución:** Implementado con Helmet.js

2. Missing Anti-CSRF Tokens
   - **Estado:** ⚠️ Mitigado
   - **Solución:** JWT en Authorization header

**🟡 Alertas Bajas (Low):**
1. X-Content-Type-Options Header Missing
   - **Estado:** ✅ Corregido
   - **Solución:** `X-Content-Type-Options: nosniff`

2. Strict-Transport-Security Header Not Set
   - **Estado:** ⚠️ Solo HTTPS
   - **Nota:** Implementado, activo en producción

**🔵 Alertas Informativas:**
1. Information Disclosure - Suspicious Comments
   - **Impacto:** Informativo
   - **Acción:** Revisar en producción

2. Timestamp Disclosure
   - **Impacto:** Informativo
   - **Acción:** Aceptable

**Pruebas Manuales con ZAP:**

a) **Fuzzing de Autenticación**
```
1. Interceptar request de login
2. Click derecho → "Fuzz"
3. Seleccionar campo "password"
4. Agregar payloads:
   - Diccionario de contraseñas comunes
   - Caracteres especiales
   - Payloads de inyección
5. Iniciar fuzzing
6. Analizar respuestas
```

b) **Prueba de Session Management**
```
1. Login con usuario válido
2. Copiar JWT token
3. Modificar payload del token
4. Intentar usar token modificado
```

c) **Prueba de Inyección en Headers**
```http
GET /api/items HTTP/1.1
Host: localhost:3000
Authorization: Bearer <script>alert(1)</script>
X-Custom-Header: '; DROP TABLE items--
```

#### 5. Vulnerabilidades Detectadas y Mitigadas

**OWASP Top 10 (2021):**

| # | Vulnerabilidad | Estado | Mitigación |
|---|----------------|--------|------------|
| A01 | Broken Access Control | ✅ Protegido | JWT + Ownership validation |
| A02 | Cryptographic Failures | ✅ Protegido | bcrypt + JWT signing |
| A03 | Injection | ✅ Protegido | Input validation + sanitization |
| A04 | Insecure Design | ✅ Protegido | Security by design |
| A05 | Security Misconfiguration | ✅ Protegido | Helmet.js + secure defaults |
| A06 | Vulnerable Components | ✅ Protegido | 0 vulnerabilities (npm audit) |
| A07 | Auth Failures | ✅ Protegido | Strong password + rate limiting |
| A08 | Data Integrity | ✅ Protegido | JWT verification |
| A09 | Logging Failures | ⚠️ Básico | Request logging |
| A10 | SSRF | ✅ N/A | No external fetching |

**Puntuación: 9.5/10** 🏆

#### 6. Recomendaciones de Seguridad

**Implementadas ✅:**
1. Helmet.js - Headers de seguridad
2. express-validator - Validación de inputs
3. bcryptjs - Hashing de passwords
4. jsonwebtoken - Autenticación JWT
5. express-rate-limit - Rate limiting
6. CORS configurado

**Recomendaciones Adicionales 📋:**
1. Implementar CSRF Tokens
2. Agregar Logging de Seguridad
3. Implementar 2FA
4. Escaneo de Dependencias Automatizado
5. Penetration Testing Regular
6. WAF (Web Application Firewall)

#### 7. Checklist de Seguridad

**Antes de Producción:**
- [ ] Cambiar JWT_SECRET
- [ ] Habilitar HTTPS
- [ ] Configurar HSTS
- [ ] Implementar CSRF tokens
- [ ] Configurar logging
- [ ] Realizar penetration testing
- [ ] Actualizar dependencias
- [ ] Configurar WAF
- [ ] Implementar monitoreo
- [ ] Documentar procedimientos

**Mantenimiento Continuo:**
- [ ] Escaneos semanales
- [ ] Actualización mensual
- [ ] Revisión de logs diaria
- [ ] Pruebas trimestrales
- [ ] Auditoría semestral
- [ ] Capacitación del equipo

#### 8. Herramientas Adicionales Recomendadas

1. **Nikto** - Escáner de vulnerabilidades web
2. **SQLMap** - Pruebas de SQL Injection
3. **Nmap** - Escaneo de puertos
4. **Wireshark** - Análisis de tráfico
5. **Postman/Newman** - Pruebas de API

#### 9. Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Burp Suite Documentation](https://portswigger.net/burp/documentation)
- [OWASP ZAP User Guide](https://www.zaproxy.org/docs/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

---

## Uso de la Documentación

### Para Pruebas de Seguridad:

1. **Leer la guía completa:**
   ```bash
   # Abrir en editor
   code docs/SECURITY-TESTING-GUIDE.md
   ```

2. **Ejecutar pruebas automatizadas:**
   ```bash
   npm run test:security
   ```

3. **Configurar Burp Suite:**
   - Seguir sección "Burp Suite Community"
   - Configurar proxy
   - Interceptar tráfico

4. **Ejecutar OWASP ZAP:**
   - Seguir sección "OWASP ZAP"
   - Spider + Active Scan
   - Analizar alertas

---

## Formato de la Documentación

### Markdown
- Formato: Markdown (.md)
- Sintaxis: GitHub Flavored Markdown
- Tablas, listas, código, enlaces

### Estructura
- Headers jerárquicos (H1-H6)
- Código con syntax highlighting
- Tablas comparativas
- Listas de verificación
- Enlaces a recursos

---

## Mantenimiento

### Actualización de Documentación

**Cuándo actualizar:**
- Nuevas vulnerabilidades descubiertas
- Cambios en herramientas
- Nuevas mitigaciones implementadas
- Actualizaciones de OWASP Top 10

**Cómo actualizar:**
1. Editar `SECURITY-TESTING-GUIDE.md`
2. Agregar fecha de actualización
3. Documentar cambios
4. Revisar enlaces
5. Verificar ejemplos de código

---

## Mejoras Futuras

1. **Más guías:**
   - API-DOCUMENTATION.md
   - DEPLOYMENT-GUIDE.md
   - ARCHITECTURE.md
   - CONTRIBUTING.md

2. **Diagramas:**
   - Arquitectura del sistema
   - Flujo de autenticación
   - Modelo de datos

3. **Videos:**
   - Tutoriales de Burp Suite
   - Tutoriales de OWASP ZAP
   - Demostraciones de vulnerabilidades

4. **Ejemplos:**
   - Más payloads de prueba
   - Scripts de automatización
   - Configuraciones avanzadas

---

## Contacto y Soporte

Para más información sobre seguridad:
- Consultar `SECURITY-TESTING-GUIDE.md`
- Revisar `../tests/security-test.js`
- Ver `../README.md` principal
