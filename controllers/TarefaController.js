// ==============================================================================
// TAREFA CONTROLLER - LÓGICA CRUD DAS TAREFAS
// ==============================================================================
// Este controller contém TODA a lógica de negócio relacionada às tarefas.
// Ele implementa as operações CRUD completas:
//   C - CREATE  (criar/salvar)
//   R - READ    (listar/visualizar)
//   U - UPDATE  (editar/atualizar)
//   D - DELETE  (excluir/remover)
//
// Cada função aqui é associada a uma rota no app.js e segue o fluxo:
//   1. Recebe os dados da requisição (req.params, req.body, req.query)
//   2. Interage com o banco de dados através do modelo Tarefa
//   3. Retorna uma resposta (renderiza view ou redireciona)
// ==============================================================================

// Importa o modelo Tarefa para interagir com a tabela 'tarefas' no banco.
// Através deste modelo fazemos todas as operações de banco:
//   Tarefa.findAll() → Buscar todas as tarefas
//   Tarefa.findByPk() → Buscar uma tarefa pelo ID
//   Tarefa.create()   → Criar nova tarefa
//   tarefa.update()   → Atualizar tarefa existente
//   tarefa.destroy()  → Remover tarefa
const Tarefa = require('../models/Tarefa');

// ==============================================================================
// OBJETO TAREFACONTROLLER
// ==============================================================================
// Agrupa todas as funções relacionadas ao gerenciamento de tarefas.
// Cada método será vinculado a uma rota específica no app.js.
const TarefaController = {
  
  // ==========================================================================
  // LISTAR TAREFAS (READ - Todos os registros)
  // ==========================================================================
  // Rota associada: GET /
  // 
  // Função:
  //   Busca TODAS as tarefas no banco de dados e as exibe na página inicial.
  //   Também captura mensagens de feedback (sucesso/erro) enviadas por outras
  //   operações (criar, editar, excluir) via query string na URL.
  //
  // Exemplo de URL com mensagem: /?msg_success=Tarefa%20criada%20com%20sucesso
  // ==========================================================================
  async listarTarefas(req, res) {
    try {
      // Tarefa.findAll() busca TODOS os registros da tabela 'tarefas'.
      // Tradução SQL: SELECT * FROM tarefas;
      //
      // Retorna um array de objetos Sequelize (instâncias do modelo).
      // Cada objeto contém os dados da tarefa + métodos do Sequelize.
      const tarefasRaw = await Tarefa.findAll();
      
      // IMPORTANTE: Convertemos cada tarefa para um objeto JavaScript puro.
      // 
      // Por que .toJSON()?
      //   O Handlebars (template engine) não consegue acessar propriedades
      //   de objetos Sequelize diretamente. Ele precisa de objetos JS puros.
      //
      // .map() percorre o array e aplica .toJSON() em cada elemento.
      // Resultado: array de objetos simples como { id: 1, titulo: "...", ... }
      const tarefas = tarefasRaw.map(t => t.toJSON());
      
      // Captura mensagens de feedback passadas via query string.
      // Estas mensagens vêm de outras operações que redirecionaram para cá.
      // 
      // Exemplos de quem envia mensagens para cá:
      //   - salvarTarefa()  → /?msg_success=Tarefa criada com sucesso!
      //   - deletarTarefa() → /?msg_success=Tarefa "X" excluída
      //   - atualizarTarefa() → /?msg_success=Tarefa atualizada
      let mensagem = null;
      
      // msg_success: Mensagem verde de sucesso
      if (req.query.msg_success) {
        mensagem = { tipo: 'success', texto: req.query.msg_success };
      } 
      // msg_error: Mensagem vermelha de erro
      else if (req.query.msg_error) {
        mensagem = { tipo: 'danger', texto: req.query.msg_error };
      } 
      // msg_warning: Mensagem amarela de alerta
      else if (req.query.msg_warning) {
        mensagem = { tipo: 'warning', texto: req.query.msg_warning };
      }
      
      // Renderiza a view 'index.handlebars' (página inicial com lista de tarefas).
      // 
      // Dados enviados para a view:
      //   tarefas → Array com todas as tarefas (para o #each)
      //   mensagem → Objeto de feedback (para o partial mensagens)
      //   tituloPagina → Texto que aparece na aba do navegador
      res.render('index', { 
        tarefas, 
        mensagem, 
        tituloPagina: 'Lista de Tarefas' 
      });
      
    } catch (error) {
      // Se ocorrer qualquer erro (ex: banco de dados corrompido)...
      console.error("Erro ao listar tarefas:", error);
      // Envia resposta HTTP 500 (Internal Server Error).
      res.status(500).send("Erro interno do servidor ao buscar tarefas.");
    }
  },

  // ==========================================================================
  // VER DETALHES DE UMA TAREFA (READ - Registro individual)
  // ==========================================================================
  // Rota associada: GET /tarefa/:id
  //
  // Função:
  //   Busca UMA tarefa específica pelo ID e exibe seus detalhes completos.
  //   O ID vem como parâmetro na URL (ex: /tarefa/3 → id = 3).
  // ==========================================================================
  async detalhesTarefa(req, res) {
    try {
      // req.params contém os parâmetros dinâmicos da URL.
      // Exemplo: URL = /tarefa/5 → req.params.id = "5"
      const { id } = req.params;
      
      // Tarefa.findByPk(id): Busca pela Primary Key (Chave Primária).
      // Tradução SQL: SELECT * FROM tarefas WHERE id = ? LIMIT 1;
      //
      // Retorna a tarefa encontrada ou NULL se não existir.
      const tarefa = await Tarefa.findByPk(id);
      
      // Se a tarefa NÃO foi encontrada (ID inválido ou foi excluída)...
      if (!tarefa) {
        // Retorna código HTTP 404 (Not Found) e renderiza a página inicial
        // com uma mensagem de erro explicativa.
        return res.status(404).render('index', {
          tarefas: [],        // Array vazio (sem tarefas para listar)
          mensagem: { 
            tipo: 'danger',   // Vermelho (erro)
            texto: `Tarefa com ID #${id} não encontrada. Ela pode ter sido excluída.` 
          },
          tituloPagina: 'Tarefa Não Encontrada'
        });
      }
      
      // Renderiza a view 'detalhes.handlebars' com os dados da tarefa.
      // .toJSON() converte para objeto JavaScript puro (exigência do Handlebars).
      res.render('detalhes', { 
        tarefa: tarefa.toJSON(), 
        tituloPagina: 'Detalhes da Tarefa' 
      });
      
    } catch (error) {
      console.error("Erro ao buscar detalhes da tarefa:", error);
      res.status(500).send("Erro interno do servidor.");
    }
  },

  // ==========================================================================
  // MOSTRAR FORMULÁRIO DE CADASTRO (CREATE - Passo 1: Exibir formulário)
  // ==========================================================================
  // Rota associada: GET /cadastrar
  //
  // Função:
  //   Exibe o formulário VAZIO para o usuário preencher com os dados da nova tarefa.
  //   Também captura mensagens de erro (ex: validação falhou ao salvar).
  // ==========================================================================
  mostrarFormCadastro(req, res) {
    // Captura mensagens de erro de tentativas anteriores de cadastro.
    // Exemplo: /cadastrar?msg_error=Erro%20ao%20salvar
    let mensagem = null;
    if (req.query.msg_error) {
      mensagem = { tipo: 'danger', texto: req.query.msg_error };
    }
    
    // Renderiza a view 'cadastrar.handlebars' (formulário em branco).
    // Não passamos 'tarefa' porque o formulário começa vazio.
    res.render('cadastrar', { 
      mensagem, 
      tituloPagina: 'Cadastrar Tarefa' 
    });
  },

  // ==========================================================================
  // SALVAR NOVA TAREFA (CREATE - Passo 2: Processar formulário)
  // ==========================================================================
  // Rota associada: POST /salvar
  //
  // Função:
  //   Recebe os dados do formulário de cadastro e cria um novo registro no banco.
  //   Em caso de sucesso, redireciona para a listagem com mensagem de sucesso.
  //   Em caso de erro, redireciona de volta ao formulário com mensagem de erro.
  // ==========================================================================
  async salvarTarefa(req, res) {
    try {
      // Extrai os dados enviados pelo formulário (req.body).
      // Os nomes 'titulo', 'descricao' e 'categoria' correspondem aos
      // atributos 'name' dos campos no formulário HTML.
      const { titulo, descricao, categoria } = req.body;      
  
      // Tarefa.create(): Insere um novo registro na tabela 'tarefas'.
      // Tradução SQL: INSERT INTO tarefas (titulo, descricao, categoria) VALUES (?, ?, ?);
      //
      // O Sequelize automaticamente valida os dados conforme as regras
      // definidas no modelo (notEmpty, isIn, etc.) antes de inserir.
      await Tarefa.create({ titulo, descricao, categoria });      
      
      // Se chegou aqui, a criação foi bem-sucedida!
      // 
      // encodeURIComponent() converte a mensagem para formato seguro de URL.
      // Caracteres especiais (espaços, acentos, emojis) são convertidos.
      // Exemplo: "Tarefa criada!" → "Tarefa%20criada!"
      const mensagem = encodeURIComponent('Tarefa criada com sucesso! ✅');
      
      // Padrão Post/Redirect/Get (PRG):
      // Após processar um POST, redirecionamos para uma rota GET.
      // Isso evita que o usuário reenvie o formulário ao atualizar a página (F5).
      res.redirect(`/?msg_success=${mensagem}`);
      
    } catch (error) {
      // Se algo deu errado (ex: validação falhou, título vazio, categoria inválida)...
      console.error("Erro ao salvar tarefa:", error);
      
      // Envia a mensagem de erro de volta para o formulário.
      // error.message contém a mensagem específica do erro.
      const mensagem = encodeURIComponent(
        `Erro ao salvar: ${error.message || 'Verifique os dados e tente novamente.'}`
      );
      res.redirect(`/cadastrar?msg_error=${mensagem}`);
    }
  },

  // ==========================================================================
  // MOSTRAR FORMULÁRIO DE EDIÇÃO (UPDATE - Passo 1: Exibir formulário)
  // ==========================================================================
  // Rota associada: GET /editar/:id
  //
  // Função:
  //   Busca a tarefa pelo ID e exibe o formulário PREENCHIDO com os dados atuais.
  //   O usuário pode modificar os campos e salvar as alterações.
  // ==========================================================================
  async mostrarFormEdicao(req, res) {
    try {
      // Captura o ID da tarefa a ser editada da URL.
      const { id } = req.params;
      
      // Busca a tarefa no banco pelo ID.
      const tarefa = await Tarefa.findByPk(id);
      
      // Se não encontrou (ID inválido), retorna erro 404.
      if (!tarefa) {
        return res.status(404).send("Tarefa não encontrada.");
      }
      
      // Captura mensagens de erro de tentativas anteriores de edição.
      let mensagem = null;
      if (req.query.msg_error) {
        mensagem = { tipo: 'danger', texto: req.query.msg_error };
      }
      
      // Renderiza a view 'editar.handlebars' com os dados atuais da tarefa.
      // .toJSON() é essencial para o Handlebars acessar as propriedades.
      res.render('editar', { 
        tarefa: tarefa.toJSON(),   // Dados atuais para preencher o formulário
        mensagem,                   // Possível mensagem de erro
        tituloPagina: 'Editar Tarefa' 
      });
      
    } catch (error) {
      console.error("Erro ao buscar tarefa para edição:", error);
      res.status(500).send("Erro interno do servidor.");
    }
  },

  // ==========================================================================
  // ATUALIZAR TAREFA (UPDATE - Passo 2: Processar formulário)
  // ==========================================================================
  // Rota associada: POST /atualizar
  //
  // Função:
  //   Recebe os dados editados do formulário e atualiza o registro no banco.
  //   O ID da tarefa vem em um campo oculto (hidden) no formulário.
  // ==========================================================================
  async atualizarTarefa(req, res) {
    try {
      // Extrai os dados do formulário de edição.
      // 'id' vem de um campo hidden: <input type="hidden" name="id" value="{{tarefa.id}}">
      const { id, titulo, descricao, categoria } = req.body;
      
      // Busca a tarefa no banco para garantir que ela ainda existe.
      const tarefa = await Tarefa.findByPk(id);
      
      // Se a tarefa foi excluída entre a exibição do formulário e o envio...
      if (!tarefa) {
        const mensagem = encodeURIComponent('Tarefa não encontrada para atualização.');
        return res.redirect(`/?msg_error=${mensagem}`);
      }
      
      // tarefa.update(): Atualiza os campos da tarefa no banco.
      // Tradução SQL: UPDATE tarefas SET titulo=?, descricao=?, categoria=? WHERE id=?;
      //
      // O Sequelize só atualiza os campos que foram passados no objeto.
      // As validações do modelo são executadas novamente.
      await tarefa.update({ titulo, descricao, categoria });
    
      // Redireciona para a listagem com mensagem de sucesso.
      const mensagem = encodeURIComponent('Tarefa atualizada com sucesso! ✏️');
      res.redirect(`/?msg_success=${mensagem}`);
      
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      
      // Em caso de erro, redireciona de volta ao formulário de edição.
      // Usamos o ID para montar a URL correta.
      const { id } = req.body;
      const mensagem = encodeURIComponent(
        `Erro ao atualizar: ${error.message || 'Verifique os dados.'}`
      );
      res.redirect(`/editar/${id}?msg_error=${mensagem}`);
    }
  },

  // ==========================================================================
  // DELETAR TAREFA (DELETE)
  // ==========================================================================
  // Rota associada: POST /deletar/:id
  //
  // Função:
  //   Remove PERMANENTEMENTE uma tarefa do banco de dados.
  //   Antes de excluir, busca a tarefa para confirmar que existe e obter o título.
  //   O título é usado na mensagem de feedback.
  //
  // Nota: Usamos POST em vez de GET/DELETE porque formulários HTML
  // só suportam GET e POST nativamente.
  // ==========================================================================
  async deletarTarefa(req, res) {
    try {
      // Captura o ID da tarefa a ser excluída da URL.
      const { id } = req.params;
      
      // Busca a tarefa ANTES de excluir para:
      //   1. Verificar se ela existe
      //   2. Obter o título para a mensagem de feedback
      const tarefa = await Tarefa.findByPk(id);
      
      // Se a tarefa não existe (já foi excluída ou ID inválido)...
      if (!tarefa) {
        const mensagem = encodeURIComponent('Tarefa não encontrada para exclusão.');
        return res.redirect(`/?msg_warning=${mensagem}`);
      }
      
      // Salva o título da tarefa ANTES de excluir.
      // Depois de destroy(), não teremos mais acesso aos dados.
      const tituloTarefa = tarefa.titulo;
      
      // tarefa.destroy(): Remove o registro do banco de dados.
      // Tradução SQL: DELETE FROM tarefas WHERE id = ?;
      //
      // ⚠️ CUIDADO: Esta operação é IRREVERSÍVEL!
      // O registro é removido permanentemente do banco.
      await tarefa.destroy();
      
      // Redireciona para a listagem com mensagem de sucesso
      // incluindo o título da tarefa que foi excluída.
      const mensagem = encodeURIComponent(
        `Tarefa "${tituloTarefa}" excluída permanentemente. 🗑️`
      );
      res.redirect(`/?msg_success=${mensagem}`);
      
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      const mensagem = encodeURIComponent('Erro interno ao tentar excluir a tarefa.');
      res.redirect(`/?msg_error=${mensagem}`);
    }
  }
};

// Exporta o objeto TarefaController para ser usado no app.js.
//
// No app.js, as rotas são vinculadas assim:
//   app.get('/', TarefaController.listarTarefas);
//   app.get('/tarefa/:id', TarefaController.detalhesTarefa);
//   app.get('/cadastrar', TarefaController.mostrarFormCadastro);
//   app.post('/salvar', TarefaController.salvarTarefa);
//   app.get('/editar/:id', TarefaController.mostrarFormEdicao);
//   app.post('/atualizar', TarefaController.atualizarTarefa);
//   app.post('/deletar/:id', TarefaController.deletarTarefa);
module.exports = TarefaController;