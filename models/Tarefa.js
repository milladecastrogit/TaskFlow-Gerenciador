// ==============================================================================
// MODELO TAREFA - RESPONSÁVEL PELA TABELA DE TAREFAS NO BANCO DE DADOS
// ==============================================================================
// Este modelo define a estrutura da tabela 'tarefas' no banco de dados.
// Cada tarefa representa uma atividade a ser gerenciada pelo usuário,
// contendo título, descrição (opcional) e categoria.
//
// Diferente do modelo Usuario, aqui NÃO usamos timestamps (createdAt/updatedAt)
// para manter o exemplo mais simples e focado no CRUD básico.
// ==============================================================================

// Importa a instância de conexão com o banco de dados.
// É a MESMA conexão usada por todos os modelos (singleton).
const sequelize = require('../config/database');

// Importa do Sequelize:
// - DataTypes: Define os tipos de dados das colunas (INTEGER, STRING, TEXT)
// - Model: Classe base que dá ao nosso modelo métodos como findAll(), create(), etc.
const { DataTypes, Model } = require('sequelize');

// ==============================================================================
// DEFINIÇÃO DA CLASSE TAREFA
// ==============================================================================
// Nossa classe Tarefa estende (herda de) Model.
// Isso significa que Tarefa ganha automaticamente todos os métodos do Sequelize:
//
//   CREATE:  Tarefa.create({ titulo: '...', descricao: '...', categoria: '...' })
//   READ:    Tarefa.findAll()  ou  Tarefa.findByPk(id)
//   UPDATE:  tarefa.update({ titulo: 'Novo título' })
//   DELETE:  tarefa.destroy()
//
// Não adicionamos métodos personalizados aqui porque a lógica de negócio
// fica toda no TarefaController (seguindo o padrão MVC).
class Tarefa extends Model {}

// ==============================================================================
// INICIALIZAÇÃO DO MODELO (MAPEAMENTO PARA A TABELA 'tarefas')
// ==============================================================================
// Tarefa.init() configura como a classe JavaScript se relaciona com a tabela SQL.
// Recebe dois objetos:
//   1. Definição das colunas (atributos/campos)
//   2. Configurações do modelo (nome da tabela, timestamps, etc.)
// ==============================================================================

Tarefa.init(
  
  // ==========================================================================
  // PRIMEIRO OBJETO: DEFINIÇÃO DAS COLUNAS (ATRIBUTOS)
  // Cada chave aqui vira uma coluna na tabela 'tarefas' do banco de dados.
  // ==========================================================================
  {
    
    // COLUNA 'id': Identificador único de cada tarefa
    id: {
      type: DataTypes.INTEGER,       // Tipo: Número inteiro (1, 2, 3, 4...)
      primaryKey: true,              // Chave primária: identifica unicamente cada registro
                                     // Só pode existir UMA chave primária por tabela
      autoIncrement: true,           // O banco gera automaticamente: 1, 2, 3...
                                     // Não precisamos nos preocupar em definir o ID manualmente
      allowNull: false               // NOT NULL: este campo é obrigatório
    },
    
    // COLUNA 'titulo': Nome/título descritivo da tarefa
    titulo: {
      type: DataTypes.STRING,        // Tipo: Texto curto (VARCHAR, até 255 caracteres)
                                     // Ideal para títulos, nomes, identificadores curtos
      allowNull: false,              // Obrigatório: toda tarefa precisa de um título
      validate: {
        notEmpty: true               // Validação extra: não aceita string vazia ("")
                                     // Diferente de allowNull que só barra NULL,
                                     // notEmpty barra também strings vazias
      }
    },
    
    // COLUNA 'descricao': Detalhes e informações complementares da tarefa
    descricao: {
      type: DataTypes.TEXT,          // Tipo: Texto longo (sem limite de caracteres)
                                     // Diferente de STRING (255 caracteres), TEXT aceita textos enormes
                                     // Ideal para descrições, anotações, comentários
      allowNull: true                // OPCIONAL: uma tarefa pode não ter descrição
                                     // O usuário pode deixar este campo em branco
    },
    
    // COLUNA 'categoria': Classificação da tarefa (Trabalho, Faculdade ou Pessoal)
    categoria: {
      type: DataTypes.STRING,        // Tipo: Texto curto
      allowNull: false,              // Obrigatório: toda tarefa deve ter uma categoria
      validate: {
        // Validação 'isIn': Restringe os valores aceitos a uma lista específica
        // Isso garante que o usuário NÃO possa inventar categorias novas
        // sem antes atualizar o código e o banco de dados.
        isIn: {
          // args: Array com os valores permitidos
          args: [['Trabalho', 'Faculdade', 'Pessoal']],
          
          // msg: Mensagem de erro personalizada caso a validação falhe
          // Esta mensagem aparece nos logs e pode ser exibida ao usuário
          msg: "A categoria deve ser: Trabalho, Faculdade ou Pessoal."
          
          // Exemplos:
          //   'Trabalho'  → ACEITO ✅
          //   'Faculdade' → ACEITO ✅
          //   'Pessoal'   → ACEITO ✅
          //   'Lazer'     → REJEITADO ❌ (não está na lista)
          //   'trabalho'  → REJEITADO ❌ (minúscula, não corresponde exatamente)
        }
      }
    }
  },
  
  // ==========================================================================
  // SEGUNDO OBJETO: CONFIGURAÇÕES DO MODELO
  // ==========================================================================
  {
    sequelize,                       // Passa a conexão com o banco de dados
                                     // Essencial para o modelo saber onde se conectar
    
    modelName: 'Tarefa',             // Nome do modelo no código JavaScript
                                     // Usado internamente pelo Sequelize para associações
    
    tableName: 'tarefas',            // Nome REAL da tabela no banco de dados
                                     // Forçamos 'tarefas' (português) em vez do padrão
                                     // Se não definíssemos, o Sequelize tentaria 'Tarefas' ou 'Tarefa'
    
    timestamps: false                // NÃO cria colunas createdAt e updatedAt automaticamente
                                     // Mantemos false para simplificar o exemplo didático
                                     // Se fosse true, cada tarefa teria data de criação e atualização
  }
);

// Exporta a classe Tarefa para ser usada em outros arquivos.
//
// Principais usos:
//   - TarefaController: Para executar as operações CRUD
//   - app.js: Para que o Sequelize reconheça o modelo e crie a tabela
//
// Métodos herdados de Model que usamos no controller:
//   Tarefa.findAll()                  → Busca TODAS as tarefas (SELECT * FROM tarefas)
//   Tarefa.findByPk(id)               → Busca UMA tarefa pelo ID (SELECT * FROM tarefas WHERE id = ?)
//   Tarefa.create({...})              → Insere uma nova tarefa (INSERT INTO tarefas ...)
//   tarefa.update({...})              → Atualiza uma tarefa existente (UPDATE tarefas SET ...)
//   Tarefa.destroy({ where: { id } }) → Remove uma tarefa (DELETE FROM tarefas WHERE id = ?)
module.exports = Tarefa;