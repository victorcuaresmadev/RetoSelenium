/**
 * SCRIPT DE PRUEBAS DE SEGURIDAD AUTOMATIZADAS
 * 
 * Este archivo prueba vulnerabilidades comunes en aplicaciones web:
 * - XSS (Cross-Site Scripting)
 * - SQL Injection
 * - Autenticación y Autorización
 * - Validación de Inputs
 * - Rate Limiting
 * - Headers de Seguridad
 * - Exposición de Datos Sensibles
 * - Y más...
 */

// Importar módulos nativos de Node.js para hacer peticiones HTTP
const http = require('http');
const https = require('https');

/**
 * Clase SecurityTester
 * Ejecuta pruebas de seguridad automatizadas contra la aplicación
 */
class SecurityTester {
    /**
     * Constructor - Inicializa el tester de seguridad
     * 
     * @param {string} baseUrl - URL base de la aplicación a probar
     */
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl; // URL de la aplicación
        
        // Objeto para llevar el conteo de resultados
        this.results = {
            passed: 0,    // Pruebas que pasaron (sin vulnerabilidades)
            failed: 0,    // Pruebas que fallaron (vulnerabilidades encontradas)
            warnings: 0,  // Advertencias (posibles mejoras)
            total: 0      // Total de pruebas ejecutadas
        };
        
        this.authToken = null; // Token JWT para pruebas autenticadas
    }

    /**
     * Hacer una petición HTTP a la aplicación
     * Función auxiliar para realizar peticiones de prueba
     * 
     * @param {string} path - Ruta del endpoint (ej: '/api/items')
     * @param {Object} options - Opciones de la petición (method, headers, body)
     * @returns {Promise} Promesa que resuelve con la respuesta
     */
    async makeRequest(path, options = {}) {
        return new Promise((resolve, reject) => {
            // Construir la URL completa
            const url = new URL(path, this.baseUrl);
            
            // Determinar si usar HTTP o HTTPS
            const protocol = url.protocol === 'https:' ? https : http;
            
            // Configurar las opciones de la petición
            const requestOptions = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname + url.search,
                method: options.method || 'GET', // Por defecto GET
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers // Agregar headers adicionales
                }
            };

            // Crear la petición
            const req = protocol.request(requestOptions, (res) => {
                let data = '';
                
                // Acumular los datos de la respuesta
                res.on('data', chunk => data += chunk);
                
                // Cuando termine de recibir datos
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode, // Código de estado HTTP
                        headers: res.headers,       // Headers de la respuesta
                        body: data                  // Cuerpo de la respuesta
                    });
                });
            });

            // Manejar errores de red
            req.on('error', reject);
            
            // Si hay body, enviarlo
            if (options.body) {
                req.write(JSON.stringify(options.body));
            }
            
            // Finalizar la petición
            req.end();
        });
    }

    async runTest(testName, testFunction) {
        this.results.total++;
        try {
            console.log(`\n🔍 Test ${this.results.total}: ${testName}`);
            const result = await testFunction.call(this);
            
            if (result.status === 'passed') {
                this.results.passed++;
                console.log(`✅ PASSED: ${result.message}`);
            } else if (result.status === 'warning') {
                this.results.warnings++;
                console.log(`⚠️  WARNING: ${result.message}`);
            } else {
                this.results.failed++;
                console.log(`❌ FAILED: ${result.message}`);
            }
            
            if (result.details) {
                console.log(`   Details: ${result.details}`);
            }
        } catch (error) {
            this.results.failed++;
            console.error(`❌ FAILED: ${testName}`);
            console.error(`   Error: ${error.message}`);
        }
    }

    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('🔒 SECURITY TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`⚠️  Warnings: ${this.results.warnings}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log('='.repeat(60));
        
        if (this.results.failed === 0 && this.results.warnings === 0) {
            console.log('🎉 All security tests passed!');
        } else if (this.results.failed === 0) {
            console.log('⚠️  Some warnings detected. Review recommended.');
        } else {
            console.log('❌ Security vulnerabilities detected! Immediate action required.');
        }
        console.log('='.repeat(60));
    }

    // Test Cases

    async testSecurityHeaders() {
        const response = await this.makeRequest('/api/health');
        const headers = response.headers;
        
        const requiredHeaders = {
            'x-content-type-options': 'nosniff',
            'x-frame-options': ['DENY', 'SAMEORIGIN'],
            'strict-transport-security': null // Should exist for HTTPS
        };
        
        const missing = [];
        const present = [];
        
        for (const [header, expectedValue] of Object.entries(requiredHeaders)) {
            if (headers[header]) {
                present.push(header);
            } else {
                missing.push(header);
            }
        }
        
        if (missing.length === 0) {
            return {
                status: 'passed',
                message: 'All critical security headers present',
                details: present.join(', ')
            };
        } else if (missing.includes('strict-transport-security')) {
            return {
                status: 'warning',
                message: 'HSTS header missing (acceptable for HTTP)',
                details: `Present: ${present.join(', ')}`
            };
        } else {
            return {
                status: 'failed',
                message: 'Missing security headers',
                details: `Missing: ${missing.join(', ')}`
            };
        }
    }

    async testXSSProtection() {
        // Register a test user
        const timestamp = Date.now();
        const xssPayload = '<script>alert("XSS")</script>';
        
        const response = await this.makeRequest('/api/auth/register', {
            method: 'POST',
            body: {
                username: `xsstest_${timestamp}`,
                email: `xss_${timestamp}@test.com`,
                password: 'Test123!Pass'
            }
        });
        
        if (response.statusCode === 201) {
            const data = JSON.parse(response.body);
            this.authToken = data.token;
            
            // Try to create item with XSS payload
            const itemResponse = await this.makeRequest('/api/items', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: {
                    name: xssPayload,
                    description: xssPayload,
                    category: 'other',
                    price: 10
                }
            });
            
            if (itemResponse.statusCode === 201) {
                const itemData = JSON.parse(itemResponse.body);
                
                // Check if payload was sanitized
                if (itemData.item.name.includes('<script>')) {
                    return {
                        status: 'failed',
                        message: 'XSS vulnerability detected',
                        details: 'Script tags not sanitized'
                    };
                } else {
                    return {
                        status: 'passed',
                        message: 'XSS payload properly sanitized',
                        details: 'Script tags escaped or removed'
                    };
                }
            }
        }
        
        return {
            status: 'warning',
            message: 'Could not complete XSS test',
            details: 'Registration or item creation failed'
        };
    }

    async testSQLInjection() {
        // Test SQL injection in item ID parameter
        const sqlPayloads = [
            "1' OR '1'='1",
            "1; DROP TABLE items--",
            "1' UNION SELECT * FROM users--"
        ];
        
        for (const payload of sqlPayloads) {
            const response = await this.makeRequest(`/api/items/${encodeURIComponent(payload)}`);
            
            // Should return 400 (bad request) or 404 (not found), not 500 (server error)
            if (response.statusCode === 500) {
                return {
                    status: 'failed',
                    message: 'Potential SQL injection vulnerability',
                    details: `Payload "${payload}" caused server error`
                };
            }
        }
        
        return {
            status: 'passed',
            message: 'SQL injection attempts properly handled',
            details: 'All payloads rejected or sanitized'
        };
    }

    async testAuthenticationRequired() {
        // Try to create item without authentication
        const response = await this.makeRequest('/api/items', {
            method: 'POST',
            body: {
                name: 'Test Item',
                description: 'Test',
                category: 'other'
            }
        });
        
        if (response.statusCode === 401) {
            return {
                status: 'passed',
                message: 'Authentication properly required',
                details: 'Unauthorized access blocked'
            };
        } else {
            return {
                status: 'failed',
                message: 'Authentication not enforced',
                details: `Expected 401, got ${response.statusCode}`
            };
        }
    }

    async testWeakPasswordRejection() {
        const timestamp = Date.now();
        const weakPasswords = ['123456', 'password', 'test', 'abc'];
        
        for (const password of weakPasswords) {
            const response = await this.makeRequest('/api/auth/register', {
                method: 'POST',
                body: {
                    username: `weakpass_${timestamp}_${password}`,
                    email: `weak_${timestamp}_${password}@test.com`,
                    password: password
                }
            });
            
            if (response.statusCode === 201) {
                return {
                    status: 'failed',
                    message: 'Weak password accepted',
                    details: `Password "${password}" should be rejected`
                };
            }
        }
        
        return {
            status: 'passed',
            message: 'Weak passwords properly rejected',
            details: 'Password policy enforced'
        };
    }

    async testRateLimiting() {
        // Make multiple rapid requests
        const requests = [];
        for (let i = 0; i < 150; i++) {
            requests.push(this.makeRequest('/api/health'));
        }
        
        const responses = await Promise.all(requests);
        const rateLimited = responses.filter(r => r.statusCode === 429);
        
        if (rateLimited.length > 0) {
            return {
                status: 'passed',
                message: 'Rate limiting active',
                details: `${rateLimited.length} requests blocked`
            };
        } else {
            return {
                status: 'warning',
                message: 'Rate limiting not detected',
                details: '150 rapid requests all succeeded'
            };
        }
    }

    async testInputValidation() {
        if (!this.authToken) {
            // Register a test user
            const timestamp = Date.now();
            const response = await this.makeRequest('/api/auth/register', {
                method: 'POST',
                body: {
                    username: `validtest_${timestamp}`,
                    email: `valid_${timestamp}@test.com`,
                    password: 'Test123!Pass'
                }
            });
            
            if (response.statusCode === 201) {
                const data = JSON.parse(response.body);
                this.authToken = data.token;
            }
        }
        
        // Test with invalid data types
        const invalidPayloads = [
            { name: 123, description: 'test' }, // number instead of string
            { name: 'test', description: null }, // null value
            { name: 'test', description: 'test', price: 'invalid' }, // invalid price
            { name: 'a'.repeat(200), description: 'test' } // exceeds max length
        ];
        
        let validationWorks = true;
        
        for (const payload of invalidPayloads) {
            const response = await this.makeRequest('/api/items', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: payload
            });
            
            if (response.statusCode === 201) {
                validationWorks = false;
                break;
            }
        }
        
        if (validationWorks) {
            return {
                status: 'passed',
                message: 'Input validation working correctly',
                details: 'Invalid inputs properly rejected'
            };
        } else {
            return {
                status: 'failed',
                message: 'Input validation insufficient',
                details: 'Some invalid inputs accepted'
            };
        }
    }

    async testCSRFProtection() {
        // Check if CSRF tokens are implemented
        const response = await this.makeRequest('/');
        const body = response.body;
        
        // Look for CSRF token in response
        const hasCsrfToken = body.includes('csrf') || body.includes('_token');
        
        if (hasCsrfToken) {
            return {
                status: 'passed',
                message: 'CSRF protection detected',
                details: 'CSRF tokens found in response'
            };
        } else {
            return {
                status: 'warning',
                message: 'CSRF protection not detected',
                details: 'Consider implementing CSRF tokens for state-changing operations'
            };
        }
    }

    async testCORSConfiguration() {
        const response = await this.makeRequest('/api/health');
        const corsHeader = response.headers['access-control-allow-origin'];
        
        if (!corsHeader) {
            return {
                status: 'passed',
                message: 'CORS not enabled (restrictive)',
                details: 'No CORS headers found'
            };
        } else if (corsHeader === '*') {
            return {
                status: 'warning',
                message: 'CORS allows all origins',
                details: 'Consider restricting to specific domains'
            };
        } else {
            return {
                status: 'passed',
                message: 'CORS properly configured',
                details: `Allowed origin: ${corsHeader}`
            };
        }
    }

    async testSensitiveDataExposure() {
        if (!this.authToken) {
            return { status: 'warning', message: 'Skipped - no auth token' };
        }
        
        const response = await this.makeRequest('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${this.authToken}`
            }
        });
        
        if (response.statusCode === 200) {
            const data = JSON.parse(response.body);
            
            // Check if sensitive data is exposed
            if (data.password || data.passwordHash) {
                return {
                    status: 'failed',
                    message: 'Password data exposed in API response',
                    details: 'Sensitive data should never be returned'
                };
            } else {
                return {
                    status: 'passed',
                    message: 'No sensitive data exposure detected',
                    details: 'User data properly filtered'
                };
            }
        }
        
        return { status: 'warning', message: 'Could not verify' };
    }

    async testHTTPSRedirect() {
        // This test is informational for HTTP environments
        if (this.baseUrl.startsWith('https://')) {
            return {
                status: 'passed',
                message: 'Application using HTTPS',
                details: 'Secure connection established'
            };
        } else {
            return {
                status: 'warning',
                message: 'Application using HTTP',
                details: 'Consider enforcing HTTPS in production'
            };
        }
    }
}

// Main execution
async function main() {
    console.log('='.repeat(60));
    console.log('🔒 AUTOMATED SECURITY TESTING');
    console.log('='.repeat(60));
    console.log('Testing for: XSS, SQL Injection, Authentication, Authorization,');
    console.log('Input Validation, Rate Limiting, and more...\n');
    
    const tester = new SecurityTester();
    
    try {
        await tester.runTest('Security Headers', tester.testSecurityHeaders);
        await tester.runTest('XSS Protection', tester.testXSSProtection);
        await tester.runTest('SQL Injection Prevention', tester.testSQLInjection);
        await tester.runTest('Authentication Required', tester.testAuthenticationRequired);
        await tester.runTest('Weak Password Rejection', tester.testWeakPasswordRejection);
        await tester.runTest('Rate Limiting', tester.testRateLimiting);
        await tester.runTest('Input Validation', tester.testInputValidation);
        await tester.runTest('CSRF Protection', tester.testCSRFProtection);
        await tester.runTest('CORS Configuration', tester.testCORSConfiguration);
        await tester.runTest('Sensitive Data Exposure', tester.testSensitiveDataExposure);
        await tester.runTest('HTTPS Usage', tester.testHTTPSRedirect);
        
        tester.printResults();
        
    } catch (error) {
        console.error('\n💥 Fatal error:', error);
    }
}

// Run tests
main().catch(console.error);
