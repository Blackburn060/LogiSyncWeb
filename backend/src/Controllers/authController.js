const jwt = require("jsonwebtoken");
const AuthService = require("../services/authService");
const { refreshSecret } = require("../Config/jwtConfig");
const User = require("../models/userModel");

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
}

module.exports = AuthController;
