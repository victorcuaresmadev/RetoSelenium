const { Builder, By, until, Key } = require('selenium-webdriver');

/**
 * Script de demostración de Selenium con un sitio web público
 * Este ejemplo usa un sitio de prueba real para demostrar las capacidades de Selenium
 */

async function runPublicSiteTest() {
    let driver;
    
    try {
        console.log('Iniciando pruebas con Selenium...\n');
        
        // Inicializar el navegador Chrome
        driver = await new Builder().forBrowser('chrome').build();
        
        // Test 1: Navegar a un sitio de prueba
        console.log('Test 1: Navegando a sitio de prueba...');
        await driver.get('https://www.saucedemo.com/');
        console.log('✓ Sitio cargado correctamente');
        
        // Test 2: Llenar formulario de login
        console.log('\nTest 2: Llenando formulario de login...');
        const usernameField = await driver.findElement(By.id('user-name'));
        const passwordField = await driver.findElement(By.id('password'));
        
        await usernameField.sendKeys('standard_user');
        await passwordField.sendKeys('secret_sauce');
        console.log('✓ Credenciales ingresadas');
        
        // Test 3: Hacer clic en botón de login
        console.log('\nTest 3: Haciendo clic en botón de login...');
        const loginButton = await driver.findElement(By.id('login-button'));
        await loginButton.click();
        
        // Esperar a que la página de productos cargue
        await driver.wait(until.urlContains('inventory.html'), 5000);
        console.log('✓ Login exitoso, página de productos cargada');
        
        // Test 4: Validar que los productos se muestran
        console.log('\nTest 4: Validando productos...');
        const products = await driver.findElements(By.className('inventory_item'));
        console.log(`✓ Se encontraron ${products.length} productos en la página`);
        
        // Test 5: Agregar producto al carrito
        console.log('\nTest 5: Agregando producto al carrito...');
        const addToCartButton = await driver.findElement(By.css('[data-test="add-to-cart-sauce-labs-backpack"]'));
        await addToCartButton.click();
        
        // Verificar que el badge del carrito se actualiza
        const cartBadge = await driver.findElement(By.className('shopping_cart_badge'));
        const cartCount = await cartBadge.getText();
        console.log(`✓ Producto agregado al carrito (${cartCount} item)`);
        
        // Test 6: Ir al carrito
        console.log('\nTest 6: Navegando al carrito...');
        const cartLink = await driver.findElement(By.className('shopping_cart_link'));
        await cartLink.click();
        await driver.wait(until.urlContains('cart.html'), 5000);
        console.log('✓ Página del carrito cargada');
        
        // Test 7: Validar contenido del carrito
        console.log('\nTest 7: Validando contenido del carrito...');
        const cartItems = await driver.findElements(By.className('cart_item'));
        console.log(`✓ El carrito contiene ${cartItems.length} producto(s)`);
        
        // Obtener nombre del producto
        const productName = await driver.findElement(By.className('inventory_item_name'));
        const name = await productName.getText();
        console.log(`✓ Producto en carrito: "${name}"`);
        
        // Test 8: Tomar screenshot
        console.log('\nTest 8: Capturando screenshot...');
        await driver.takeScreenshot().then(
            function(image) {
                require('fs').writeFileSync('test-screenshot.png', image, 'base64');
                console.log('✓ Screenshot guardado como "test-screenshot.png"');
            }
        );
        
        console.log('\n✅ Todas las pruebas completadas exitosamente!');
        
    } catch (error) {
        console.error('\n❌ Error durante las pruebas:', error.message);
    } finally {
        // Cerrar el navegador
        if (driver) {
            await driver.quit();
            console.log('\n🔒 Navegador cerrado');
        }
    }
}

// Ejecutar las pruebas
console.log('='.repeat(60));
console.log('PRUEBAS FUNCIONALES AUTOMATIZADAS CON SELENIUM');
console.log('='.repeat(60));
runPublicSiteTest();
