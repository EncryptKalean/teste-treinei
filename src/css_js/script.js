const date = new Date();
const dia_da_semana = (date.getDay()) + 1;
const hoje_dia = date.getDate();
const hoje_mes = (date.getMonth()) + 1;
const transcricao = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];

const biblioteca_button = document.getElementById('biblioteca_button'),
    biblioteca_painel = document.getElementById('biblioteca_container'),
    menu_painel = document.getElementById('menu'),
    tela_adicao = document.getElementById('tela_adicao'),
    setas_container = document.getElementById('setas_container'),
    trilho = document.getElementById('trilho'),
    alerta_delete = document.getElementById('alerta_delete'),
    avaliacao_container = document.getElementById('avaliacao_container');

let login = localStorage.getItem('ultimoLogin');
let exercicios = JSON.parse(localStorage.getItem('exercicios_database') || '[]');

/* =======================
   CARREGAR EXERCÍCIOS
======================= */

if (exercicios != '[]') renderizar(exercicios);


/* =======================
   OBSERVER
======================= */

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            const item = entry.target;

            if (item.tagName === 'IMG' && entry.isIntersecting) {

                item.onerror = () => {
                    if (!item.dataset.failed) {
                        item.dataset.failed = 1;
                        item.src = item.dataset.original;
                    };
                };

                item.src = item.dataset.otimizado;

                observer.unobserve(item);

                console.log('renderizou');

            }
            else item.classList.toggle('show', entry.isIntersecting);
        });
    }, { threshold: 0.3 }
);


/* =======================
   EVENTOS
======================= */

// Abre/Fecha biblioteca
biblioteca_button.addEventListener('click', () => {
    biblioteca_button.classList.toggle('aberto');
    biblioteca_painel.classList.toggle('aberto');
});

// Manda as informações para a tela de adição ao escolher um exercicio
biblioteca_painel.addEventListener('click', (click) => {
    const target = click.target.closest('li');
    const menu_open = click.target.closest('#btn_menu');

    if (!target && !menu_open) return;

    if (target) {
        target.classList.add('clicado');
        const contagem = target.dataset.contagem;
        const texto = (contagem == 'undefined' ? 'Peso (Kg)' : contagem);

        setTimeout(() => {
            target.classList.remove('clicado');
        }, 200);

        tela_adicao.classList.add('aberto');

        tela_adicao.querySelector('img').src = target.querySelector('img').dataset.original;

        tela_adicao.querySelector('img').setAttribute('musculo', target.querySelector('img').getAttribute('musculo'));

        tela_adicao.querySelector('h2').textContent = target.querySelector('p.nome').textContent;

        tela_adicao.querySelector('label').textContent = texto;
        tela_adicao.querySelector('label').setAttribute('data-contagem', texto);
    }

    else if (menu_open) {
        menu_painel.classList.toggle('aberto');
        menu_open.classList.toggle('aberto');
        menu_open.classList.add('clicado');
        setTimeout(() => { menu_open.classList.remove('clicado') }, 200);
    };

});

menu_painel.addEventListener('click', (click) => {
    const target = click.target.closest('button');

    if (!target) return;

    gridBiblioteca((target.value == '3x3'));
});

function gridBiblioteca(grid) {

    if (grid == undefined) return

    const escolhido = menu_painel.querySelector('.escolhido');
    if (escolhido) escolhido.classList.remove('escolhido');

    if (grid) {
        biblioteca_painel.classList.add('trio');
        menu_painel.querySelector('button[value="3x3"]').classList.add('escolhido');
    }
    else {
        biblioteca_painel.classList.remove('trio');
        menu_painel.querySelector('button[value="2x2"]').classList.add('escolhido');
    };

    localStorage.setItem('grid_save', grid);

    // console.log("grid: "+grid);
};

gridBiblioteca(JSON.parse(localStorage.getItem('grid_save')));

// Todas as ações da tela de adição
tela_adicao.addEventListener('click', (click) => {
    const target = click.target.closest('button');

    if (!target) return;

    const button = target.getAttribute('name');

    if (button === 'cancelar' || button === 'adicionar') {
        if (button === 'cancelar') tela_adicao.classList.remove('aberto');
        else adicionarItem(tela_adicao.querySelector('img').src, tela_adicao.querySelector('label').dataset.contagem);

        setTimeout(() => {
            tela_adicao.querySelector('img').removeAttribute("src");
            tela_adicao.querySelectorAll('input').forEach((el) => { el.value = el.min });
        }, 500);
    }

    // Botões de adição e subtração dos inputs
    else {
        const divPai = target.parentElement;
        const input = divPai.querySelector('input');

        // Subtrai, com o requisito do valor estar acima de 1
        if (button === 'menos' && input.value > 1) input.value--;

        // Adiciona, com o requisito de não estourar o limitador
        else if (input.value < parseFloat(input.max) && button != 'menos') input.value++;
    }

    // Animação
    target.classList.add('click');
    setTimeout(() => target.classList.remove('click'), 100);
});


/* =======================
   ADICIONAR ITEM
======================= */

// O que acontece após apertar em "adicionar item"
function adicionarItem(imgSRC, contagem) {
    function diminutivo(data) {

        const tipos = {
            repeticoes: 'rep',
            segundos: 's'
        };

        return tipos[data];
    };

    const peso_input = document.getElementById('input_peso').value;
    const dificuldade_input = document.getElementById('input_dificuldade').value;

    if (!peso_input || !dificuldade_input) return;

    // Começa a coletar todas as informações do exercicio escolhido
    const img = imgSRC;
    const exercicio_nome = tela_adicao.querySelector('h2').textContent;

    const peso = peso_input + (contagem.includes('Peso') ? 'kg' : diminutivo(contagem));
    const dificuldade = `Dificuldade: ${dificuldade_input}/10`;

    const diariaID = `d${String(hoje_dia) + String(hoje_mes)}`;
    const musculo = tela_adicao.querySelector('img').getAttribute('musculo');

    // Adicionar o exercicio na array
    const exerc = {
        dds: dia_da_semana,
        dia: String(hoje_dia),
        mes: String(hoje_mes),
        diariaID,
        nome: exercicio_nome,
        peso,
        dificuldade,
        img,
        musculo
    }

    exercicios.push(exerc);

    // Inicia a function para renderizar o card
    renderizar(exerc);

    // Salva
    localStorage.setItem('exercicios_database', JSON.stringify(exercicios));

    // Fecha todas as abas
    document.querySelectorAll('.aberto').forEach((el) => { el.classList.remove('aberto') });

    if (!login) {
        login = `${hoje_dia}/${hoje_mes}`;
        localStorage.setItem('ultimoLogin', login);
    };
}

/* =======================
   RENDERIZAR CARD
======================= */

function renderizar(itens) {
    if (itens.length === 0) return

    const fragment = document.createDocumentFragment();
    let save;
    let save_img;

    if (itens.length > 1) itens.forEach((el) => { ren(el) });
    else ren(itens[0] ?? itens);

    function ren(el) {

        const li = document.createElement('li');
        li.classList.add('exercicio');

        const apagar_btn = document.createElement('button');
        apagar_btn.innerHTML = `<svg><use href="#icon_lixo" /></svg>`;
        apagar_btn.classList.add('apagar_btn');
        apagar_btn.setAttribute('data-index', exercicios.indexOf(el));

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.setAttribute('data-original', `${encodeURIComponent(el.img)}`);
        img.setAttribute('data-otimizado', `https://images.weserv.nl/?url=${encodeURIComponent(el.img)}&w=120&output=webp&we`);
        img.setAttribute('decoding', 'async');
        save_img = img;

        const area_textos = document.createElement('div');
        area_textos.classList.add('area_textos');

        const area_cima = document.createElement('div');
        area_cima.classList.add('area_textos_cima');

        const h3 = document.createElement('h3');
        h3.textContent = el.nome;

        const h4 = document.createElement('h4');
        h4.textContent = el.peso;

        const area_baixo = document.createElement('div');
        area_baixo.classList.add('area_textos_baixo');

        const p = document.createElement('p');
        p.textContent = el.dificuldade;

        li.append(img);

        area_cima.append(h3);
        area_cima.append(h4);

        area_baixo.append(p);

        area_textos.append(area_cima);
        area_textos.append(area_baixo);

        li.append(area_textos);
        li.append(apagar_btn);

        // Procura por uma div com o ID da diaria
        let diaria = document.getElementById(el.diariaID) ?? fragment.getElementById(el.diariaID);
        let criarDiaria = false;

        // Se não encontrar a diaria, cria uma
        if (!diaria) {
            criarDiaria = true;
            diaria = document.createElement('div');
            diaria.classList.add('diaria');
            save = el.diariaID;
            diaria.id = el.diariaID;
            diaria.setAttribute('data-data', `${el.dia}/${el.mes}`);
            diaria.setAttribute('data-dds', el.dds)
        }

        // Procura a ul da div, se não encontrar, cria uma
        let ul = document.querySelector(`#${el.diariaID} ul`) ?? fragment.querySelector(`#${el.diariaID} ul`);
        let criarUl = false;

        if (!ul) {
            ul = document.createElement('ul');
            criarUl = true;
        }

        ul.append(li);

        if (criarUl) diaria.append(ul);

        // Adicionar as tags dos musculos trabalhados naquele dia
        if (!diaria.classList.contains(el.musculo)) diaria.classList.add(el.musculo);

        if (criarDiaria) fragment.append(diaria);
    };

    const ultima_diaria = (document.querySelectorAll('.diaria').length == 0 ? fragment.querySelectorAll('.diaria') : document.querySelectorAll('.diaria'));

    // Atualiza o carrossel
    setTimeout(() => {
        diarias = document.querySelectorAll('.diaria');
        const miniFragment = [];

        if (itens.length > 1)
            miniFragment.push(
                ...[...ultima_diaria].flatMap(el => [...el.querySelectorAll('img')])
            );
        else {
            miniFragment.push(save_img);

            if (save) {
                const div = document.querySelector(`#${save}`);
                miniFragment.push(div);
            };
        };

        setTimeout(() => {
            trilho.parentElement.scrollLeft = 0;
            miniFragment.forEach(img => observer.observe(img));
        }, 500);

    }, 500);

    // Atualiza a data da diaria, caso ela exista
    const dia_numero = ultima_diaria[ultima_diaria.length - 1].dataset.data;
    const dia_nome = transcricao[ultima_diaria[ultima_diaria.length - 1].dataset.dds - 1];

    atualizandoDataShow(dia_numero, dia_nome);

    document.getElementById('trilho').append(fragment);
}

function atualizandoDataShow(numero, nome) {
    const data_show = document.getElementById('data_show');
    data_show.querySelector('h1').textContent = numero;
    data_show.querySelector('h3').textContent = nome;
}

// function historico(){}

// Botão de Apagar 
trilho.addEventListener('click', (click) => {
    const target = click.target.closest('.apagar_btn');

    if (!target) return

    const div = target.closest('li');
    const img = div.querySelector('img').src;
    const nome = div.querySelector('h3').textContent;
    const peso = div.querySelector('h4').textContent;
    const dificuldade = div.querySelector('p').textContent;
    const index = target.dataset.index;


    target.classList.add('clicado');

    setTimeout(() => {
        target.classList.remove('clicado');
    }, 200);

    alerta_delete.classList.add('aberto');

    alerta_delete.querySelector('img').src = img;
    alerta_delete.querySelector('img').setAttribute('data-index', index);
    alerta_delete.querySelector('h3').textContent = nome;
    alerta_delete.querySelector('h4').textContent = peso;
    alerta_delete.querySelector('p').textContent = dificuldade;
});

alerta_delete.addEventListener('click', (click) => {
    const btn = click.target.closest('button');

    if (!btn) return

    if (btn.name == 'cancelar') {
        alerta_delete.classList.remove('aberto');

        setTimeout(() => { alerta_delete.querySelector('img').removeAttribute("src"); }, 500);
    }
    else {
        const index = alerta_delete.querySelector('img').dataset.index;
        exercicios.splice(index, 1);
        localStorage.setItem('exercicios_database', JSON.stringify(exercicios));
        requestAnimationFrame(() => { location.reload() });
    }
})

/* =======================
   CARROSSEL
======================= */

let diarias = document.querySelectorAll('.diaria');
let casa_carrossel = { valor: 0 };
const divPai = document.getElementById('vitrine');

diarias.forEach((el) => { observer.observe(el); });

function carrossel(
    quantidade_de_itens,
    progresso_carrossel,
    trilho,
    seta
) {
    const tamanho_do_trilho = trilho.clientWidth;

    // Define para qual lado fica as "costas" do carrossel
    const indoParaEsquerda = (seta === 'setaEsquerda');

    let posicao_Scroll = divPai.scrollLeft;

    const tamanho_item = tamanho_do_trilho / quantidade_de_itens;

    let novaPosicao = progresso_carrossel.valor + (indoParaEsquerda ? -1 : 1);

    // Volta pro ponto inicial ao chegar no fim do trilho
    if (novaPosicao > quantidade_de_itens) {
        novaPosicao = 1;
        posicao_Scroll = 0;
    }
    // Vai pro fim do trilho ao tentar ir alem do ponto 0
    else if (novaPosicao < 1) {
        novaPosicao = quantidade_de_itens;
        posicao_Scroll = tamanho_do_trilho;
    }
    // Faz o carrossel percorrer normalmente
    else {
        posicao_Scroll += (indoParaEsquerda ? -1 : 1) * tamanho_item;
    }

    divPai.scrollTo({
        top: 0,
        left: posicao_Scroll,
    });

    progresso_carrossel.valor = novaPosicao;

    // Atualizando data_show
    const index = quantidade_de_itens - novaPosicao;
    const novoDiaria = diarias[index];
    const dia_numero = novoDiaria.dataset.data;
    const dia_nome = transcricao[novoDiaria.dataset.dds - 1];
    atualizandoDataShow(dia_numero, dia_nome);
}

setas_container.addEventListener('click', (click) => {

    const target = click.target.closest('button');
    if (!target) return;

    carrossel(
        diarias.length,
        casa_carrossel,
        trilho,
        target.id
    );

    target.classList.add('click');
    setTimeout(() => target.classList.remove('click'), 100);
});

function carregandoBiblioteca(txt) {

    const biblioteca_exercs = txt;

    const fragment = document.createDocumentFragment();

    const ul = biblioteca_painel.querySelector('ul');

    biblioteca_exercs.forEach((el) => {
        const li = document.createElement('li');
        li.setAttribute('data-contagem', el.contagem);

        if (el.nome === 'divisao') {
            li.classList.add('divisao');

            const h2 = document.createElement('h2');
            h2.textContent = el.tipo;

            li.append(h2);
        }
        else {
            const img = document.createElement('img');
            img.setAttribute('loading', 'lazy');
            img.setAttribute('data-original', el.img);
            img.setAttribute('data-otimizado', `https://images.weserv.nl/?url=${encodeURIComponent(el.img)}&w=120&output=webp&we`);
            img.setAttribute('musculo', el.tipo);
            img.setAttribute('decoding', 'async');

            const p = document.createElement('p');
            p.classList.add('nome')
            p.textContent = el.nome;

            const musculo = document.createElement('p');
            musculo.classList.add('musculo');
            musculo.textContent = el.tipo;

            li.append(img);
            li.append(musculo);
            li.append(p);

            observer.observe(img);
        }

        fragment.append(li);
    });

    ul.append(fragment);
};

fetch('biblioteca.txt').then(res => res.json()).then(data => { carregandoBiblioteca(data) })

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
        .then((reg) => {
            // console.log("SW registrado");

            reg.addEventListener("updatefound", () => {
                const newWorker = reg.installing;

                newWorker.addEventListener("statechange", () => {
                    if (newWorker.state === "installed") {
                        if (navigator.serviceWorker.controller) {
                            console.log("Nova versão disponível!");
                            window.location.reload(); // força atualização
                        }
                    }
                });
            });
        })
        .catch(err => console.log("Erro SW:", err));
}