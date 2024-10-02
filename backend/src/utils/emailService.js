const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// Configuração OAuth2 com as credenciais fornecidas
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

// Configure o token de atualização que você obteve
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

// Função para obter o access token atualizado
const getAccessToken = async () => {
  const { token } = await oauth2Client.getAccessToken();
  return token;
};

// Configuração do transportador SMTP com OAuth2
const createTransporter = async () => {
  const accessToken = await getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "logisync.no.reply@gmail.com",
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  return transporter;
};

// Função para enviar e-mail de recuperação de senha
const enviarEmailRecuperacaoSenha = async (to, resetLink) => {
  const transporter = await createTransporter();
  
  const subject = "Recuperação de Senha - LogiSync";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 40px 0; text-align: center;">
      <div style="background-color: white; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1f4e79; font-size: 24px;">Recuperação de Senha</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Olá,</p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Recebemos uma solicitação para redefinir a sua senha. Se você não fez essa solicitação, por favor, ignore este e-mail.
        </p>
        <div style="margin: 30px 0;">
          <a href="${resetLink}" 
            style="background-color: #1f4e79; color: white; padding: 15px 30px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">
            Redefinir Senha
          </a>
        </div>
        <p style="color: #555; font-size: 14px; line-height: 1.4;">Ou copie e cole o link abaixo no seu navegador:</p>
        <p style="color: #1f4e79; font-size: 14px; word-break: break-all;">
          <a href="${resetLink}" style="color: #1f4e79;">${resetLink}</a>
        </p>
        <p style="color: #777; font-size: 12px; margin-top: 40px;">Obrigado,</p>
        <p style="color: #777; font-size: 12px;">Equipe LogiSync</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: "logisync.no.reply@gmail.com",
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }
};

// Função para enviar e-mail de senha temporária
const enviarEmailSenhaTemporaria = async (to, senhaTemporaria) => {
  const transporter = await createTransporter();
  
  const subject = "Sua Senha Temporária - LogiSync";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 40px 0; text-align: center;">
      <div style="background-color: white; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1f4e79; font-size: 24px;">Sua Senha Temporária</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Olá,</p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Sua senha foi redefinida pelo administrador. Sua nova senha temporária é:
        </p>
        <div style="margin: 30px 0;">
          <p style="background-color: #1f4e79; color: white; padding: 15px 30px; font-size: 20px; font-weight: bold; border-radius: 5px;">
            ${senhaTemporaria}
          </p>
        </div>
        <p style="color: #555; font-size: 14px; line-height: 1.4;">Por favor, acesse o sistema e altere sua senha o quanto antes.</p>
        <p style="color: #777; font-size: 12px; margin-top: 40px;">Obrigado,</p>
        <p style="color: #777; font-size: 12px;">Equipe LogiSync</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: "logisync.no.reply@gmail.com",
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Erro ao enviar e-mail para ${to}:`, error);
  }
};

// Função para enviar e-mails de boas-vindas
const enviarEmailBoasVindas = async (to, senhaTemporaria) => {
  const transporter = await createTransporter();

  const subject = "Bem-vindo à LogiSync! Sua Senha Temporária";
  const htmlContent = `
    <h1>Bem-vindo à LogiSync!</h1>
    <p>Sua conta foi criada com sucesso. Sua senha temporária é: <strong>${senhaTemporaria}</strong></p>
    <p>Por favor, acesse o sistema e altere sua senha o mais rápido possível.</p>
  `;

  try {
    await transporter.sendMail({
      from: "logisync.no.reply@gmail.com",
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Erro ao enviar e-mail de boas-vindas para ${to}:`, error);
  }
};

// Função para enviar vários e-mails em série com delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const enviarEmailsTemporariosEmSerie = async (emails) => {
  for (const email of emails) {
    try {
      await enviarEmailSenhaTemporaria(email.to, email.senhaTemporaria);
    } catch (error) {
      console.error(`Erro ao enviar e-mail para ${email.to}:`, error);
    }
    await delay(2000);
  }
};

// Exportando as funções
module.exports = {
  enviarEmailRecuperacaoSenha,
  enviarEmailSenhaTemporaria,
  enviarEmailBoasVindas,
  enviarEmailsTemporariosEmSerie,
};