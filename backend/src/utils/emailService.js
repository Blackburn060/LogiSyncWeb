const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: "SSLv3",
  },
  pool: true, // Ativa o reuso de conexões
  maxConnections: 5, // Limita o número de conexões simultâneas
  maxMessages: 100, // Limita o número de e-mails por conexão
  rateLimit: true, // Habilita o controle de taxa
});

const enviarEmailRecuperacaoSenha = async (to, resetLink) => {
  const subject = "Recuperação de Senha - LogiSync";

  const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 40px 0; text-align: center;">
        <div style="background-color: white; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
  
          <!-- Título -->
          <h2 style="color: #1f4e79; font-size: 24px;">Recuperação de Senha</h2>
          
          <!-- Texto de introdução -->
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Olá,</p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Recebemos uma solicitação para redefinir a sua senha. Se você não fez essa solicitação, por favor, ignore este e-mail.
          </p>
          
          <!-- Link de redefinição -->
          <div style="margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #1f4e79; color: white; padding: 15px 30px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">
              Redefinir Senha
            </a>
          </div>
          
          <!-- Alternativa para copiar o link -->
          <p style="color: #555; font-size: 14px; line-height: 1.4;">Ou copie e cole o link abaixo no seu navegador:</p>
          <p style="color: #1f4e79; font-size: 14px; word-break: break-all;">
            <a href="${resetLink}" style="color: #1f4e79;">${resetLink}</a>
          </p>
  
          <!-- Rodapé -->
          <p style="color: #777; font-size: 12px; margin-top: 40px;">Obrigado,</p>
          <p style="color: #777; font-size: 12px;">Equipe LogiSync</p>
        </div>
      </div>
    `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }
};

const enviarEmailSenhaTemporaria = async (to, senhaTemporaria) => {
  const subject = "Sua Senha Temporária - LogiSync";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 40px 0; text-align: center;">
      <div style="background-color: white; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
  
        <!-- Título -->
        <h2 style="color: #1f4e79; font-size: 24px;">Sua Senha Temporária</h2>
        
        <!-- Texto de introdução -->
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Olá,</p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Sua senha foi redefinida pelo administrador. Sua nova senha temporária é:
        </p>
        
        <!-- Senha Temporária -->
        <div style="margin: 30px 0;">
          <p style="background-color: #1f4e79; color: white; padding: 15px 30px; font-size: 20px; font-weight: bold; border-radius: 5px;">
            ${senhaTemporaria}
          </p>
        </div>
        
        <p style="color: #555; font-size: 14px; line-height: 1.4;">Por favor, acesse o sistema e altere sua senha o quanto antes.</p>

        <!-- Rodapé -->
        <p style="color: #777; font-size: 12px; margin-top: 40px;">Obrigado,</p>
        <p style="color: #777; font-size: 12px;">Equipe LogiSync</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const enviarEmailsTemporariosEmSerie = async (emails) => {
  for (const email of emails) {
    try {
      await enviarEmailSenhaTemporaria(email.to, email.senhaTemporaria);
      console.log(`E-mail enviado para: ${email.to}`);
    } catch (error) {
      console.error(`Erro ao enviar e-mail para ${email.to}:`, error);
    }
    await delay(2000);
  }
};

module.exports = {
  enviarEmailRecuperacaoSenha,
  enviarEmailSenhaTemporaria,
  enviarEmailsTemporariosEmSerie,
};
