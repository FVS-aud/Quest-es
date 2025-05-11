// --- INICIALIZAÇÃO E REFERÊNCIAS DO FIREBASE ---
import { auth, db } from './firebase-config.js';

console.log("script.js: Módulo carregado e executando."); // 1. Script está rodando?

// --- ELEMENTOS DO DOM ---
// Auth
const authContainer = document.getElementById('auth-container');
const loginForm = document.getElementById('login-form'); // Usado implicitamente, mas bom ter se precisar
const signupForm = document.getElementById('signup-form'); // Usado implicitamente
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');
const signupNameInput = document.getElementById('signup-name');
const signupBtn = document.getElementById('signup-btn');
const authError = document.getElementById('auth-error');
const userNav = document.getElementById('user-nav');

// Views Principais
const questionView = document.getElementById('question-view');
const statsView = document.getElementById('stats-view');
const addQuestionView = document.getElementById('add-question-view');
const forumView = document.getElementById('forum-view');

// Elementos das Questões
const breadcrumb = document.getElementById('breadcrumb');
const currentQNumEl = document.getElementById('current-question-number');
const totalQsEl = document.getElementById('total-questions');
const prevQBtn = document.getElementById('prev-question-btn');
const nextQBtn = document.getElementById('next-question-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const questionContainer = document.getElementById('question-container');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const feedbackContainer = document.getElementById('feedback-container');
const addToNotebookBtn = document.getElementById('add-to-notebook-btn');

// Filtros de Questões (Sidebar)
const categoryFiltersEl = document.getElementById('category-filters'); // Container principal dos filtros

// Cadernos (Sidebar)
const createNotebookBtn = document.getElementById('create-notebook-btn');
const notebooksListEl = document.getElementById('notebooks-list');

// Adicionar Questão
const addQStatement = document.getElementById('add-q-statement');
const addQType = document.getElementById('add-q-type');
const addQOptionsMC = document.getElementById('add-q-options-mc');
const addQOptA = document.getElementById('add-q-opt-a');
const addQOptB = document.getElementById('add-q-opt-b');
const addQOptC = document.getElementById('add-q-opt-c');
const addQOptD = document.getElementById('add-q-opt-d');
const addQOptE = document.getElementById('add-q-opt-e');
const addQCorrectMC = document.getElementById('add-q-correct-mc');
const addQOptionsTF = document.getElementById('add-q-options-tf');
const addQCorrectTF = document.getElementById('add-q-correct-tf');
const addQJustification = document.getElementById('add-q-justification');
const addQSubject = document.getElementById('add-q-subject');
const addQTopic = document.getElementById('add-q-topic');
const submitNewQuestionBtn = document.getElementById('submit-new-question-btn');

// Botões de Navegação Footer
const showStatsBtn = document.getElementById('show-stats-btn');
const showAddQuestionBtn = document.getElementById('show-add-question-btn');

// Forum
const toggleForumBtn = document.getElementById('toggle-forum-btn');
const forumCommentsList = document.getElementById('forum-comments-list');
const newCommentText = document.getElementById('new-comment-text');
const submitCommentBtn = document.getElementById('submit-comment-btn');
const forumQuestionIdDisplay = document.getElementById('forum-question-id-display');

// Favoritas e Botão Voltar em Estatísticas
const showFavoritesBtn = document.getElementById('show-favorites-btn');
const backToQuestionsFromStatsBtn = document.getElementById('back-to-questions-from-stats-btn');

// Estatísticas View
const statsContextTypeSelect = document.getElementById('stats-context-type');
const applyStatsContextBtn = document.getElementById('apply-stats-context-btn');
const statsSubjectFilter = document.getElementById('stats-subject-filter');
const statsTopicFilter = document.getElementById('stats-topic-filter');
const applyUserStatsFilterBtn = document.getElementById('apply-user-stats-filter-btn');
const userPerformanceTitleEl = document.getElementById('user-performance-title');
const globalPerformanceTitleEl = document.getElementById('global-performance-title');
const statsComparisonContainerEl = document.getElementById('stats-comparison-container');

// --- ELEMENTOS DAS ABAS PRINCIPAIS ---
const tabButtons = document.querySelectorAll('.main-tab-btn');
const contentViews = { // Mapeia o ID do botão da aba para o ID da view de conteúdo
    'tab-questions': document.getElementById('question-view'),
    'tab-stats-header': document.getElementById('stats-view'), // << ATUALIZADO
    'tab-notebooks': document.getElementById('notebooks-view'),
    'tab-favorites': document.getElementById('favorites-listing-view')
};
const questionViewEl = document.getElementById('question-view'); // Adicionado para consistência se usado em displayFavoriteQuestions
const statsViewEl = document.getElementById('stats-view'); // Adicionado para consistência
const addQuestionViewEl = document.getElementById('add-question-view'); // Adicionado para consistência
const forumViewEl = document.getElementById('forum-view'); // Adicionado para consistência

// 2. Os elementos dos botões foram encontrados no DOM?
console.log("script.js: Verificando referências dos botões de autenticação.");
console.log("script.js: Elemento loginBtn:", loginBtn);
console.log("script.js: Elemento signupBtn:", signupBtn);
if (!loginBtn) {
    console.error("CRÍTICO: Botão de Login (loginBtn) NÃO encontrado no DOM!");
}
if (!signupBtn) {
    console.error("CRÍTICO: Botão de Cadastro (signupBtn) NÃO encontrado no DOM!");
}

// --- FUNÇÕES DE CONTROLE DAS ABAS PRINCIPAIS ---
// Função para mostrar a view selecionada e esconder as outras
function showMainContentView(viewToShow) {
    Object.values(contentViews).forEach(view => {
        if (view && view !== viewToShow) {
            view.classList.add('hidden');
        }
    });
    if (viewToShow) {
        viewToShow.classList.remove('hidden');
    }

    // Ocultar views que não estão no contentViews (como auth, add-question)
    // Essas são geralmente acionadas por outros botões/lógicas
    if (authContainer && viewToShow !== authContainer) authContainer.classList.add('hidden');
    if (addQuestionView && viewToShow !== addQuestionView) addQuestionView.classList.add('hidden'); // addQuestionViewEl é a referência correta se definida acima
    if (forumView && viewToShow !== forumView) forumView.classList.add('hidden'); // forumViewEl é a referência correta se definida acima
}

// Função para definir a aba ativa
function setActiveTab(activeButton) {
    tabButtons.forEach(button => {
        button.classList.remove('active-tab');
    });
    if (activeButton) {
        activeButton.classList.add('active-tab');
    }
}

// --- ESTADO GLOBAL DA APLICAÇÃO ---
let currentUser = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let selectedAnswer = null;
let currentFilters = { subject: null, topic: null };
let userAnswersCache = {};
let userFavoritesCache = new Set();
let userStatsData = null;
let userNotebooks = [];
let currentViewingContext = { type: 'general', id: null, name: 'Todas as Questões' };
let allSubjectsAndTopics = {};

// --- INSTÂNCIAS DOS GRÁFICOS ---
let geralChartInstance = null;
let globalCompareChartInstance = null;
let dificuldadeChartInstance = null;

// --- AUTENTICAÇÃO ---
console.log("script.js: Configurando observador auth.onAuthStateChanged.");
auth.onAuthStateChanged(user => {
    console.log("script.js: auth.onAuthStateChanged foi acionado. Usuário:", user ? user.uid : 'Nenhum usuário');
    if (user) {
        currentUser = user;
        if (authContainer) authContainer.classList.add('hidden'); else console.warn("authContainer não encontrado para esconder");
        if (questionView) questionView.classList.remove('hidden'); else console.warn("questionView não encontrado para mostrar");
        if (statsView) statsView.classList.add('hidden');
        if (addQuestionView) addQuestionView.classList.add('hidden');
        if (forumView) forumView.classList.add('hidden');

        if (userNav) {
            userNav.innerHTML = `
                <span>Olá, ${user.displayName || user.email}</span>
                <button id="logout-btn">Sair</button>
            `;
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    console.log("script.js: Botão Logout CLICADO!");
                    auth.signOut();
                });
            } else {
                console.error("script.js: logoutBtn não encontrado após userNav.innerHTML!");
            }

        } else {
            console.error("script.js: userNav não encontrado para atualizar UI de usuário logado!");
        }

        console.log("script.js: Chamando loadInitialUserData() para usuário logado.");
        loadInitialUserData(); // Carrega dados específicos do usuário
        if(addToNotebookBtn) addToNotebookBtn.classList.remove('hidden');

    } else {
        currentUser = null;
        userStatsData = null;
        userNotebooks = [];
        currentViewingContext = { type: 'general', id: null, name: 'Todas as Questões' };
        if (authContainer) authContainer.classList.remove('hidden'); else console.warn("authContainer não encontrado para mostrar");
        if (questionView) questionView.classList.add('hidden');
        if (statsView) statsView.classList.add('hidden');
        if (addQuestionView) addQuestionView.classList.add('hidden');
        if (forumView) forumView.classList.add('hidden');
        if (userNav) userNav.innerHTML = '';
        currentQuestions = [];
        currentQuestionIndex = 0;
        if(showStatsBtn) showStatsBtn.classList.add('hidden');
        if(showAddQuestionBtn) showAddQuestionBtn.classList.add('hidden');
        if(addToNotebookBtn) addToNotebookBtn.classList.add('hidden');
        if(categoryFiltersEl) categoryFiltersEl.innerHTML = ''; // Limpa filtros da sidebar ao deslogar
        if(notebooksListEl) notebooksListEl.innerHTML = '';
        console.log("script.js: Usuário deslogado, UI de login/cadastro exibida.");
    }
});

// Adicionar event listeners aos botões das abas
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!currentUser && button.id !== 'tab-home') { // Ajuste se a home for acessível sem login
            alert("Por favor, faça login para acessar esta seção.");
            // Opcional: redirecionar para a tela de login ou não fazer nada
            // if (authContainer) {
            //     showMainContentView(null); // Esconde todas as views de abas
            //     authContainer.classList.remove('hidden');
            //     setActiveTab(null);
            // }
            return;
        }

        const viewToShow = contentViews[button.id];
        showMainContentView(viewToShow);
        setActiveTab(button);

        // Lógica específica ao clicar em cada aba (carregar dados, etc.)
        switch (button.id) {
            case 'tab-questions':
                console.log("Aba Questões clicada.");
                if (currentViewingContext.type !== 'filter' && currentViewingContext.type !== 'general') {
                    currentFilters = { subject: null, topic: null };
                    currentViewingContext = { type: 'general', id: null, name: 'Todas as Questões' };
                     const allMateriasHeader = document.querySelector('#category-filters .main-filter-header');
                    if (allMateriasHeader) setActiveFilterUI(allMateriasHeader);
                }
                fetchQuestions(); // Carrega questões (gerais ou com filtros atuais)
                break;
            case 'tab-stats-header': // << ID ATUALIZADO
                console.log("Aba Estatísticas (Header) clicada.");
                if (statsContextTypeSelect) {
                    statsContextTypeSelect.value = 'general'; // Default
                }
                const statsSubmenu = document.getElementById('stats-main-submenu');
                if (!statsSubmenu.classList.contains('expanded')) {
                }
                break;
            case 'tab-notebooks':
                console.log("Aba Cadernos clicada.");
                // A view 'notebooks-view' será exibida por showMainContentView.
                // A sidebar já deve ter sido populada com os cadernos pelo fetchUserNotebooks.
                // Você pode querer expandir a seção de cadernos na sidebar automaticamente:
                const notebooksListMenu = document.getElementById('notebooks-list');
                const notebooksHeaderSidebar = document.querySelector('.collapsible-header-sidebar[data-target="notebooks-list"]'); // Use a classe correta do seu HTML para o header da lista de cadernos
                if (notebooksListMenu && notebooksHeaderSidebar && notebooksListMenu.classList.contains('list-collapsed')) {
                    // notebooksHeaderSidebar.click(); // Simula o clique para expandir se estiver recolhido
                    // OU, de forma mais direta:
                    notebooksListMenu.classList.remove('list-collapsed');
                    const icon = notebooksHeaderSidebar.querySelector('.collapse-icon-sidebar');
                    if (icon) icon.textContent = '-';
                    notebooksHeaderSidebar.classList.add('expanded');
                }
                // Se você tiver uma função para popular #notebooks-view com uma lista principal de cadernos:
                // displayAllNotebooksInMainView();
                break;
            case 'tab-favorites':
                console.log("Aba Favoritas clicada.");
                displayFavoriteQuestions(); // Função que já busca e exibe os favoritos na favorites-listing-view
                // fetchUserFavoriteGroups();  // Se você tiver essa função para grupos de favoritas
                break;
            // case 'tab-home':
            //     // Lógica para a página inicial, se diferente de "Questões"
            //     break;
        }
    });
});

// --- LÓGICA DE LOGIN E CADASTRO ---
if (loginBtn) {
    console.log("script.js: Botão de Login (loginBtn) ENCONTRADO. Adicionando listener de clique.");
    loginBtn.addEventListener('click', () => {
        console.log("script.js: Botão de Login CLICADO!");
        const email = loginEmailInput ? loginEmailInput.value : null;
        const password = loginPasswordInput ? loginPasswordInput.value : null;

        if (!loginEmailInput || !loginPasswordInput) {
            console.error("CRÍTICO: Campos de email ou senha para login (loginEmailInput, loginPasswordInput) não encontrados!");
            if(authError) authError.textContent = "Erro interno: campos de login não encontrados.";
            return;
        }
        if (!email || !password) {
            console.warn("script.js: Email ou senha não preenchidos para login.");
            if(authError) authError.textContent = "Por favor, preencha email e senha.";
            return;
        }
        console.log(`script.js: Tentando login com email: ${email}`);
        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                console.log("script.js: Firebase: Login BEM-SUCEDIDO para:", userCredential.user.uid);
                if(authError) authError.textContent = '';
            })
            .catch(error => {
                console.error("script.js: Firebase: ERRO no login:", error.code, error.message);
                if(authError) authError.textContent = `Erro no login: ${error.message}`;
            });
    });
} else {
    console.error("CRÍTICO: Botão de Login (loginBtn) é null. Listener NÃO foi adicionado.");
}

if (signupBtn) {
    console.log("script.js: Botão de Cadastro (signupBtn) ENCONTRADO. Adicionando listener de clique.");
    signupBtn.addEventListener('click', () => {
        console.log("script.js: Botão de Cadastro CLICADO!");
        const email = signupEmailInput ? signupEmailInput.value : null;
        const password = signupPasswordInput ? signupPasswordInput.value : null;
        const name = signupNameInput ? signupNameInput.value : null;

        if (!signupEmailInput || !signupPasswordInput || !signupNameInput) {
            console.error("CRÍTICO: Campos de email, senha ou nome para cadastro não encontrados!");
            if(authError) authError.textContent = "Erro interno: campos de cadastro não encontrados.";
            return;
        }
        if (!email || !password || !name) {
            console.warn("script.js: Email, senha ou nome não preenchidos para cadastro.");
            if(authError) authError.textContent = "Por favor, preencha todos os campos para cadastro.";
            return;
        }
        if (!name.trim()) {
            console.warn("script.js: Nome de exibição está vazio ou contém apenas espaços.");
            if(authError) authError.textContent = "Por favor, insira um nome válido.";
            return;
        }
        console.log(`script.js: Tentando cadastro com email: ${email}, nome: ${name}`);
        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                console.log("script.js: Firebase: Cadastro BEM-SUCEDIDO para:", userCredential.user.uid);
                return userCredential.user.updateProfile({
                    displayName: name
                }).then(() => {
                    console.log("script.js: Firebase: Perfil do usuário atualizado com displayName.");
                    return db.collection('users').doc(userCredential.user.uid).set({
                        displayName: name,
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        stats: { totalAnswered: 0, totalCorrect: 0, subjects: {}, topics: {} }
                    });
                }).then(() => {
                    console.log("script.js: Informações do usuário salvas na coleção 'users'.");
                    if(authError) authError.textContent = '';
                });
            })
            .catch(error => {
                console.error("script.js: Firebase: ERRO no cadastro:", error.code, error.message);
                if(authError) authError.textContent = `Erro no cadastro: ${error.message}`;
            });
    });
} else {
    console.error("CRÍTICO: Botão de Cadastro (signupBtn) é null. Listener NÃO foi adicionado.");
}

async function loadInitialUserData() {
    if (!currentUser) {
        console.warn("loadInitialUserData: Chamada sem usuário logado, retornando.");
        return;
    }
    try {
        console.log("loadInitialUserData: Iniciando...");

        // 1. Carregar dados para a sidebar e caches internos
        await fetchAllSubjectsAndTopics();
        console.log("loadInitialUserData: Matérias e tópicos para filtros carregados.");
        loadFilterCategories(); // Popula os filtros de matéria/assunto na sidebar
        console.log("loadInitialUserData: Filtros de categoria na sidebar carregados.");

        await fetchUserFavorites(); // Carrega dados dos favoritos para userFavoritesCache
        console.log("loadInitialUserData: Dados de favoritos do usuário carregados para o cache.");

        await fetchUserNotebooks(); // Carrega dados dos cadernos para userNotebooks e popula a lista na sidebar
        console.log("loadInitialUserData: Cadernos do usuário carregados e lista da sidebar populada.");

        // await fetchUserFavoriteGroups(); // Se você tiver essa função para grupos de favoritas, chame-a.

        // 2. Visibilidade de botões de ação (não abas)
        // A view principal (ex: question-view) já deve ter sido tornada visível
        // pela lógica de onAuthStateChanged ao definir a aba/item de sidebar padrão.

        if (addToNotebookBtn) { // Botão na barra de ações da questão
            addToNotebookBtn.classList.remove('hidden');
        } else {
            console.warn("loadInitialUserData: addToNotebookBtn não encontrado.");
        }

        if (showAddQuestionBtn) { // Botão "Adicionar Questão" no footer
            showAddQuestionBtn.classList.remove('hidden');
        } else {
            console.warn("loadInitialUserData: showAddQuestionBtn não encontrado.");
        }

        // 3. Remover/Esconder botões antigos que foram substituídos pelas abas/itens da sidebar
        if (showStatsBtn) { // Botão "Desempenho" no footer
            showStatsBtn.classList.add('hidden'); // Escondido, pois "Estatísticas" é um item da sidebar
            console.log("loadInitialUserData: Botão 'showStatsBtn' do footer escondido.");
        }

        // O botão `showFavoritesBtn` da sua sidebar (se ele existia para listar todas as favoritas)
        // agora é substituído pelo item "Favoritas" na navegação principal da sidebar.
        // A sua sidebar tem uma seção #my-favorites-section com um <ul> id="favorites-list-menu"
        // que já tem uma mensagem "Use o menu 'Favoritas' acima...". Isso está bom.
        // Se houvesse um botão específico com id="show-favorites-btn" que precisasse ser removido,
        // faríamos isso aqui. Pelo seu HTML, a estrutura atual parece ok.

        // 4. Configurar elementos interativos da sidebar (colapsáveis)
        // A chamada para setupSidebarCollapsibles já está no final do script
        // e também dentro do DOMContentLoaded (ou deveria estar).
        // Se ainda não estiver lá, ou se for mais confiável chamar após os dados da sidebar serem carregados:
        setupSidebarCollapsibles();
        console.log("loadInitialUserData: setupSidebarCollapsibles chamado.");


        // 5. Carregamento inicial de questões (Opcional aqui, pois onAuthStateChanged já faz isso)
        // A lógica em onAuthStateChanged já chama fetchQuestions() após definir a aba/item padrão.
        // Se você quiser garantir que as questões sejam recarregadas ou atualizadas com base
        // em algum estado específico que loadInitialUserData define, você poderia chamar fetchQuestions() aqui.
        // Mas, para evitar redundância, geralmente é melhor deixar onAuthStateChanged cuidar do carregamento inicial
        // da view padrão.
        // Exemplo: se você quisesse sempre carregar as questões "Todas" aqui, independentemente da aba:
        // currentFilters = { subject: null, topic: null };
        // currentViewingContext = { type: 'general', id: null, name: 'Todas as Questões' };
        // await fetchQuestions();
        // console.log("loadInitialUserData: Questões gerais recarregadas (se intencional).");

        console.log("loadInitialUserData: Concluído com sucesso.");

    } catch (error) {
        console.error("Erro CRÍTICO em loadInitialUserData:", error);
        if (authError && authError.textContent !== undefined) { // Verifica se authError existe e tem textContent
            authError.textContent = "Erro ao carregar dados da sua conta. Tente recarregar.";
        } else {
            console.warn("Elemento authError não encontrado ou não possui textContent.");
        }
    }
}

// --- CARREGAMENTO DE MATÉRIAS E ASSUNTOS (PARA FILTROS DA SIDEBAR) ---
async function fetchAllSubjectsAndTopics() {
    allSubjectsAndTopics = {}; // Reset
    try {
        const snapshot = await db.collection('questions').orderBy("subject").orderBy("topic").get(); // Ordenar pode ajudar na consistência
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.subject) {
                const subjectClean = data.subject.trim(); // Limpa espaços extras
                if (!subjectClean) return; // Ignora matérias vazias

                if (!allSubjectsAndTopics[subjectClean]) {
                    allSubjectsAndTopics[subjectClean] = new Set();
                }
                if (data.topic) {
                    const topicClean = data.topic.trim();
                    if (topicClean) allSubjectsAndTopics[subjectClean].add(topicClean);
                }
            }
        });
        // Converter Sets para Arrays ordenados
        for (const subject in allSubjectsAndTopics) {
            allSubjectsAndTopics[subject] = Array.from(allSubjectsAndTopics[subject]).sort();
        }
        console.log("Matérias e Assuntos para filtros carregados:", allSubjectsAndTopics);
    } catch (error) {
        console.error("Erro ao buscar todas as matérias e assuntos para filtros:", error);
        allSubjectsAndTopics = {}; // Garante que está vazio em caso de erro
    }
}

// --- NOVA LÓGICA PARA SIDEBAR DE FILTROS ---
function loadFilterCategories() {
    if (!categoryFiltersEl) {
        console.error("loadFilterCategories: Elemento 'categoryFiltersEl' não encontrado.");
        return;
    }
    categoryFiltersEl.innerHTML = ''; // Limpa a área de filtros

    // 1. Criar o cabeçalho "Todas as Matérias"
    const allMateriasHeaderDiv = document.createElement('div');
    allMateriasHeaderDiv.classList.add('main-filter-header');
    allMateriasHeaderDiv.innerHTML = `
        <span>Todas as Matérias</span>
        <span class="collapse-icon-main">+</span>
    `;
    allMateriasHeaderDiv.dataset.filterType = "all_materias";

    // 2. Criar a UL para as matérias individuais (branches)
    const materiasBranchUl = document.createElement('ul');
    materiasBranchUl.id = 'materias-branch-list';
    materiasBranchUl.classList.add('list-collapsed');

    allMateriasHeaderDiv.addEventListener('click', () => {
        materiasBranchUl.classList.toggle('list-collapsed');
        const icon = allMateriasHeaderDiv.querySelector('.collapse-icon-main');
        icon.textContent = materiasBranchUl.classList.contains('list-collapsed') ? '+' : '-';

        currentFilters.subject = null;
        currentFilters.topic = null;
        currentViewingContext = { type: 'general', id: null, name: 'Todas as Questões' };
        fetchQuestions();
        setActiveFilterUI(allMateriasHeaderDiv);

        if (materiasBranchUl.classList.contains('list-collapsed')) {
            materiasBranchUl.querySelectorAll('.assuntos-sublist').forEach(ul => ul.classList.add('list-collapsed'));
            materiasBranchUl.querySelectorAll('.collapse-icon-materia').forEach(iconMateria => iconMateria.textContent = '+');
        }
    });

    categoryFiltersEl.appendChild(allMateriasHeaderDiv);
    categoryFiltersEl.appendChild(materiasBranchUl);

    // 3. Popular 'materiasBranchUl'
    const sortedSubjects = Object.keys(allSubjectsAndTopics).sort();

    if (sortedSubjects.length === 0 && Object.keys(allSubjectsAndTopics).length > 0) {
        // Isso pode acontecer se allSubjectsAndTopics tiver chaves, mas o sort falhar ou resultar em vazio
        console.warn("loadFilterCategories: sortedSubjects está vazio, mas allSubjectsAndTopics tem chaves. Verifique os nomes das matérias.");
    }
    if (sortedSubjects.length === 0) { // Se realmente não há matérias
         const noSubjectsLi = document.createElement('li');
        noSubjectsLi.textContent = "Nenhuma matéria para filtrar.";
        noSubjectsLi.style.paddingLeft = "10px";
        noSubjectsLi.style.fontStyle = "italic";
        noSubjectsLi.style.cursor = "default";
        materiasBranchUl.appendChild(noSubjectsLi);
        // Se não há matérias, talvez "Todas as Matérias" deva ser o único filtro clicável e não expansível
        allMateriasHeaderDiv.querySelector('.collapse-icon-main').style.display = 'none'; // Esconde o ícone se não há o que expandir
        // E remove o toggle da lista de branches se ela estiver vazia.
        allMateriasHeaderDiv.onclick = () => { // Sobrescreve o listener anterior
            currentFilters.subject = null;
            currentFilters.topic = null;
            currentViewingContext = { type: 'general', id: null, name: 'Todas as Questões' };
            fetchQuestions();
            setActiveFilterUI(allMateriasHeaderDiv);
        };
        return; // Não há mais nada a fazer aqui se não há matérias
    }


    sortedSubjects.forEach(subject => {
        const materiaItemLi = document.createElement('li');
        materiaItemLi.classList.add('materia-item-branch');

        const materiaHeaderIndividualDiv = document.createElement('div');
        materiaHeaderIndividualDiv.classList.add('materia-header');
        materiaHeaderIndividualDiv.innerHTML = `
            <span>${subject}</span>
            <span class="collapse-icon-materia">+</span>
        `;
        materiaHeaderIndividualDiv.dataset.subjectName = subject;
        materiaHeaderIndividualDiv.dataset.filterType = "subject";

        const assuntosUl = document.createElement('ul');
        assuntosUl.classList.add('assuntos-sublist', 'list-collapsed');

        if (allSubjectsAndTopics[subject] && allSubjectsAndTopics[subject].length > 0) {
            allSubjectsAndTopics[subject].forEach(topic => {
                const assuntoLi = document.createElement('li');
                assuntoLi.textContent = topic;
                assuntoLi.dataset.subjectName = subject;
                assuntoLi.dataset.topicName = topic;
                assuntoLi.dataset.filterType = "topic";

                assuntoLi.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentFilters.subject = subject;
                    currentFilters.topic = topic;
                    currentViewingContext = { type: 'filter', id: null, name: `${subject} > ${topic}` };
                    fetchQuestions();
                    setActiveFilterUI(assuntoLi);
                });
                assuntosUl.appendChild(assuntoLi);
            });
        } else {
            const noAssuntoLi = document.createElement('li');
            noAssuntoLi.textContent = "Nenhum assunto";
            noAssuntoLi.style.fontStyle = "italic";
            noAssuntoLi.style.cursor = "default";
            noAssuntoLi.style.padding = "5px"; // Garante que é clicável/visível
            assuntosUl.appendChild(noAssuntoLi);
        }

        materiaHeaderIndividualDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            assuntosUl.classList.toggle('list-collapsed');
            const icon = materiaHeaderIndividualDiv.querySelector('.collapse-icon-materia');
            icon.textContent = assuntosUl.classList.contains('list-collapsed') ? '+' : '-';

            currentFilters.subject = subject;
            currentFilters.topic = null;
            currentViewingContext = { type: 'filter', id: null, name: subject };
            fetchQuestions();
            setActiveFilterUI(materiaHeaderIndividualDiv);
        });

        materiaItemLi.appendChild(materiaHeaderIndividualDiv);
        materiaItemLi.appendChild(assuntosUl);
        materiasBranchUl.appendChild(materiaItemLi);
    });
}

function setActiveFilterUI(selectedElement) {
    document.querySelectorAll('#category-filters .main-filter-header, #category-filters .materia-header, #category-filters .assuntos-sublist li').forEach(el => {
        el.classList.remove('active-filter');
    });
    if (selectedElement) {
        selectedElement.classList.add('active-filter');
    }
}

// --- LÓGICA DOS CADERNOS ---
// (Seu código de handleCreateNotebook, fetchUserNotebooks, loadNotebookQuestions, listener de addToNotebookBtn)
// As funções de caderno da resposta anterior podem ser coladas aqui.
// Exemplo (cole as suas funções completas):
async function handleCreateNotebook() {
    if (!currentUser) {
        alert("Faça login para criar cadernos.");
        return;
    }
    const notebookName = prompt("Digite o nome do novo caderno:");
    if (!notebookName || notebookName.trim() === "") {
        // alert("Nome do caderno inválido."); // Removido para não interromper fluxo de teste
        console.warn("Nome do caderno inválido ou cancelado.");
        return;
    }

    try {
        const newNotebookRef = await db.collection('userNotebooks').add({
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email,
            notebookName: notebookName.trim(),
            questionIds: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            stats: {
                totalAnswered: 0,
                totalCorrect: 0,
                subjects: {},
            }
        });
        alert(`Caderno "${notebookName.trim()}" criado! (ID: ${newNotebookRef.id})`);
        fetchUserNotebooks();
    } catch (error) {
        console.error("Erro ao criar caderno:", error);
        alert("Não foi possível criar o caderno. Tente novamente.");
    }
}

if (createNotebookBtn) {
    createNotebookBtn.addEventListener('click', handleCreateNotebook);
} else {
    console.warn("createNotebookBtn não encontrado.");
}


async function fetchUserNotebooks() {
    if (!currentUser || !notebooksListEl) {
         console.warn("fetchUserNotebooks: Usuário não logado ou elemento da lista de cadernos não encontrado.");
        if(notebooksListEl) notebooksListEl.innerHTML = '<li>Faça login para ver seus cadernos.</li>';
        return;
    }
    notebooksListEl.innerHTML = '<li>Carregando cadernos...</li>';

    const existingOptions = statsContextTypeSelect ? statsContextTypeSelect.querySelectorAll('option[value^="notebook_"]') : [];
    existingOptions.forEach(opt => opt.remove());

    try {
        const snapshot = await db.collection('userNotebooks')
            .where('userId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get();

        userNotebooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (userNotebooks.length === 0) {
            notebooksListEl.innerHTML = '<li>Nenhum caderno criado.</li>';
            return;
        }

        notebooksListEl.innerHTML = '';
        userNotebooks.forEach(notebook => {
            const li = document.createElement('li');
            li.dataset.notebookId = notebook.id;
            
        // 1. Criar o SPAN para o nome do caderno (clicável)
            const nameSpan = document.createElement('span');
            nameSpan.classList.add('notebook-name'); // Adicione esta classe no seu CSS
            nameSpan.textContent = `${notebook.notebookName} (${notebook.questionIds ? notebook.questionIds.length : 0}q)`;
            nameSpan.addEventListener('click', () => {
                loadNotebookQuestions(notebook);
                document.querySelectorAll('#notebooks-list li').forEach(item => item.classList.remove('active-notebook'));
                li.classList.add('active-notebook'); // 'li' continua sendo o item que recebe a classe 'active-notebook'

                // Se a view de favoritas estiver visível, esconda-a
                const favoritesView = document.getElementById('favorites-listing-view');
                if (favoritesView && !favoritesView.classList.contains('hidden')) {
                    favoritesView.classList.add('hidden');
                    const questionViewEl = document.getElementById('question-view'); // Use a constante se já definida
                    if (questionViewEl) questionViewEl.classList.remove('hidden');
                }
            });

            // 2. Criar o BOTÃO de exclusão
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.classList.add('delete-notebook-btn'); // Adicione esta classe no seu CSS
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // IMPORTANTE: Impede que o clique no botão acione o listener do nameSpan ou do li.
                deleteNotebook(notebook.id, notebook.notebookName); // Chama a função que você criará para deletar
            });

            // 3. Adicionar o span e o botão ao LI
            li.appendChild(nameSpan);
            li.appendChild(deleteBtn);
            notebooksListEl.appendChild(li);

            // 4. Lógica para adicionar ao seletor de estatísticas (permanece a mesma)
            if (statsContextTypeSelect) {
                const option = document.createElement('option');
                option.value = `notebook_${notebook.id}`;
                option.textContent = `Caderno: ${notebook.notebookName}`;
                statsContextTypeSelect.appendChild(option);
            }
            
        });
    } catch (error) {
        console.error("Erro ao buscar cadernos do usuário:", error);
        notebooksListEl.innerHTML = '<li>Erro ao carregar cadernos.</li>';
    }
}

async function deleteNotebook(notebookId, notebookName) {
    if (!currentUser) {
        alert("Faça login para excluir cadernos.");
        return;
    }
    if (confirm(`Tem certeza que deseja excluir o caderno "${notebookName}"? Esta ação não pode ser desfeita.`)) {
        try {
            await db.collection('userNotebooks').doc(notebookId).delete();
            alert(`Caderno "${notebookName}" excluído com sucesso.`);
            fetchUserNotebooks(); // Atualiza a lista de cadernos

            if (currentViewingContext.type === 'notebook' && currentViewingContext.id) {
                const notebookStatsRef = db.collection('userNotebooks').doc(currentViewingContext.id);
                const notebookUpdate = {}; // Para os incrementos
                const saneSubject = subject.replace(/\./g, '_');

                // 1. Lê o documento atual do caderno
                const notebookDoc = await notebookStatsRef.get();
                const currentNotebookStats = notebookDoc.exists && notebookDoc.data().stats ? notebookDoc.data().stats : {};

                // 2. Define a estrutura base garantida para as estatísticas do caderno
                const defaultNotebookStatsStructure = {
                    totalAnswered: currentNotebookStats.totalAnswered || 0,
                    totalCorrect: currentNotebookStats.totalCorrect || 0,
                    totalBlank: currentNotebookStats.totalBlank || 0,
                    subjects: {
                        ...(currentNotebookStats.subjects || {}),
                        [saneSubject]: {
                            total: (currentNotebookStats.subjects && currentNotebookStats.subjects[saneSubject] && currentNotebookStats.subjects[saneSubject].total) || 0,
                            correct: (currentNotebookStats.subjects && currentNotebookStats.subjects[saneSubject] && currentNotebookStats.subjects[saneSubject].correct) || 0,
                            blank: (currentNotebookStats.subjects && currentNotebookStats.subjects[saneSubject] && currentNotebookStats.subjects[saneSubject].blank) || 0,
                        }
                    }
                    // Adicione 'topics' aqui se você também rastrear estatísticas de tópicos por caderno
                };

                // 3. Aplica a estrutura base garantida com merge:true
                await notebookStatsRef.set({ stats: defaultNotebookStatsStructure }, { merge: true });

                // 4. Define os campos para o incremento
                notebookUpdate['stats.totalAnswered'] = firebase.firestore.FieldValue.increment(1);
                notebookUpdate[`stats.subjects.${saneSubject}.total`] = firebase.firestore.FieldValue.increment(1);

                if (status === 'correct') {
                    notebookUpdate['stats.totalCorrect'] = firebase.firestore.FieldValue.increment(1);
                    notebookUpdate[`stats.subjects.${saneSubject}.correct`] = firebase.firestore.FieldValue.increment(1);
                } else if (status === 'blank' || status === 'blank_navigation') {
                    notebookUpdate['stats.totalBlank'] = firebase.firestore.FieldValue.increment(1);
                    notebookUpdate[`stats.subjects.${saneSubject}.blank`] = firebase.firestore.FieldValue.increment(1);
                }

                console.log(`[saveUserAnswer - Caderno] Status: ${status}, Atualizações para o caderno:`, JSON.stringify(notebookUpdate));

                // 5. Aplica os incrementos
                await notebookStatsRef.update(notebookUpdate);
                console.log("[saveUserAnswer - Caderno] Estatísticas do caderno atualizadas.");
            }
        } catch (error) {
            console.error("Erro ao excluir caderno:", error);
            alert("Não foi possível excluir o caderno. Tente novamente.");
        }
    }
}

async function loadNotebookQuestions(notebook) {
    // ... (sua função loadNotebookQuestions, garanta que ela use `setQuestionAreaUIMode`) ...
    if (!questionContainer || !breadcrumb) { // Adicione outras dependências se necessário
        console.error("loadNotebookQuestions: Elementos essenciais da UI não encontrados.");
        return;
    }
    if (!notebook || !notebook.questionIds) {
        alert("Caderno inválido ou sem IDs de questão.");
        return;
    }
    currentViewingContext = { type: 'notebook', id: notebook.id, name: notebook.notebookName };
    breadcrumb.textContent = `Caderno > ${notebook.notebookName}`;
    setActiveFilterUI(null); // Limpa filtro ativo da sidebar de matérias

    if (notebook.questionIds.length === 0) {
        questionContainer.innerHTML = `<p>O caderno "${notebook.notebookName}" está vazio. Adicione questões a ele.</p>`;
        currentQuestions = [];
        currentQuestionIndex = 0;
        updateQuestionNumbers();
        // setQuestionAreaUIMode('list'); // Defina esta função se precisar
        if(addToNotebookBtn) addToNotebookBtn.classList.remove('hidden');
        return;
    }
    // ... (resto da sua lógica loadNotebookQuestions)
    questionContainer.innerHTML = `<p>Carregando questões do caderno "${notebook.notebookName}"...</p>`;
    try {
        const questionPromises = notebook.questionIds.map(qId => db.collection('questions').doc(qId).get());
        const questionDocs = await Promise.all(questionPromises);

        currentQuestions = questionDocs
            .filter(doc => doc.exists)
            .map(doc => ({ id: doc.id, ...doc.data() }));

        currentQuestionIndex = 0;

        if (currentQuestions.length > 0) {
            displayQuestion(currentQuestionIndex);
        } else {
            questionContainer.innerHTML = `<p>Nenhuma questão válida encontrada para o caderno "${notebook.notebookName}".</p>`;
        }
        updateQuestionNumbers();
        if(addToNotebookBtn) addToNotebookBtn.classList.remove('hidden');

    } catch (error) {
        console.error(`Erro ao carregar questões do caderno ${notebook.id}:`, error);
        questionContainer.innerHTML = `<p>Erro ao carregar questões do caderno.</p>`;
    }
}


if (addToNotebookBtn) {
    addToNotebookBtn.addEventListener('click', async () => {
        // ... (sua lógica addToNotebookBtn, lembre-se de usar prompt com cuidado ou implementar um modal) ...
        if (!currentUser || currentQuestions.length === 0 || !currentQuestions[currentQuestionIndex]) {
            alert("Nenhuma questão selecionada ou você não está logado.");
            return;
        }
        if (userNotebooks.length === 0) {
            alert("Você não possui cadernos. Crie um primeiro.");
            handleCreateNotebook(); // Sugere criar um caderno
            return;
        }

        const questionIdToAdd = currentQuestions[currentQuestionIndex].id;
        const questionStatementPreview = currentQuestions[currentQuestionIndex].statement.substring(0, 50) + "...";

        let promptMessage = `Adicionar questão "${questionStatementPreview}" ao caderno:\n`;
        userNotebooks.forEach((nb, i) => {
            promptMessage += `${i + 1}. ${nb.notebookName}\n`;
        });
        promptMessage += `Digite o número do caderno:`;

        const selection = prompt(promptMessage);
        if (selection) {
            const selectedIndex = parseInt(selection) - 1;
            if (selectedIndex >= 0 && selectedIndex < userNotebooks.length) {
                const notebookDocId = userNotebooks[selectedIndex].id;
                const notebookRef = db.collection('userNotebooks').doc(notebookDocId);
                try {
                    // Verificar se a questão já existe no caderno para evitar duplicatas no array
                    const currentNotebookDoc = await notebookRef.get();
                    if (currentNotebookDoc.exists) {
                        const currentNotebookData = currentNotebookDoc.data();
                        if (currentNotebookData.questionIds && currentNotebookData.questionIds.includes(questionIdToAdd)) {
                            alert(`A questão já existe no caderno "${userNotebooks[selectedIndex].notebookName}".`);
                            return;
                        }
                    }

                    await notebookRef.update({
                        questionIds: firebase.firestore.FieldValue.arrayUnion(questionIdToAdd)
                    });
                    alert(`Questão adicionada ao caderno "${userNotebooks[selectedIndex].notebookName}"!`);
                    fetchUserNotebooks(); // Atualiza a contagem na lista de cadernos
                } catch (error) {
                    console.error("Erro ao adicionar questão ao caderno:", error);
                    alert("Erro ao adicionar questão.");
                }
            } else {
                alert("Seleção de caderno inválida.");
            }
        }
    });
}


// --- LÓGICA DAS QUESTÕES (FETCH, DISPLAY, SUBMIT) ---
// (Suas funções fetchQuestions, displayQuestion, addOptionListeners, updateQuestionNumbers, submitAnswerBtn listener, showFeedback, saveUserAnswer)
// Cole suas funções completas aqui, com as modificações para currentViewingContext e breadcrumb se aplicável.
// Exemplo de fetchQuestions adaptado:
async function fetchQuestions(filters = currentFilters) {
    if (!questionContainer || !breadcrumb || !submitAnswerBtn || !prevQBtn || !nextQBtn || !favoriteBtn) {
        console.error("fetchQuestions: Elementos da UI de questão não encontrados.");
        return;
    }

    if (currentViewingContext.type === 'notebook') {
        console.log("fetchQuestions: Em modo caderno, não buscará por filtros gerais.");
        // As questões do caderno já devem ter sido carregadas por loadNotebookQuestions
        // Se currentQuestions estiver vazio aqui, significa que o caderno está vazio ou as questões não foram encontradas.
        if (currentQuestions.length === 0) {
             questionContainer.innerHTML = `<p>O caderno "${currentViewingContext.name}" está vazio ou as questões não puderam ser carregadas.</p>`;
             updateQuestionNumbers(); // Para mostrar 0 de 0
        }
        return;
    }

    // Se não estiver em modo caderno, procede com a busca por filtros
    // setQuestionAreaUIMode('single'); // Defina esta função
    if (feedbackContainer) feedbackContainer.innerHTML = '';
    submitAnswerBtn.disabled = false;
    selectedAnswer = null;

    let query = db.collection('questions');
    let breadcrumbText = "Questões > ";

    if (filters.subject) {
        query = query.where('subject', '==', filters.subject);
        breadcrumbText += `${filters.subject}`;
        if (filters.topic) {
            query = query.where('topic', '==', filters.topic);
            breadcrumbText += ` > ${filters.topic}`;
        }
    } else {
        breadcrumbText += 'Todas';
        // Se "Todas", garante que o filtro "Todas as Matérias" na UI esteja ativo
        const allMatHeader = document.querySelector('#category-filters .main-filter-header');
        if (allMatHeader) setActiveFilterUI(allMatHeader);
    }
    breadcrumb.textContent = breadcrumbText;
    if(currentViewingContext.type !== 'notebook') { // Não sobrescrever se já estiver em caderno
        currentViewingContext = { type: 'filter', name: breadcrumbText };
    }


    try {
        const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get(); // Adicione outros orderBy se necessário
        currentQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        currentQuestionIndex = 0;

        if (currentQuestions.length > 0) {
            displayQuestion(currentQuestionIndex);
            if(questionView) questionView.classList.remove('hidden');
            if(addToNotebookBtn) addToNotebookBtn.classList.remove('hidden');
        } else {
            questionContainer.innerHTML = "<p>Nenhuma questão encontrada para os filtros selecionados.</p>";
            if(addToNotebookBtn) addToNotebookBtn.classList.add('hidden');
            // Esconder botões de navegação de questão
            prevQBtn.classList.add('hidden');
            nextQBtn.classList.add('hidden');
            favoriteBtn.classList.add('hidden');
            submitAnswerBtn.classList.add('hidden');
        }
        updateQuestionNumbers();
    } catch (error) {
        console.error("Erro ao buscar questões:", error);
        questionContainer.innerHTML = "<p>Erro ao carregar questões. Tente novamente mais tarde.</p>";
    }
}

function displayQuestion(index) {
    // ... (sua função displayQuestion completa, garantindo que ela lide com currentQuestions vazio ou índice inválido)
    // ... e que ela chame addOptionListeners e checkIfFavorited
    // Exemplo de início:
    if (!questionContainer || !currentQuestions || currentQuestions.length === 0 || index < 0 || index >= currentQuestions.length) {
        if (questionContainer) questionContainer.innerHTML = "<p>Nenhuma questão para exibir ou fim da lista.</p>";
        if (submitAnswerBtn) submitAnswerBtn.classList.add('hidden');
        if (prevQBtn) prevQBtn.classList.add('hidden');
        if (nextQBtn) nextQBtn.classList.add('hidden');
        if (favoriteBtn) favoriteBtn.classList.add('hidden');
        if (addToNotebookBtn) addToNotebookBtn.classList.add('hidden'); // Ou manter visível se o caderno estiver ativo
        updateQuestionNumbers(); // Para mostrar 0 de 0
        return;
    }

    // Mostrar botões se houver questão
    if (submitAnswerBtn) { submitAnswerBtn.classList.remove('hidden'); submitAnswerBtn.disabled = false; }
    if (prevQBtn) prevQBtn.classList.remove('hidden');
    if (nextQBtn) nextQBtn.classList.remove('hidden');
    if (favoriteBtn) favoriteBtn.classList.remove('hidden');
    if (addToNotebookBtn) addToNotebookBtn.classList.remove('hidden');


    if(feedbackContainer) feedbackContainer.innerHTML = '';
    selectedAnswer = null;
    const q = currentQuestions[index];
    // ... (resto da sua lógica para construir o HTML da questão) ...
    // Copie o restante da sua função displayQuestion aqui
    let optionsHTML = '<ul class="options-list">';
    const letters = ['A', 'B', 'C', 'D', 'E'];

    if (q.type === 'multiple_choice' && q.options) {
        q.options.forEach((option, i) => {
            optionsHTML += `<li data-index="${i}"><span class="option-letter">${letters[i]}</span><span class="option-text">${option}</span></li>`;
        });
    } else if (q.type === 'true_false') {
        optionsHTML += `<li data-index="0"><span class="option-letter">C</span><span class="option-text">Certo</span></li>`; // Certo = 0
        optionsHTML += `<li data-index="1"><span class="option-letter">E</span><span class="option-text">Errado</span></li>`;// Errado = 1
    }
    optionsHTML += '</ul>';

    questionContainer.innerHTML = `
        <div class="question-info">
            Matéria: <span class="filter-trigger" data-type="subject" data-value="${q.subject || ''}">${q.subject || 'N/A'}</span> |
            Assunto: <span class="filter-trigger" data-type="topic" data-value="${q.topic || ''}">${q.topic || 'N/A'}</span>
            ${q.createdBy && q.createdBy !== 'admin' ? `| Criada por: Usuário` : ''}
        </div>
        <p class="question-statement">${q.statement}</p>
        ${optionsHTML}
    `;
    updateQuestionNumbers();
    addOptionListeners(); // Adiciona listeners às novas opções
    if(q.id && favoriteBtn) checkIfFavorited(q.id); // Verifica se é favorita

    if(prevQBtn) prevQBtn.disabled = index === 0;
    if(nextQBtn) nextQBtn.disabled = index === currentQuestions.length - 1;

    // Lógica para reexibir resposta anterior, se houver (userAnswersCache)
    if (q.id && userAnswersCache[q.id]) {
        const userAnswer = userAnswersCache[q.id];
        selectedAnswer = userAnswer.selectedAnswer; // selectedAnswer deve ser o índice da opção
        
        const liElements = questionContainer.querySelectorAll('.options-list li');
        if (liElements && liElements[selectedAnswer]) {
             // Não adicionar 'selected' aqui, pois o feedback fará isso com cores de certo/errado
        }
        showFeedback(userAnswer.isCorrect, q.correctAnswer, q.justification, q.type, q.options, true /*isRestored*/);
        if(submitAnswerBtn) submitAnswerBtn.disabled = true;
    } else {
        if(submitAnswerBtn) submitAnswerBtn.disabled = false;
    }
}


function addOptionListeners() {
    // ... (sua função addOptionListeners)
    const optionsLi = document.querySelectorAll('#question-container .options-list li');
    optionsLi.forEach(li => {
        li.addEventListener('click', function () {
            if (submitAnswerBtn && submitAnswerBtn.disabled) return; // Não permite selecionar se já respondido
            optionsLi.forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');
            selectedAnswer = parseInt(this.dataset.index);
        });
        li.addEventListener('dblclick', function () {
            if (submitAnswerBtn && submitAnswerBtn.disabled) return;
            this.classList.toggle('taxed'); // Adiciona/remove a classe 'taxed' para riscar
        });
    });

    // Listeners para os spans de Matéria/Assunto clicáveis na info da questão
    document.querySelectorAll('.filter-trigger').forEach(span => {
        span.addEventListener('click', function () {
            const type = this.dataset.type;
            const value = this.dataset.value;
            if (!value) return; // Não faz nada se o valor for vazio

            if (type === 'subject') {
                currentFilters.subject = value;
                currentFilters.topic = null; // Reseta o assunto ao clicar na matéria
                 // Ativa o filtro correspondente na sidebar
                const subjectHeader = document.querySelector(`#category-filters .materia-header[data-subject-name="${value}"]`);
                if(subjectHeader) setActiveFilterUI(subjectHeader);

            } else if (type === 'topic') {
                // Para filtrar por tópico, precisamos saber a matéria pai
                // Assumindo que a matéria já está no currentFilters.subject ou pode ser obtida da UI
                const currentSubjectFromFilter = currentFilters.subject; // Ou buscar da questão se necessário
                if(currentSubjectFromFilter) {
                    currentFilters.topic = value;
                    const topicLi = document.querySelector(`#category-filters .assuntos-sublist li[data-subject-name="${currentSubjectFromFilter}"][data-topic-name="${value}"]`);
                    if(topicLi) setActiveFilterUI(topicLi);
                } else {
                    console.warn("Não foi possível filtrar por tópico pois a matéria pai não está definida.");
                    return;
                }
            }
            currentViewingContext = { type: 'filter', name: `Filtro: ${currentFilters.subject} ${currentFilters.topic ? '> ' + currentFilters.topic : ''}` };
            fetchQuestions(); // Busca as questões com os novos filtros
        });
    });
}

function updateQuestionNumbers() {
    // ... (sua função updateQuestionNumbers)
    if(currentQNumEl) currentQNumEl.textContent = currentQuestions.length > 0 ? currentQuestionIndex + 1 : 0;
    if(totalQsEl) totalQsEl.textContent = currentQuestions.length;
}

if(submitAnswerBtn) {
    submitAnswerBtn.addEventListener('click', () => {
        // ... (sua lógica de submitAnswerBtn)
        if (selectedAnswer === null) {
            alert("Por favor, selecione uma alternativa.");
            return;
        }

        const q = currentQuestions[currentQuestionIndex];
        if (!q) {
            console.error("Nenhuma questão atual para submeter resposta.");
            return;
        }
        let isCorrectLocal; // Renomeado para evitar conflito com parâmetro antigo
        let correctAnswerValue = q.correctAnswer;

        if (q.type === 'multiple_choice') {
            isCorrectLocal = (selectedAnswer === correctAnswerValue);
        } else if (q.type === 'true_false') {
            // selectedAnswer é 0 para 'Certo' e 1 para 'Errado'
            // correctAnswerValue é true para 'Certo' e false para 'Errado'
            let selectedActualValue = (selectedAnswer === 0); // true se 'Certo' foi selecionado
            isCorrectLocal = (selectedActualValue === correctAnswerValue);
        }

        const newStatus = isCorrectLocal ? 'correct' : 'incorrect'; // ADICIONADO: determina o status com base na correção

        showFeedback(isCorrectLocal, q.correctAnswer, q.justification, q.type, q.options);
        if(q.id) saveUserAnswer(q.id, selectedAnswer, newStatus); // MODIFICADO: passa newStatus em vez de isCorrectLocal diretamente
        submitAnswerBtn.disabled = true; // Desabilita o botão após responder

    });
}

function showFeedback(isCorrect, correctAnswer, justification, type, options, isRestored = false) {
    // ... (sua função showFeedback, adaptada para `correctAnswer` ser o valor real para TF)
     if(!feedbackContainer) return;
    feedbackContainer.innerHTML = ''; // Limpa feedback anterior
    const title = document.createElement('h3');
    title.classList.add('feedback-title');

    if (isCorrect) {
        title.textContent = 'Você Acertou!';
        title.classList.add('correct');
        feedbackContainer.classList.add('correct-feedback');
        feedbackContainer.classList.remove('incorrect-feedback');
    } else {
        title.textContent = 'Você Errou!';
        title.classList.add('incorrect');
        feedbackContainer.classList.add('incorrect-feedback');
        feedbackContainer.classList.remove('correct-feedback');
    }
    feedbackContainer.appendChild(title);

    if (justification) {
        const justText = document.createElement('p');
        justText.classList.add('justification-text');
        justText.innerHTML = `<strong>Justificativa:</strong> ${justification}`;
        feedbackContainer.appendChild(justText);
    }

    const optionsLi = document.querySelectorAll('#question-container .options-list li');
    optionsLi.forEach((li, i) => {
        if (!isRestored) li.classList.remove('selected'); // Remove 'selected' apenas se não estiver restaurando

        let optionIsTheCorrectOne;
        if (type === 'multiple_choice') {
            optionIsTheCorrectOne = (i === correctAnswer); // correctAnswer é o índice
        } else if (type === 'true_false') {
            // correctAnswer é true (para Certo) ou false (para Errado)
            // i=0 é Certo, i=1 é Errado
            const optionValueAsBoolean = (i === 0);
            optionIsTheCorrectOne = (optionValueAsBoolean === correctAnswer);
        }

        if (optionIsTheCorrectOne) {
            li.classList.add('correct');
        }

        // Se a opção atual (li) foi a que o usuário selecionou (índice 'selectedAnswer') E estava errada
        if (i === selectedAnswer && !isCorrect) {
            li.classList.add('incorrect');
            if(isRestored) li.classList.add('selected'); // Mantém o visual de selecionado se restaurado
        }
        // Se a opção atual (li) foi a que o usuário selecionou E estava certa (já tratada pelo 'correct' acima)
        else if (i === selectedAnswer && isCorrect) {
             if(isRestored) li.classList.add('selected'); // Mantém o visual de selecionado se restaurado
        }
    });
}

async function saveUserAnswer(questionId, answerIndex, status) { // MODIFICADO: o terceiro parâmetro agora é 'status'
    if (!currentUser || (!currentQuestions.find(q => q.id === questionId) && status !== 'blank_navigation')) { // Ajuste para permitir 'blank_navigation'
        console.warn("saveUserAnswer: Usuário não logado ou questão atual não definida (e não é blank_navigation).");
        return;
    }

    // Tenta encontrar a questão no array currentQuestions. Se for 'blank_navigation', pode ser que currentQuestionIndex seja mais relevante.
    const questionData = currentQuestions.find(q => q.id === questionId) ||
                         (status === 'blank_navigation' && currentQuestions[currentQuestionIndex] && currentQuestions[currentQuestionIndex].id === questionId ? currentQuestions[currentQuestionIndex] : null);

    if (!questionData) {
        console.error("saveUserAnswer: Não foi possível obter dados da questão para salvar a resposta.", questionId);
        return;
    }

    const subject = questionData.subject;
    const topic = questionData.topic;
    let isCorrectFlag = (status === 'correct'); // Definir isCorrectFlag com base no status

    try {
        const answerRef = db.collection('userAnswers').doc(`${currentUser.uid}_${questionId}`);
        const answerDataToSave = {
            userId: currentUser.uid,
            questionId: questionId,
            selectedAnswer: status === 'blank' || status === 'blank_navigation' ? null : answerIndex, // Salva null se for em branco
            isCorrect: isCorrectFlag, // Usa a flag derivada do status
            status: status === 'blank_navigation' ? 'blank' : status, // Armazena o status ('correct', 'incorrect', 'blank')
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            subject: subject || "N/A",
            topic: topic || "N/A",
            answeredInContextType: currentViewingContext.type,
            answeredInContextId: currentViewingContext.id || null,
            answeredInContextName: currentViewingContext.name
        };
        await answerRef.set(answerDataToSave, { merge: true });
        userAnswersCache[questionId] = answerDataToSave;
        console.log("Resposta salva no Firestore:", answerDataToSave);

        if (subject) {
            // A função updateUserGlobalStats agora também precisa do status
            updateUserGlobalStats(status, subject, topic || "N/A"); // MODIFICADO: passar status

            if (currentViewingContext.type === 'notebook' && currentViewingContext.id) {
                const notebookStatsRef = db.collection('userNotebooks').doc(currentViewingContext.id);
                const notebookUpdate = {}; // Para os incrementos
                const saneSubject = subject.replace(/\./g, '_');

                console.log(`[saveUserAnswer - Caderno] Preparando para atualizar estatísticas do caderno. Status: ${status}`);

                // --- PREPARA OS INCREMENTOS para o caderno ---
                notebookUpdate['stats.totalAnswered'] = firebase.firestore.FieldValue.increment(1);
                notebookUpdate[`stats.subjects.${saneSubject}.total`] = firebase.firestore.FieldValue.increment(1);

                if (status === 'correct') {
                    notebookUpdate['stats.totalCorrect'] = firebase.firestore.FieldValue.increment(1);
                    notebookUpdate[`stats.subjects.${saneSubject}.correct`] = firebase.firestore.FieldValue.increment(1);
                } else if (status === 'blank' || status === 'blank_navigation') {
                    notebookUpdate['stats.totalBlank'] = firebase.firestore.FieldValue.increment(1);
                    notebookUpdate[`stats.subjects.${saneSubject}.blank`] = firebase.firestore.FieldValue.increment(1);
                }
                console.log(`[saveUserAnswer - Caderno] Campos para ATUALIZAR (incrementar) no caderno:`, JSON.stringify(notebookUpdate));

                try {
                    await db.runTransaction(async (transaction) => {
                        const notebookDoc = await transaction.get(notebookStatsRef);
                        let stats = {};

                        if (notebookDoc.exists && notebookDoc.data().stats) {
                            stats = notebookDoc.data().stats;
                        }

                        // Garante estrutura base para estatísticas do caderno
                        stats.totalAnswered = stats.totalAnswered || 0;
                        stats.totalCorrect = stats.totalCorrect || 0;
                        stats.totalBlank = stats.totalBlank || 0;

                        stats.subjects = stats.subjects || {};
                        stats.subjects[saneSubject] = stats.subjects[saneSubject] || {};
                        stats.subjects[saneSubject].total = stats.subjects[saneSubject].total || 0;
                        stats.subjects[saneSubject].correct = stats.subjects[saneSubject].correct || 0;
                        stats.subjects[saneSubject].blank = stats.subjects[saneSubject].blank || 0;
                        // Adicione 'topics' aqui se você rastreia no nível do caderno

                        transaction.set(notebookStatsRef, { stats: stats }, { merge: true });
                        transaction.update(notebookStatsRef, notebookUpdate);
                    });
                    console.log("[saveUserAnswer - Caderno] Estatísticas do caderno (transação) atualizadas com sucesso.");
                } catch (error) {
                    console.error("[saveUserAnswer - Caderno] ERRO na TRANSAÇÃO ao atualizar estatísticas do caderno: ", error);
                }
            }
        } else {
            console.warn("Não foi possível atualizar estatísticas pois a matéria da questão não está definida.");
        }

    } catch (error) {
        console.error("Erro ao salvar resposta ou atualizar estatísticas: ", error);
    }
}

// --- NAVEGAÇÃO ENTRE QUESTÕES ---
if(prevQBtn) {
    prevQBtn.addEventListener('click', () => {
        const currentQuestionForNavPrev = currentQuestions[currentQuestionIndex];
        if (currentQuestionForNavPrev && currentQuestionForNavPrev.id && !userAnswersCache[currentQuestionForNavPrev.id] && (submitAnswerBtn ? !submitAnswerBtn.disabled : true)) {
            console.log(`Questão ${currentQuestionForNavPrev.id} deixada em branco (navegação para anterior).`);
            saveUserAnswer(currentQuestionForNavPrev.id, null, 'blank_navigation');
            // if(submitAnswerBtn) submitAnswerBtn.disabled = true; // Opcional
        }
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex);
        }
    });
}
if(nextQBtn) {
    nextQBtn.addEventListener('click', () => {
        const currentQuestionForNav = currentQuestions[currentQuestionIndex];
        // Verifica se a questão atual existe, tem um ID, ainda não foi respondida (não está no cache),
        // e o botão de submeter não está desabilitado (ou seja, o feedback ainda não foi mostrado para ela)
        if (currentQuestionForNav && currentQuestionForNav.id && !userAnswersCache[currentQuestionForNav.id] && (submitAnswerBtn ? !submitAnswerBtn.disabled : true) ) {
            console.log(`Questão ${currentQuestionForNav.id} deixada em branco (navegação para próxima).`);
            // Chama saveUserAnswer com status 'blank_navigation'. Este status será normalizado para 'blank' dentro de saveUserAnswer.
            // O 'answerIndex' é null pois não houve seleção.
            saveUserAnswer(currentQuestionForNav.id, null, 'blank_navigation');
            // Opcional: desabilitar o botão de submissão para a questão que foi marcada como em branco
            // if(submitAnswerBtn) submitAnswerBtn.disabled = true;
        }
        if (currentQuestionIndex < currentQuestions.length - 1) {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        } else {
            // Opcional: alertar ou ir para estatísticas/fim do caderno
            if (currentViewingContext.type === 'notebook') {
                alert("Fim das questões do caderno!");
                // Talvez mostrar estatísticas do caderno: showStatsView(`notebook_${currentViewingContext.id}`);
            } else {
                alert("Fim das questões filtradas!");
            }
        }
    });
}

// --- FAVORITOS ---
// (Suas funções fetchUserFavorites, favoriteBtn listener, checkIfFavorited, displayFavoriteQuestions)

// Imports do Firebase Firestore (garanta que você os tem no topo do seu arquivo)
// import { doc, getDoc, arrayUnion, arrayRemove, updateDoc } from "firebase/firestore";
// import { db, auth } from './firebase-config'; // Ou como quer que você inicialize 'db' e 'auth'

// Certifique-se de que userFavoritesCache está definido em algum lugar acessível,
// por exemplo: let userFavoritesCache = new Set();

async function fetchUserFavorites() {
    console.log("[fetchUserFavorites] Iniciando busca de favoritos...");

    const user = auth.currentUser;

    if (!user || !user.uid) {
        console.warn("[fetchUserFavorites] Usuário não autenticado ou UID indisponível. Limpando cache de favoritos.");
        if (typeof userFavoritesCache !== 'undefined') {
            userFavoritesCache.clear();
        }
        return;
    }

    console.log("[fetchUserFavorites] Tentando buscar favoritos para UID:", user.uid);

    try {
        // SDK v8: Acessa o documento diretamente usando os métodos de 'db'
        const userDocRef = db.collection("users").doc(user.uid); // <<< MUDANÇA AQUI
        console.log("[fetchUserFavorites] Referência do documento:", userDocRef.path);

        const docSnap = await userDocRef.get(); // <<< MUDANÇA AQUI (usa o método .get() da referência)

        if (docSnap.exists && docSnap.data().favorites) { // .exists é uma propriedade, não uma função na v8 para DocumentSnapshot
            userFavoritesCache = new Set(docSnap.data().favorites);
            console.log("[fetchUserFavorites] Favoritos do usuário carregados:", Array.from(userFavoritesCache));
        } else {
            if (typeof userFavoritesCache !== 'undefined') {
                userFavoritesCache.clear();
            }
            if (!docSnap.exists) {
                console.log("[fetchUserFavorites] Documento do perfil do usuário não encontrado em:", userDocRef.path);
            } else { // docSnap.exists é true, mas docSnap.data().favorites não existe ou é falsy
                console.log("[fetchUserFavorites] Campo 'favorites' não encontrado no documento do usuário. Perfil Data:", docSnap.data());
            }
        }

        console.log("[fetchUserFavorites] Verificando condições para checkIfFavorited:");
        console.log("  typeof currentQuestions:", typeof currentQuestions, "length:", typeof currentQuestions !== 'undefined' ? currentQuestions.length : 'N/A');
        console.log("  typeof currentQuestionIndex:", typeof currentQuestionIndex, "value:", currentQuestionIndex);
        if (typeof currentQuestions !== 'undefined' && typeof currentQuestionIndex !== 'undefined' && currentQuestions.length > 0 && currentQuestionIndex < currentQuestions.length) { // Adicionada verificação de currentQuestionIndex < length
            console.log("  currentQuestions[currentQuestionIndex]:", currentQuestions[currentQuestionIndex]);
            if (currentQuestions[currentQuestionIndex]) {
                console.log("  currentQuestions[currentQuestionIndex].id:", currentQuestions[currentQuestionIndex].id);
            }
        } else if (typeof currentQuestions !== 'undefined') { // Log adicional se currentQuestions existir mas o índice for inválido
            console.log("  currentQuestionIndex pode estar fora dos limites ou currentQuestions vazio.");
        }
        console.log("  typeof checkIfFavorited:", typeof checkIfFavorited);

        if (typeof currentQuestions !== 'undefined' && currentQuestions.length > 0 &&
            typeof currentQuestionIndex !== 'undefined' && currentQuestionIndex < currentQuestions.length &&
            currentQuestions[currentQuestionIndex] && typeof currentQuestions[currentQuestionIndex].id !== 'undefined' &&
            typeof checkIfFavorited === 'function') {
            checkIfFavorited(currentQuestions[currentQuestionIndex].id);
        } else {
            console.warn("[fetchUserFavorites] currentQuestions, currentQuestionIndex ou checkIfFavorited não estão prontos.");
        }

    } catch (error) {
        console.error("[fetchUserFavorites] Erro ao buscar favoritos do usuário:", error);
        if (error.code) {
            console.error("[fetchUser_favorites] Código do Erro Firebase:", error.code);
            console.error("[fetchUser_favorites] Mensagem do Erro Firebase:", error.message);
        }
        if (typeof userFavoritesCache !== 'undefined') {
            userFavoritesCache.clear();
        }
    }
}

// Garanta que 'db', 'auth', 'currentUser', 'currentQuestions', 'currentQuestionIndex',
// 'userFavoritesCache', e 'favoriteBtn' estejam definidos e acessíveis neste escopo.
// Garanta que 'firebase.firestore.FieldValue' esteja disponível.

if (favoriteBtn) {
    favoriteBtn.addEventListener('click', async () => {
        if (!currentUser || !currentUser.uid) {
            alert("Usuário não logado. Por favor, faça login para favoritar questões.");
            return;
        }
        if (!currentQuestions || !currentQuestions[currentQuestionIndex] || !currentQuestions[currentQuestionIndex].id) {
            alert("Nenhuma questão selecionada para favoritar.");
            return;
        }

        const questionId = currentQuestions[currentQuestionIndex].id;
        // SDK v8: Acessa a referência do documento
        const userDocRef = db.collection("users").doc(currentUser.uid); // Caminho corrigido

        console.log(`[FAVORITAR] Tentando atualizar favorito para questão: ${questionId}, Usuário: ${currentUser.uid}`);
        console.log(`[FAVORITAR] Referência do documento: ${userDocRef.path}`);

        try {
            // 'firebase.firestore.FieldValue' é o jeito da SDK v8
            const FieldValue = firebase.firestore.FieldValue;

            if (userFavoritesCache.has(questionId)) {
                console.log(`[FAVORITAR] Desfavoritando questão ${questionId}...`);
                await userDocRef.update({
                    favorites: FieldValue.arrayRemove(questionId)
                });
                userFavoritesCache.delete(questionId);
                favoriteBtn.textContent = 'Favoritar ☆';
                favoriteBtn.classList.remove('favorited');
                console.log(`[FAVORITAR] Questão ${questionId} desfavoritada com sucesso.`);
            } else {
                console.log(`[FAVORITAR] Favoritando questão ${questionId}...`);

                // Lógica revisada para adicionar (SDK v8)
                const userDocSnap = await userDocRef.get(); // Obter o documento primeiro
                if (!userDocSnap.exists) {
                    console.log(`[FAVORITAR] Documento do usuário não existe. Criando com o primeiro favorito: ${questionId}`);
                    await userDocRef.set({ // Cria o documento
                        favorites: [questionId]
                        // Adicione outros campos de perfil aqui se necessário, ex:
                        // nome: currentUser.displayName || "Usuário Anônimo",
                        // email: currentUser.email || ""
                    });
                } else {
                    // Documento existe, então use update com arrayUnion
                    console.log(`[FAVORITAR] Documento do usuário existe. Usando arrayUnion para adicionar: ${questionId}`);
                    await userDocRef.update({
                        favorites: FieldValue.arrayUnion(questionId)
                    });
                }

                userFavoritesCache.add(questionId);
                favoriteBtn.textContent = 'Favoritado ★';
                favoriteBtn.classList.add('favorited');
                console.log(`[FAVORITAR] Questão ${questionId} favoritada com sucesso.`);
            }
        } catch (error) {
            console.error("Erro ao atualizar favorito:", error);
            if (error.code) {
                console.error("[FAVORITAR] Código do Erro Firebase:", error.code);
                console.error("[FAVORITAR] Mensagem do Erro Firebase:", error.message);
            }
            alert("Erro ao processar favorito. Verifique o console para detalhes.");
        }
    });
}

function checkIfFavorited(questionId) {
    if (!favoriteBtn) return; // Se o botão não existe na view atual
    if (userFavoritesCache.has(questionId)) {
        favoriteBtn.textContent = 'Favoritado ★';
        favoriteBtn.classList.add('favorited');
    } else {
        favoriteBtn.textContent = 'Favoritar ☆';
        favoriteBtn.classList.remove('favorited');
    }
}

async function displayFavoriteQuestions() {
    console.log("[displayFavoriteQuestions] Iniciando. Cache de favoritos:", Array.from(userFavoritesCache)); // LOG 1
    if (!currentUser) {
        alert("Por favor, faça login para ver suas questões favoritas.");
        return;
    }
    console.log("Tentando exibir a view de listagem de favoritas..."); // Seu log original

    // Referências aos elementos da view de listagem de favoritas
    const favoritesViewEl = document.getElementById('favorites-listing-view');
    const favoritesContainerEl = document.getElementById('favorites-listing-container');
    // As constantes globais que você mencionou (ou obtenha-as aqui se não forem globais)
    // const questionViewEl = document.getElementById('question-view');
    // const statsViewEl = document.getElementById('stats-view');
    // const addQuestionViewEl = document.getElementById('add-question-view');
    // const forumViewEl = document.getElementById('forum-view');

    if (!favoritesViewEl || !favoritesContainerEl) {
        console.error("[displayFavoriteQuestions] Elementos da view de listagem de favoritas (favorites-listing-view ou favorites-listing-container) não encontrados no HTML."); // LOG 2
        // A lógica abaixo tenta usar 'questionContainer', que não foi definido nesta função.
        // Você pode querer mostrar o erro em um local mais genérico ou garantir que 'questionContainer' seja acessível.
        // if (questionContainer) {
        //     questionContainer.innerHTML = "<p>Erro ao configurar a visualização de favoritas. Verifique o console.</p>";
        // }
        alert("Erro ao configurar a visualização de favoritas. Verifique o console do desenvolvedor.");
        return;
    }

    // Esconder outras views principais e mostrar a de listagem de favoritas
    if (typeof questionViewEl !== 'undefined' && questionViewEl) questionViewEl.classList.add('hidden');
    if (typeof statsViewEl !== 'undefined' && statsViewEl) statsViewEl.classList.add('hidden');
    if (typeof addQuestionViewEl !== 'undefined' && addQuestionViewEl) addQuestionViewEl.classList.add('hidden');
    if (typeof forumViewEl !== 'undefined' && forumViewEl) forumViewEl.classList.add('hidden');
    
    favoritesViewEl.classList.remove('hidden');
    console.log("[displayFavoriteQuestions] View de favoritas tornada visível."); // LOG 3
    favoritesContainerEl.innerHTML = '<li>Carregando suas questões favoritas...</li>';

    if (userFavoritesCache.size === 0) {
        console.log("[displayFavoriteQuestions] Cache de favoritos VAZIO."); // LOG 4
        favoritesContainerEl.innerHTML = '<li>Você ainda não favoritou nenhuma questão.</li>';
        return;
    }

    // Atualiza o contexto de visualização e o breadcrumb
    if (typeof currentViewingContext !== 'undefined') {
        currentViewingContext = { type: 'favorites_list', name: 'Minhas Favoritas' };
    }
    if (typeof breadcrumb !== 'undefined' && breadcrumb) {
        breadcrumb.textContent = "Questões > Minhas Favoritas";
    }


    try {
        const favoriteIds = Array.from(userFavoritesCache);
        console.log("[displayFavoriteQuestions] IDs a serem buscados:", favoriteIds); // LOG 5
        
        // Certifique-se de que 'db' é sua instância do Firestore (SDK v8)
        const questionPromises = favoriteIds.map(qId => db.collection('questions').doc(qId).get());
        const questionDocs = await Promise.all(questionPromises);
        console.log("[displayFavoriteQuestions] Documentos brutos recebidos do Firestore:", questionDocs.length, "documentos."); // LOG 6

        const favoriteQuestionsData = questionDocs
            .filter(doc => {
                if (!doc.exists) { // Lembre-se: 'exists' é uma propriedade na SDK v8
                    console.warn(`[displayFavoriteQuestions] Documento com ID ${doc.id} não existe no Firestore.`); // LOG 7a
                }
                return doc.exists; // 'exists' é uma propriedade
            })
            .map(doc => ({ id: doc.id, ...doc.data() }));
        
        console.log("[displayFavoriteQuestions] Dados das questões favoritas processados:", favoriteQuestionsData.length, "questões.", favoriteQuestionsData); // LOG 8

        if (favoriteQuestionsData.length === 0) {
            console.log("[displayFavoriteQuestions] Nenhuma questão favorita encontrada nos dados processados (podem ter sido removidas)."); // LOG 9
            favoritesContainerEl.innerHTML = '<li>Nenhuma questão favorita encontrada (talvez tenham sido removidas ou não existem mais).</li>';
            return;
        }

        favoritesContainerEl.innerHTML = ''; // Limpa o "Carregando..."
        const ul = document.createElement('ul');
        // Adicione uma classe à UL se você tiver estilos específicos, por exemplo:
        // ul.className = 'favorites-listing-ul'; 

        favoriteQuestionsData.forEach(q => {
            const li = document.createElement('li');
            li.classList.add('favorite-item-li'); // Use suas classes CSS existentes
            
            // Constrói o HTML interno do item da lista
            // Trata campos que podem não existir para evitar 'undefined' no HTML
            const statementHTML = q.statement ? q.statement.substring(0, 200) + (q.statement.length > 200 ? '...' : '') : 'Enunciado indisponível';
            const subjectHTML = q.subject || 'N/A';
            const topicHTML = q.topic || 'N/A';

            li.innerHTML = `
                <p class="favorite-item-statement">${statementHTML}</p>
                <p class="favorite-item-meta">Matéria: ${subjectHTML} | Assunto: ${topicHTML}</p>
                <button class="view-single-favorite-btn" data-question-id="${q.id}">Ver Questão Completa</button>
            `;
            // console.log("[displayFavoriteQuestions] Criando item de lista para:", q.id); // LOG 10 (pode ser muito verboso, descomente se necessário)
            ul.appendChild(li);
        });
        favoritesContainerEl.appendChild(ul);
        console.log("[displayFavoriteQuestions] Lista de favoritas adicionada ao DOM."); // LOG 11

        // Adicionar listeners aos botões "Ver Questão Completa"
        ul.querySelectorAll('.view-single-favorite-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const questionIdToView = btn.dataset.questionId;
                console.log(`[displayFavoriteQuestions] Botão 'Ver Questão Completa' clicado para ID: ${questionIdToView}`); // Log do clique no botão
                const questionData = favoriteQuestionsData.find(qData => qData.id === questionIdToView);
                
                if (questionData) {
                    currentQuestions = [questionData]; // Não precisa do typeof se currentQuestions é uma variável global já declarada
                    currentQuestionIndex = 0;          // Mesmo para currentQuestionIndex
                    currentViewingContext = {          // Mesmo para currentViewingContext
                        type: 'single_favorite', 
                        id: questionIdToView, 
                        name: `Favorita: ${(questionData.statement ? questionData.statement.substring(0,30) : 'Detalhe')}...` 
                    };

                    // Mudar para a view de questão usando a função centralizada showMainContentView
                    // Supondo que 'questionViewEl' é a referência correta para a sua principal área de exibição de questões.
                    // 'questionViewEl' deve ser a mesma constante que você usa no objeto 'contentViews'.
                    // Se você tem 'questionView' como constante global para o elemento, use-a.
                    const mainQuestionDisplayArea = document.getElementById('question-view'); // Ou use sua constante global questionView / questionViewEl
                    showMainContentView(mainQuestionDisplayArea); // Mostra a área de questão e esconde as outras (como favorites-listing-view)

                    // Opcional: Mudar o item ativo na sidebar para "Questões" se fizer mais sentido UX
                    // const questionsSidebarButton = document.getElementById('nav-item-questions');
                    // if (questionsSidebarButton) {
                    //     setActiveSidebarItem(questionsSidebarButton); // Atualiza o destaque na sidebar
                    // }

                    if (breadcrumb) { // Não precisa do typeof se breadcrumb é uma variável global já declarada
                        breadcrumb.textContent = `Questões > Favoritas > Detalhe`;
                    }
                    
                    if (typeof displayQuestion === 'function') { // Esta verificação é boa
                        displayQuestion(currentQuestionIndex);
                    } else {
                        console.error("[displayFavoriteQuestions] Função displayQuestion não está definida!");
                    }
                } else {
                    console.warn(`[displayFavoriteQuestions] Questão favorita com ID ${questionIdToView} não encontrada nos dados carregados ao tentar ver detalhes.`);
                }
            });
        });

    } catch (error) {
        console.error("[displayFavoriteQuestions] Erro no bloco try/catch principal:", error); // LOG 12
        if (error.code) { // Adiciona detalhes do erro do Firebase, se houver
            console.error("[displayFavoriteQuestions] Código do Erro Firebase:", error.code);
            console.error("[displayFavoriteQuestions] Mensagem do Erro Firebase:", error.message);
        }
        if (favoritesContainerEl) { // Garante que o container existe antes de tentar modificar
            favoritesContainerEl.innerHTML = '<li>Ocorreu um erro ao carregar suas favoritas. Tente novamente ou verifique o console.</li>';
        }
    }
}

const btnBackFromFavorites = document.getElementById('back-to-questions-from-favorites-btn');
if (btnBackFromFavorites) {
    btnBackFromFavorites.addEventListener('click', () => {
        // const favoritesViewEl = document.getElementById('favorites-listing-view'); // Já referenciado como contentViews['tab-favorites']
        // const questionViewEl = document.getElementById('question-view'); // Já referenciado como contentViews['tab-questions']

        // Ao voltar da lista de favoritas, provavelmente queremos voltar para a aba "Questões"
        const questionsTabButton = document.getElementById('tab-questions');
        if (questionsTabButton) {
            questionsTabButton.click(); // Simula o clique na aba Questões para reativá-la e carregar seu conteúdo
        } else {
            // Fallback se o botão da aba não for encontrado
            if (contentViews['tab-favorites']) contentViews['tab-favorites'].classList.add('hidden');
            if (contentViews['tab-questions']) contentViews['tab-questions'].classList.remove('hidden');
            currentViewingContext = { type: 'general', id: null, name: 'Todas as Questões' };
            fetchQuestions(currentFilters);
        }
    });
}

// --- ADICIONAR QUESTÕES ---
// (Seus listeners e funções para adicionar questão: showAddQuestionBtn, addQType, submitNewQuestionBtn)
if(showAddQuestionBtn) showAddQuestionBtn.addEventListener('click', () => { /* ... */ });
if(addQType) addQType.addEventListener('change', function() { /* ... */ });
if(submitNewQuestionBtn) submitNewQuestionBtn.addEventListener('click', async () => { /* ... */ });

async function updateUserGlobalStats(status, subject, topic) {
    if (!currentUser || !subject || !topic) {
        console.warn("updateUserGlobalStats: Parâmetros inválidos ou usuário não logado.", { currentUser, subject, topic });
        return;
    }

    const userStatsRef = db.collection('users').doc(currentUser.uid);
    const increment = firebase.firestore.FieldValue.increment(1);
    const fieldsToUpdate = {}; // Objeto para os incrementos

    console.log(`[updateUserGlobalStats] Recebido - Status: ${status}, Matéria: ${subject}, Tópico: ${topic}`);

    const saneSubject = subject.replace(/\./g, '_');
    const saneTopic = topic.replace(/\./g, '_');

    // --- PREPARA OS INCREMENTOS ---
    fieldsToUpdate[`stats.totalAnswered`] = increment;
    fieldsToUpdate[`stats.subjects.${saneSubject}.total`] = increment;
    fieldsToUpdate[`stats.topics.${saneSubject}.${saneTopic}.total`] = increment;

    if (status === 'correct') {
        fieldsToUpdate[`stats.totalCorrect`] = increment;
        fieldsToUpdate[`stats.subjects.${saneSubject}.correct`] = increment;
        fieldsToUpdate[`stats.topics.${saneSubject}.${saneTopic}.correct`] = increment;
    } else if (status === 'blank') {
        fieldsToUpdate[`stats.totalBlank`] = increment;
        fieldsToUpdate[`stats.subjects.${saneSubject}.blank`] = increment;
        fieldsToUpdate[`stats.topics.${saneSubject}.${saneTopic}.blank`] = increment;
    }

    console.log("[updateUserGlobalStats] Campos para ATUALIZAR (incrementar):", JSON.stringify(fieldsToUpdate));

    try {
        // --- TRANSAÇÃO PARA LER, GARANTIR E ATUALIZAR ---
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userStatsRef);
            let stats = {}; // Objeto stats padrão/inicial

            if (userDoc.exists && userDoc.data().stats) {
                stats = userDoc.data().stats; // Pega stats existentes
            }

            // Garante que os campos numéricos de primeiro nível existem em 'stats'
            // Se não existirem, serão inicializados com 0 ANTES do incremento ser aplicado pelo 'update'
            // Esta inicialização manual é feita porque FieldValue.increment(1) em um campo não existente
            // o define como 1, mas não queremos depender disso para a *existência* inicial dos campos
            // que displayUserPerformance espera.
            stats.totalAnswered = stats.totalAnswered || 0;
            stats.totalCorrect = stats.totalCorrect || 0;
            stats.totalBlank = stats.totalBlank || 0;

            // Garante a estrutura para subjects
            stats.subjects = stats.subjects || {};
            stats.subjects[saneSubject] = stats.subjects[saneSubject] || {};
            stats.subjects[saneSubject].total = stats.subjects[saneSubject].total || 0;
            stats.subjects[saneSubject].correct = stats.subjects[saneSubject].correct || 0;
            stats.subjects[saneSubject].blank = stats.subjects[saneSubject].blank || 0;

            // Garante a estrutura para topics
            stats.topics = stats.topics || {};
            stats.topics[saneSubject] = stats.topics[saneSubject] || {};
            stats.topics[saneSubject][saneTopic] = stats.topics[saneSubject][saneTopic] || {};
            stats.topics[saneSubject][saneTopic].total = stats.topics[saneSubject][saneTopic].total || 0;
            stats.topics[saneSubject][saneTopic].correct = stats.topics[saneSubject][saneTopic].correct || 0;
            stats.topics[saneSubject][saneTopic].blank = stats.topics[saneSubject][saneTopic].blank || 0;

            // Primeiro, garante que a estrutura base exista com .set e merge
            // Isso é importante se o objeto 'stats' ou sub-objetos não existirem de todo.
            transaction.set(userStatsRef, { stats: stats }, { merge: true });

            // Em seguida, aplica os incrementos específicos.
            // O Firestore lida com a criação do campo com o valor do incremento se o caminho exato não existir.
            transaction.update(userStatsRef, fieldsToUpdate);
        });

        console.log(`Estatísticas GLOBAIS do usuário (transação) atualizadas para status '${status}': ${saneSubject}, ${saneTopic}`);
        userStatsData = null; // Força recarregar na próxima visualização
    } catch (error) {
        console.error(`Erro Crítico na TRANSAÇÃO ao atualizar estatísticas GLOBAIS (status: ${status}) do usuário: `, error);
    }
}

// --- ESTATÍSTICAS ---
// Função principal para mostrar a view de estatísticas
async function showStatsView(contextIdentifier = 'user_general') { // 'user_general', 'notebook_XYZ', 'platform_global'
    if (!statsView || !currentUser) return;

    questionView.classList.add('hidden');
    addQuestionView.classList.add('hidden');
    forumView.classList.add('hidden');
    statsView.classList.remove('hidden');
    statsComparisonContainerEl.classList.remove('hidden'); // Mostrar container de comparação

    const userStatsFiltersEl = document.getElementById('user-stats-filters');
    const statsTitleEl = statsView.querySelector('h2');

    // Limpar gráficos anteriores
    if (geralChartInstance) geralChartInstance.destroy();
    if (globalCompareChartInstance) globalCompareChartInstance.destroy();
    if (dificuldadeChartInstance) dificuldadeChartInstance.destroy(); // Se for usar

    let statsDataSource; // Objeto com { totalAnswered, totalCorrect, subjects: {...} }
    let contextName = "Geral (Minhas Estatísticas)";
    let comparisonData = null; // Para "Demais Usuários"

    if (contextIdentifier.startsWith('notebook_')) {
        const notebookId = contextIdentifier.split('_')[1];
        const notebook = userNotebooks.find(nb => nb.id === notebookId);
        // ... (lógica para statsDataSource e contextName) ...

        // Obter dados de comparação (outros usuários) para o caderno
        const qIds = notebook ? (notebook.questionIds || []) : [];
        comparisonData = await getAggregatedStatsForQuestions(qIds, currentUser.uid); // Dados dos outros usuários

        if (userStatsFiltersEl) userStatsFiltersEl.classList.remove('hidden'); // Mostra filtros de matéria/assunto DENTRO do caderno

        // Popula filtros de matéria/assunto com base no statsDataSource DO USUÁRIO para este caderno
        populateStatsFilters(statsDataSource, statsSubjectFilter, statsTopicFilter);
        // Exibe estatísticas DO USUÁRIO filtradas (ou todas se nenhum filtro aplicado)
        displayUserPerformance(statsDataSource, "", "");

        if (applyUserStatsFilterBtn) {
            applyUserStatsFilterBtn.onclick = () => {
                displayUserPerformance(statsDataSource, statsSubjectFilter.value, statsTopicFilter.value);
                // Atualizar também o gráfico de comparação global e o indicador de dificuldade se os filtros mudarem
                if (comparisonData) {
                    displayGlobalComparisonPerformance(comparisonData, statsSubjectFilter.value, statsTopicFilter.value); // Passa filtros atuais
                    // Recalcular e exibir dificuldade com base nos filtros aplicados se necessário,
                    // ou manter a dificuldade geral do caderno. Por simplicidade, vamos manter a geral.
                }
            };
        }
        
        if (globalPerformanceTitleEl && comparisonData) { // Ajusta título do gráfico de comparação
             globalPerformanceTitleEl.textContent = `Média Demais Usuários (${notebook.notebookName || 'Caderno'})`;
        }


        // >>> ADICIONE/MODIFIQUE ESTA SEÇÃO PARA O INDICADOR DE DIFICULDADE <<<
        const difficultyContainerEl = document.getElementById('notebook-difficulty-indicator-container');
        const difficultyTextEl = document.getElementById('notebook-difficulty-text');

        if (comparisonData && difficultyContainerEl && difficultyTextEl) {
            // comparisonData.totalCorrect é o total de acertos dos OUTROS usuários no caderno
            // comparisonData.totalAnswered é o total de respostas (corretas+incorretas+em branco) dos OUTROS usuários no caderno
            const communityCorrect = comparisonData.totalCorrect || 0;
            const communityTotalAttempted = comparisonData.totalAnswered || 0;

            let difficultyLevelText = 'Dados Insuficientes'; // Padrão
            let difficultyClass = 'difficulty-unknown';  // Padrão

            // Só calcula a dificuldade se houver um número mínimo de tentativas da comunidade (ex: 5)
            // Isso evita classificações baseadas em pouquíssimas respostas.
            if (communityTotalAttempted >= 1) { // Ajuste este limite conforme necessário (ex: 5, 10)
                const communityCorrectPercentage = (communityCorrect / communityTotalAttempted) * 100;

                if (communityCorrectPercentage > 75) {
                    difficultyLevelText = 'Fácil';
                    difficultyClass = 'difficulty-facil';
                } else if (communityCorrectPercentage >= 50) { // 50–75%
                    difficultyLevelText = 'Médio';
                    difficultyClass = 'difficulty-medio';
                } else if (communityCorrectPercentage >= 25) { // 25–49%
                    difficultyLevelText = 'Difícil';
                    difficultyClass = 'difficulty-dificil';
                } else { // < 25%
                    difficultyLevelText = 'Muito Difícil';
                    difficultyClass = 'difficulty-muito-dificil';
                }
            }

            difficultyTextEl.textContent = difficultyLevelText;
            difficultyTextEl.className = ''; // Limpa classes anteriores de dificuldade
            difficultyTextEl.classList.add(difficultyClass); // Adiciona a nova classe de dificuldade
            difficultyContainerEl.classList.remove('hidden'); // Mostra o contêiner do indicador
        } else if (difficultyContainerEl) {
            difficultyContainerEl.classList.add('hidden'); // Esconde se não há dados ou elementos
        }
        // >>> FIM DA SEÇÃO DO INDICADOR DE DIFICULDADE <<<

        // Exibe o gráfico de desempenho global (outros usuários)
        if (comparisonData) {
            statsComparisonContainerEl.classList.remove('hidden'); // Mostra o container de comparação global
            displayGlobalComparisonPerformance(comparisonData, statsSubjectFilter.value, statsTopicFilter.value);
        } else {
             const globalCompareCanvas = document.getElementById('globalCompareChart');
             if (globalCompareCanvas) {
                const context = globalCompareCanvas.getContext('2d');
                if (globalCompareChartInstance) globalCompareChartInstance.destroy();
                context.clearRect(0, 0, globalCompareCanvas.width, globalCompareCanvas.height);
             }
             // Poderia adicionar uma mensagem de "dados de comparação indisponíveis"
             if (statsComparisonContainerEl) statsComparisonContainerEl.classList.add('hidden'); // Esconde se não há dados
        }


    } else { // Se o contexto NÃO é um caderno (ex: 'user_general' ou 'platform_global')
        // Esconder o indicador de dificuldade do caderno
        const difficultyContainerEl = document.getElementById('notebook-difficulty-indicator-container');
        if (difficultyContainerEl) {
            difficultyContainerEl.classList.add('hidden');
        }
        // ... (resto da lógica para 'user_general')
        if (userStatsFiltersEl) userStatsFiltersEl.classList.remove('hidden'); // Mostrar filtros para estatísticas gerais do usuário

        // Lógica para buscar dados de comparação globais da plataforma se necessário
        const globalSummaryDoc = await db.collection('globalPlatformStats').doc('summary').get();
        if (globalSummaryDoc.exists) {
            comparisonData = globalSummaryDoc.data();
        }
        if (globalPerformanceTitleEl) globalPerformanceTitleEl.textContent = `Média Demais Usuários (Plataforma)`;


        if (comparisonData) {
            statsComparisonContainerEl.classList.remove('hidden');
            displayGlobalComparisonPerformance(comparisonData, statsSubjectFilter.value, statsTopicFilter.value);
        } else {
            if (statsComparisonContainerEl) statsComparisonContainerEl.classList.add('hidden');
        }
    }

    if (statsTitleEl) statsTitleEl.textContent = `Desempenho: ${contextName}`;
    if (userPerformanceTitleEl) userPerformanceTitleEl.textContent = `Meu Desempenho (${contextName})`;


    if (!statsDataSource) {
         document.getElementById('general-stats').innerHTML = "<p>Nenhuma estatística disponível para este contexto.</p>";
        if (document.getElementById('subject-performance')) document.getElementById('subject-performance').innerHTML = '';
        return;
    }

    // Popular filtros de matéria/assunto com base no statsDataSource
    populateStatsFilters(statsDataSource, statsSubjectFilter, statsTopicFilter); // Adaptar esta função

    // Exibir estatísticas filtradas (ou todas se nenhum filtro aplicado)
    displayUserPerformance(statsDataSource, "", ""); // Inicialmente sem filtros internos

    if (applyUserStatsFilterBtn) { // Botão para aplicar filtro DENTRO do contexto de stats (geral ou caderno)
        applyUserStatsFilterBtn.onclick = () => {
            displayUserPerformance(statsDataSource, statsSubjectFilter.value, statsTopicFilter.value);
        };
    }

    // Exemplo de como o gráfico de comparação poderia ser (mockup)
    // A lógica real para getGlobalStatsForContext precisaria ser robusta
    if (contextIdentifier.startsWith('notebook_')) {
        const qIds = userNotebooks.find(nb => nb.id === contextIdentifier.split('_')[1])?.questionIds || [];
        comparisonData = await getAggregatedStatsForQuestions(qIds, currentUser.uid); // Passa IDs das questões e ID do usuário atual para excluir
        if (globalPerformanceTitleEl) globalPerformanceTitleEl.textContent = `Média Demais Usuários (Caderno)`;
    } else { // Geral
        // comparisonData = await getGlobalPlatformWideStats(); // Estatísticas de todos os usuários, todas questões
        // Esta função é complexa, usaremos o globalPlatformStats/summary por enquanto para simplificar
        const globalSummaryDoc = await db.collection('globalPlatformStats').doc('summary').get();
        if (globalSummaryDoc.exists) {
            comparisonData = globalSummaryDoc.data(); // Assume que tem totalAnswered, totalCorrect, subjects...
        }
        if (globalPerformanceTitleEl) globalPerformanceTitleEl.textContent = `Média Demais Usuários (Plataforma)`;

    }

    if (comparisonData) {
        displayGlobalComparisonPerformance(comparisonData, statsSubjectFilter.value, statsTopicFilter.value); // Passa filtros atuais para o global tbm
    } else {
         document.getElementById('global-performance-chart-container').querySelector('canvas').getContext('2d').clearRect(0,0,300,150); // Limpa
         document.getElementById('global-performance-chart-container').insertAdjacentHTML('beforeend', '<p>Dados de comparação indisponíveis.</p>');
    }
}

if (applyStatsContextBtn) { // Botão para carregar o contexto (Geral ou Caderno X)
    applyStatsContextBtn.addEventListener('click', () => {
        const selectedContext = statsContextTypeSelect.value;
        showStatsView(selectedContext);
    });
}


// Função para popular os filtros de matéria/assunto na tela de ESTATÍSTICAS
function populateStatsFilters(statsSource, subjectFilterEl, topicFilterEl) {
    if (!subjectFilterEl || !topicFilterEl || !statsSource || !statsSource.subjects) {
        subjectFilterEl.innerHTML = '<option value="">Todas as Matérias</option>';
        topicFilterEl.innerHTML = '<option value="">Todos os Assuntos</option>';
        return;
    }

    subjectFilterEl.innerHTML = '<option value="">Todas as Matérias</option>';
    topicFilterEl.innerHTML = '<option value="">Todos os Assuntos</option>';

    const subjectsInStats = Object.keys(statsSource.subjects).sort();
    subjectsInStats.forEach(subjectKey => { // subjectKey pode ser 'Matematica' ou 'Matematica_com_acento'
        const option = document.createElement('option');
        option.value = subjectKey;
        option.textContent = subjectKey.replace(/_/g, '.'); // Reverte sanitização para display
        subjectFilterEl.appendChild(option);
    });

    subjectFilterEl.onchange = () => {
        topicFilterEl.innerHTML = '<option value="">Todos os Assuntos</option>';
        const selectedSubjectKey = subjectFilterEl.value;
        // Para popular tópicos, precisaríamos da estrutura `statsSource.topics[selectedSubjectKey]`
        // Se você salvou tópicos em `stats.users.{uid}.stats.topics.{saneSubject}.{saneTopic}`
        // ou `stats.notebooks.{notebookId}.stats.topics.{saneSubject}.{saneTopic}`
        // Por ora, vamos manter simples e não popular sub-tópicos aqui, a menos que `statsSource.topics` exista
        if (selectedSubjectKey && statsSource.topics && statsSource.topics[selectedSubjectKey]) {
            const topicsInSubject = Object.keys(statsSource.topics[selectedSubjectKey]).sort();
            topicsInSubject.forEach(topicKey => {
                const topicOption = document.createElement('option');
                topicOption.value = topicKey;
                topicOption.textContent = topicKey.replace(/_/g, '.');
                topicFilterEl.appendChild(topicOption);
            });
        }
    };
}

// Exibe o desempenho DO USUÁRIO LOGADO (gráfico geral + lista por matéria/assunto)
function displayUserPerformance(statsData, subjectFilterKey, topicFilterKey) {
    if (!statsData) {
        // Limpa o canvas e a área de texto se não houver dados
        const geralCtx = document.getElementById('geralChart');
        if (geralCtx) {
            const context = geralCtx.getContext('2d');
            if (geralChartInstance) geralChartInstance.destroy(); // Destroi instância anterior
            context.clearRect(0, 0, geralCtx.width, geralCtx.height); // Limpa o canvas
        }
        const subjectPerfEl = document.getElementById('subject-performance');
        if (subjectPerfEl) subjectPerfEl.innerHTML = "<p>Dados de desempenho do usuário indisponíveis.</p>";
        return;
    }

    let filteredCorrect = 0;
    let filteredTotalAttempted = 0; // Renomeado de filteredTotal para clareza (corretas + incorretas + em branco)
    let filteredBlank = 0;          // NOVO: contador para respostas em branco
    let chartLabel = (currentViewingContext && currentViewingContext.name) || "Meu Desempenho";
    const subjectPerformanceEl = document.getElementById('subject-performance');
    let performanceHTML = '';

    if (subjectFilterKey && statsData.subjects && statsData.subjects[subjectFilterKey]) {
        const subjStats = statsData.subjects[subjectFilterKey];
        // Se houver filtro de TÓPICO e os dados de tópico existirem:
        if (topicFilterKey && statsData.topics && statsData.topics[subjectFilterKey] && statsData.topics[subjectFilterKey][topicFilterKey]) {
            const topStats = statsData.topics[subjectFilterKey][topicFilterKey];
            filteredTotalAttempted = topStats.total || 0;
            filteredCorrect = topStats.correct || 0;
            filteredBlank = topStats.blank || 0; // Busca contagem de "em branco" para o tópico
            chartLabel = `${subjectFilterKey.replace(/_/g, '.')} > ${topicFilterKey.replace(/_/g, '.')}`;
            const responded = filteredTotalAttempted - filteredBlank; // Quantas foram de fato respondidas (não em branco)
            const successRate = responded > 0 ? (filteredCorrect / responded) * 100 : 0;
            performanceHTML = `<h4>${chartLabel}:</h4><p>${successRate.toFixed(1)}% de acerto (${filteredCorrect}/${responded} respondidas). ${filteredBlank} em branco de ${filteredTotalAttempted} vistas.</p>`;
        } else { // Apenas filtro de MATÉRIA
            filteredTotalAttempted = subjStats.total || 0;
            filteredCorrect = subjStats.correct || 0;
            filteredBlank = subjStats.blank || 0; // Busca contagem de "em branco" para a matéria
            chartLabel = `${subjectFilterKey.replace(/_/g, '.')}`;
            const responded = filteredTotalAttempted - filteredBlank;
            const successRate = responded > 0 ? (filteredCorrect / responded) * 100 : 0;
            performanceHTML = `<h4>${chartLabel} (Geral da Matéria):</h4><p>${successRate.toFixed(1)}% de acerto (${filteredCorrect}/${responded} respondidas). ${filteredBlank} em branco de ${filteredTotalAttempted} vistas.</p>`;
            // Listar tópicos DENTRO da matéria
            if (statsData.topics && statsData.topics[subjectFilterKey]) {
                performanceHTML += `<ul>`;
                Object.keys(statsData.topics[subjectFilterKey]).sort().forEach(topicKey => {
                    const tStats = statsData.topics[subjectFilterKey][topicKey];
                    const tTotal = tStats.total || 0;
                    const tCorrect = tStats.correct || 0;
                    const tBlank = tStats.blank || 0;
                    const tResponded = tTotal - tBlank;
                    const tSuccessRate = tResponded > 0 ? (tCorrect / tResponded) * 100 : 0;
                    performanceHTML += `<li>${topicKey.replace(/_/g,'.')}: ${tSuccessRate.toFixed(1)}% (${tCorrect}/${tResponded} resp.). ${tBlank} em branco de ${tTotal} vistas.</li>`;
                });
                performanceHTML += `</ul>`;
            }
        }
    } else { // Sem filtro de matéria/assunto (Desempenho Geral no contexto atual)
        filteredTotalAttempted = statsData.totalAnswered || 0;
        filteredCorrect = statsData.totalCorrect || 0;
        filteredBlank = statsData.totalBlank || 0; // Busca contagem global de "em branco"
        performanceHTML = '<h4>Desempenho Geral por Matéria (neste contexto):</h4><ul>';
        if (statsData.subjects && Object.keys(statsData.subjects).length > 0) {
            Object.keys(statsData.subjects).sort().forEach(sKey => {
                const sData = statsData.subjects[sKey];
                const sTotal = sData.total || 0;
                const sCorrect = sData.correct || 0;
                const sBlank = sData.blank || 0;
                const sResponded = sTotal - sBlank;
                const sSuccessRate = sResponded > 0 ? (sCorrect / sResponded) * 100 : 0;
                performanceHTML += `<li>${sKey.replace(/_/g,'.')}: ${sSuccessRate.toFixed(1)}% (${sCorrect}/${sResponded} resp.). ${sBlank} em branco de ${sTotal} vistas.</li>`;
            });
        } else {
            performanceHTML += '<li>Nenhum dado por matéria.</li>';
        }
        performanceHTML += '</ul>';
    }

    if (subjectPerformanceEl) subjectPerformanceEl.innerHTML = performanceHTML;

    if (geralChartInstance) {
        geralChartInstance.destroy(); // Destrói a instância anterior do gráfico para evitar sobreposições
    }
    const ctxGeral = document.getElementById('geralChart').getContext('2d');

    // Calcula o número de respostas incorretas
    // Total "respondidas" (não em branco) = Total de Tentativas - Em Branco
    const nonBlankAttempts = filteredTotalAttempted - filteredBlank;
    // Incorretas = Total Respondidas - Corretas
    const filteredIncorrect = nonBlankAttempts - filteredCorrect;

    geralChartInstance = new Chart(ctxGeral, {
        type: 'doughnut',
        data: {
            labels: ['Acertos', 'Erros', 'Em Branco'], // MODIFICADO: adiciona "Em Branco"
            datasets: [{
                label: chartLabel,
                data: [
                    filteredCorrect,
                    filteredIncorrect < 0 ? 0 : filteredIncorrect, // Garante que não seja negativo
                    filteredBlank // NOVO: dados para "Em Branco"
                ],
                backgroundColor: [
                    '#28a745', // Cor para Acertos (verde)
                    '#dc3545', // Cor para Erros (vermelho)
                    '#ffc107'  // Cor para Em Branco (amarelo/laranja) ou '#6c757d' (cinza)
                ],
                borderColor: [ // Adiciona bordas para melhor visualização
                    '#ffffff',
                    '#ffffff',
                    '#ffffff'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    // O título do gráfico agora reflete a porcentagem de acerto sobre as questões efetivamente respondidas
                    text: `${chartLabel} (${(nonBlankAttempts > 0 ? (filteredCorrect / nonBlankAttempts) * 100 : 0).toFixed(1)}% acerto de respondidas)`
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const value = context.raw;
                            const totalSum = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = totalSum > 0 ? (value / totalSum * 100).toFixed(1) + '%' : '0%';
                            label += `${value} (${percentage})`;
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Exibe o desempenho GLOBAL COMPARATIVO (gráfico + lista)
function displayGlobalComparisonPerformance(globalStats, subjectFilterKey, topicFilterKey) {
    if (!globalStats) {
        document.getElementById('globalCompareChart').getContext('2d').clearRect(0,0,300,150); // Limpa
        // Adicionar mensagem de dados indisponíveis ao lado do título
        return;
    }

    let filteredCorrect = 0;
    let filteredTotal = 0;
    let chartLabel = "Média Demais Usuários";

    // Lógica de filtragem similar à displayUserPerformance, mas usando globalStats
    if (subjectFilterKey && globalStats.subjects && globalStats.subjects[subjectFilterKey]) {
        const subjStats = globalStats.subjects[subjectFilterKey];
         if (topicFilterKey && globalStats.topics && globalStats.topics[subjectFilterKey] && globalStats.topics[subjectFilterKey][topicFilterKey]) {
            const topStats = globalStats.topics[subjectFilterKey][topicFilterKey];
            filteredTotal = topStats.totalAnswered || topStats.total || 0; // Adaptar campos
            filteredCorrect = topStats.totalCorrect || topStats.correct || 0;
            chartLabel = `Demais: ${subjectFilterKey.replace(/_/g, '.')} > ${topicFilterKey.replace(/_/g, '.')}`;
        } else {
            filteredTotal = subjStats.totalAnswered || subjStats.total || 0;
            filteredCorrect = subjStats.totalCorrect || subjStats.correct || 0;
            chartLabel = `Demais: ${subjectFilterKey.replace(/_/g, '.')}`;
        }
    } else { // Geral da plataforma (ou do contexto do caderno para os demais)
        filteredTotal = globalStats.totalAnswered || 0;
        filteredCorrect = globalStats.totalCorrect || 0;
    }


    if (globalCompareChartInstance) globalCompareChartInstance.destroy();
    const ctxGlobalCompare = document.getElementById('globalCompareChart').getContext('2d');
    const filteredIncorrect = filteredTotal - filteredCorrect;

    globalCompareChartInstance = new Chart(ctxGlobalCompare, {
        type: 'doughnut',
        data: {
            labels: ['Acertos (Outros)', 'Erros (Outros)'],
            datasets: [{
                label: chartLabel,
                data: [filteredCorrect, filteredIncorrect < 0 ? 0 : filteredIncorrect],
                backgroundColor: ['#007bff', '#ffc107'], // Cores diferentes
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: `${chartLabel} (${((filteredCorrect / filteredTotal) * 100 || 0).toFixed(1)}% acerto)` }
            }
        }
    });
}


// Função para buscar estatísticas agregadas para um conjunto de questões, excluindo um usuário
async function getAggregatedStatsForQuestions(questionIdsArray, excludeUserId) {
    if (!questionIdsArray || questionIdsArray.length === 0) {
        return { totalAnswered: 0, totalCorrect: 0, subjects: {} };
    }

    let totalAnswered = 0;
    let totalCorrect = 0;
    const subjectsStats = {}; // { "Matematica": { total: X, correct: Y }}

    // Firestore não suporta query 'not-in' ou '!=' em 'array-contains-any' de forma eficiente para muitos IDs.
    // A melhor forma é iterar ou usar 'in' para buscar todas e filtrar no cliente, ou ter dados pré-agregados.
    // Esta é uma operação POTENCIALMENTE CUSTOSA se houver muitas respostas.
    try {
        // Para cada questão, buscar todas as respostas e agregar
        const responsesPromises = questionIdsArray.map(qId =>
            db.collection('userAnswers').where('questionId', '==', qId).get()
        );
        const responsesSnapshots = await Promise.all(responsesPromises);

        responsesSnapshots.forEach(snapshot => {
            snapshot.forEach(doc => {
                const answer = doc.data();
                if (answer.userId !== excludeUserId) { // Exclui o usuário atual
                    totalAnswered++;
                    if (answer.isCorrect) {
                        totalCorrect++;
                    }
                    if (answer.subject) {
                        const saneSubject = answer.subject.replace(/\./g, '_');
                        if (!subjectsStats[saneSubject]) {
                            subjectsStats[saneSubject] = { total: 0, correct: 0 };
                        }
                        subjectsStats[saneSubject].total++;
                        if (answer.isCorrect) {
                            subjectsStats[saneSubject].correct++;
                        }
                    }
                }
            });
        });
        return { totalAnswered, totalCorrect, subjects: subjectsStats };
    } catch (error) {
        console.error("Erro ao agregar estatísticas para questões:", error);
        return { totalAnswered: 0, totalCorrect: 0, subjects: {} };
    }
}


// Estatísticas GLOBAIS DA PLATAFORMA (o botão no header)
async function showGlobalPlatformStatsView() {
        const difficultyContainerForGlobal = document.getElementById('notebook-difficulty-indicator-container');
    if (difficultyContainerForGlobal) {
        difficultyContainerForGlobal.classList.add('hidden');
    }
    questionView.classList.add('hidden');
    addQuestionView.classList.add('hidden');
    forumView.classList.add('hidden');
    statsView.classList.remove('hidden');

    // Esconder filtros de usuário e seletor de contexto de caderno
    document.getElementById('user-stats-filters').classList.add('hidden');
    document.getElementById('stats-context-selector').classList.add('hidden');
    statsComparisonContainerEl.classList.add('hidden'); // Esconder comparação direta por enquanto

    const statsTitleEl = statsView.querySelector('h2');
    if (statsTitleEl) statsTitleEl.textContent = "Estatísticas Globais da Plataforma";

    if (geralChartInstance) geralChartInstance.destroy(); // Usaremos o geralChart para o global aqui
    if (globalCompareChartInstance) globalCompareChartInstance.destroy();


    try {
        const globalStatsDoc = await db.collection('globalPlatformStats').doc('summary').get();
        if (!globalStatsDoc.exists || !globalStatsDoc.data()) {
            document.getElementById('general-stats').innerHTML = "<p>Nenhuma estatística global da plataforma disponível.</p>"; // Precisa de um div com id 'general-stats'
            document.getElementById('subject-performance').innerHTML = "";
            return;
        }
        const globalData = globalStatsDoc.data();

        const totalCorrectGlobal = globalData.totalCorrect || 0;
        const totalAnsweredGlobal = globalData.totalAnswered || 0;
        const totalIncorrectGlobal = totalAnsweredGlobal - totalCorrectGlobal;

        const ctxGeral = document.getElementById('geralChart').getContext('2d'); // Reutiliza o canvas principal
        geralChartInstance = new Chart(ctxGeral, {
            type: 'doughnut',
            data: { /* ... dados do gráfico global ... */ },
            options: { /* ... opções ... */ }
        });
        // Preencher #subject-performance com dados de globalData.subjects e globalData.topics
        // ...
    } catch (error) {
        console.error("Erro ao carregar estatísticas globais da plataforma:", error);
    }
}

if (applyStatsContextBtn) {
    applyStatsContextBtn.addEventListener('click', () => {
        const selectedContext = statsContextTypeSelect.value;
        showStatsView(selectedContext);
    });
}


// --- FÓRUM DE QUESTÕES ---
// (Suas funções de fórum: toggleForumBtn, loadForumComments, submitCommentBtn)
if(toggleForumBtn) toggleForumBtn.addEventListener('click', () => { /* ... */ });
async function loadForumComments(questionId) { /* ... */ }
if(submitCommentBtn) submitCommentBtn.addEventListener('click', async () => { /* ... */ });

// --- ATALHOS DE TECLADO ---
document.addEventListener('keydown', (event) => { /* ...seu código... */ });


// --- INICIALIZAÇÃO DE LISTENERS GERAIS ---
if (backToQuestionsFromStatsBtn) {
    backToQuestionsFromStatsBtn.addEventListener('click', () => {
        if(statsView) statsView.classList.add('hidden');
        if(questionView) questionView.classList.remove('hidden');
    });
}

if (showStatsBtn) {
    showStatsBtn.addEventListener('click', () => {
        if(statsContextTypeSelect) statsContextTypeSelect.value = 'general';
        showStatsView('general');
    });
}

// Garante que as views comecem escondidas (exceto authContainer que é tratado por onAuthStateChanged)
if(statsView) statsView.classList.add('hidden');
if(addQuestionView) addQuestionView.classList.add('hidden');
if(forumView) forumView.classList.add('hidden');
// A questionView é controlada pela lógica de autenticação

// --- FUNÇÃO PARA CONTROLAR SEÇÕES COLAPSÁVEIS DA SIDEBAR ---
function setupSidebarCollapsibles() {
    const headers = document.querySelectorAll('.collapsible-header-sidebar');
    if (headers.length > 0) { // Verifica se os elementos existem
        headers.forEach(header => {
            // Verifica se já tem um listener para não adicionar múltiplos
            if (!header.dataset.collapsibleInitialized) {
                header.addEventListener('click', () => {
                    const targetId = header.dataset.target;
                    const targetElement = document.getElementById(targetId);
                    const icon = header.querySelector('.collapse-icon-sidebar');

                    if (targetElement) {
                        targetElement.classList.toggle('list-collapsed');
                        header.classList.toggle('expanded'); // Para o ícone +/-
                        if (icon) {
                            icon.textContent = targetElement.classList.contains('list-collapsed') ? '+' : '-';
                        }
                    }
                });
                header.dataset.collapsibleInitialized = 'true'; // Marca como inicializado
            }
        });
    } else {
        console.warn("Nenhum .collapsible-header-sidebar encontrado para inicializar.");
    }
}

function setupMainNavCollapsibles() {
    const headers = document.querySelectorAll('.collapsible-main-nav-header > button.main-nav-item');
    headers.forEach(header => {
        if (!header.dataset.mainNavCollapsibleInitialized) {
            header.addEventListener('click', function(event) {
                // Este listener é para o colapso do submenu.
                // A navegação da aba principal (mostrar view, setar ativa) ainda será tratada
                // pelo listener de 'tabButtons' se o ID do header estiver lá.
                // Ou, se o header NÃO deve trocar de view, apenas abrir submenu, precisamos de cuidado.

                const targetSubmenuId = this.dataset.targetSubmenu;
                const submenu = document.getElementById(targetSubmenuId);
                const icon = this.querySelector('.collapse-icon-nav');

                if (submenu) {
                    const isExpanded = submenu.classList.toggle('expanded');
                    this.classList.toggle('submenu-expanded', isExpanded);
                    if (icon) {
                        icon.textContent = isExpanded ? '-' : '+';
                    }
                    // Não propague se for apenas para abrir/fechar submenu e não trocar de view principal
                    // event.stopPropagation(); // Descomente se o clique no header não deve mudar a view
                }
            });
            header.dataset.mainNavCollapsibleInitialized = 'true';
        }
    });

    const myStatsSubmenuBtn = document.getElementById('nav-item-my-stats');
    if (myStatsSubmenuBtn) {
        myStatsSubmenuBtn.addEventListener('click', () => {
            if (!currentUser) { alert("Por favor, faça login."); return; }
            console.log("Botão Minhas Estatísticas (submenu) CLICADO!");
            const statsHeaderButton = document.getElementById('tab-stats-header'); // Botão principal da aba
            showMainContentView(contentViews[statsHeaderButton.id]);
            setActiveTab(statsHeaderButton);
            showStatsView('general');
            closeOtherSubmenus('stats-main-submenu', headers); // Passa a lista de headers
        });
    }

    const globalStatsSubmenuBtn = document.getElementById('nav-item-global-stats');
    if (globalStatsSubmenuBtn) {
        globalStatsSubmenuBtn.addEventListener('click', () => {
            if (!currentUser) { alert("Por favor, faça login."); return; }
            console.log("Botão Estatísticas Globais (submenu) CLICADO!");

            const statsHeaderButton = document.getElementById('tab-stats-header'); // Botão da aba principal "Estatísticas"
            const statsViewToShow = contentViews[statsHeaderButton.id]; // A div principal de estatísticas

            showMainContentView(statsViewToShow); // Mostra a view principal de estatísticas
            setActiveTab(statsHeaderButton);      // Define a aba "Estatísticas" como ativa

            // Esconde o seletor de contexto de estatísticas, pois estamos definindo o contexto programaticamente
            if (statsContextTypeSelect && statsContextTypeSelect.parentElement) { // Verifica se o seletor e seu pai existem
                 statsContextTypeSelect.parentElement.classList.add('hidden'); // Esconde o seletor e seu label/container
            }


            if (currentViewingContext && currentViewingContext.type === 'notebook' && currentViewingContext.id) {
                // Se um caderno está ativo no contexto de visualização de questões
                console.log(`Exibindo estatísticas globais para o caderno: ${currentViewingContext.name}`);
                
                // Chama showStatsView para o caderno. Esta função já lida com:
                // 1. Desempenho do usuário NO CADERNO.
                // 2. Comparação com outros usuários NO CADERNO.
                // 3. Indicador de dificuldade do CADERNO.
                showStatsView(`notebook_${currentViewingContext.id}`);
                
                // Como o foco é "Estatísticas GLOBAIS do Caderno", vamos esconder as partes de "Minhas Estatísticas"
                // que showStatsView normalmente exibe para um caderno.
                const userPerfTitle = document.getElementById('user-performance-title');
                const geralChartCanvas = document.getElementById('geralChart'); // Gráfico de desempenho individual
                const subjectPerfDiv = document.getElementById('subject-performance'); // Lista de desempenho por matéria/assunto individual
                const userStatsFiltersDiv = document.getElementById('user-stats-filters'); // Filtros para desempenho individual

                if(userPerfTitle) userPerfTitle.classList.add('hidden');
                if(geralChartCanvas && geralChartCanvas.parentElement) geralChartCanvas.parentElement.classList.add('hidden'); // Esconde o container do gráfico
                if(subjectPerfDiv) subjectPerfDiv.classList.add('hidden');
                if(userStatsFiltersDiv) userStatsFiltersDiv.classList.add('hidden');

                // Ajustar o título principal da página de estatísticas
                const statsMainTitleEl = statsViewEl.querySelector('h2'); // statsViewEl é a div principal de estatísticas
                 if(statsMainTitleEl) statsMainTitleEl.textContent = `Estatísticas Globais: Caderno "${currentViewingContext.name}"`;


            } else {
                // Nenhum caderno ativo, mostrar estatísticas globais da plataforma
                // Garantir que o seletor de contexto seja mostrado se aplicável para a visão de plataforma
                if (statsContextTypeSelect && statsContextTypeSelect.parentElement) {
                     // statsContextTypeSelect.parentElement.classList.remove('hidden'); // Decida se quer mostrar para a global
                }
                showGlobalPlatformStatsView(); // Esta função já lida com o título e esconde o indicador de dificuldade do caderno
            }
            // closeOtherSubmenus('stats-main-submenu', headers); // 'headers' precisaria ser passado ou definido no escopo
        });
    }
}

function closeOtherSubmenus(currentSubmenuId, allHeaderButtons) {
    allHeaderButtons.forEach(header => {
        const targetId = header.dataset.targetSubmenu;
        if (targetId && targetId !== currentSubmenuId) {
            const submenu = document.getElementById(targetId);
            const icon = header.querySelector('.collapse-icon-nav');
            if (submenu && submenu.classList.contains('expanded')) {
                submenu.classList.remove('expanded');
                header.classList.remove('submenu-expanded');
                if (icon) icon.textContent = '+';
            }
        }
    });
}

// Chamar a função após o DOM estar pronto ou quando a sidebar for populada.
// Se a sidebar é estática e sempre presente, pode chamar aqui.
// Se ela é gerada dinamicamente após o login, chame dentro de onAuthStateChanged ou loadInitialUserData.
// Para garantir, vamos chamar no final do script, após a definição de todas as funções.
// OU, melhor ainda, chame dentro de `loadInitialUserData` ou no `onAuthStateChanged` após o login,
// para garantir que os elementos da sidebar já existem.
// Exemplo: dentro de onAuthStateChanged, após o login bem-sucedido:
// auth.onAuthStateChanged(user => {
//     if (user) {
//         // ... seu código de login ...
//         loadInitialUserData();
//         setupSidebarCollapsibles(); // CHAME AQUI
//     } else { ... }
// });
// Por enquanto, vamos adicionar uma chamada no final do script para tentar inicializar:
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupSidebarCollapsibles();
        setupMainNavCollapsibles(); // << ADICIONAR CHAMADA
    });
} else {
    setupSidebarCollapsibles();
    setupMainNavCollapsibles(); // << ADICIONAR CHAMADA
}

console.log("script.js: Fim do arquivo de script alcançado e processado.");
