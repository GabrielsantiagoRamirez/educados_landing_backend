const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Validar que las variables de entorno estén configuradas
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ ERROR: Las variables de entorno EMAIL_USER y EMAIL_PASS deben estar configuradas en el archivo .env');
  console.error('📝 Crea un archivo .env con:');
  console.error('   EMAIL_USER=tu_correo@gmail.com');
  console.error('   EMAIL_PASS=tu_contraseña_de_aplicacion');
  process.exit(1);
}

// Configuración del transporter de nodemailer
// Eliminar espacios en blanco de las credenciales (común al copiar desde Google)
const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim().replace(/\s/g, ''); // Eliminar todos los espacios

// Debug: mostrar información (sin mostrar la contraseña completa)
console.log('📧 Configuración de correo:');
console.log(`   Usuario: ${emailUser}`);
console.log(`   Contraseña: ${emailPass ? emailPass.substring(0, 4) + '****' : 'NO CONFIGURADA'}`);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: emailUser,
    pass: emailPass
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verificar la conexión del transporter al iniciar
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Error en la configuración del correo:', error.message);
    console.error('💡 Verifica que EMAIL_USER y EMAIL_PASS estén correctos en el archivo .env');
  } else {
    console.log('✅ Configuración de correo verificada correctamente');
  }
});

// Endpoint para enviar correo
app.post('/api/enviar-formulario', async (req, res) => {
  try {
    const { nombreCompleto, edad, ciudadResidencia, numeroWhatsApp, ultimoAnoCursado } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!nombreCompleto || !edad || !ciudadResidencia || !numeroWhatsApp || !ultimoAnoCursado) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Configurar el correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'gabrielsabtiago176@gmail.com',
      subject: 'Nueva Inscripción - Formulario Educados',
      html: `
        <h2>Nueva Inscripción Recibida</h2>
        <p>Se ha recibido una nueva inscripción desde el formulario:</p>
        <ul>
          <li><strong>Nombre completo:</strong> ${nombreCompleto}</li>
          <li><strong>Edad:</strong> ${edad}</li>
          <li><strong>Ciudad de residencia:</strong> ${ciudadResidencia}</li>
          <li><strong>Número de WhatsApp:</strong> ${numeroWhatsApp}</li>
          <li><strong>Último año cursado certificado:</strong> ${ultimoAnoCursado}</li>
        </ul>
        <p><em>Fecha de recepción: ${new Date().toLocaleString('es-ES')}</em></p>
      `,
      text: `
        Nueva Inscripción Recibida
        
        Nombre completo: ${nombreCompleto}
        Edad: ${edad}
        Ciudad de residencia: ${ciudadResidencia}
        Número de WhatsApp: ${numeroWhatsApp}
        Último año cursado certificado: ${ultimoAnoCursado}
        
        Fecha de recepción: ${new Date().toLocaleString('es-ES')}
      `
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Correo enviado correctamente',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el correo',
      error: error.message
    });
  }
});

// Endpoint de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API funcionando correctamente',
    endpoints: {
      'POST /api/enviar-formulario': 'Envía un correo con los datos del formulario',
      'GET /api/status': 'Verifica el estado de la configuración de correo'
    }
  });
});

// Endpoint para verificar configuración (sin exponer la contraseña)
app.get('/api/status', (req, res) => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();
  
  res.json({
    emailConfigured: !!(emailUser && emailPass),
    emailUser: emailUser || 'NO CONFIGURADO',
    emailPassLength: emailPass ? emailPass.length : 0,
    hasSpaces: emailPass ? emailPass.includes(' ') : false,
    message: emailUser && emailPass 
      ? 'Configuración de correo detectada' 
      : 'Faltan credenciales en el archivo .env'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📧 Endpoint disponible: POST http://localhost:${PORT}/api/enviar-formulario`);
});
