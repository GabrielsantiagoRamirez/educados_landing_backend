const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS
const corsOptions = {
  origin: '*', // Permite todos los orígenes (en producción puedes especificar tu dominio)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Leer variables de entorno del .env
const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim()?.replace(/\s/g, '');

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPass
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Endpoint para enviar correo
app.post('/api/enviar-formulario', async (req, res) => {
  try {
    const { nombreCompleto, edad, ciudadResidencia, numeroWhatsApp, ultimoAnoCursado, correo } = req.body;

    // Validar campos requeridos
    if (!nombreCompleto || !edad || !ciudadResidencia || !numeroWhatsApp || !ultimoAnoCursado || !correo) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Enviar correo
    const info = await transporter.sendMail({
      from: emailUser,
      to: emailUser, // Enviar al mismo correo configurado en EMAIL_USER
      subject: 'Nueva Inscripción - Formulario Educados',
      html: `
        <h2>Nueva Inscripción Recibida</h2>
        <p>Se ha recibido una nueva inscripción desde el formulario:</p>
        <ul>
          <li><strong>Nombre completo:</strong> ${nombreCompleto}</li>
          <li><strong>Correo electrónico:</strong> ${correo}</li>
          <li><strong>Edad:</strong> ${edad}</li>
          <li><strong>Ciudad de residencia:</strong> ${ciudadResidencia}</li>
          <li><strong>Número de WhatsApp:</strong> ${numeroWhatsApp}</li>
          <li><strong>Último año cursado certificado:</strong> ${ultimoAnoCursado}</li>
        </ul>
        <p><em>Fecha de recepción: ${new Date().toLocaleString('es-ES')}</em></p>
      `
    });

    res.json({
      success: true,
      message: 'Correo enviado correctamente'
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

// Exportar la app para Vercel
module.exports = app;

// Iniciar servidor solo si no estamos en Vercel
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}
