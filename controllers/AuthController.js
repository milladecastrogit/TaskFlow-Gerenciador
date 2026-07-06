// ==============================================================================
// AUTH CONTROLLER - LÓGICA DE AUTENTICAÇÃO (LOGIN, REGISTRO, LOGOUT)
// ==============================================================================
// Este controller é responsável por TODO o fluxo de autenticação do usuário.
// Ele contém as funções que:
//   - Exibem as telas de login e registro (GET)
//   - Processam o formulário de login (POST)
//   - Processam o formulário de registro/criação de conta (POST)
//   - Gerenciam a sessão do usuário (login mantém, logout destrói)
//   - Validam dados antes de salvar no banco
//
// Padrão MVC: O Controller é a camada que recebe as requisições,
// chama os Models para acessar o banco, e devolve as Views como resposta.
// ==============================================================================

// Importa o modelo Usuario para poder consultar e criar registros na tabela 'usuarios'.
// É através deste modelo que fazemos:
//   Usuario.findOne() → Buscar usuário por email (login)
//   Usuario.create()  → Criar novo usuário (registro)
const Usuario = require('../models/Usuario');

// ==============================================================================
// OBJETO AUTHCONTROLLER
// ==============================================================================
// Agrupamos todas as funções relacionadas à autenticação em um ÚNICO objeto.
// Isso é uma convenção do padrão MVC para manter o código organizado.
// Cada função (método) será associada a uma rota no app.js.
const AuthController = {

    // ==========================================================================
    // MOSTRAR TELA DE LOGIN
    // ==========================================================================
    // Rota associada: GET /login
    // 
    // Função:
    //   1. Verifica se o usuário já está logado (tem sessão ativa)
    //   2. Se sim, redireciona direto para a lista de tarefas
    //   3. Se não, exibe o formulário de login com possíveis mensagens de erro
    //
    // Parâmetros:
    //   req (request)  → Objeto com dados da requisição (sessão, query strings)
    //   res (response) → Objeto para enviar a resposta (renderizar view ou redirecionar)
    // ==========================================================================
    mostrarLogin(req, res) {
        // Verifica se existe uma sessão ativa para este usuário.
        // req.session.usuario foi criado no momento do login (ver função login abaixo).
        // Se existir, significa que o usuário já fez login e não precisa ver a tela novamente.
        if (req.session.usuario) {
            // Redireciona para a página inicial (lista de tarefas).
            // res.redirect() envia uma resposta HTTP 302 (Found) que faz o navegador
            // automaticamente navegar para a URL indicada.
            return res.redirect('/');
        }

        // Captura mensagens passadas via query string na URL.
        // Exemplo de URL: /login?msg_error=Email%20não%20encontrado
        // 
        // Query strings são parâmetros enviados na própria URL (após o símbolo '?').
        // São úteis para passar mensagens de feedback entre redirecionamentos.
        let mensagem = null;
        
        // Se existir msg_error na URL, cria uma mensagem do tipo 'danger' (vermelha).
        if (req.query.msg_error) {
            mensagem = { tipo: 'danger', texto: req.query.msg_error };
        } 
        // Se existir msg_success na URL, cria uma mensagem do tipo 'success' (verde).
        // Exemplo: após fazer logout, podemos redirecionar com uma mensagem de sucesso.
        else if (req.query.msg_success) {
            mensagem = { tipo: 'success', texto: req.query.msg_success };
        }

        // Renderiza a view 'login.handlebars' e envia os dados para ela.
        // 
        // Opções passadas para a view:
        //   layout: 'auth'    → Usa o layout auth.handlebars (sem navbar, fundo gradiente)
        //   mensagem          → Objeto com tipo e texto para o partial de mensagens
        //   tituloPagina      → Texto que aparece na aba do navegador
        res.render('login', {
            layout: 'auth',
            mensagem,
            tituloPagina: 'Entrar'
        });
    },

    // ==========================================================================
    // MOSTRAR TELA DE REGISTRO
    // ==========================================================================
    // Rota associada: GET /registro
    //
    // Função: Similar ao mostrarLogin, mas exibe o formulário de CRIAÇÃO DE CONTA.
    // Também verifica se o usuário já está logado para evitar acesso desnecessário.
    // ==========================================================================
    mostrarRegistro(req, res) {
        // Se já estiver logado, não faz sentido ficar na tela de registro.
        // Redireciona direto para a lista de tarefas.
        if (req.session.usuario) {
            return res.redirect('/');
        }

        // Captura mensagens de erro da query string.
        // Exemplo: /registro?msg_error=As%20senhas%20não%20conferem
        let mensagem = null;
        if (req.query.msg_error) {
            mensagem = { tipo: 'danger', texto: req.query.msg_error };
        }

        // Renderiza a view 'registro.handlebars'.
        res.render('registro', {
            layout: 'auth',           // Mesmo layout da tela de login
            mensagem,
            tituloPagina: 'Criar Conta'
        });
    },

    // ==========================================================================
    // PROCESSAR LOGIN (VERIFICAR CREDENCIAIS)
    // ==========================================================================
    // Rota associada: POST /login
    //
    // Função:
    //   1. Recebe email e senha do formulário
    //   2. Busca o usuário no banco pelo email
    //   3. Verifica se a senha está correta (usando bcrypt)
    //   4. Se tudo ok, cria a sessão e redireciona para as tarefas
    //   5. Se algo falhar, redireciona de volta ao login com mensagem de erro
    //
    // Por que é async?
    //   Porque usamos 'await' para esperar o banco de dados responder.
    //   Operações de banco são assíncronas (demoram um tempo para completar).
    // ==========================================================================
    async login(req, res) {
        try {
            // Desestruturação: extrai email e senha do corpo da requisição.
            // req.body contém os dados enviados pelo formulário HTML (method="post").
            // Isso funciona graças ao middleware express.urlencoded() configurado no app.js.
            const { email, senha } = req.body;

            // Busca no banco de dados UM usuário cujo email seja igual ao digitado.
            // 
            // Usuario.findOne(): Método do Sequelize que traduz para:
            //   SELECT * FROM usuarios WHERE email = ? LIMIT 1;
            //
            // where: { email } → É uma shorthand de where: { email: email }
            // Retorna NULL se nenhum usuário for encontrado.
            const usuario = await Usuario.findOne({ where: { email } });

            // Se o usuário NÃO foi encontrado (findOne retornou null)...
            // Significa que o email digitado não existe no banco de dados.
            if (!usuario) {
                // encodeURIComponent() converte a mensagem para um formato seguro de URL.
                // Exemplo: "Email não encontrado" → "Email%20não%20encontrado"
                // Isso evita que caracteres especiais quebrem a URL.
                const msg = encodeURIComponent('Email não encontrado. Verifique ou crie uma conta.');
                
                // Redireciona de volta ao login com a mensagem de erro na URL.
                // O mostrarLogin vai capturar essa query string e exibir na tela.
                return res.redirect(`/login?msg_error=${msg}`);
            }

            // Verifica se a senha digitada confere com o hash armazenado no banco.
            // 
            // usuario.verificarSenha() é o método personalizado que criamos no modelo Usuario.
            // Ele usa bcrypt.compare() para comparar a senha em texto puro com o hash.
            // 
            // IMPORTANTE: Em nenhum momento "descriptografamos" a senha.
            // O bcrypt aplica o mesmo algoritmo na senha digitada e compara os hashes.
            const senhaCorreta = await usuario.verificarSenha(senha);

            // Se a senha NÃO confere...
            if (!senhaCorreta) {
                const msg = encodeURIComponent('Senha incorreta. Tente novamente.');
                return res.redirect(`/login?msg_error=${msg}`);
            }

            // ==================================================================
            // LOGIN BEM-SUCEDIDO! 🎉
            // ==================================================================
            // Cria a sessão do usuário no servidor.
            // 
            // req.session é um objeto persistente fornecido pelo express-session.
            // Os dados salvos aqui ficam disponíveis em TODAS as requisições futuras
            // deste mesmo usuário (até a sessão expirar ou ele fazer logout).
            //
            // Por segurança, NÃO salvamos a senha na sessão.
            // Apenas id, nome e email são necessários para identificar o usuário.
            req.session.usuario = {
                id: usuario.id,         // ID no banco (útil para operações futuras)
                nome: usuario.nome,     // Nome para exibir na navbar
                email: usuario.email    // Email para referência
            };

            // Redireciona para a página principal (lista de tarefas)
            // com uma mensagem de boas-vindas personalizada.
            const msg = encodeURIComponent(`Bem-vindo(a), ${usuario.nome}! 🎉`);
            return res.redirect(`/?msg_success=${msg}`);

        } catch (error) {
            // Se ocorrer QUALQUER erro inesperado durante o processo...
            // Exemplos: banco de dados fora do ar, erro de conexão, etc.
            console.error('Erro ao fazer login:', error);
            const msg = encodeURIComponent('Erro interno ao processar login.');
            return res.redirect(`/login?msg_error=${msg}`);
        }
    },

    // ==========================================================================
    // PROCESSAR REGISTRO (CRIAÇÃO DE NOVA CONTA)
    // ==========================================================================
    // Rota associada: POST /registro
    //
    // Função:
    //   1. Recebe nome, email, senha e confirmação de senha do formulário
    //   2. Valida se as senhas conferem
    //   3. Valida se o email já não está cadastrado
    //   4. Cria o usuário no banco (senha é criptografada automaticamente)
    //   5. Já faz login automático após o cadastro
    // ==========================================================================
    async registro(req, res) {
        try {
            // Extrai todos os dados enviados pelo formulário de registro.
            // 
            // confirmarSenha: Campo extra no formulário para evitar erros de digitação.
            // Não é salvo no banco, apenas validamos se é igual à senha.
            const { nome, email, senha, confirmarSenha } = req.body;

            // ==================================================================
            // VALIDAÇÃO 1: As senhas digitadas conferem?
            // ==================================================================
            // Esta validação é feita no SERVIDOR, não apenas no frontend.
            // Isso é importante porque validações no navegador podem ser burladas.
            if (senha !== confirmarSenha) {
                const msg = encodeURIComponent('As senhas não conferem. Tente novamente.');
                return res.redirect(`/registro?msg_error=${msg}`);
            }

            // ==================================================================
            // VALIDAÇÃO 2: O email já está cadastrado?
            // ==================================================================
            // Verifica no banco se já existe alguém com este email.
            // O campo 'unique: true' no modelo já impede duplicidade no banco,
            // mas fazemos esta verificação extra para dar uma mensagem mais amigável.
            const usuarioExistente = await Usuario.findOne({ where: { email } });
            
            if (usuarioExistente) {
                const msg = encodeURIComponent('Este email já está cadastrado. Faça login ou use outro email.');
                return res.redirect(`/registro?msg_error=${msg}`);
            }

            // ==================================================================
            // CRIAÇÃO DO USUÁRIO NO BANCO
            // ==================================================================
            // Usuario.create() insere um novo registro na tabela 'usuarios'.
            // 
            // O hook 'beforeSave' que configuramos no modelo Usuario
            // será executado AUTOMATICAMENTE aqui, criptografando a senha
            // ANTES de salvar no banco. Não precisamos nos preocupar com isso.
            //
            // O objeto retornado (novoUsuario) contém os dados salvos,
            // incluindo o ID gerado automaticamente.
            const novoUsuario = await Usuario.create({ nome, email, senha });

            // Após criar a conta com sucesso, já fazemos LOGIN AUTOMÁTICO.
            // Isso melhora a experiência do usuário: ele não precisa
            // criar a conta e depois fazer login separadamente.
            req.session.usuario = {
                id: novoUsuario.id,
                nome: novoUsuario.nome,
                email: novoUsuario.email
            };

            // Redireciona para a página principal com mensagem de boas-vindas.
            const msg = encodeURIComponent(`Conta criada com sucesso! Bem-vindo(a), ${nome}! 🎉`);
            return res.redirect(`/?msg_success=${msg}`);

        } catch (error) {
            console.error('Erro ao registrar usuário:', error);

            // Captura erros de validação do Sequelize.
            // 
            // SequelizeValidationError ocorre quando as validações definidas
            // no modelo (notEmpty, len, isEmail, isIn) falham.
            // 
            // Exemplo: email em formato inválido, nome com menos de 2 caracteres.
            if (error.name === 'SequelizeValidationError') {
                // error.errors é um array de erros de validação.
                // Usamos map() para extrair apenas as mensagens de cada erro.
                // Depois join('. ') para unir todas em uma única string.
                const mensagens = error.errors.map(e => e.message).join('. ');
                const msg = encodeURIComponent(mensagens);
                return res.redirect(`/registro?msg_error=${msg}`);
            }

            // Para qualquer outro tipo de erro (ex: banco de dados fora do ar).
            const msg = encodeURIComponent('Erro interno ao criar conta.');
            return res.redirect(`/registro?msg_error=${msg}`);
        }
    },

    // ==========================================================================
    // LOGOUT (SAIR DA CONTA)
    // ==========================================================================
    // Rota associada: GET /logout
    //
    // Função:
    //   1. Destrói a sessão do usuário no servidor
    //   2. Remove o cookie de sessão do navegador
    //   3. Redireciona para a tela de login
    //
    // Após o logout, o usuário precisará fazer login novamente
    // para acessar qualquer página protegida.
    // ==========================================================================
    logout(req, res) {
        // req.session.destroy() remove TODOS os dados da sessão no servidor.
        // 
        // É uma função assíncrona que recebe um callback.
        // O parâmetro 'erro' será null se a destruição foi bem-sucedida,
        // ou conterá um objeto de erro se algo falhou.
        req.session.destroy((erro) => {
            if (erro) {
                // Se ocorrer um erro ao destruir a sessão (raro),
                // logamos no console e redirecionamos para a página inicial.
                console.error('Erro ao fazer logout:', erro);
                return res.redirect('/');
            }
            
            // res.clearCookie() remove o cookie de sessão do navegador.
            // 'connect.sid' é o nome padrão do cookie usado pelo express-session.
            // 
            // Isso garante que, mesmo que o navegador mantenha o cookie antigo,
            // ele não será mais válido (a sessão correspondente já foi destruída).
            res.clearCookie('connect.sid');
            
            // Redireciona para a tela de login.
            // O middleware de autenticação (app.js) vai permitir o acesso
            // porque /login está na lista de rotas públicas.
            res.redirect('/login');
        });
    }
};

// Exporta o objeto AuthController para ser usado no app.js.
// 
// No app.js, usamos assim:
//   const AuthController = require('./controllers/AuthController');
//   app.get('/login', AuthController.mostrarLogin);
//   app.post('/login', AuthController.login);
//   // ... etc
module.exports = AuthController;