const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const {
  jwtSecret,
  jwtExpiration,
  refreshSecret,
  refreshExpiration,
} = require("../Config/jwtConfig");

class AuthService {
  static async login(email, senha) {
    const user = await User.findUserByEmail(email.toLowerCase());

    if (!user) {
      const error = new Error("Conta não encontrada com o e-mail informado");
      error.status = 404;
      throw error;
    }

    if (user.SituacaoUsuario !== 1) {
      const error = new Error("Conta inativa. Entre em contato com o suporte.");
      error.status = 403;
      throw error;
    }

    const senhaValida = await bcrypt.compare(senha, user.Senha);
    if (!senhaValida) {
      const error = new Error("Senha inválida");
      error.status = 401;
      throw error;
    }

    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { token, refreshToken };
  }

  static async registro(userData) {
    const { email, senha } = userData;

    const existingUser = await User.findUserByEmail(email.toLowerCase());
    if (existingUser) throw new Error("Usuário já existe");

    if (!senha) throw new Error("A senha é obrigatória");

    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = await User.addUser({ ...userData, Senha: hashedPassword });

    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { token, refreshToken };
  }

  static generateToken(user) {
    const payload = {
      id: user.CodigoUsuario,
      email: user.Email,
      nomecompleto: user.NomeCompleto,
      tipousuario: user.TipoUsuario,
      codigotransportadora: user.CodigoTransportadora,
      cpf: user.CPF,
      numerocelular: user.NumeroCelular,
    };

    return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiration });
  }

  static generateRefreshToken(user) {
    const payload = {
      id: user.CodigoUsuario,
      email: user.Email,
    };

    return jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiration });
  }

  static verifyToken(token) {
    return jwt.verify(token, jwtSecret);
  }

  static verifyRefreshToken(token) {
    return jwt.verify(token, refreshSecret);
  }
}

module.exports = AuthService;
