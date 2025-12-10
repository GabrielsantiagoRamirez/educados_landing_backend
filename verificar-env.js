// Script para verificar la configuración del .env
require('dotenv').config();

console.log('🔍 Verificación de variables de entorno:\n');
console.log('PORT:', process.env.PORT || 'NO CONFIGURADO');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NO CONFIGURADO');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 
  process.env.EMAIL_PASS.substring(0, 4) + '**** (longitud: ' + process.env.EMAIL_PASS.length + ')' : 
  'NO CONFIGURADO');

console.log('\n📋 Detalles:');
if (process.env.EMAIL_USER) {
  console.log('✅ EMAIL_USER está configurado');
  console.log('   Longitud:', process.env.EMAIL_USER.length);
  console.log('   Tiene espacios:', process.env.EMAIL_USER.includes(' ') ? 'SÍ ❌' : 'NO ✅');
  console.log('   Tiene comillas:', (process.env.EMAIL_USER.includes('"') || process.env.EMAIL_USER.includes("'")) ? 'SÍ ❌' : 'NO ✅');
} else {
  console.log('❌ EMAIL_USER NO está configurado');
}

if (process.env.EMAIL_PASS) {
  console.log('✅ EMAIL_PASS está configurado');
  console.log('   Longitud:', process.env.EMAIL_PASS.length, process.env.EMAIL_PASS.length === 16 ? '✅ (correcto)' : '⚠️ (debería ser 16)');
  console.log('   Tiene espacios:', process.env.EMAIL_PASS.includes(' ') ? 'SÍ ❌ (debe eliminarse)' : 'NO ✅');
  console.log('   Tiene comillas:', (process.env.EMAIL_PASS.includes('"') || process.env.EMAIL_PASS.includes("'")) ? 'SÍ ❌' : 'NO ✅');
  console.log('   Primeros 4 caracteres:', process.env.EMAIL_PASS.substring(0, 4));
} else {
  console.log('❌ EMAIL_PASS NO está configurado');
}

console.log('\n💡 Si algo está mal, revisa el archivo .env');

