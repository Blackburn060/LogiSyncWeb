const produtoModel = require('../../../src/models/produtoModel');
const db = require('../../../src/Config/database');
const moment = require('moment-timezone');

// Mock do db
jest.mock('../../../src/Config/database');

describe('ProdutoModel', () => {

  // Teste para getAllProdutos
  describe('getAllProdutos', () => {
    it('deve retornar todos os produtos com filtros aplicados', async () => {
      const filters = { Categoria: 'Alimentos' };
      const produtosMock = [
        { CodigoProduto: 1, DescricaoProduto: 'Produto 1', Categoria: 'Alimentos' },
        { CodigoProduto: 2, DescricaoProduto: 'Produto 2', Categoria: 'Alimentos' }
      ];
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, produtosMock);
      });

      const result = await produtoModel.getAllProdutos(filters);
      expect(db.all).toHaveBeenCalledWith(expect.any(String), [filters.Categoria], expect.any(Function));
      expect(result).toEqual(produtosMock);
    });

    it('deve lançar erro ao buscar todos os produtos', async () => {
      const filters = { Categoria: 'Alimentos' };
      db.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar produtos'), null);
      });

      await expect(produtoModel.getAllProdutos(filters)).rejects.toThrow('Erro ao buscar produtos');
    });
  });

  // Teste para addProduto
  describe('addProduto', () => {
    it('deve adicionar um novo produto e retornar o ID gerado', async () => {
      const produtoData = {
        DescricaoProduto: 'Novo Produto',
        Categoria: 'Alimentos',
        SituacaoProduto: 1,
        UsuarioAlteracao: 'admin'
      };
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.lastID = 1;  // Simulando o ID gerado
      });

      const result = await produtoModel.addProduto(produtoData);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar adicionar um novo produto', async () => {
      const produtoData = {
        DescricaoProduto: 'Novo Produto',
        Categoria: 'Alimentos',
        SituacaoProduto: 1,
        UsuarioAlteracao: 'admin'
      };
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao adicionar produto'));
      });

      await expect(produtoModel.addProduto(produtoData)).rejects.toThrow('Erro ao adicionar produto');
    });
  });

  // Teste para getProdutoById
  describe('getProdutoById', () => {
    it('deve retornar o produto pelo ID', async () => {
      const produtoMock = { CodigoProduto: 1, DescricaoProduto: 'Produto 1', Categoria: 'Alimentos' };
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, produtoMock);
      });

      const result = await produtoModel.getProdutoById(1);
      expect(db.get).toHaveBeenCalledWith(expect.any(String), [1], expect.any(Function));
      expect(result).toEqual(produtoMock);
    });

    it('deve lançar erro ao buscar produto pelo ID', async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar produto'), null);
      });

      await expect(produtoModel.getProdutoById(1)).rejects.toThrow('Erro ao buscar produto');
    });
  });

  // Teste para updateProduto
  describe('updateProduto', () => {
    it('deve atualizar um produto com sucesso', async () => {
      const produtoUpdate = { DescricaoProduto: 'Produto Atualizado', Categoria: 'Bebidas', UsuarioAlteracao: 'admin' };
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.changes = 1;  // Simulando sucesso na atualização
      });

      const result = await produtoModel.updateProduto(produtoUpdate, 1);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar atualizar um produto', async () => {
      const produtoUpdate = { DescricaoProduto: 'Produto Atualizado', Categoria: 'Bebidas', UsuarioAlteracao: 'admin' };
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao atualizar produto'));
      });

      await expect(produtoModel.updateProduto(produtoUpdate, 1)).rejects.toThrow('Erro ao atualizar produto');
    });

    it('deve lançar erro se não houver campos para atualizar', async () => {
      await expect(produtoModel.updateProduto({}, 1)).rejects.toThrow('No fields to update');
    });
  });

  // Teste para deleteProduto
  describe('deleteProduto', () => {
    it('deve realizar soft delete em um produto com sucesso', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.changes = 1;  // Simulando sucesso na exclusão
      });

      const result = await produtoModel.deleteProduto(1, 'admin');
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar realizar soft delete em um produto', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao deletar produto'));
      });

      await expect(produtoModel.deleteProduto(1, 'admin')).rejects.toThrow('Erro ao deletar produto');
    });
  });
});
