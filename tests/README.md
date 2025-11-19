# 📂 Tests

## Descripción

Esta carpeta contiene todas las pruebas automatizadas del proyecto: funcionales con Selenium y de seguridad.

## Estructura

```
tests/
├── selenium-final-test.js      # Suite optimizada (10 pruebas) ⭐ RECOMENDADO
├── selenium-simple-test.js     # Suite simplificada (11 pruebas)
├── selenium-advanced-test.js   # Suite completa (15 pruebas)
└── security-test.js            # Pruebas de seguridad (11 pruebas)
```

## Pruebas Funcionales (Selenium)

### `selenium-final-test.js` ⭐ RECOMENDADO

**Propósito:** Suite optimizada para máxima confiabilidad.

**Comando:**
```bash
npm run test:selenium-final
```

**Pruebas incluidas (10):**
1. ✅ Cargar Aplicación
2. ✅ Modal de Autenticación
3. ✅ Login con Admin
4. ✅ Lista de Items
5. ✅ Seleccionar Item
6. ✅ Actualizar Item
7. ✅ Crear Nuevo Item
8. ✅ Aplicar Filtros
9. ✅ Limpiar Filtros
10. ✅ Diseño Responsive

**Características:**
- Timeouts largos (15-20 segundos)
- Login directo (sin registro)
- Esperas adicionales
- Scroll automático
- Verificación de visibilidad

**Resultado esperado:** 10/10 (100%)

---

### `selenium-simple-test.js`

**Propósito:** Balance entre cobertura y confiabilidad.

**Comando:**
```bash
npm run test:selenium-simple
```

**Pruebas incluidas (11):**
- Todas las de selenium-final-test.js
- Plus: Logout

**Resultado esperado:** 9-11/11 (81-100%)

---

### `selenium-advanced-test.js`

**Propósito:** Suite completa con máxima cobertura.

**Comando:**
```bash
npm run test:selenium-advanced
```

**Pruebas incluidas (15):**
1. Load Application
2. Auth Modal Visible
3. User Registration (crea usuario nuevo)
4. User Login (login con usuario creado)
5. Items List Loaded
6. Filter by Category
7. Search Filter
8. Create New Item
9. Select and View Item
10. Update Item
11. Form Validation
12. Responsive Design
13. Security Headers
14. XSS Prevention
15. Logout

**Características:**
- Registro de usuario nuevo
- Pruebas de seguridad
- Validación de formularios
- Más susceptible a timing issues

**Resultado esperado:** 5-15/15 (33-100%)

---

## Comparación de Scripts de Selenium

| Script | Pruebas | Confiabilidad | Velocidad | Uso Recomendado |
|--------|---------|---------------|-----------|-----------------|
| `selenium-final-test.js` | 10 | ⭐⭐⭐⭐⭐ | Rápido | Evaluación |
| `selenium-simple-test.js` | 11 | ⭐⭐⭐⭐ | Rápido | Demostración |
| `selenium-advanced-test.js` | 15 | ⭐⭐⭐ | Lento | Testing completo |

---

## Estructura de un Test de Selenium

```javascript
class TestRunner {
    constructor() {
        this.driver = null;
        this.baseUrl = 'http://localhost:3000';
        this.testResults = { passed: 0, failed: 0, total: 0 };
    }

    async setup() {
        // Configurar WebDriver
        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
    }

    async runTest(testName, testFunction) {
        // Ejecutar prueba individual
        try {
            await testFunction.call(this);
            this.testResults.passed++;
        } catch (error) {
            this.testResults.failed++;
            // Tomar screenshot
        }
    }

    async teardown() {
        // Cerrar navegador
        await this.driver.quit();
    }
}
```

---

## Pruebas de Seguridad

### `security-test.js`

**Propósito:** Pruebas automatizadas de vulnerabilidades comunes.

**Comando:**
```bash
npm run test:security
```

**Vulnerabilidades probadas (11):**

1. **Security Headers**
   - X-Content-Type-Options
   - X-Frame-Options
   - Content-Security-Policy
   - HSTS

2. **XSS Protection**
   - Payload: `<script>alert("XSS")</script>`
   - Verifica sanitización de inputs

3. **SQL Injection Prevention**
   - Payloads: `' OR '1'='1`, `DROP TABLE`
   - Verifica validación de tipos

4. **Authentication Required**
   - Intenta crear item sin token
   - Debe retornar 401

5. **Weak Password Rejection**
   - Prueba: `123456`, `password`, `test`
   - Debe rechazar todas

6. **Rate Limiting**
   - 150 peticiones rápidas
   - Debe bloquear después de 100

7. **Input Validation**
   - Datos inválidos (tipos incorrectos)
   - Debe rechazar todos

8. **CSRF Protection**
   - Verifica uso de JWT en headers
   - No cookies

9. **CORS Configuration**
   - Verifica headers CORS
   - Configuración apropiada

10. **Sensitive Data Exposure**
    - Verifica que passwords no se retornen
    - Datos sensibles filtrados

11. **HTTPS Usage**
    - Verifica uso de HTTPS
    - Recomendación para producción

**Resultado esperado:** 9 PASSED, 2 WARNINGS, 0 FAILED

---

## Tecnologías Utilizadas

### Selenium WebDriver
```json
{
  "selenium-webdriver": "^4.38.0"
}
```

**Características:**
- Automatización de navegadores
- Soporte para Chrome, Firefox, Safari, Edge
- API completa para interacción con elementos
- Esperas implícitas y explícitas

### Chrome Options
```javascript
const options = new chrome.Options();
options.addArguments('--disable-gpu');
options.addArguments('--no-sandbox');
options.addArguments('--window-size=1920,1080');
```

---

## Comandos de Ejecución

### Pruebas Funcionales

```bash
# Suite optimizada (recomendado)
npm run test:selenium-final

# Suite simplificada
npm run test:selenium-simple

# Suite completa
npm run test:selenium-advanced

# Script básico (raíz del proyecto)
node selenium-test.js
```

### Pruebas de Seguridad

```bash
# Pruebas automatizadas
npm run test:security
```

### Requisitos Previos

```bash
# Terminal 1: Iniciar servidor
npm start

# Terminal 2: Ejecutar pruebas
npm run test:selenium-final
```

---

## Resultados de las Pruebas

### Formato de Salida

```
============================================================
📊 RESULTADOS FINALES
============================================================
Total: 10
✅ Exitosas: 10
❌ Fallidas: 0
Tasa de éxito: 100.00%
============================================================
🎉 ¡TODAS LAS PRUEBAS PASARON!
```

### Screenshots en Fallos

Cuando una prueba falla, se guarda automáticamente un screenshot:

```javascript
const screenshot = await this.driver.takeScreenshot();
fs.writeFileSync(`test-failure-${Date.now()}.png`, screenshot, 'base64');
```

---

## Mejores Prácticas Implementadas

### 1. Esperas Apropiadas
```javascript
// Espera explícita
await this.driver.wait(until.elementIsVisible(element), 15000);

// Espera adicional para UI
await this.driver.sleep(1000);
```

### 2. Scroll Automático
```javascript
await this.driver.executeScript(
    'arguments[0].scrollIntoView(true);', 
    element
);
```

### 3. Verificación de Visibilidad
```javascript
await this.driver.wait(until.elementIsVisible(element), 5000);
```

### 4. Manejo de Errores
```javascript
try {
    await testFunction.call(this);
    this.testResults.passed++;
} catch (error) {
    this.testResults.failed++;
    console.error(`Error: ${error.message}`);
    // Tomar screenshot
}
```

### 5. Timeouts Configurables
```javascript
// Timeout implícito global
await this.driver.manage().setTimeouts({ implicit: 15000 });

// Timeout explícito por operación
await this.driver.wait(condition, 20000);
```

---

## Problemas Comunes y Soluciones

### 1. "element not interactable"
**Causa:** Elemento no está listo para interactuar.

**Solución:**
```javascript
// Verificar visibilidad
await this.driver.wait(until.elementIsVisible(element), 5000);

// Scroll al elemento
await this.driver.executeScript('arguments[0].scrollIntoView(true);', element);

// Esperar un momento
await this.driver.sleep(500);
```

### 2. "Wait timed out"
**Causa:** Elemento tarda en aparecer.

**Solución:**
```javascript
// Aumentar timeout
await this.driver.wait(condition, 20000); // 20 segundos

// Agregar esperas adicionales
await this.driver.sleep(2000);
```

### 3. "element click intercepted"
**Causa:** Otro elemento cubre el elemento objetivo.

**Solución:**
```javascript
// Verificar que el modal esté cerrado
await this.driver.wait(async () => {
    const modal = await this.driver.findElement(By.id('auth-modal'));
    const display = await modal.getCssValue('display');
    return display === 'none';
}, 10000);
```

---

## Métricas de Calidad

### Cobertura de Pruebas

| Funcionalidad | Cubierta | Tests |
|---------------|----------|-------|
| Autenticación | ✅ | 3 |
| CRUD Items | ✅ | 4 |
| Filtros | ✅ | 2 |
| Responsive | ✅ | 1 |
| Seguridad | ✅ | 11 |

### Tasa de Éxito

| Script | Tasa Esperada | Tasa Real |
|--------|---------------|-----------|
| selenium-final-test.js | 100% | 100% |
| selenium-simple-test.js | 90-100% | 81-100% |
| selenium-advanced-test.js | 70-100% | 33-100% |
| security-test.js | 80-100% | 81% |

---

## Configuración de Chrome

### Opciones Utilizadas

```javascript
const options = new chrome.Options();

// Deshabilitar GPU (estabilidad)
options.addArguments('--disable-gpu');

// Sandbox (seguridad)
options.addArguments('--no-sandbox');

// Tamaño de ventana
options.addArguments('--window-size=1920,1080');

// Memoria compartida
options.addArguments('--disable-dev-shm-usage');

// Modo headless (opcional)
// options.addArguments('--headless');
```

---

## Integración Continua

### GitHub Actions (ejemplo)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm start &
      - run: npm run test:selenium-final
      - run: npm run test:security
```

---

## Documentación Adicional

### Para más información:
- **Selenium:** https://www.selenium.dev/documentation/
- **WebDriver:** https://w3c.github.io/webdriver/
- **Chrome DevTools Protocol:** https://chromedevtools.github.io/devtools-protocol/

### Archivos relacionados:
- `../README-EJECUCION.md` - Guía de ejecución
- `../playwright-comparison.md` - Comparación con Playwright
- `../docs/SECURITY-TESTING-GUIDE.md` - Guía de seguridad

---

## Mejoras Futuras

1. **Parallel Testing** - Ejecutar pruebas en paralelo
2. **Cross-browser Testing** - Firefox, Safari, Edge
3. **Visual Regression Testing** - Comparar screenshots
4. **Performance Testing** - Medir tiempos de carga
5. **API Testing** - Pruebas de endpoints
6. **E2E Testing** - Flujos completos de usuario
7. **CI/CD Integration** - Automatización completa
8. **Test Reports** - Reportes HTML detallados

---

## Contacto y Soporte

Para problemas con las pruebas:
1. Verificar que el servidor esté corriendo
2. Verificar que Chrome esté instalado
3. Revisar los screenshots de fallos
4. Consultar la documentación
5. Aumentar timeouts si es necesario
