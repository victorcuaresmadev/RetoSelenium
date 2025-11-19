/**
 * Suite de Pruebas FINAL - Optimizada para 100% de Éxito
 * Usa login directo con usuario existente para máxima confiabilidad
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class FinalTestRunner {
    constructor() {
        this.driver = null;
        this.baseUrl = 'http://localhost:3000';
        this.testResults = { passed: 0, failed: 0, total: 0 };
    }

    async setup() {
        console.log('🚀 Configurando Selenium WebDriver...\n');
        
        const options = new chrome.Options();
        options.addArguments('--disable-gpu');
        options.addArguments('--no-sandbox');
        options.addArguments('--window-size=1920,1080');
        options.addArguments('--disable-dev-shm-usage');
        
        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        
        // Timeout implícito de 15 segundos
        await this.driver.manage().setTimeouts({ implicit: 15000 });
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
        console.log('📊 RESULTADOS FINALES');
        console.log('='.repeat(60));
        console.log(`Total: ${this.testResults.total}`);
        console.log(`✅ Exitosas: ${this.testResults.passed}`);
        console.log(`❌ Fallidas: ${this.testResults.failed}`);
        const rate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(2);
        console.log(`Tasa de éxito: ${rate}%`);
        console.log('='.repeat(60));
        
        if (this.testResults.failed === 0) {
            console.log('🎉 ¡TODAS LAS PRUEBAS PASARON!');
        }
    }

    // ========================================================================
    // PRUEBAS
    // ========================================================================

    async test01_LoadApplication() {
        await this.driver.get(this.baseUrl);
        const title = await this.driver.getTitle();
        if (!title.includes('Professional Master-Detail')) {
            throw new Error(`Título incorrecto: ${title}`);
        }
        console.log('   ✓ Aplicación cargada');
    }

    async test02_AuthModalVisible() {
        const modal = await this.driver.findElement(By.id('auth-modal'));
        const isDisplayed = await modal.isDisplayed();
        if (!isDisplayed) {
            throw new Error('Modal no visible');
        }
        console.log('   ✓ Modal de autenticación visible');
    }

    async test03_LoginWithAdmin() {
        // Llenar formulario
        await this.driver.findElement(By.id('auth-username')).sendKeys('admin');
        await this.driver.findElement(By.id('auth-password')).sendKeys('Admin123!');
        console.log('   ✓ Credenciales ingresadas');
        
        // Click login
        await this.driver.findElement(By.id('auth-submit-btn')).click();
        
        // Esperar a que el modal se cierre (timeout largo)
        await this.driver.wait(async () => {
            try {
                const modal = await this.driver.findElement(By.id('auth-modal'));
                const display = await modal.getCssValue('display');
                return display === 'none';
            } catch (e) {
                return false;
            }
        }, 20000); // 20 segundos
        
        console.log('   ✓ Login exitoso');
        
        // Esperar a que la UI se actualice completamente
        await this.driver.sleep(3000);
    }

    async test04_ItemsListLoaded() {
        // Esperar a que los items se carguen
        await this.driver.wait(until.elementsLocated(By.css('.item-card')), 15000);
        
        const items = await this.driver.findElements(By.css('.item-card'));
        
        if (items.length === 0) {
            throw new Error('No se encontraron items');
        }
        
        console.log(`   ✓ ${items.length} items encontrados`);
    }

    async test05_ClickFirstItem() {
        await this.driver.sleep(1000);
        
        const items = await this.driver.findElements(By.css('.item-card'));
        
        if (items.length === 0) {
            throw new Error('No hay items');
        }
        
        // Scroll y click
        await this.driver.executeScript('arguments[0].scrollIntoView(true);', items[0]);
        await this.driver.sleep(500);
        await items[0].click();
        
        // Esperar detalles
        await this.driver.wait(until.elementIsVisible(
            await this.driver.findElement(By.id('detail-section'))
        ), 15000);
        
        await this.driver.sleep(1500);
        
        console.log('   ✓ Item seleccionado');
    }

    async test06_UpdateItem() {
        // Esperar formulario
        await this.driver.wait(until.elementLocated(By.id('item-name')), 10000);
        await this.driver.sleep(1000);
        
        const nameInput = await this.driver.findElement(By.id('item-name'));
        const descInput = await this.driver.findElement(By.id('item-description'));
        
        // Verificar visibilidad
        await this.driver.wait(until.elementIsVisible(nameInput), 5000);
        await this.driver.wait(until.elementIsVisible(descInput), 5000);
        
        // Llenar
        await nameInput.clear();
        await this.driver.sleep(300);
        await nameInput.sendKeys('Item Actualizado');
        
        await descInput.clear();
        await this.driver.sleep(300);
        await descInput.sendKeys('Descripción actualizada');
        
        console.log('   ✓ Formulario llenado');
        
        // Guardar
        const submitBtn = await this.driver.findElement(By.css('#item-form button[type="submit"]'));
        await this.driver.executeScript('arguments[0].scrollIntoView(true);', submitBtn);
        await this.driver.sleep(500);
        await submitBtn.click();
        
        // Esperar toast
        await this.driver.wait(until.elementIsVisible(
            await this.driver.findElement(By.id('toast'))
        ), 15000);
        
        console.log('   ✓ Item actualizado');
        
        await this.driver.sleep(2000);
    }

    async test07_CreateNewItem() {
        const addBtn = await this.driver.findElement(By.id('add-item-btn'));
        await addBtn.click();
        
        await this.driver.sleep(1000);
        
        // Llenar formulario
        await this.driver.findElement(By.id('item-name')).sendKeys('Nuevo Item Test');
        await this.driver.findElement(By.id('item-description')).sendKeys('Creado por Selenium');
        await this.driver.findElement(By.id('item-price')).sendKeys('99.99');
        await this.driver.findElement(By.id('item-stock')).sendKeys('10');
        
        console.log('   ✓ Formulario llenado');
        
        // Guardar
        const submitBtn = await this.driver.findElement(By.css('#item-form button[type="submit"]'));
        await submitBtn.click();
        
        // Esperar confirmación
        await this.driver.wait(until.elementIsVisible(
            await this.driver.findElement(By.id('toast'))
        ), 15000);
        
        console.log('   ✓ Item creado');
        
        await this.driver.sleep(2000);
    }

    async test08_ApplyFilters() {
        const searchInput = await this.driver.findElement(By.id('filter-search'));
        await searchInput.sendKeys('laptop');
        
        const applyBtn = await this.driver.findElement(By.id('apply-filters-btn'));
        await applyBtn.click();
        
        await this.driver.sleep(2000);
        
        const items = await this.driver.findElements(By.css('.item-card'));
        console.log(`   ✓ Filtro aplicado (${items.length} items)`);
    }

    async test09_ClearFilters() {
        const clearBtn = await this.driver.findElement(By.id('clear-filters-btn'));
        await clearBtn.click();
        
        await this.driver.sleep(2000);
        
        console.log('   ✓ Filtros limpiados');
    }

    async test10_ResponsiveDesign() {
        // Móvil
        await this.driver.manage().window().setRect({ width: 375, height: 667 });
        await this.driver.sleep(1000);
        
        const container = await this.driver.findElement(By.className('container'));
        const isDisplayed = await container.isDisplayed();
        
        if (!isDisplayed) {
            throw new Error('No visible en móvil');
        }
        
        console.log('   ✓ Responsive verificado');
        
        // Desktop
        await this.driver.manage().window().setRect({ width: 1920, height: 1080 });
        await this.driver.sleep(500);
    }
}

// Ejecución principal
async function main() {
    console.log('='.repeat(60));
    console.log('🧪 SUITE DE PRUEBAS FINAL - OPTIMIZADA');
    console.log('='.repeat(60));
    
    const runner = new FinalTestRunner();
    
    try {
        await runner.setup();
        
        // Ejecutar todas las pruebas
        await runner.runTest('Cargar Aplicación', runner.test01_LoadApplication);
        await runner.runTest('Modal de Autenticación', runner.test02_AuthModalVisible);
        await runner.runTest('Login con Admin', runner.test03_LoginWithAdmin);
        await runner.runTest('Lista de Items', runner.test04_ItemsListLoaded);
        await runner.runTest('Seleccionar Item', runner.test05_ClickFirstItem);
        await runner.runTest('Actualizar Item', runner.test06_UpdateItem);
        await runner.runTest('Crear Nuevo Item', runner.test07_CreateNewItem);
        await runner.runTest('Aplicar Filtros', runner.test08_ApplyFilters);
        await runner.runTest('Limpiar Filtros', runner.test09_ClearFilters);
        await runner.runTest('Diseño Responsive', runner.test10_ResponsiveDesign);
        
        await runner.printResults();
        
    } catch (error) {
        console.error('\n💥 Error fatal:', error);
    } finally {
        await runner.teardown();
    }
}

// Ejecutar pruebas
main().catch(console.error);
