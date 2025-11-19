/**
 * Suite de Pruebas Simplificada con Selenium
 * Versión más confiable con mejores esperas y manejo de errores
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class SimpleTestRunner {
    constructor() {
        this.driver = null;
        this.baseUrl = 'http://localhost:3000';
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    async setup() {
        console.log('🚀 Configurando Selenium WebDriver...\n');
        
        const options = new chrome.Options();
        options.addArguments('--disable-gpu');
        options.addArguments('--no-sandbox');
        options.addArguments('--window-size=1920,1080');
        
        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        
        await this.driver.manage().setTimeouts({ implicit: 10000 });
    }

    async teardown() {
        if (this.driver) {
            await this.driver.quit();
            console.log('\n🔒 Navegador cerrado');
        }
    }

    async runTest(testName, testFunction) {
        this.testResults.total++;
        try {
            console.log(`\n📝 Test ${this.testResults.total}: ${testName}`);
            await testFunction.call(this);
            this.testResults.passed++;
            console.log(`✅ PASSED: ${testName}`);
        } catch (error) {
            this.testResults.failed++;
            console.error(`❌ FAILED: ${testName}`);
            console.error(`   Error: ${error.message}`);
        }
    }

    async printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESULTADOS DE LAS PRUEBAS');
        console.log('='.repeat(60));
        console.log(`Total: ${this.testResults.total}`);
        console.log(`✅ Exitosas: ${this.testResults.passed}`);
        console.log(`❌ Fallidas: ${this.testResults.failed}`);
        console.log(`Tasa de éxito: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(2)}%`);
        console.log('='.repeat(60));
    }

    // ========================================================================
    // PRUEBAS
    // ========================================================================

    async testLoadApplication() {
        await this.driver.get(this.baseUrl);
        const title = await this.driver.getTitle();
        if (!title.includes('Professional Master-Detail')) {
            throw new Error(`Título incorrecto: ${title}`);
        }
        console.log('   ✓ Aplicación cargada correctamente');
    }

    async testAuthModalVisible() {
        const modal = await this.driver.findElement(By.id('auth-modal'));
        const isDisplayed = await modal.isDisplayed();
        if (!isDisplayed) {
            throw new Error('Modal de autenticación no visible');
        }
        console.log('   ✓ Modal de autenticación visible');
    }

    async testLoginWithAdmin() {
        // Llenar formulario de login
        await this.driver.findElement(By.id('auth-username')).sendKeys('admin');
        await this.driver.findElement(By.id('auth-password')).sendKeys('Admin123!');
        
        console.log('   ✓ Credenciales ingresadas');
        
        // Click en login
        await this.driver.findElement(By.id('auth-submit-btn')).click();
        
        // Esperar a que el modal se cierre
        await this.driver.wait(async () => {
            try {
                const modal = await this.driver.findElement(By.id('auth-modal'));
                const display = await modal.getCssValue('display');
                return display === 'none';
            } catch (e) {
                return false;
            }
        }, 15000);
        
        console.log('   ✓ Login exitoso');
        
        // Esperar a que la UI se actualice
        await this.driver.sleep(2000);
    }

    async testItemsListLoaded() {
        // Esperar a que los items se carguen
        await this.driver.wait(until.elementsLocated(By.css('.item-card')), 10000);
        
        const items = await this.driver.findElements(By.css('.item-card'));
        
        if (items.length === 0) {
            throw new Error('No se encontraron items');
        }
        
        console.log(`   ✓ Se encontraron ${items.length} items`);
    }

    async testClickFirstItem() {
        // Esperar a que los items estén cargados
        await this.driver.sleep(1000);
        
        const items = await this.driver.findElements(By.css('.item-card'));
        
        if (items.length === 0) {
            throw new Error('No hay items para seleccionar');
        }
        
        // Scroll al elemento para asegurar que sea visible
        await this.driver.executeScript('arguments[0].scrollIntoView(true);', items[0]);
        await this.driver.sleep(500);
        
        // Click en el item
        await items[0].click();
        
        // Esperar a que la sección de detalles sea visible (aumentar timeout)
        await this.driver.wait(until.elementIsVisible(
            await this.driver.findElement(By.id('detail-section'))
        ), 15000); // Aumentado a 15 segundos
        
        // Esperar a que el formulario esté completamente cargado
        await this.driver.sleep(1000);
        
        console.log('   ✓ Item seleccionado y detalles mostrados');
    }

    async testUpdateItem() {
        // Esperar a que el formulario esté listo
        await this.driver.wait(until.elementLocated(By.id('item-name')), 10000);
        await this.driver.sleep(500);
        
        const nameInput = await this.driver.findElement(By.id('item-name'));
        const descInput = await this.driver.findElement(By.id('item-description'));
        
        // Verificar que los elementos sean interactuables
        await this.driver.wait(until.elementIsVisible(nameInput), 5000);
        await this.driver.wait(until.elementIsVisible(descInput), 5000);
        
        // Limpiar y llenar
        await nameInput.clear();
        await this.driver.sleep(200);
        await nameInput.sendKeys('Item Actualizado por Selenium');
        
        await descInput.clear();
        await this.driver.sleep(200);
        await descInput.sendKeys('Descripción actualizada por las pruebas');
        
        console.log('   ✓ Formulario llenado');
        
        // Guardar
        const submitBtn = await this.driver.findElement(By.css('#item-form button[type="submit"]'));
        
        // Scroll al botón
        await this.driver.executeScript('arguments[0].scrollIntoView(true);', submitBtn);
        await this.driver.sleep(300);
        
        await submitBtn.click();
        
        // Esperar toast de confirmación (aumentar timeout)
        await this.driver.wait(until.elementIsVisible(
            await this.driver.findElement(By.id('toast'))
        ), 15000);
        
        console.log('   ✓ Item actualizado exitosamente');
        
        await this.driver.sleep(1500);
    }

    async testCreateNewItem() {
        const addBtn = await this.driver.findElement(By.id('add-item-btn'));
        await addBtn.click();
        
        await this.driver.sleep(500);
        
        // Llenar formulario
        await this.driver.findElement(By.id('item-name')).sendKeys('Nuevo Item de Prueba');
        await this.driver.findElement(By.id('item-description')).sendKeys('Creado por Selenium');
        await this.driver.findElement(By.id('item-price')).sendKeys('99.99');
        await this.driver.findElement(By.id('item-stock')).sendKeys('10');
        
        console.log('   ✓ Formulario de nuevo item llenado');
        
        // Guardar
        const submitBtn = await this.driver.findElement(By.css('#item-form button[type="submit"]'));
        await submitBtn.click();
        
        // Esperar confirmación
        await this.driver.wait(until.elementIsVisible(
            await this.driver.findElement(By.id('toast'))
        ), 10000);
        
        console.log('   ✓ Nuevo item creado exitosamente');
        
        await this.driver.sleep(1000);
    }

    async testApplyFilters() {
        const searchInput = await this.driver.findElement(By.id('filter-search'));
        await searchInput.sendKeys('laptop');
        
        const applyBtn = await this.driver.findElement(By.id('apply-filters-btn'));
        await applyBtn.click();
        
        await this.driver.sleep(1500);
        
        const items = await this.driver.findElements(By.css('.item-card'));
        console.log(`   ✓ Filtro aplicado, ${items.length} items encontrados`);
    }

    async testClearFilters() {
        const clearBtn = await this.driver.findElement(By.id('clear-filters-btn'));
        await clearBtn.click();
        
        await this.driver.sleep(1500);
        
        console.log('   ✓ Filtros limpiados');
    }

    async testResponsiveDesign() {
        // Probar viewport móvil
        await this.driver.manage().window().setRect({ width: 375, height: 667 });
        await this.driver.sleep(1000);
        
        const container = await this.driver.findElement(By.className('container'));
        const isDisplayed = await container.isDisplayed();
        
        if (!isDisplayed) {
            throw new Error('Contenedor no visible en móvil');
        }
        
        console.log('   ✓ Diseño responsive verificado');
        
        // Restaurar viewport desktop
        await this.driver.manage().window().setRect({ width: 1920, height: 1080 });
        await this.driver.sleep(500);
    }

    async testLogout() {
        const logoutBtn = await this.driver.findElement(By.id('logout-btn'));
        await logoutBtn.click();
        
        await this.driver.sleep(1000);
        
        // Verificar que el modal de login aparece
        const modal = await this.driver.findElement(By.id('auth-modal'));
        const isDisplayed = await modal.isDisplayed();
        
        if (!isDisplayed) {
            throw new Error('Modal de login no apareció después de logout');
        }
        
        console.log('   ✓ Logout exitoso');
    }
}

// Ejecución principal
async function main() {
    console.log('='.repeat(60));
    console.log('🧪 SUITE DE PRUEBAS SIMPLIFICADA CON SELENIUM');
    console.log('='.repeat(60));
    
    const runner = new SimpleTestRunner();
    
    try {
        await runner.setup();
        
        // Ejecutar todas las pruebas
        await runner.runTest('Cargar Aplicación', runner.testLoadApplication);
        await runner.runTest('Modal de Autenticación Visible', runner.testAuthModalVisible);
        await runner.runTest('Login con Admin', runner.testLoginWithAdmin);
        await runner.runTest('Lista de Items Cargada', runner.testItemsListLoaded);
        await runner.runTest('Seleccionar Primer Item', runner.testClickFirstItem);
        await runner.runTest('Actualizar Item', runner.testUpdateItem);
        await runner.runTest('Crear Nuevo Item', runner.testCreateNewItem);
        await runner.runTest('Aplicar Filtros', runner.testApplyFilters);
        await runner.runTest('Limpiar Filtros', runner.testClearFilters);
        await runner.runTest('Diseño Responsive', runner.testResponsiveDesign);
        await runner.runTest('Logout', runner.testLogout);
        
        await runner.printResults();
        
    } catch (error) {
        console.error('\n💥 Error fatal:', error);
    } finally {
        await runner.teardown();
    }
}

// Ejecutar pruebas
main().catch(console.error);
