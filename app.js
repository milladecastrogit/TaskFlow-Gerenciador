// ==============================================================================
// APP.JS - PONTO DE ENTRADA PRINCIPAL DO TASKFLOW
// ==============================================================================
// Este é o arquivo principal da aplicação. Ele é responsável por:
// 1. Importar e configurar todas as bibliotecas necessárias
// 2. Criar e configurar o servidor Express (que recebe e responde requisições)
// 3. Configurar o Template Engine Handlebars (que renderiza as páginas HTML)
// 4. Configurar a sessão de usuário (para manter o login ativo)
// 5. Aplicar middlewares de segurança e autenticação
// 6. Mapear todas as rotas da aplicação (URLs que o usuário pode acessar)
// 7. Sincronizar o banco de dados e iniciar o servidor
// ==============================================================================

// ==============================================================================
// 1. IMPORTAÇÃO DAS BIBLIOTECAS E MÓDULOS
// ==============================================================================
// Aqui importamos tudo que nossa aplicação precisa para funcionar.
// 'require()' é a forma do Node.js de carregar módulos/bibliotecas.

// Express: Framework web minimalista para Node.js.
// Ele facilita a criação de rotas, manipulação de requisições e respostas HTTP.
const express = require('express');

// Express-Handlebars: Template Engine que permite criar páginas HTML dinâmicas.
// Usamos a desestruturação { engine } para extrair apenas a função engine.
const { engine } = require('express-handlebars');

// Path: Módulo NATIVO do Node.js (não precisa instalar).
// Serve para manipular caminhos de arquivos e pastas de forma segura,
// independente do sistema operacional (Windows usa \ e Linux usa /).
const path = require('path');

// Express-Session: Middleware que gerencia sessões de usuário.
// Quando o usuário faz login, uma sessão é criada no servidor e um cookie
// é enviado ao navegador. Isso mantém o usuário "logado" entre as páginas.
const session = require('express-session');

// Importa a instância de conexão com o banco de dados configurada em config/database.js
// Essa instância é um objeto Sequelize que gerencia toda a comunicação com o SQLite.
const sequelize = require('./config/database');

// Importa os modelos (models) que definem a estrutura das tabelas no banco.
// Mesmo que não usemos diretamente aqui, eles precisam ser carregados para
// que o Sequelize saiba quais tabelas criar durante a sincronização.
const Tarefa = require('./models/Tarefa');
const Usuario = require('./models/Usuario');

// Importa os controllers que contêm a lógica de negócio.
// Cada controller agrupa funções relacionadas: um para tarefas, outro para autenticação.
const TarefaController = require('./controllers/TarefaController');
const AuthController = require('./controllers/AuthController');


// ==============================================================================
// 2. INICIALIZAÇÃO DO APLICATIVO EXPRESS
// ==============================================================================
// 'express()' cria uma nova aplicação Express.
// 'app' é o objeto central que usaremos para configurar tudo.
const app = express();

// Define a porta onde o servidor vai escutar.
// 'process.env.PORT' verifica se existe uma porta definida no ambiente (útil para deploy).
// Se não existir, usa a porta 3000 como padrão.
const PORTA = process.env.PORT || 3000;


// ==============================================================================
// 3. CONFIGURAÇÃO DO TEMPLATE ENGINE (HANDLEBARS)
// ==============================================================================
// O Template Engine permite criar páginas HTML com conteúdo dinâmico.
// Em vez de HTML puro, usamos arquivos .handlebars com expressões como {{titulo}}.

app.engine('handlebars', engine({
    // Helpers: Funções utilitárias que podem ser chamadas DENTRO das views (.handlebars).
    // Eles permitem fazer lógica simples nos templates, como comparações.
    helpers: {
        // Helper 'eq': Compara se dois valores são iguais (equal).
        // Uso na view: {{#if (eq categoria 'Trabalho')}}...{{/if}}
        // Exemplo: Se a categoria for 'Trabalho', mostra algo específico.
        eq: (a, b) => a === b,
        
        // Helper 'default': Retorna um valor padrão se o primeiro for vazio/falso.
        // Uso na view: {{default descricao 'Nenhuma descrição fornecida.'}}
        // Exemplo: Se a descrição estiver vazia, mostra o texto alternativo.
        default: (value, defaultValue) => value || defaultValue
    },
    
    // partialsDir: Define onde ficam os arquivos parciais (partials).
    // Partials são pedaços reutilizáveis de HTML, como o componente de mensagens.
    // '__dirname' é uma variável global do Node que contém o caminho absoluto da pasta atual.
    partialsDir: path.join(__dirname, 'views', 'partials')
}));

// Define o Handlebars como a engine de visualização padrão.
// Agora o Express sabe que arquivos .handlebars devem ser processados por ele.
app.set('view engine', 'handlebars');


// ==============================================================================
// 4. CONFIGURAÇÃO DA SESSÃO
// ==============================================================================
// Sessão é um mecanismo que permite identificar um usuário entre múltiplas requisições.
// Sem sessão, o servidor trataria cada requisição como se fosse de um novo usuário.
// Com sessão, após o login, o servidor "lembra" quem é o usuário.

app.use(session({
    // secret: Uma string secreta usada para assinar digitalmente o cookie da sessão.
    // Isso evita que alguém falsifique o cookie. Em produção, use algo mais complexo.
    secret: 'taskflow-segredo-super-secreto-2023',
    
    // resave: false = Não salva a sessão novamente se ela não foi modificada.
    // Evita gravações desnecessárias no armazenamento de sessões.
    resave: false,
    
    // saveUninitialized: false = Não cria sessão para usuários não autenticados.
    // Só cria sessão quando algo for realmente armazenado (ex: após login).
    saveUninitialized: false,
    
    // Configurações do cookie que será enviado ao navegador do usuário.
    cookie: {
        // maxAge: Tempo máximo de vida do cookie em milissegundos.
        // 24 horas * 60 minutos * 60 segundos * 1000 milissegundos = 86.400.000 ms.
        // Após esse tempo, o usuário precisará fazer login novamente.
        maxAge: 24 * 60 * 60 * 1000,
        
        // httpOnly: true = O cookie NÃO pode ser acessado por JavaScript no navegador.
        // Isso protege contra ataques XSS (Cross-Site Scripting).
        httpOnly: true
    }
}));


// ==============================================================================
// 5. MIDDLEWARES
// ==============================================================================
// Middlewares são funções que executam entre a requisição e a resposta.
// Eles processam/modificam a requisição antes de chegar na rota final.

// Middleware express.urlencoded():
// Analisa (parse) dados enviados por formulários HTML com método POST.
// O parâmetro 'extended: false' usa a biblioteca 'querystring' (mais simples).
// Sem este middleware, 'req.body' seria undefined.
app.use(express.urlencoded({ extended: false }));

// Middleware express.static():
// Serve arquivos estáticos (CSS, imagens, JavaScript do frontend) da pasta 'public'.
// Exemplo: o arquivo 'public/css/style.css' fica acessível em 'http://localhost:3000/css/style.css'.
app.use(express.static(path.join(__dirname, 'public')));

// Log informativo no console para confirmar o caminho dos arquivos estáticos.
console.log('📁 Servindo arquivos estáticos de: ' + path.join(__dirname, 'public'));


// ==============================================================================
// MIDDLEWARE DE AUTENTICAÇÃO (PROTEÇÃO DE ROTAS)
// ==============================================================================
// Este middleware é executado em TODAS as requisições.
// Ele verifica se o usuário está logado antes de permitir o acesso às páginas.
// Se não estiver logado, redireciona para a tela de login.

app.use((req, res, next) => {
    // Lista de rotas que NÃO precisam de autenticação (rotas públicas).
    // Qualquer pessoa pode acessar login, registro e arquivos estáticos.
    const rotasPublicas = ['/login', '/registro', '/css', '/js', '/img'];

    // 'some()' verifica se ALGUMA rota pública corresponde ao início do caminho atual.
    // Exemplo: req.path = '/css/style.css' começa com '/css' → é rota pública.
    const ehRotaPublica = rotasPublicas.some(rota => req.path.startsWith(rota));

    // Se for uma rota pública, permite o acesso imediatamente (chama next()).
    if (ehRotaPublica) {
        return next();
    }

    // Se NÃO for rota pública e o usuário NÃO estiver logado (sem sessão)...
    // Redireciona para a tela de login.
    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    // Se chegou aqui, o usuário ESTÁ logado.
    // Salva os dados do usuário em 'res.locals', que fica disponível em TODAS as views.
    // Assim, qualquer template .handlebars pode acessar {{usuario.nome}}.
    res.locals.usuario = req.session.usuario;

    // next() permite que a requisição continue para a rota solicitada.
    next();
});


// ==============================================================================
// 6. DEFINIÇÃO DAS ROTAS (MAPEAMENTO URL → FUNÇÃO DO CONTROLLER)
// ==============================================================================
// Aqui associamos cada URL (rota) a uma função específica do controller.
// Métodos HTTP usados:
//   GET    → Para buscar/exibir páginas (quando você digita uma URL ou clica em um link)
//   POST   → Para enviar dados ao servidor (quando você envia um formulário)

// ---------- ROTAS DE AUTENTICAÇÃO (PÚBLICAS - não precisam de login) ----------

// GET /login → Exibe a tela de login (formulário de email e senha)
app.get('/login', AuthController.mostrarLogin);

// POST /login → Processa o login (verifica email e senha no banco de dados)
app.post('/login', AuthController.login);

// GET /registro → Exibe a tela de criação de conta (formulário de registro)
app.get('/registro', AuthController.mostrarRegistro);

// POST /registro → Processa o registro (cria um novo usuário no banco)
app.post('/registro', AuthController.registro);

// GET /logout → Faz logout (destrói a sessão e redireciona para o login)
app.get('/logout', AuthController.logout);


// ---------- ROTAS DE TAREFAS (PROTEGIDAS - precisa estar logado) ----------
// Todas as rotas abaixo só são acessíveis após o login, graças ao middleware acima.

// CREATE - Passo 1: GET /cadastrar → Exibe o formulário vazio para criar uma nova tarefa
app.get('/cadastrar', TarefaController.mostrarFormCadastro);

// CREATE - Passo 2: POST /salvar → Recebe os dados do formulário e salva no banco
app.post('/salvar', TarefaController.salvarTarefa);

// READ - Todos: GET / → Página inicial que lista todas as tarefas do usuário
app.get('/', TarefaController.listarTarefas);

// READ - Individual: GET /tarefa/:id → Exibe os detalhes de uma tarefa específica
// ':id' é um parâmetro dinâmico na URL (ex: /tarefa/1, /tarefa/2)
app.get('/tarefa/:id', TarefaController.detalhesTarefa);

// UPDATE - Passo 1: GET /editar/:id → Exibe o formulário preenchido com os dados atuais da tarefa
app.get('/editar/:id', TarefaController.mostrarFormEdicao);

// UPDATE - Passo 2: POST /atualizar → Recebe os dados editados e atualiza no banco
app.post('/atualizar', TarefaController.atualizarTarefa);

// DELETE: POST /deletar/:id → Remove permanentemente uma tarefa do banco de dados
app.post('/deletar/:id', TarefaController.deletarTarefa);


// ==============================================================================
// 7. SINCRONIZAÇÃO DO BANCO DE DADOS E INICIALIZAÇÃO DO SERVIDOR
// ==============================================================================
// sequelize.sync(): Compara os modelos definidos (Tarefa, Usuario) com o banco.
// Se as tabelas não existirem, ele as CRIA automaticamente.
// Se já existirem, não altera nada (não apaga dados existentes).

sequelize.sync().then(() => {
    // Sincronização bem-sucedida: as tabelas estão prontas para uso.
    console.log('✅ Banco de dados SQLite sincronizado e pronto para uso.');
    console.log('   Tabelas criadas: tarefas, usuarios');

    // Inicia o servidor Express na porta definida.
    // 'app.listen()' faz o servidor "escutar" requisições HTTP.
    app.listen(PORTA, () => {
        // Callback executada quando o servidor estiver pronto.
        console.log(`🚀 Servidor rodando na porta ${PORTA}.`);
        console.log(`   Acesse: http://localhost:${PORTA}`);
        console.log(`   Faça login em: http://localhost:${PORTA}/login`);
    });
}).catch(erro => {
    // Se houver erro na sincronização (ex: arquivo SQLite corrompido ou sem permissão).
    console.error('❌ Erro fatal ao sincronizar o banco de dados:', erro);
});