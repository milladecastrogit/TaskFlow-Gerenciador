// ==============================================================================
// CONFIGURAÇÃO DO BANCO DE DADOS - CONEXÃO COM SEQUELIZE
// ==============================================================================
// Este arquivo é responsável por criar e configurar a conexão com o banco de dados.
// O Sequelize é um ORM (Object-Relational Mapping) que permite escrever código
// JavaScript em vez de SQL puro para manipular o banco de dados.
// 
// Tradução: Em vez de escrever "SELECT * FROM tarefas", escrevemos "Tarefa.findAll()".
// O Sequelize converte automaticamente para o SQL do banco que estamos usando.
// ==============================================================================

// Importa a classe Sequelize da biblioteca 'sequelize'.
// A desestruturação { Sequelize } extrai apenas a classe principal do pacote.
const { Sequelize } = require('sequelize');

// Cria uma nova instância do Sequelize, que representa a conexão ativa com o banco.
// É como abrir uma porta de comunicação entre nosso código e o arquivo SQLite.
const sequelize = new Sequelize({
    
    // dialect: Define qual tipo de banco de dados estamos usando.
    // 'sqlite' é um banco de dados leve que salva tudo em um único arquivo.
    // Não precisa instalar um servidor separado (como MySQL ou PostgreSQL).
    // Vantagens para desenvolvimento: simples, portátil, zero configuração.
    dialect: 'sqlite',
    
    // storage: Especifica o caminho do arquivo onde os dados serão armazenados.
    // './database.sqlite' significa: crie o arquivo na mesma pasta do projeto.
    // 
    // Alternativas:
    //   ':memory:' → Banco existe apenas enquanto o servidor roda (dados voláteis)
    //   './database.sqlite' → Arquivo físico (dados PERSISTEM após reiniciar)
    //
    // Usamos arquivo físico para que as tarefas e usuários não desapareçam
    // quando o servidor for reiniciado.
    storage: './database.sqlite',
    
    // logging: Controla se os comandos SQL gerados pelo Sequelize aparecem no console.
    // false = Não mostra nada (terminal mais limpo)
    // true = Mostra cada comando SQL executado (útil para debug)
    // console.log = Mostra usando a função console.log
    //
    // Exemplo do que seria exibido com logging: true:
    //   Executing: SELECT * FROM tarefas;
    //   Executing: INSERT INTO tarefas (titulo, descricao, categoria) VALUES (...);
    logging: false
    
    // ==========================================================================
    // SE QUISÉSSEMOS USAR MYSQL NO FUTURO, BASTA SUBSTITUIR A CONFIGURAÇÃO ACIMA:
    // ==========================================================================
    // dialect: 'mysql',
    // host: 'localhost',        // Endereço do servidor MySQL
    // port: 3306,               // Porta padrão do MySQL
    // username: 'root',         // Usuário do banco
    // password: 'minha_senha',  // Senha do banco
    // database: 'taskflow',     // Nome do banco de dados
    // logging: false
    //
    // Também seria necessário instalar o driver: npm install mysql2
    // ==========================================================================
});

// Exporta a instância configurada do Sequelize.
// 'module.exports' torna este objeto disponível para outros arquivos que derem require().
// Assim, models e app.js compartilham a MESMA conexão com o banco de dados.
module.exports = sequelize;