const jwt = require("jsonwebtoken");
const AuthService = require("../services/authService");
const { refreshSecret } = require("../Config/jwtConfig");
const User = require("../models/userModel");
const { enviarEmailRecuperacaoSenha } = require("../utils/emailService");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

class AuthController {
  static async login(req, res) {
    const { email, senha } = req.body;
    try {
      const { token, refreshToken } = await AuthService.login(email, senha);
      res.json({ token, refreshToken });
    } catch (error) {
      res.status(error.status || 400).json({ message: error.message });
    }
  }

  static async registro(req, res) {
    const userData = req.body;

    try {
      const { token, refreshToken } = await AuthService.registro(userData);
      res.status(201).json({ token, refreshToken });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async refreshToken(req, res) {
    const { refreshToken } = req.body;

    try {
      const decoded = jwt.verify(refreshToken, refreshSecret);
      const user = await User.findUserById(decoded.id);

      if (!user) throw new Error("Usuário não encontrado");

      const newToken = AuthService.generateToken(user);
      res.json({ token: newToken });
    } catch (error) {
      res.status(400).json({ message: "Token inválido ou expirado" });
    }
  }

  // Função para solicitar recuperação de senha
  static async recuperarSenha(req, res) {
    const { email } = req.body;
    try {
      const user = await User.findUserByEmail(email.toLowerCase());
      if (!user) {
        return res.status(404).json({ message: "E-mail não encontrado." });
      }

      // Gerar token de redefinição
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = await bcrypt.hash(resetToken, 10);

      // Salvar token com validade no banco
      await User.savePasswordResetToken(user.CodigoUsuario, hashedToken);

      // Enviar e-mail com link de redefinição
      const resetLink = `${process.env.REACT_APP_FRONTEND_URL}/redefinir-senha?token=${resetToken}&id=${user.CodigoUsuario}`;
      await enviarEmailRecuperacaoSenha(user.Email, resetLink);

      res.status(200).json({ message: "E-mail de recuperação enviado." });
    } catch (error) {
      res.status(500).json({ message: "Erro ao processar a solicitação." });
    }
  }

  // Função para redefinir a senha
  static async redefinirSenha(req, res) {
    const { token, id, novaSenha } = req.body;

    try {
      const user = await User.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      const isTokenValid = await bcrypt.compare(token, user.ResetTokenHash);
      if (!isTokenValid) {
        return res.status(400).json({ message: "Token inválido ou expirado." });
      }

      const hashedPassword = await bcrypt.hash(novaSenha, 10);
      await User.updatePassword(user.CodigoUsuario, hashedPassword);

      res.status(200).json({ message: "Senha redefinida com sucesso." });
    } catch (error) {
      res.status(500).json({ message: "Erro ao redefinir a senha." });
    }
  }
}

module.exports = AuthController;
