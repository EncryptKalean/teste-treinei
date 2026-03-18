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
    const fragment = document.createDocumentFragment();
    let save;
    let save_img;

    if (itens.length > 1) itens.forEach((el) => { ren(el) });
    else ren(itens);

    function ren(el) {
        const li = document.createElement('li');
        li.classList.add('exercicio');

        const apagar_btn = document.createElement('button');
        apagar_btn.innerHTML = `<svg><use href="#icon_lixo" /></svg>`
        apagar_btn.classList.add('apagar_btn');
        apagar_btn.setAttribute('data-index', exercicios.indexOf(el));

        // Tem que fazer um filtro para separar os exercicios

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

        if (itens.length > 1) ultima_diaria.forEach((el) => {
            el.querySelectorAll('img').forEach((img) => {
                observer.observe(img);
            });
        })
        else {
            if (save) {
                const div = document.querySelector(`#${save}`);

                observer.observe(div);
            }
            const img = save_img;

            observer.observe(img);
        };

        setTimeout(() => { trilho.parentElement.scrollLeft = trilho.clientWidth; }, 500)
    }, 500);

    // Atualiza a data da diaria, caso ela exista
    const dia_numero = ultima_diaria[ultima_diaria.length - 1].dataset.data;
    const dia_nome = transcricao[ultima_diaria[ultima_diaria.length - 1].dataset.dds - 1];

    atualizandoDataShow(dia_numero, dia_nome);

    document.getElementById('trilho').append(fragment);

    // Quando todos os itens forem renderizados, e for a primeira vez no dia, a tela de avaliação é iniciada
    // if (login != `${hoje_dia}/${hoje_mes}` &&
    //     ultima_diaria.length >= 1) {

    //     const classes = ultima_diaria[ultima_diaria.length - 1].classList;

    //     // Inicia a criação do formulario
    //     avaliandoMusculos(classes);

    //     // Animação
    //     avaliacao_container.style.display = 'block';
    //     setTimeout(() => {
    //         avaliacao_container.style.opacity = '1';
    //     }, 100);
    // }
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
   AVALIAÇÃO
======================= */

// function avaliandoMusculos(classes) {
//     const container_avaliacao = document.getElementById('container_principal');
//     const avaliacao_button = container_avaliacao.querySelector('button');
//     const h2 = document.querySelector('#container_principal h2');

//     let avaliacoes_quantidade = 0;

//     const opcoes = [
//         'Sem dor, totalmente recuperado',
//         'Leve desconforto, mas nada que atrapalhe',
//         'Dor moderada, sinto o músculo cansado',
//         'Dor intensa, difícil movimentar normalmente'
//     ];

//     // Separa todas as tags para criar as perguntas individuais
//     classes.forEach((el) => {

//         // Ignora a tag "diaria"
//         if (el === 'diaria') return;

//         h2.textContent += ` ${el},`;
//         avaliacoes_quantidade++;

//         const label = document.createElement('label');
//         label.textContent = `Como está o(a) ${el}?`;
//         label.setAttribute('for', el);

//         const div_musculo = document.createElement('div');
//         div_musculo.setAttribute('name', el);

//         // Cria e adiciona as opções de resposta
//         for (let i = 0; i < opcoes.length; i++) {

//             const div_op = document.createElement('div');

//             const span_op = document.createElement('span');
//             span_op.textContent = opcoes[i];

//             const input_op = document.createElement('input');
//             input_op.type = 'radio';
//             input_op.setAttribute('name', el);
//             input_op.value = i;

//             div_op.append(span_op);
//             div_op.appendChild(input_op);

//             div_musculo.appendChild(div_op);
//         }

//         container_avaliacao.appendChild(label);
//         container_avaliacao.appendChild(div_musculo);
//     });

//     // Inicia o eventListener das perguntas
//     avaliacao();

//     // Quando todos as perguntas forem respondidas, atualiza a data e fechar o avaliador
//     avaliacao_button.addEventListener('click', () => {
//         const pronto = container_avaliacao.querySelectorAll('input:checked').length === avaliacoes_quantidade;

//         if (pronto) {
//             login = `${hoje_dia}/${hoje_mes}`;
//             localStorage.setItem('ultimoLogin', `${hoje_dia}/${hoje_mes}`);

//             // Animação
//             avaliacao_container.style.opacity = '0';
//             setTimeout(() => {
//                 avaliacao_container.style.display = 'none';
//             }, 1000);
//         }
//         else {
//             avaliacao_button.classList.add('erro');

//             setTimeout(() => { avaliacao_button.classList.remove('erro') }, 200);
//         };
//     });
// }

// EventListener de todas as perguntas
// function avaliacao() {
//     const div_musculo = document.querySelector('#container_principal');

//     div_musculo.addEventListener('click', (click) => {

//         // Verificação para saber quando um input é apertado
//         const target = click.target.closest('input');
//         if (!target) return;

//         // Desativa a resposta anterior
//         const atual = target.parentElement.parentElement.querySelector('.avaliado');
//         if (atual) atual.classList.toggle('avaliado');

//         // Ativa a nova resposta
//         target.parentElement.classList.toggle('avaliado');
//     });
// }


/* =======================
   CARROSSEL
======================= */

let diarias = document.querySelectorAll('.diaria');
let casa_carrossel = { valor: diarias.length };

diarias.forEach((el) => { observer.observe(el); });

function carrossel(
    quantidade_de_itens,
    progresso_carrossel,
    trilho,
    direcao
) {
    const tamanho_do_trilho = +window.getComputedStyle(trilho).getPropertyValue('width').split('px')[0];

    const divPai = trilho.parentElement;
    let posicao_Scroll = divPai.scrollLeft;

    const tamanho_item = tamanho_do_trilho / quantidade_de_itens;

    if (progresso_carrossel.valor >= quantidade_de_itens && direcao != 'setaEsquerda') {
        posicao_Scroll = 0;
        progresso_carrossel.valor = 1;
    }

    else if (progresso_carrossel.valor <= 1 && direcao === 'setaEsquerda') {
        posicao_Scroll = trilho.clientWidth;
        progresso_carrossel.valor = quantidade_de_itens;
    }

    else {
        posicao_Scroll += (direcao === 'setaEsquerda' ? -1 : 1) * tamanho_item;
        progresso_carrossel.valor = direcao === 'setaEsquerda' ? progresso_carrossel.valor - 1 : progresso_carrossel.valor + 1;
    };

    divPai.scrollTo({
        top: 0,
        left: posicao_Scroll,
    });

    // Atualizando data_show
    const novoDiaria = diarias[progresso_carrossel.valor - 1];
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


import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabase = (window.supabase ??= createClient(
    "https://ljpchdnlebmzvsjcyfei.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcGNoZG5sZWJtenZzamN5ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzAxOTYsImV4cCI6MjA2OTkwNjE5Nn0.wkcNLzuBEv1T_f2VEo8CwC04Yuta5VQli6pkZ2ZBy48",
));

async function carregandoBiblioteca() {
    let biblioteca;

    try {
        biblioteca = JSON.parse(localStorage.getItem('galeria_acad'));
        // console.log('procurando no local...')
        // document.getElementById('home').style.background = 'red';
    }
    catch {
        biblioteca = null;
        console.log('Biblioteca erro');
    }

    if (!biblioteca) {
        console.log('vamo olhar o server...')
        const { data, error } = await supabase.from("html").select("*").eq("id", 3).single();
        localStorage.setItem('galeria_acad', JSON.stringify(data.js_baixando));
        biblioteca = data.js_baixando;
        document.getElementById('home').style.background = 'green';
    }

    const biblioteca_exercs = JSON.parse(biblioteca);

    const fragment = document.createDocumentFragment();

    const ul = biblioteca_painel.querySelector('ul');

    biblioteca_exercs.forEach((el) => {
        const li = document.createElement('li');
        li.setAttribute('data-contagem', el.contagem);

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

        fragment.append(li);
    });

    ul.append(fragment);
}
carregandoBiblioteca();


// const bib = [
//     { nome: 'Supino Reto', tipo: 'Peitoral', img: 'https://www.hipertrofia.org/blog/wp-content/uploads/2017/09/barbell-bench-press.gif' },
//     { nome: 'Supino Inclinado', tipo: 'Peitoral', img: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/supino-inclinado-com-barra.gif' },
//     { nome: 'Crucifixo Máquina', tipo: 'Peitoral', img: 'https://bsaapdx.com/wp-content/uploads/2023/03/Pec-Deck-Fly-BSAA.gif' },
//     { nome: 'Supino Reto Máquina', tipo: 'Peitoral', img: 'https://static.wixstatic.com/media/2edbed_80220eb2779c4804a8a9cb9a9053077a~mv2.gif' },
//     { nome: 'Supino Inclinado Máquina', tipo: 'Peitoral', img: 'https://www.hipertrofia.org/blog/wp-content/uploads/2025/11/supino-declinado-maquina.gif' },
//     { nome: 'Pull-Over', tipo: 'Peitoral', img: 'https://boxlifemagazine.com/wp-content/uploads/2023/09/pull-over-barre-1-min.gif' },
//     { nome: 'Francês', tipo: 'Triceps', img: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/10/dumbbell-seated-triceps-extension.gif' },
//     { nome: 'Pulley Corda', tipo: 'Triceps', img: 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/07/triceps-puxada-no-pulley-com-corda.gif' },
//     { nome: 'Pulley Barra', tipo: 'Triceps', img: 'https://static.wixstatic.com/media/2edbed_e0caf218d1a446368fea3ae11102b5ef~mv2.gif' },
//     { nome: 'Mergulho no Banco', tipo: 'triceps', img: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgSKC0cSW_KHIxz4O7vl-5xiUZraa_RO5xRZomr8EIz7F6vgRidtuT3JaUzP5oBf1dpRohmgiAex5Chp0z_sYr3aDhVtNZJ69IRqjSPyGwMHZjfRZS9qEcNIF1_3d3oAuAziBQuQscMg3Vf2nw17zMyDarsJ0UB35HHdLD5W5DXhnO-oLhfQZyLH_DX7g/s16000/mergulho.gif',  contagem: 'repeticoes'  },
//     { nome: 'Triceps Testa', tipo: 'triceps', img: 'https://image.tuasaude.com/media/article/hd/sc/exercicios-para-biceps-e-triceps_75262.gif?width=686&height=487' },
//     { nome: 'Elevação de Ombros', tipo: 'Ombro', img: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/desenvolvimento-para-ombros-com-halteres.gif' },
//     { nome: 'Elevação Lateral', tipo: 'Ombro', img: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/ombros-elevacao-lateral-de-ombros-com-halteres.gif' },
//     { nome: 'Elevação Lateral Maquina', tipo: 'Ombro', img: 'https://i.pinimg.com/originals/5c/26/01/5c260113a602e20af15a2adccbeca928.gif' },
//     { nome: 'Elevação Frontal', tipo: 'Ombro', img: 'https://www.hipertrofia.org/blog/wp-content/uploads/2018/09/elevacao-frontal-com-anilha-v2.gif' },
//     { nome: 'Remada Alta', tipo: 'Ombro', img: 'https://static.wixstatic.com/media/2edbed_4d703635f5b84daf95d094ba48521489~mv2.gif' },
//     { nome: 'Remada Alta Pulley', tipo: 'Ombro', img: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/ombros-remada-alta-no-cabo.gif' },
//     { nome: 'Pulley Frente', tipo: 'Costas', img: 'https://static.wixstatic.com/media/2edbed_31120f3c7f2e4c37b202581c77509e6d~mv2.gif' },
//     { nome: 'Pulley Frente Triângulo', tipo: 'Costas', img: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/costas-puxada-para-frente-no-pulley-com-triangulo.gif' },
//     { nome: 'Remada Baixa', tipo: 'Costas', img: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/costas-remada-sentado-com-cabos-e-triangulo.gif' },
//     { nome: 'Remada Sentado Maquina', tipo: 'Costas', img: 'https://fitcron.com/wp-content/uploads/2021/04/26641301-Lever-Seated-Row-plate-loaded_Back_720.gif' },
//     { nome: 'Remada no Banco', tipo: 'Costas', img: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/costas-remada-martelo-no-banco-inclinado-com-halteres.gif' },
//     { nome: 'Remada Serrote', tipo: 'Costas', img: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/11/remada-serrote-2.gif' },
//     { nome: 'Puxada Convergente', tipo: 'Costas', img: 'https://www.hipertrofia.org/blog/wp-content/uploads/2025/05/puxada-maquina-articulada.gif' },
//     { nome: 'Rosca Simultânea', tipo: 'Biceps', img: 'https://www.hipertrofia.org/blog/wp-content/uploads/2019/04/rosca-simultanea.gif' },
//     { nome: 'Rosca Direta com Barra', tipo: 'Biceps', img: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/rosca-biceps-direta-na-barra-ez.gif' },
//     { nome: 'Rosca Scott', tipo: 'Biceps', img: 'https://www.hipertrofia.org/blog/wp-content/uploads/2019/04/rosca-scott.gif' },
//     { nome: 'Rosca Concentrada', tipo: 'Biceps', img: 'https://www.hipertrofia.org/blog/wp-content/uploads/2019/04/rosca-concentrada.gif' },
//     { nome: 'Rosca Concentrada no Pulley', tipo: 'Biceps', img: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/11/overhead-cable-curl.gif' },
//     { nome: 'Rosca Alternada', tipo: 'Biceps', img: 'https://www.hipertrofia.org/blog/wp-content/uploads/2019/04/rosca-alternada.gif' },
//     { nome: 'Rosca Martelo', tipo: 'Biceps', img: 'https://image.tuasaude.com/media/article/kr/cn/rosca-martelo_75628.gif?width=686&height=487' },
//     { nome: 'Elevação de Pernas', tipo: 'Abdômen', img: 'https://fitcron.com/wp-content/uploads/2021/04/08261301-Vertical-Leg-Raise-on-parallel-bars_Hips_720.gif', contagem: 'repeticoes' },
//     { nome: 'Elevação de Pernas Deitado', tipo: 'Abdômen', img: 'https://www.hipertrofia.org/blog/wp-content/uploads/2018/12/elevacao-de-pernas-no-chao.gif', contagem: 'repeticoes' },
//     { nome: 'Abdominal', tipo: 'Abdômen', img: 'https://www.hipertrofia.org/blog/wp-content/uploads/2017/09/abdominal-reto.gif', contagem: 'repeticoes' },
//     { nome: 'Abdominal Alternado', tipo: 'Abdômen', img: 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/04/abdominal-bicicleta-no-ar.gif', contagem: 'repeticoes' },
//     { nome: 'Abdominal Canivete', tipo: 'Abdômen', img: 'https://newlife.com.cy/wp-content/uploads/2019/11/05071301-Jackknife-Sit-Up_waist_360.gif', contagem: 'repeticoes' },
//     { nome: 'Abdominal Remador', tipo: 'Abdômen', img: 'https://treinomestre.com.br/wp-content/uploads/2024/11/abdominal-remador-1.gif', contagem: 'repeticoes' },
//     { nome: 'Prancha', tipo: 'Abdômen', img: 'https://workoutguru.fit/wp-content/uploads/2023/10/front-plank-butt-wrong-right-female-video-exercise-guide-tips-2-768x432.jpg', contagem: 'segundos' },
//     { nome: 'Leg Press', tipo: 'Quadriceps', img: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/single-leg-leg-press.gif' },
//     { nome: 'Hack Machine', tipo: 'Quadriceps', img: 'https://www.infofitness.nl/wp-content/uploads/2023/10/hack-squat.gif' },
//     { nome: 'Agachamento Livre com Barra', tipo: 'Quadriceps', img: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/11/agachamento-com-barra.gif' },
//     { nome: 'Agachamento Smith', tipo: 'Quadriceps', img: 'https://static.wixstatic.com/media/2edbed_687d6aac9dcd4a78b3de2247d5dad059~mv2.gif' },
//     { nome: 'Cadeira Extensora', tipo: 'Quadriceps', img: 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/04/pernas-extensao-de-pernas-na-maquina.gif' },
//     { nome: 'Cadeira Adutora', tipo: 'Quadriceps', img: 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/04/pernas-aducao-de-pernas-na-maquina.gif' },
//     { nome: 'Panturrilha Máquina', tipo: 'Panturrilha', img: 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/03/Panturrilha-em-pe-no-aparelho.gif' },
//     { nome: 'Panturrilha Sentado', tipo: 'Panturrilha', img: 'https://www.hipertrofia.org/blog/wp-content/uploads/2018/10/lever-seated-calf-raise-.gif' },
//     // {nome: '', tipo: '', img: ''},
// ]

// console.log(JSON.stringify(bib))

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("SW registrado"))
    .catch(err => console.log("Erro SW:", err));
}