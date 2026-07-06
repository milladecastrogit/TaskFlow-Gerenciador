# TaskFlow - Gerenciador de Tarefas Acadêmicas e Profissionais

![Badge de Status](https://img.shields.io/badge/status-MVP%20Acadêmico-blue)
![Badge Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)
![Badge Licença](https://img.shields.io/badge/licença-MIT-green)
![Badge Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple)
![Badge Auth](https://img.shields.io/badge/autenticação-bcrypt%20%2B%20session-orange)
![Badge Ícones](https://img.shields.io/badge/ícones-Bootstrap%20Icons%201.11-lightgrey)

**MVP Educacional: Sistema de gerenciamento de tarefas com autenticação de usuários, desenvolvido com Node.js, Express, Sequelize, Handlebars e Bootstrap. Código 100% comentado para fins didáticos.**

---

## Visão Geral

# Tela de Login
*Autenticação com email e senha criptografada (bcrypt). Fundo gradiente personalizado.*

# Página de Tarefas
*Cards organizados por categoria (Trabalho, Faculdade, Pessoal) com ações de CRUD.*

#Design Responsivo
*Interface adaptável para desktop, tablet e mobile graças ao sistema grid do Bootstrap.*

---

# Sobre o Projeto

O **TaskFlow** foi desenvolvido como material didático para apresentações acadêmicas de Desenvolvimento de Sistemas. O código é **100% comentado linha a linha**, explicando cada conceito e decisão técnica.

### Conceitos Abordados

| Conceito          | Onde Encontrar no Código                                       |
|-------------------|----------------------------------------------------------------|
| Arquitetura MVC   | Pastas `models/`, `views/`, `controllers/`                     |
| ORM Sequelize     | `findAll()`, `create()`, `update()`, `destroy()`, `findByPk()` |
| Autenticação      | `AuthController.js` com bcrypt e express-session               |
| Sessão de Usuário | Middleware de proteção de rotas no `app.js`                    |
| Criptografia      | Hook `beforeSave` com bcrypt no `models/Usuario.js`            |
| Template Engine   | Helpers `eq`, `default`, partials, layouts                     |
| Design Responsivo | Grid Bootstrap, breakpoints, cards                             |
| Feedback Visual   | Sistema de mensagens com query strings                         |

---

## Funcionalidades

### Sistema de Autenticação

| Funcionalidade    | Descrição                                | Status      |
|-------------------|------------------------------------------|-------------|
| Registro          | Criação de conta com nome, email e senha | Funcionando |
| Login             | Autenticação com verificação bcrypt      | Funcionando |
| Senhas Seguras    | Hash com salt de 10 rounds               | Funcionando |
| Sessão            | Usuário logado por 24 horas              | Funcionando |
| Logout            | Destruição segura da sessão              | Funcionando |
| Proteção de Rotas | Middleware bloqueia acesso sem login     | Funcionando |

### CRUD de Tarefas

| Operação     | Método | Rota                           | Status      |
|--------------|--------|--------------------------------|-------------|
| Criar        | POST   | `/salvar`                      | Funcionando |
| Listar Todas | GET    | `/`                            | Funcionando |
| Ver Detalhes | GET    | `/tarefa/:id`                  | Funcionando |
| Editar       | POST   | `/atualizar`                   | Funcionando |
| Excluir      | POST   | `/deletar/:id`                 | Funcionando |
| Categorizar  | -      | Trabalho / Faculdade / Pessoal | Funcionando |

---

## Stack Tecnológica

| Tecnologia             | Versão | Propósito                            |
|------------------------|--------|--------------------------------------|
| **Node.js**            | 18+    | Ambiente de execução JavaScript      |
| **Express**            | 4.18   | Framework web minimalista            |
| **Sequelize**          | 6.35   | ORM para abstração de banco de dados |
| **SQLite3**            | 5.1    | Banco de dados local (arquivo)       |
| **Express-Handlebars** | 7.1    | Template Engine para views dinâmicas |
| **Bootstrap**          | 5.3    | Framework CSS responsivo             |
| **Bootstrap Icons**    | 1.11   | Biblioteca de ícones SVG (gratuita)  |
| **bcryptjs**           | 2.4    | Criptografia de senhas               |
| **express-session**    | 1.17   | Gerenciamento de sessões             |

---

## Estrutura do Projeto (MVC)
taskflow-academico/
│
├── config/
│ └── database.js # Conexão Sequelize com SQLite
│
├── models/
│ ├── Tarefa.js # Modelo: id, titulo, descricao, categoria
│ └── Usuario.js # Modelo: id, nome, email, senha (bcrypt)
│
├── controllers/
│ ├── TarefaController.js # Lógica CRUD das tarefas
│ └── AuthController.js # Lógica de autenticação e sessão
│
├── views/
│ ├── layouts/
│ │ ├── main.handlebars # Layout com navbar (usuário logado)
│ │ └── auth.handlebars # Layout sem navbar (login/registro)
│ ├── partials/
│ │ └── mensagens.handlebars # Componente de feedback reutilizável
│ ├── login.handlebars # Tela de login
│ ├── registro.handlebars # Tela de criação de conta
│ ├── index.handlebars # Listagem de tarefas (página inicial)
│ ├── detalhes.handlebars # Visualização individual da tarefa
│ ├── cadastrar.handlebars # Formulário de nova tarefa
│ └── editar.handlebars # Formulário de edição de tarefa
│
├── public/
│ ├── css/
│ │ └── style.css # Estilos personalizados
│ └── img/
│ └── logo.png # Logo do TaskFlow
│
├── package.json # Metadados e dependências
├── app.js # Ponto de entrada (servidor + sessão + rotas)
└── README.md # Este arquivo

---

## Diagrama de Fluxo

┌─────────────────────────────────────────────────────────────────┐
│ FLUXO COMPLETO DO USUÁRIO                                       │
│                                                                 │
│ Acessa / ──→ (sem sessão) ──→ Redireciona /login                │
│              │                                                  │
│ ┌────────────┴────────────┐                                     │
│ │                         │                                     │
│ Tem conta?             Não tem                                  │
│ │                         │                                     │
│ ▼                         ▼                                     │
│ Faz login           Cria conta em                               │
│               (email + senha)/registro                          │
│ │ │ │
│ └─────────┬───────────────┘ │
│ │ │
│ ▼ │
│ Sessão criada ✅ │
│ │ │
│ ▼ │
│ Página Inicial (/) - Lista de Tarefas │
│ │ │
│ ┌──────────────┼──────────────┐ │
│ │ │ │ │
│ ▼ ▼ ▼ │
│ Criar Tarefa Ver/Editar Excluir │
│ /cadastrar /tarefa/:id /deletar/:id │
│ │ /editar/:id │ │
│ └──────────────┼──────────────┘ │
│ │ │
│ ▼ │
│ /logout │
│ (destrói sessão) │
│ │ │
│ ▼ │
│ Volta ao /login │
└─────────────────────────────────────────────────────────────────┘

---

## Modelos de Dados

### Tabela `usuarios`

| Coluna      | Tipo     | Restrições                 | Descrição           |
|-------------|----------|----------------------------|---------------------|
| `id`        | INTEGER  | PK, AUTO INCREMENT         | Identificador único |
| `nome`      | STRING   | NOT NULL, 2-100 caracteres | Nome completo       |
| `email`     | STRING   | NOT NULL, UNIQUE, isEmail  | Email para login    |
| `senha`     | STRING   | NOT NULL, hash bcrypt      | Senha criptografada |
| `createdAt` | DATETIME | Automático                 | Data de criação     |
| `updatedAt` | DATETIME | Automático                 | Data de atualização |

### Tabela `tarefas`

| Coluna      | Tipo    | Restrições         | Descrição                  |
|-------------|---------|--------------------|----------------------------|
| `id`        | INTEGER | PK, AUTO INCREMENT | Identificador único        |
| `titulo`    | STRING  | NOT NULL, notEmpty | Título da tarefa           |
| `descricao` | TEXT    | NULLABLE           | Detalhes opcionais         |
| `categoria` | STRING  | NOT NULL, isIn     | Trabalho/Faculdade/Pessoal |

---

## Sistema de Cores

| Categoria     | Classe Bootstrap        | Cor             | Significado                   |
|---------------|-------------------------|-----------------|-------------------------------|
| **Trabalho**  | `bg-warning text-dark`  | 🟡 Amarelo     | Atenção e profissionalismo    |
| **Faculdade** | `bg-info text-dark`     | 🔵 Azul Claro  | Conhecimento e estudo         |
| **Pessoal**   | `bg-success text-white` | 🟢 Verde       | Bem-estar e qualidade de vida |

---

## Como Executar Localmente

### Pré-requisitos

- **Node.js** versão 18 ou superior → [Download Oficial](https://nodejs.org/)
- **npm** (instalado junto com o Node.js)
- Navegador web moderno (Chrome, Firefox, Edge)
- Conexão com internet (para CDN do Bootstrap)

### Instalação (3 minutos)


# 1. Clone o repositório ou copie os arquivos para uma pasta
git clone https://github.com/seu-usuario/taskflow-academico.git

# 2. Acesse a pasta do projeto
cd taskflow-academico

# 3. Instale todas as dependências
npm install

# 4. Inicie o servidor
node app.js

# Acesso
Abra o navegador e acesse: http://localhost:3000

# Primeiro Acesso
Passo |	Ação	                           | Detalhe
----------------------------------------------------------
1	    | Acesse http://localhost:3000	   | Redirecionado para /login
2	    | em "Criar conta gratuita"        | Vai para /registro
3	    | Preencha Nome, Email e Senha	   | Senha: mínimo 6 caracteres
4	    | Clique em "Criar Conta"	         | Login automático!
5	    | Comece a gerenciar suas tarefas	 | CRUD completo liberado

# Testando o CRUD

Criar Tarefa
Clique em "Nova Tarefa"
1 - Preencha título, descrição e categoria
2 - Clique em "Salvar Tarefa"
3 - Feedback: "Tarefa criada com sucesso!"

Visualizar Detalhes
1 - Na lista, clique em "Detalhes"
2 - Veja a tarefa em tela cheia
3 - Opções: Voltar, Editar ou Excluir

Editar Tarefa
1 - Clique em "Editar" no card
2 - Altere os campos desejados
3 - Clique em "Atualizar Tarefa"

Excluir Tarefa
1 - Clique em "Excluir" no card
2 - Confirme na janela de diálogo
3 - Feedback: "Tarefa excluída permanentemente!"

# Personalização

Mudar para MySQL
1 - Instale o driver: npm install mysql2
2 - Altere config/database.js:
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'seu_usuario',
  password: 'sua_senha',
  database: 'taskflow',
  logging: false
});
3 - Crie o banco no MySQL: CREATE DATABASE taskflow;

# Adicionar Novas Categorias
No arquivo models/Tarefa.js, atualize a validação isIn e os <option> nos formulários cadastrar.handlebars e editar.handlebars.

# Problemas Comuns
Erro	                | Causa	                        | Solução
------------------------------------------------------------------------------------------------
EADDRINUSE :::3000	  | Porta 3000 em uso	            | Feche outros terminais ou altere a porta
MODULE_NOT_FOUND	    | Dependência não instalada	    | Execute npm install novamente
Erro ao criar conta	  | Email inválido ou senha curta	| Email válido + senha 6+ caracteres
Sessão expirou	      | 24 horas desde o login	      | Faça login novamente
Bootstrap não carrega	| Sem internet (CDN)	          | Verifique sua conexão

# Atribuições e Licenças
## Ícones
Bootstrap Icons - Licença MIT
Uso gratuito, sem necessidade de atribuição

## Logo
Imagem personalizada do projeto TaskFlow

## Código Fonte
Licença MIT - Livre para uso, modificação e distribuição

## Licença
MIT License

Copyright (c) 2026 TaskFlow Acadêmico

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...

# Informações Acadêmicas
Disciplina: Desenvolvimento de Sistemas
Professor: Westn Melo
Desenvolvedores: Camila Paranhos, Juliana Viana, Simeon Gomes
Instituição: Serviço Nacional de Aprendizagem Industrial - SENAI Camaçari
Ano: 2026

# Referências

Documentação Express: https://expressjs.com/pt-br/
Documentação Sequelize: https://sequelize.org/docs/v6/
Documentação Handlebars: https://handlebarsjs.com/guide/
Documentação Bootstrap 5: https://getbootstrap.com/docs/5.3/
Bootstrap Icons: https://icons.getbootstrap.com/
Documentação bcryptjs: https://www.npmjs.com/package/bcryptjs
Documentação express-session: https://www.npmjs.com/package/express-session


## Desenvolvido para fins educacionais






