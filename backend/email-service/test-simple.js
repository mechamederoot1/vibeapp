const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

// Carregar configurações
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3002; // Porta diferente para teste

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do transportador de e-mail
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Vibe Email Service (Teste)',
    timestamp: new Date().toISOString(),
    config: {
      smtp_host: process.env.SMTP_HOST || 'não configurado',
      smtp_port: process.env.SMTP_PORT || 'não configurado',
      smtp_user: process.env.SMTP_USER || 'não configurado'
    }
  });
});

// Rota de teste de SMTP (sem banco de dados)
app.post('/test-smtp', async (req, res) => {
  try {
    console.log('📧 Testando configuração SMTP...');
    
    // Verificar conexão SMTP
    await transporter.verify();
    console.log('✅ Servidor SMTP verificado com sucesso');
    
    const testEmail = {
      from: {
        name: 'Vibe - Teste',
        address: process.env.SMTP_FROM
      },
      to: req.body.email || process.env.SMTP_USER,
      subject: '🧪 Teste do Serviço de E-mail - Vibe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">🧪 Teste de E-mail</h2>
          <p>Este é um e-mail de teste do microserviço de e-mail do Vibe.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Configurações SMTP:</h3>
            <ul>
              <li><strong>Host:</strong> ${process.env.SMTP_HOST}</li>
              <li><strong>Port:</strong> ${process.env.SMTP_PORT}</li>
              <li><strong>From:</strong> ${process.env.SMTP_FROM}</li>
            </ul>
          </div>
          <p style="color: #16a34a;"><strong>✅ Configurações SMTP funcionando corretamente!</strong></p>
          <p><small>Data/Hora: ${new Date().toLocaleString('pt-BR')}</small></p>
        </div>
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ E-mail de teste enviado:', info.messageId);
    
    res.json({
      success: true,
      message: 'E-mail de teste enviado com sucesso!',
      messageId: info.messageId,
      destination: testEmail.to
    });

  } catch (error) {
    console.error('❌ Erro no teste SMTP:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao testar SMTP',
      error: error.message,
      code: error.code
    });
  }
});

// Rota para envio simples sem banco
app.post('/send-simple', async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'E-mail é obrigatório'
      });
    }
    
    const mailOptions = {
      from: {
        name: 'Vibe',
        address: process.env.SMTP_FROM
      },
      to: email,
      subject: subject || 'Mensagem do Vibe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">Vibe</h2>
          <p>${message || 'Esta é uma mensagem de teste do Vibe.'}</p>
          <p><small>Enviado em: ${new Date().toLocaleString('pt-BR')}</small></p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ E-mail enviado para: ${email}`);

    res.json({
      success: true,
      message: 'E-mail enviado com sucesso',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao enviar e-mail',
      error: error.message
    });
  }
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Serviço de E-mail (Teste) rodando na porta ${PORT}`);
  console.log(`📧 SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  console.log(`📮 From: ${process.env.SMTP_FROM}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Teste SMTP: POST http://localhost:${PORT}/test-smtp`);
});

module.exports = app;
