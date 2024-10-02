const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { enviarEmailBoasVindas } = require("../utils/emailService");

// Listar todos os usuários
const listarUsuarios = async (req, res) => {
  try {
    const filters = req.query;
    const usuarios = await userModel.getAllUsers(filters);
    res.json(usuarios);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Erro ao buscar usuários: " + error.message });
  }
};

// Listar um usuário pelo ID
const listarUsuario = async (req, res) => {
  try {
    const usuario = await userModel.getUserById(req.params.id);
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).send({ message: "Usuário não encontrado" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Erro ao buscar usuário: " + error.message });
  }
};

// Adicionar um usuário
const adicionarUsuario = async (req, res) => {
  const {
    NomeCompleto,
    Email,
    Senha,
    TipoUsuario,
    CodigoTransportadora,
    NumeroCelular,
    CPF,
  } = req.body;

  try {
    const existingUser = await userModel.findUserByEmail(Email.toLowerCase());
    if (existingUser) {
      return res.status(400).send({ message: "E-mail já está em uso." });
    }

    const hashedPassword = await bcrypt.hash(Senha, 10);
    const user = {
      nomeCompleto: NomeCompleto,
      email: Email.toLowerCase(),
      senha: hashedPassword,
      tipoUsuario: TipoUsuario,
      codigoTransportadora: CodigoTransportadora || 0,
      situacaoUsuario: 1,
      numeroCelular: NumeroCelular || null,
      cpf: CPF || null,
    };

    const userId = await userModel.addUser(user);

    // Enviar e-mail de boas-vindas com a senha temporária
    await enviarEmailBoasVindas(Email, Senha);

    res
      .status(201)
      .send({ id: userId, message: "Usuário adicionado com sucesso" });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Erro ao adicionar usuário: " + error.message });
  }
};

// Atualizar um usuário
const atualizarUsuario = async (req, res) => {
  const user = req.body;

  // Verifique se há campos para atualizar
  if (Object.keys(user).length === 0) {
    return res.status(400).send({ message: "Nenhum dado para atualizar" });
  }

  try {
    const changes = await userModel.updateUser(user, req.params.id);
    if (changes > 0) {
      res.send({ message: "Usuário atualizado com sucesso" });
    } else {
      res.status(400).send({ message: "Nenhuma alteração foi realizada" });
    }
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res
      .status(500)
      .send({ message: "Erro ao atualizar usuário: " + error.message });
  }
};

// Verificar se o e-mail já existe e retornar se a conta está ativa ou não
const verificarEmailExistente = async (req, res) => {
  const { email } = req.query;
  try {
    const user = await userModel.findUserByEmail(email.toLowerCase());
    if (user) {
      // Verifica se o usuário existe e se está ativo (SituacaoUsuario = 1)
      res.json({ exists: true, active: user.SituacaoUsuario === 1 });
    } else {
      res.json({ exists: false, active: false });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Erro ao verificar e-mail: " + error.message });
  }
};

// Deletar um usuário
const deletarUsuario = async (req, res) => {
  try {
    const changes = await userModel.deleteUser(req.params.id);
    if (changes) {
      res.send({ message: "Usuário deletado com sucesso" });
    } else {
      res.status(404).send({ message: "Usuário não encontrado" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Erro ao deletar usuário: " + error.message });
  }
};

// Adicionar um usuário sem autenticação
const adicionarUsuarioPublic = async (req, res) => {
  const { nomeCompleto, email, senha, tipoUsuario, numeroCelular, cpf } =
    req.body;

  try {
    const existingUser = await userModel.findUserByEmail(email.toLowerCase());
    if (existingUser) {
      return res.status(400).send({ message: "E-mail já está em uso." });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const user = {
      nomeCompleto: nomeCompleto,
      email: email.toLowerCase(),
      senha: hashedPassword,
      tipoUsuario: "motorista",
      situacaoUsuario: 1,
      numeroCelular: numeroCelular || null,
      cpf: cpf || null,
    };

    const userId = await userModel.addUser(user);
    res
      .status(201)
      .send({ id: userId, message: "Usuário registrado com sucesso" });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Erro ao registrar usuário: " + error.message });
  }
};

module.exports = {
  listarUsuarios,
  adicionarUsuario,
  listarUsuario,
  verificarEmailExistente,
  atualizarUsuario,
  deletarUsuario,
  adicionarUsuarioPublic,
};
