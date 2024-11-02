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
  refresh_token: process.env.REFRESH_TOKEN,
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
      code: process.env.CODE,
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
        <h2 style="color: #1f4e79; font-size: 24px; margin-top: 0;">Recuperação de Senha</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Olá,</p>
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Recebemos uma solicitação para redefinir sua senha. Caso você não tenha feito essa solicitação, por favor, ignore este e-mail.
        </p>
        <div style="margin: 30px 0;">
          <a href="${resetLink}" 
            style="display: inline-block; background-color: #1f4e79; color: white; padding: 15px 30px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">
            Redefinir Senha
          </a>
        </div>
        <p style="color: #555; font-size: 14px; line-height: 1.4; margin-bottom: 10px;">Ou copie e cole o link abaixo no seu navegador:</p>
        <p style="color: #1f4e79; font-size: 14px; word-break: break-all; margin-bottom: 30px;">
          <a href="${resetLink}" style="color: #1f4e79; text-decoration: none;">${resetLink}</a>
        </p>
        <p style="color: #777; font-size: 12px; margin-top: 40px;">Atenciosamente,</p>
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
    console.error("Erro ao enviar e-mail:", error.message);
    throw new Error("Erro ao enviar e-mail de recuperação de senha.");
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
    console.error(`Erro ao enviar e-mail: ${error.message}`);
    throw new Error(`Erro ao enviar e-mail de senha temporária para ${to}.`);
  }
};

// Função para enviar e-mails de boas-vindas
const enviarEmailBoasVindas = async (to, senhaTemporaria) => {
  const transporter = await createTransporter();

  const subject = "Bem-vindo à LogiSync! Sua Senha Temporária";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 40px 0; text-align: center;">
      <div style="background-color: white; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1f4e79; font-size: 24px;">Bem-vindo à LogiSync!</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Sua conta foi criada com sucesso.</p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Sua senha temporária é:
        </p>
        <div style="margin: 30px 0;">
          <p style="background-color: #1f4e79; color: white; padding: 15px 30px; font-size: 20px; font-weight: bold; border-radius: 5px;">
            ${senhaTemporaria}
          </p>
        </div>
        <p style="color: #555; font-size: 14px; line-height: 1.4;">Por favor, acesse o sistema e altere sua senha quanto antes!.</p>
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
    console.error(
      `Erro ao enviar e-mail de boas-vindas para ${to}: ${error.message}`
    );
    throw new Error("Erro ao enviar e-mail de boas-vindas.");
  }
};

// Função para enviar vários e-mails em série com delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const enviarEmailsTemporariosEmSerie = async (emails) => {
  for (const email of emails) {
    try {
      await enviarEmailSenhaTemporaria(email.to, email.senhaTemporaria);
    } catch (error) {
      console.error(`Erro ao enviar e-mail para ${email.to}: ${error.message}`);
    }
    await delay(2000);
  }
};

const enviarEmailConfirmacaoAgendamento = async (to, detalhesAgendamento) => {
  const transporter = await createTransporter();

  const subject = "Confirmação de Agendamento - LogiSync";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 40px 0; text-align: center;">
      <div style="background-color: white; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1f4e79; font-size: 24px;">Agendamento Realizado com Sucesso!</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Olá, seu agendamento foi realizado com sucesso!
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          <strong>Detalhes do Agendamento:</strong><br>
          Data: ${detalhesAgendamento.data}<br>
          Horário: ${detalhesAgendamento.horario}
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.4;">Nos vemos em breve!</p>
        <p style="color: #777; font-size: 12px; margin-top: 40px;">Atenciosamente,</p>
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
    console.error(
      `Erro ao enviar e-mail de confirmação para ${to}: ${error.message}`
    );
    throw new Error("Erro ao enviar e-mail de confirmação de agendamento.");
  }
};

const enviarEmailCancelamentoAgendamento = async (to, detalhesAgendamento) => {
  const transporter = await createTransporter();

  const subject = "Cancelamento de Agendamento - LogiSync";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 40px 0; text-align: center;">
      <div style="background-color: white; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1f4e79; font-size: 24px;">Agendamento Cancelado</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Informamos que seu agendamento foi cancelado.
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          <strong>Detalhes do Agendamento:</strong><br>
          Data: ${detalhesAgendamento.data}<br>
          Horário: ${detalhesAgendamento.horario}
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.4;">Se precisar de mais informações, entre em contato com nossa equipe.</p>
        <p style="color: #777; font-size: 12px; margin-top: 40px;">Atenciosamente,</p>
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
    console.error(
      `Erro ao enviar e-mail de cancelamento para ${to}: ${error.message}`
    );
    throw new Error("Erro ao enviar e-mail de cancelamento de agendamento.");
  }
};

const enviarEmailAprovacaoAgendamento = async (to, detalhesAgendamento) => {
  const transporter = await createTransporter();

  const subject = "Agendamento Aprovado - LogiSync";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 40px 0; text-align: center;">
      <div style="background-color: white; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1f4e79; font-size: 24px;">Seu Agendamento foi Aprovado</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Olá, seu agendamento foi aprovado com sucesso!
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          <strong>Detalhes do Agendamento:</strong><br>
          Data: ${detalhesAgendamento.data}<br>
          Horário: ${detalhesAgendamento.horario}
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.4;">Estamos ansiosos para recebê-lo!</p>
        <p style="color: #777; font-size: 12px; margin-top: 40px;">Atenciosamente,</p>
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
    console.error(
      `Erro ao enviar e-mail de aprovação para ${to}: ${error.message}`
    );
    throw new Error("Erro ao enviar e-mail de aprovação de agendamento.");
  }
};

const enviarEmailRecusaAgendamento = async (
  to,
  detalhesAgendamento,
  motivoRecusa
) => {
  const transporter = await createTransporter();

  const subject = "Agendamento Recusado - LogiSync";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 40px 0; text-align: center;">
      <div style="background-color: white; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1f4e79; font-size: 24px;">Seu Agendamento foi Recusado</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Lamentamos informar que seu agendamento foi recusado.
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          <strong>Detalhes do Agendamento:</strong><br>
          Data: ${detalhesAgendamento.data}<br>
          Horário: ${detalhesAgendamento.horario}
        </p>
        <p style="color: #e63946; font-size: 16px; font-weight: bold;">Motivo da Recusa:</p>
        <p style="color: #333; font-size: 14px; line-height: 1.6;">${motivoRecusa}</p>
        <p style="color: #777; font-size: 12px; margin-top: 40px;">Atenciosamente,</p>
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
    console.error(
      `Erro ao enviar e-mail de recusa para ${to}: ${error.message}`
    );
    throw new Error("Erro ao enviar e-mail de recusa de agendamento.");
  }
};

const enviarEmailFinalizacaoAgendamento = async (to, detalhesAgendamento) => {
  const transporter = await createTransporter();

  const subject = "Agendamento Finalizado - LogiSync";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 40px 0; text-align: center;">
      <div style="background-color: white; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1f4e79; font-size: 24px;">Agendamento Finalizado</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Seu agendamento foi concluído com sucesso. Agradecemos por utilizar nossos serviços!
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          <strong>Detalhes do Agendamento:</strong><br>
          Data: ${detalhesAgendamento.data}<br>
          Horário: ${detalhesAgendamento.horario}
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.4;">Esperamos vê-lo novamente em breve!</p>
        <p style="color: #777; font-size: 12px; margin-top: 40px;">Atenciosamente,</p>
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
    console.error(
      `Erro ao enviar e-mail de finalização para ${to}: ${error.message}`
    );
    throw new Error("Erro ao enviar e-mail de finalização de agendamento.");
  }
};

// Exportando as funções
module.exports = {
  enviarEmailRecuperacaoSenha,
  enviarEmailSenhaTemporaria,
  enviarEmailBoasVindas,
  enviarEmailsTemporariosEmSerie,
  enviarEmailFinalizacaoAgendamento,
  enviarEmailRecusaAgendamento,
  enviarEmailAprovacaoAgendamento,
  enviarEmailCancelamentoAgendamento,
  enviarEmailConfirmacaoAgendamento,
};
