// ==============================================================================
// MODELO USUARIO - RESPONSÁVEL PELA TABELA DE USUÁRIOS NO BANCO DE DADOS
// ==============================================================================
// Este modelo define a estrutura da tabela 'usuarios' no banco de dados.
// Cada propriedade aqui vira uma coluna na tabela.
// 
// O modelo também contém a lógica de segurança das senhas:
// - Antes de salvar, a senha é criptografada com bcrypt (hash)
// - Para verificar, comparamos a senha digitada com o hash armazenado
//
// Isso significa que NUNCA salvamos a senha real do usuário no banco.
// Mesmo que alguém acesse o banco de dados, não conseguirá ler as senhas.
// ==============================================================================

// Importa a instância de conexão com o banco de dados.
// Essa conexão foi configurada em config/database.js e é compartilhada por todos os modelos.
const sequelize = require('../config/database');

// Importa do Sequelize:
// - DataTypes: Define os tipos de dados das colunas (STRING, INTEGER, TEXT, etc.)
// - Model: Classe base que nosso modelo estende para herdar métodos como create(), findAll(), etc.
const { DataTypes, Model } = require('sequelize');

// bcryptjs: Biblioteca para criptografia de senhas.
// Diferente de simplesmente codificar (base64), bcrypt gera um hash irreversível.
// 
// Como funciona o bcrypt:
// 1. Recebe a senha em texto puro: "minhaSenha123"
// 2. Gera um "salt" (uma string aleatória) com 10 rounds de complexidade
// 3. Combina senha + salt e gera um hash: "$2a$10$X7vG...c8aG..." (60 caracteres)
// 4. Esse hash é o que salvamos no banco
// 5. Para verificar, o bcrypt aplica o mesmo processo e compara os hashes
const bcrypt = require('bcryptjs');

// ==============================================================================
// DEFINIÇÃO DA CLASSE USUARIO
// ==============================================================================
// Nossa classe estende (herda de) Model.
// Isso significa que Usuario ganha automaticamente métodos como:
//   Usuario.create()  → Insere um novo registro
//   Usuario.findAll() → Busca todos os registros
//   Usuario.findByPk() → Busca por chave primária (ID)
//   usuario.save()    → Salva alterações
//   usuario.destroy() → Remove o registro
class Usuario extends Model {
    
    // ==========================================================================
    // MÉTODO PERSONALIZADO: verificarSenha()
    // ==========================================================================
    // Este método compara uma senha em texto puro (digitada no formulário)
    // com o hash armazenado no banco de dados.
    //
    // Parâmetro:
    //   senha (string): A senha digitada pelo usuário no login
    //
    // Retorno:
    //   true  → Senha correta (login permitido)
    //   false → Senha incorreta (login negado)
    //
    // Exemplo de uso no AuthController:
    //   const usuario = await Usuario.findOne({ where: { email } });
    //   const senhaOk = await usuario.verificarSenha('senhaDigitada');
    // ==========================================================================
    verificarSenha(senha) {
        // bcrypt.compare() é um método ASSÍNCRONO (retorna uma Promise).
        // Ele aplica o mesmo algoritmo de hash na senha fornecida e compara
        // com o hash armazenado em this.senha.
        //
        // 'this.senha' se refere ao campo 'senha' do registro atual do banco,
        // que já está armazenado como hash (ex: "$2a$10$X7vG...c8aG...").
        return bcrypt.compare(senha, this.senha);
    }
}

// ==============================================================================
// INICIALIZAÇÃO DO MODELO (MAPEAMENTO PARA A TABELA FÍSICA)
// ==============================================================================
// Usuario.init() configura o mapeamento entre a classe JavaScript e a tabela SQL.
// Recebe dois objetos como parâmetro:
//   1. Definição das colunas (atributos)
//   2. Configurações adicionais (nome da tabela, hooks, etc.)
// ==============================================================================

Usuario.init(
    // ==========================================================================
    // PRIMEIRO OBJETO: DEFINIÇÃO DAS COLUNAS (ATRIBUTOS)
    // Cada chave aqui representa uma coluna na tabela 'usuarios'.
    // ==========================================================================
    {
        // COLUNA 'id': Identificador único de cada usuário
        id: {
            type: DataTypes.INTEGER,       // Tipo: Número inteiro (ex: 1, 2, 3...)
            primaryKey: true,              // É a chave primária da tabela (identifica unicamente cada registro)
            autoIncrement: true,           // O banco de dados gera automaticamente o próximo número
            allowNull: false               // NÃO pode ser nulo/vazio (obrigatório)
        },
        
        // COLUNA 'nome': Nome completo do usuário
        nome: {
            type: DataTypes.STRING,        // Tipo: Texto curto (VARCHAR de até 255 caracteres)
            allowNull: false,              // Obrigatório - todo usuário precisa ter nome
            validate: {
                notEmpty: true,            // Validação: não pode ser uma string vazia ("")
                len: [2, 100]              // Validação: mínimo 2, máximo 100 caracteres
                                           // Ex: "A" seria rejeitado, "Ana" seria aceito
            }
        },
        
        // COLUNA 'email': Email usado para login (também serve como identificador único)
        email: {
            type: DataTypes.STRING,        // Tipo: Texto curto
            allowNull: false,              // Obrigatório
            unique: true,                  // UNIQUE: Não pode haver dois usuários com o mesmo email
                                           // O Sequelize cria automaticamente um índice único no banco
            validate: {
                isEmail: true              // Validação: Verifica se o formato é de email válido
                                           // Ex: "joao@email.com" → OK | "joaoemail" → ERRO
            }
        },
        
        // COLUNA 'senha': Senha do usuário (armazenada como HASH, nunca em texto puro)
        senha: {
            type: DataTypes.STRING,        // Tipo: Texto (o hash bcrypt tem cerca de 60 caracteres)
            allowNull: false,              // Obrigatório
            validate: {
                len: [6, 100]              // Validação: mínimo 6 caracteres ANTES da criptografia
                                           // Isso garante que o usuário não use senhas muito curtas
            }
        }
    },
    
    // ==========================================================================
    // SEGUNDO OBJETO: CONFIGURAÇÕES DO MODELO
    // ==========================================================================
    {
        sequelize,                         // Passa a instância de conexão com o banco de dados
                                           // Necessário para o modelo saber ONDE se conectar
        
        modelName: 'Usuario',              // Nome do modelo no código JavaScript
                                           // O Sequelize usa isso internamente para associações
        
        tableName: 'usuarios',             // Nome REAL da tabela no banco de dados
                                           // Sem isso, o Sequelize pluralizaria automaticamente (Users)
        
        timestamps: true,                  // Cria automaticamente as colunas:
                                           //   createdAt → Data/hora de criação do registro
                                           //   updatedAt → Data/hora da última atualização
        
        // ======================================================================
        // HOOKS (GATILHOS): Funções que executam automaticamente em momentos específicos
        // ======================================================================
        // Hooks permitem executar código antes ou depois de operações no banco.
        // São como "eventos" do ciclo de vida do modelo.
        // 
        // Hooks disponíveis: beforeCreate, afterCreate, beforeUpdate, afterUpdate,
        //                    beforeSave, afterSave, beforeDestroy, afterDestroy, etc.
        // ======================================================================
        hooks: {
            
            // beforeSave: Executa ANTES de qualquer operação de salvamento.
            // Dispara tanto na CRIAÇÃO (create) quanto na ATUALIZAÇÃO (update).
            // 
            // Objetivo aqui: Criptografar a senha antes de salvar no banco.
            // Assim, mesmo que alguém acesse o banco diretamente, verá apenas o hash.
            beforeSave: async (usuario) => {
                
                // usuario.changed('senha'): Verifica se o campo 'senha' foi modificado.
                // 
                // Retorna true quando:
                //   - É um NOVO usuário sendo criado (a senha é "nova")
                //   - É uma ATUALIZAÇÃO onde a senha foi alterada
                //
                // Retorna false quando:
                //   - É uma atualização mas a senha NÃO mudou (ex: só mudou o nome)
                // 
                // Isso evita criptografar novamente uma senha que já está como hash.
                if (usuario.changed('senha')) {
                    
                    // Gera um "salt" (sal) para a criptografia.
                    // Salt é uma string aleatória adicionada à senha antes do hash.
                    // 
                    // O número 10 define os "rounds" (rodadas) de complexidade:
                    //   - 10 rounds = 2^10 = 1024 iterações do algoritmo
                    //   - Quanto maior, mais seguro, porém mais lento
                    //   - 10 é o valor padrão recomendado (bom equilíbrio segurança/velocidade)
                    const salt = await bcrypt.genSalt(10);
                    
                    // Gera o hash da senha usando o salt.
                    // Exemplo de resultado: "$2a$10$X7vG3pQ8mN9kL5jR2tY6uO...c8aG"
                    // 
                    // Este hash é IRREVERSÍVEL: não há como "descriptografar" e obter a senha original.
                    // A verificação é feita aplicando o mesmo algoritmo e comparando os resultados.
                    usuario.senha = await bcrypt.hash(usuario.senha, salt);
                    
                    // Agora usuario.senha contém o hash, não mais o texto puro.
                    // É ESSE valor que será salvo no banco de dados.
                }
            }
        }
    }
);

// Exporta a classe Usuario para ser usada em outros arquivos.
// 
// Principais usos:
//   - AuthController: Para criar usuários e verificar senhas no login
//   - app.js: Para que o Sequelize saiba que este modelo existe (sync)
//
// Métodos herdados de Model (exemplos):
//   Usuario.create({ nome, email, senha })     → Insere novo usuário
//   Usuario.findOne({ where: { email } })      → Busca por email
//   Usuario.findByPk(1)                        → Busca pelo ID
//   usuario.update({ nome: 'Novo Nome' })      → Atualiza dados
//   usuario.destroy()                          → Remove usuário
module.exports = Usuario;