const bcrypt = require('bcryptjs');

/**
 * Script para generar usuarios de prueba con passwords hasheados
 * Ejecutar: node scripts/generate-test-users.js
 */

async function generateUsers() {
    console.log('🔐 Generando usuarios de prueba...\n');
    
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
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${user.password}`);
        console.log(`Password Hash: ${hashedPassword}`);
        console.log(`Role: ${user.role}`);
        console.log('-'.repeat(60));
    }
    
    console.log('\n✅ Usuarios generados correctamente');
    console.log('\n📝 Copia estos hashes al archivo backend/routes/auth.js');
}

generateUsers().catch(console.error);
