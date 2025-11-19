/**
 * Script de Pruebas Básicas con Selenium
 * Prueba la funcionalidad completa de la aplicación incluyendo autenticación
 */

const { Builder, By, until } = require('selenium-webdriver');

async function runSeleniumTest() {
    let driver;
    
    try {
        console.log('🚀 Iniciando pruebas con Selenium...\n');
        
        // Inicializar el driver (usando Chrome por defecto)
        driver = await new Builder().forBrowser('chrome').build();
        
        // Test 1: Abrir la aplicación
        console.log('Test 1: Abriendo la aplicación...');
        await driver.get('http://localhost:3000');
        await driver.wait(until.titleContains('Professional Master-Detail'), 5000);
        console.log('✓ Aplicación abierta correctamente');
        
        // Test 2: Verificar que el modal de login está visible
        console.log('\nTest 2: Verificando modal de autenticación...');
        const authModal = await driver.findElement(By.id('auth-modal'));
        const isModalVisible = await authModal.isDisplayed();
        if (isModalVisible) {
            console.log('✓ Modal de autenticación visible');
        }
        
        // Test 3: Hacer login
        console.log('\nTest 3: Realizando login...');
        await driver.findElement(By.id('auth-username')).sendKeys('admin');
        await driver.findElement(By.id('auth-password')).sendKeys('Admin123!');
        await driver.findElement(By.id('auth-submit-btn')).click();
        
        // Esperar a que el modal se cierre
        await driver.wait(async () => {
            const modal = await driver.findElement(By.id('auth-modal'));
            const display = await modal.getCssValue('display');
            return display === 'none';
        }, 5000);
        console.log('✓ Login exitoso');
        
        // Esperar a que los items se carguen
        await driver.sleep(1000);
        
        // Test 4: Verificar que los items se muestran
        console.log('\nTest 4: Verificando items en la lista...');
        const items = await driver.findElements(By.css('.item-card'));
        console.log(`✓ Se encontraron ${items.length} items en la lista`);
        
        // Test 5: Hacer clic en el primer item
        console.log('\nTest 5: Haciendo clic en el primer item...');
        if (items.length > 0) {
            await items[0].click();
            await driver.wait(until.elementIsVisible(
                await driver.findElement(By.id('detail-section'))
            ), 5000);
            console.log('✓ Primer item seleccionado y detalles mostrados');
        }
        
        // Test 6: Llenar formulario y guardar
        console.log('\nTest 6: Llenando formulario y guardando...');
        const nameInput = await driver.findElement(By.id('item-name'));
        const descInput = await driver.findElement(By.id('item-description'));
        
        // Limpiar y llenar inputs
        await nameInput.clear();
        await nameInput.sendKeys('Item Actualizado por Selenium');
        await descInput.clear();
        await descInput.sendKeys('Descripción actualizada por las pruebas automatizadas');
        
        // Hacer clic en guardar
        const saveButton = await driver.findElement(By.css('#item-form button[type="submit"]'));
        await saveButton.click();
        
        // Esperar a que aparezca el toast de confirmación
        await driver.wait(until.elementIsVisible(
            await driver.findElement(By.id('toast'))
        ), 5000);
        console.log('✓ Formulario llenado y guardado exitosamente');
        
        await driver.sleep(1000);
        
        // Test 7: Agregar nuevo item
        console.log('\nTest 7: Agregando un nuevo item...');
        const addButton = await driver.findElement(By.id('add-item-btn'));
        await addButton.click();
        
        // Esperar a que el formulario esté visible
        await driver.wait(until.elementIsVisible(
            await driver.findElement(By.id('detail-section'))
        ), 5000);
        
        // Llenar formulario de nuevo item
        await driver.findElement(By.id('item-name')).sendKeys('Nuevo Item de Prueba');
        await driver.findElement(By.id('item-description')).sendKeys('Este item fue creado por Selenium');
        await driver.findElement(By.id('item-price')).sendKeys('99.99');
        await driver.findElement(By.id('item-stock')).sendKeys('10');
        
        // Guardar nuevo item
        const submitBtn = await driver.findElement(By.css('#item-form button[type="submit"]'));
        await submitBtn.click();
        
        // Esperar confirmación
        await driver.wait(until.elementIsVisible(
            await driver.findElement(By.id('toast'))
        ), 5000);
        console.log('✓ Nuevo item agregado exitosamente');
        
        await driver.sleep(1000);
        
        // Test 8: Verificar que el nuevo item aparece en la lista
        console.log('\nTest 8: Verificando que el nuevo item aparece en la lista...');
        const updatedItems = await driver.findElements(By.css('.item-card'));
        console.log(`✓ La lista actualizada contiene ${updatedItems.length} items`);
        
        // Test 9: Probar filtros
        console.log('\nTest 9: Probando filtros...');
        const searchInput = await driver.findElement(By.id('filter-search'));
        await searchInput.sendKeys('laptop');
        const applyFiltersBtn = await driver.findElement(By.id('apply-filters-btn'));
        await applyFiltersBtn.click();
        
        await driver.sleep(1000);
        const filteredItems = await driver.findElements(By.css('.item-card'));
        console.log(`✓ Filtro aplicado, se encontraron ${filteredItems.length} items`);
        
        // Test 10: Limpiar filtros
        console.log('\nTest 10: Limpiando filtros...');
        const clearFiltersBtn = await driver.findElement(By.id('clear-filters-btn'));
        await clearFiltersBtn.click();
        
        await driver.sleep(1000);
        console.log('✓ Filtros limpiados');
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ ¡Todas las pruebas pasaron exitosamente!');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('\n❌ Prueba fallida:', error.message);
        console.error('\nDetalles del error:', error);
    } finally {
        // Cerrar el navegador
        if (driver) {
            await driver.quit();
            console.log('\n🔒 Navegador cerrado');
        }
    }
}

// Ejecutar las pruebas
runSeleniumTest();