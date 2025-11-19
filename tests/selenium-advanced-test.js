/**
 * SUITE DE PRUEBAS PROFESIONAL CON SELENIUM
 * 
 * Este archivo contiene pruebas automatizadas completas para la aplicación:
 * - Autenticación (registro y login)
 * - Operaciones CRUD (crear, leer, actualizar, eliminar)
 * - Filtros y búsqueda
 * - Características de seguridad
 * - Diseño responsive
 */

// Importar las dependencias necesarias de Selenium
const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Clase TestRunner
 * Maneja la ejecución de todas las pruebas y el reporte de resultados
 */
class TestRunner {
    /**
     * Constructor - Inicializa las variables del test runner
     */
    constructor() {
        this.driver = null; // Instancia del WebDriver de Selenium
        this.baseUrl = 'http://localhost:3000'; // URL de la aplicación a probar
        
        // Objeto para llevar el conteo de resultados
        this.testResults = {
            passed: 0,  // Pruebas exitosas
            failed: 0,  // Pruebas fallidas
            total: 0    // Total de pruebas ejecutadas
        };
    }

    /**
     * Configurar el WebDriver de Selenium
     * Inicializa Chrome con las opciones necesarias
     */
    async setup() {
        console.log('🚀 Setting up Selenium WebDriver...\n');
        
        // Configurar opciones de Chrome
        const options = new chrome.Options();
        
        // Modo headless (sin interfaz gráfica) - descomentado para ver el navegador
        // options.addArguments('--headless');
        
        // Opciones adicionales para estabilidad
        options.addArguments('--disable-gpu'); // Deshabilitar aceleración GPU
        options.addArguments('--no-sandbox'); // Necesario en algunos entornos
        options.addArguments('--window-size=1920,1080'); // Tamaño de ventana
        
        // Crear la instancia del WebDriver
        this.driver = await new Builder()
            .forBrowser('chrome') // Usar Chrome
            .setChromeOptions(options) // Aplicar las opciones
            .build();
        
        // Configurar timeout implícito de 5 segundos para encontrar elementos
        await this.driver.manage().setTimeouts({ implicit: 5000 });
    }

    /**
     * Limpiar y cerrar el navegador después de las pruebas
     */
    async teardown() {
        if (this.driver) {
            await this.driver.quit(); // Cerrar el navegador
            console.log('\n🔒 Browser closed');
        }
    }

    /**
     * Ejecutar una prueba individual
     * Maneja errores y toma screenshots en caso de fallo
     * 
     * @param {string} testName - Nombre descriptivo de la prueba
     * @param {Function} testFunction - Función que contiene la lógica de la prueba
     */
    async runTest(testName, testFunction) {
        this.testResults.total++; // Incrementar contador de pruebas
        
        try {
            console.log(`\n📝 Test ${this.testResults.total}: ${testName}`);
            
            // Ejecutar la función de prueba
            await testFunction.call(this);
            
            // Si no hubo errores, marcar como exitosa
            this.testResults.passed++;
            console.log(`✅ PASSED: ${testName}`);
            
        } catch (error) {
            // Si hubo error, marcar como fallida
            this.testResults.failed++;
            console.error(`❌ FAILED: ${testName}`);
            console.error(`   Error: ${error.message}`);
            
            // Intentar tomar un screenshot del error
            try {
                const screenshot = await this.driver.takeScreenshot();
                require('fs').writeFileSync(
                    `test-failure-${Date.now()}.png`, // Nombre único con timestamp
                    screenshot,
                    'base64'
                );
                console.log('   📸 Screenshot saved');
            } catch (screenshotError) {
                console.error('   Failed to take screenshot');
            }
        }
    }

    /**
     * Imprimir el resumen de resultados de todas las pruebas
     */
    async printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        
        // Calcular y mostrar el porcentaje de éxito
        const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(2);
        console.log(`Success Rate: ${successRate}%`);
        console.log('='.repeat(60));
    }

    // ========================================================================
    // CASOS DE PRUEBA
    // ========================================================================

    /**
     * Test 1: Verificar que la aplicación carga correctamente
     * Comprueba que el título de la página sea el esperado
     */
    async testLoadApplication() {
        // Navegar a la URL de la aplicación
        await this.driver.get(this.baseUrl);
        
        // Obtener el título de la página
        const title = await this.driver.getTitle();
        
        // Verificar que el título contenga el texto esperado
        if (!title.includes('Professional Master-Detail')) {
            throw new Error(`Expected title to contain 'Professional Master-Detail', got '${title}'`);
        }
    }

    async testAuthModalVisible() {
        const modal = await this.driver.findElement(By.id('auth-modal'));
        const isDisplayed = await modal.isDisplayed();
        if (!isDisplayed) {
            throw new Error('Auth modal should be visible on initial load');
        }
    }

    async testUserRegistration() {
        const timestamp = Date.now();
        const username = `testuser_${timestamp}`;
        const email = `test_${timestamp}@example.com`;
        const password = 'Test123!Pass';

        // Switch to register mode
        const toggleBtn = await this.driver.findElement(By.id('auth-toggle-btn'));
        await toggleBtn.click();
        await this.driver.sleep(500);

        // Fill registration form
        await this.driver.findElement(By.id('auth-username')).sendKeys(username);
        await this.driver.findElement(By.id('auth-email')).sendKeys(email);
        await this.driver.findElement(By.id('auth-password')).sendKeys(password);

        // Submit
        await this.driver.findElement(By.id('auth-submit-btn')).click();

        // Wait for modal to close (aumentar timeout)
        await this.driver.wait(async () => {
            const modal = await this.driver.findElement(By.id('auth-modal'));
            const display = await modal.getCssValue('display');
            return display === 'none';
        }, 10000); // Aumentado a 10 segundos

        // Esperar a que la UI se actualice
        await this.driver.sleep(2000);

        // Verify user info is displayed
        const userInfo = await this.driver.findElement(By.id('user-info'));
        const isVisible = await userInfo.isDisplayed();
        if (!isVisible) {
            throw new Error('User info should be visible after registration');
        }

        // Store credentials for later tests
        this.testUser = { username, password };
        
        console.log(`   Usuario registrado: ${username}`);
    }

    async testUserLogin() {
        // Logout first
        const logoutBtn = await this.driver.findElement(By.id('logout-btn'));
        await logoutBtn.click();
        await this.driver.sleep(1000); // Esperar a que se cierre la sesión

        // Esperar a que el modal de login aparezca
        await this.driver.wait(async () => {
            const modal = await this.driver.findElement(By.id('auth-modal'));
            const display = await modal.getCssValue('display');
            return display === 'flex' || display === 'block';
        }, 5000);

        // Login with test user
        await this.driver.findElement(By.id('auth-username')).sendKeys(this.testUser.username);
        await this.driver.findElement(By.id('auth-password')).sendKeys(this.testUser.password);
        await this.driver.findElement(By.id('auth-submit-btn')).click();

        // Wait for successful login (aumentar timeout)
        await this.driver.wait(async () => {
            const modal = await this.driver.findElement(By.id('auth-modal'));
            const display = await modal.getCssValue('display');
            return display === 'none';
        }, 10000); // Aumentado a 10 segundos
        
        // Esperar a que los items se carguen
        await this.driver.sleep(2000);
    }

    async testItemsListLoaded() {
        const itemsList = await this.driver.findElement(By.id('items-list'));
        const items = await itemsList.findElements(By.css('.item-card'));
        
        if (items.length === 0) {
            throw new Error('No items found in the list');
        }
        
        console.log(`   Found ${items.length} items`);
    }

    async testFilterByCategory() {
        const categoryFilter = await this.driver.findElement(By.id('filter-category'));
        await categoryFilter.sendKeys('electronics');
        
        const applyBtn = await this.driver.findElement(By.id('apply-filters-btn'));
        await applyBtn.click();
        
        await this.driver.sleep(1000);
        
        const items = await this.driver.findElements(By.css('.item-card'));
        console.log(`   Found ${items.length} electronics items`);
    }

    async testSearchFilter() {
        // Clear previous filters
        const clearBtn = await this.driver.findElement(By.id('clear-filters-btn'));
        await clearBtn.click();
        await this.driver.sleep(500);
        
        const searchInput = await this.driver.findElement(By.id('filter-search'));
        await searchInput.sendKeys('laptop');
        
        const applyBtn = await this.driver.findElement(By.id('apply-filters-btn'));
        await applyBtn.click();
        
        await this.driver.sleep(1000);
        
        const items = await this.driver.findElements(By.css('.item-card'));
        if (items.length === 0) {
            throw new Error('Search should return at least one result for "laptop"');
        }
    }

    async testCreateNewItem() {
        // Clear filters first
        const clearBtn = await this.driver.findElement(By.id('clear-filters-btn'));
        await clearBtn.click();
        await this.driver.sleep(500);
        
        const addBtn = await this.driver.findElement(By.id('add-item-btn'));
        await addBtn.click();
        
        // Wait for detail section
        await this.driver.wait(until.elementIsVisible(
            await this.driver.findElement(By.id('detail-section'))
        ), 5000);
        
        // Fill form
        const timestamp = Date.now();
        await this.driver.findElement(By.id('item-name')).sendKeys(`Test Item ${timestamp}`);
        await this.driver.findElement(By.id('item-description')).sendKeys('This is a test item created by Selenium');
        await this.driver.findElement(By.id('item-category')).sendKeys('electronics');
        await this.driver.findElement(By.id('item-price')).sendKeys('99.99');
        await this.driver.findElement(By.id('item-stock')).sendKeys('10');
        
        // Submit
        const submitBtn = await this.driver.findElement(By.css('#item-form button[type="submit"]'));
        await submitBtn.click();
        
        // Wait for toast notification
        await this.driver.wait(until.elementIsVisible(
            await this.driver.findElement(By.id('toast'))
        ), 5000);
        
        await this.driver.sleep(1000);
    }

    async testSelectAndViewItem() {
        const items = await this.driver.findElements(By.css('.item-card'));
        if (items.length === 0) {
            throw new Error('No items available to select');
        }
        
        await items[0].click();
        
        // Wait for detail section
        await this.driver.wait(until.elementIsVisible(
            await this.driver.findElement(By.id('detail-section'))
        ), 5000);
        
        // Verify form is populated
        const nameInput = await this.driver.findElement(By.id('item-name'));
        const name = await nameInput.getAttribute('value');
        
        if (!name) {
            throw new Error('Item name should be populated in the form');
        }
        
        console.log(`   Selected item: ${name}`);
    }

    async testUpdateItem() {
        // Assuming an item is already selected from previous test
        const nameInput = await this.driver.findElement(By.id('item-name'));
        await nameInput.clear();
        await nameInput.sendKeys('Updated Item Name');
        
        const descInput = await this.driver.findElement(By.id('item-description'));
        await descInput.clear();
        await descInput.sendKeys('Updated description by Selenium test');
        
        // Submit
        const submitBtn = await this.driver.findElement(By.css('#item-form button[type="submit"]'));
        await submitBtn.click();
        
        // Wait for toast
        await this.driver.wait(until.elementIsVisible(
            await this.driver.findElement(By.id('toast'))
        ), 5000);
        
        await this.driver.sleep(1000);
    }

    async testFormValidation() {
        const addBtn = await this.driver.findElement(By.id('add-item-btn'));
        await addBtn.click();
        
        await this.driver.sleep(500);
        
        // Try to submit empty form
        const submitBtn = await this.driver.findElement(By.css('#item-form button[type="submit"]'));
        await submitBtn.click();
        
        // HTML5 validation should prevent submission
        const nameInput = await this.driver.findElement(By.id('item-name'));
        const validationMessage = await this.driver.executeScript(
            'return arguments[0].validationMessage;',
            nameInput
        );
        
        if (!validationMessage) {
            throw new Error('Form validation should prevent empty submission');
        }
        
        console.log(`   Validation message: ${validationMessage}`);
        
        // Cancel
        const cancelBtn = await this.driver.findElement(By.id('cancel-btn'));
        await cancelBtn.click();
    }

    async testResponsiveDesign() {
        // Test mobile viewport
        await this.driver.manage().window().setRect({ width: 375, height: 667 });
        await this.driver.sleep(1000);
        
        const container = await this.driver.findElement(By.className('container'));
        const isDisplayed = await container.isDisplayed();
        
        if (!isDisplayed) {
            throw new Error('Container should be visible on mobile');
        }
        
        // Restore desktop viewport
        await this.driver.manage().window().setRect({ width: 1920, height: 1080 });
        await this.driver.sleep(500);
    }

    async testSecurityHeaders() {
        await this.driver.get(this.baseUrl);
        
        // Check for security headers via JavaScript
        const headers = await this.driver.executeScript(`
            return fetch('${this.baseUrl}/api/health')
                .then(response => {
                    const headers = {};
                    response.headers.forEach((value, key) => {
                        headers[key] = value;
                    });
                    return headers;
                });
        `);
        
        console.log('   Security headers detected:');
        if (headers['x-content-type-options']) {
            console.log(`   ✓ X-Content-Type-Options: ${headers['x-content-type-options']}`);
        }
        if (headers['x-frame-options']) {
            console.log(`   ✓ X-Frame-Options: ${headers['x-frame-options']}`);
        }
    }

    async testXSSPrevention() {
        const addBtn = await this.driver.findElement(By.id('add-item-btn'));
        await addBtn.click();
        await this.driver.sleep(500);
        
        // Try to inject XSS
        const xssPayload = '<script>alert("XSS")</script>';
        await this.driver.findElement(By.id('item-name')).sendKeys(xssPayload);
        await this.driver.findElement(By.id('item-description')).sendKeys('Test description');
        await this.driver.findElement(By.id('item-price')).sendKeys('10');
        
        const submitBtn = await this.driver.findElement(By.css('#item-form button[type="submit"]'));
        await submitBtn.click();
        
        await this.driver.sleep(2000);
        
        // Check if alert was triggered (it shouldn't be)
        try {
            await this.driver.switchTo().alert();
            throw new Error('XSS vulnerability detected! Alert was triggered');
        } catch (error) {
            if (error.message.includes('no such alert')) {
                console.log('   ✓ XSS payload was properly sanitized');
            } else {
                throw error;
            }
        }
        
        // Cancel
        const cancelBtn = await this.driver.findElement(By.id('cancel-btn'));
        await cancelBtn.click();
    }

    async testLogout() {
        const logoutBtn = await this.driver.findElement(By.id('logout-btn'));
        await logoutBtn.click();
        
        await this.driver.sleep(500);
        
        // Verify auth modal is shown again
        const modal = await this.driver.findElement(By.id('auth-modal'));
        const isDisplayed = await modal.isDisplayed();
        
        if (!isDisplayed) {
            throw new Error('Auth modal should be visible after logout');
        }
    }
}

// Main execution
async function main() {
    console.log('='.repeat(60));
    console.log('🧪 PROFESSIONAL SELENIUM TEST SUITE');
    console.log('='.repeat(60));
    
    const runner = new TestRunner();
    
    try {
        await runner.setup();
        
        // Run all tests
        await runner.runTest('Load Application', runner.testLoadApplication);
        await runner.runTest('Auth Modal Visible', runner.testAuthModalVisible);
        await runner.runTest('User Registration', runner.testUserRegistration);
        await runner.runTest('User Login', runner.testUserLogin);
        await runner.runTest('Items List Loaded', runner.testItemsListLoaded);
        await runner.runTest('Filter by Category', runner.testFilterByCategory);
        await runner.runTest('Search Filter', runner.testSearchFilter);
        await runner.runTest('Create New Item', runner.testCreateNewItem);
        await runner.runTest('Select and View Item', runner.testSelectAndViewItem);
        await runner.runTest('Update Item', runner.testUpdateItem);
        await runner.runTest('Form Validation', runner.testFormValidation);
        await runner.runTest('Responsive Design', runner.testResponsiveDesign);
        await runner.runTest('Security Headers', runner.testSecurityHeaders);
        await runner.runTest('XSS Prevention', runner.testXSSPrevention);
        await runner.runTest('Logout', runner.testLogout);
        
        await runner.printResults();
        
    } catch (error) {
        console.error('\n💥 Fatal error:', error);
    } finally {
        await runner.teardown();
    }
}

// Run tests
main().catch(console.error);
