const produtoController = require('../../../src/Controllers/produtoController');
const produtoModel = require('../../../src/models/produtoModel');

// Mock do produtoModel
jest.mock('../../../src/models/produtoModel');

describe('ProdutoController', () => {
  // Teste para a função listarProdutos
  describe('listarProdutos', () => {
    it('deve retornar uma lista de produtos com sucesso', async () => {
      const req = { query: {} };
      const res = { json: jest.fn() };
      const produtosMock = [{ id: 1, nome: 'Produto 1' }, { id: 2, nome: 'Produto 2' }];

      produtoModel.getAllProdutos.mockResolvedValue(produtosMock);

      await produtoController.listarProdutos(req, res);

      expect(produtoModel.getAllProdutos).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith(produtosMock);
    });

    it('deve retornar erro 500 se ocorrer um erro ao buscar produtos', async () => {
      const req = { query: {} };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro ao buscar produtos');

      produtoModel.getAllProdutos.mockRejectedValue(errorMock);

      await produtoController.listarProdutos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao buscar produtos: ${errorMock.message}` });
    });
  });

  // Teste para a função adicionarProduto
  describe('adicionarProduto', () => {
    it('deve adicionar um novo produto e retornar o ID gerado', async () => {
      const req = { body: { nome: 'Novo Produto', descricao: 'Descrição do produto' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const idMock = 1;

      produtoModel.addProduto.mockResolvedValue(idMock);

      await produtoController.adicionarProduto(req, res);

      expect(produtoModel.addProduto).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({ id: idMock, message: 'Produto adicionado com sucesso' });
    });

    it('deve retornar erro 500 se ocorrer um erro ao adicionar produto', async () => {
      const req = { body: { nome: 'Novo Produto', descricao: 'Descrição do produto' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro ao adicionar produto');

      produtoModel.addProduto.mockRejectedValue(errorMock);

      await produtoController.adicionarProduto(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao adicionar produto: ${errorMock.message}` });
    });
  });

  // Teste para a função getProdutoById
  describe('getProdutoById', () => {
    it('deve retornar um produto pelo ID com sucesso', async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn() };
      const produtoMock = { id: 1, nome: 'Produto 1', descricao: 'Descrição do produto' };

      produtoModel.getProdutoById.mockResolvedValue(produtoMock);

      await produtoController.getProdutoById(req, res);

      expect(produtoModel.getProdutoById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(produtoMock);
    });

    it('deve retornar erro 404 se o produto não for encontrado', async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      produtoModel.getProdutoById.mockResolvedValue(null);

      await produtoController.getProdutoById(req, res);

      expect(produtoModel.getProdutoById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Produto não encontrado.' });
    });

    it('deve retornar erro 500 se ocorrer um erro ao buscar o produto', async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro ao buscar produto');

      produtoModel.getProdutoById.mockRejectedValue(errorMock);

      await produtoController.getProdutoById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao buscar produto: ${errorMock.message}` });
    });
  });

  // Teste para a função atualizarProduto
  describe('atualizarProduto', () => {
    it('deve atualizar um produto com sucesso', async () => {
      const req = { params: { id: 1 }, body: { nome: 'Produto Atualizado', descricao: 'Nova descrição' } };
      const res = { send: jest.fn() };
      const changesMock = 1;

      produtoModel.updateProduto.mockResolvedValue(changesMock);

      await produtoController.atualizarProduto(req, res);

      expect(produtoModel.updateProduto).toHaveBeenCalledWith(req.body, 1);
      expect(res.send).toHaveBeenCalledWith({ message: 'Produto atualizado com sucesso' });
    });

    it('deve retornar erro 404 se o produto não for encontrado para atualização', async () => {
      const req = { params: { id: 1 }, body: { nome: 'Produto Atualizado', descricao: 'Nova descrição' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const changesMock = 0;

      produtoModel.updateProduto.mockResolvedValue(changesMock);

      await produtoController.atualizarProduto(req, res);

      expect(produtoModel.updateProduto).toHaveBeenCalledWith(req.body, 1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Produto não encontrado' });
    });

    it('deve retornar erro 500 se ocorrer um erro ao atualizar o produto', async () => {
      const req = { params: { id: 1 }, body: { nome: 'Produto Atualizado', descricao: 'Nova descrição' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro ao atualizar produto');

      produtoModel.updateProduto.mockRejectedValue(errorMock);

      await produtoController.atualizarProduto(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao atualizar produto: ${errorMock.message}` });
    });
  });

  // Teste para a função deletarProduto
  describe('deletarProduto', () => {
    it('deve inativar um produto com sucesso', async () => {
      const req = { params: { id: 1 } };
      const res = { send: jest.fn() };
      const changesMock = 1;

      produtoModel.deleteProduto.mockResolvedValue(changesMock);

      await produtoController.deletarProduto(req, res);

      expect(produtoModel.deleteProduto).toHaveBeenCalledWith(1);
      expect(res.send).toHaveBeenCalledWith({ message: 'Produto inativado com sucesso' });
    });

    it('deve retornar erro 404 se o produto não for encontrado para exclusão', async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const changesMock = 0;

      produtoModel.deleteProduto.mockResolvedValue(changesMock);

      await produtoController.deletarProduto(req, res);

      expect(produtoModel.deleteProduto).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Produto não encontrado' });
    });

    it('deve retornar erro 500 se ocorrer um erro ao deletar o produto', async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro ao inativar produto');

      produtoModel.deleteProduto.mockRejectedValue(errorMock);

      await produtoController.deletarProduto(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao inativar produto: ${errorMock.message}` });
    });
  });
});
