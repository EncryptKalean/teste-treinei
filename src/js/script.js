//#region BASICO
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const item = entry.target;

            if (item.tagName !== 'IMG') return;

            observer.unobserve(item);

            if (!item.dataset.errorBound) {
                item.dataset.errorBound = '1';

                item.onerror = () => {
                    if (item.dataset.failed) return;

                    item.dataset.failed = '1';
                    item.src = item.dataset.original;

                    console.log('OBS: deu erro na imagem otimizada');
                };
            }

            item.src = item.dataset.otimizado;

            console.log('renderizou');
        });
    }, {
    threshold: 0.3,
    rootMargin: '200px'
}
);

const date = new Date();
const diaDaSemana = date.getDay(); // ex: segunda, terça, quarta e etc...
const dia = date.getDate();
const mes = (date.getMonth()) + 1;
const transcricao = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];

const databaseBruto = JSON.parse(localStorage.getItem('exercicios_database') || '[]');

const database = databaseBruto.map(item => {

    // Se já for do formato novo
    if ('imagemEstatica' in item) return item;

    // Se for do formato antigo
    return {
        imagemEstatica: item.img || '',
        nome: item.nome || '',
        siglaContagem: '',

        dificuldade:
            item.dificuldade
                ?.split(':')[1]
                ?.split('/')[0]
                ?.trim() || '',

        valor: item.peso || '',
        id: item.diariaID || '',

        data: `${String(item.dds - 1)}-${String(item.dia)}-${String(item.mes)}`
    };
});

function save() { localStorage.setItem('exercicios_database', JSON.stringify(database)); };

//#endregion


// #region CARROSSEL

const vitrine = document.getElementById('vitrine');
const header = document.querySelector('header');
const dataShowH2 = header.querySelector('h2');
const dataShowH3 = header.querySelector('h3');

const casas = [];

let casasCarrossel = {
    carrosselUm: {
        valor: 0,
        maximo: vitrine.querySelectorAll('ul').length - 1,
        casasPorGiro: 1,
    }
};

function carrossel(trilhoContainer, config, direita) {
    // Pega o tamanho real de um item da vitrine.
    // Isso evita problemas com responsividade, gap, zoom e padding.
    const tamanhoVitrine = trilhoContainer.children[0].clientWidth;

    // Caso contrário, avança ou retrocede a quantidade definida em casasPorGiro.
    config.valor += (direita ? config.casasPorGiro : -config.casasPorGiro);

    // Se estiver indo para a direita e chegar no final, reinicia o carrossel no começo.
    if (direita && config.valor > config.maximo) config.valor = 0;

    // Se estiver indo para a esquerda e chegar no começo, pula para o final do carrossel.
    else if (!direita && config.valor < 0) config.valor = config.maximo;

    // Move o scroll horizontal baseado na posição atual do carrossel.
    trilhoContainer.scrollLeft = tamanhoVitrine * config.valor;

    dataShow(config);
};

header.addEventListener('click', (click) => {
    const target = click.target.closest('button');

    if (!target) return;

    const direita = (target.id === 'seta-direita' ? true : false);

    carrossel(vitrine, casasCarrossel.carrosselUm, direita);
});

function dataShow(carrosselConfig) {
    const data = casas[carrosselConfig.maximo - carrosselConfig.valor].split('D')[1].split('-');
    const diaNome = data[0];
    const dia = data[1];
    const mes = data[2];

    dataShowH2.textContent = dia + '/' + mes;
    dataShowH3.textContent = transcricao[diaNome];
};

// #endregion


//#region BIBLIOTECA RENDER

function carregandoBiblioteca(txt) {
    const biblioteca_exercs = txt;
    const fragment = document.createDocumentFragment();
    const ul = document.getElementById('biblioteca-container');

    biblioteca_exercs.forEach((el) => {
        const li = document.createElement('li');

        if (el.nome === 'divisao') {
            li.classList.add('divisao');

            const h2 = document.createElement('h2');
            h2.textContent = el.tipo;

            li.append(h2);
        }
        else {
            li.setAttribute('data-contagem', el.contagem);

            const img = document.createElement('img');
            img.setAttribute('data-original', el.img);
            img.setAttribute('data-otimizado', `https://images.weserv.nl/?url=${encodeURIComponent(el.img)}&w=120&output=webp&we`);
            img.setAttribute('src', `data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==`);
            // img.setAttribute('musculo', el.tipo);
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

fetch('biblioteca.txt').then(res => res.json()).then(data => { carregandoBiblioteca(data) });

//#endregion


//#region TELA ADIÇÂO

const biblioteca = document.getElementById('biblioteca');
const telaAdicao = document.getElementById('tela-adicao');
const telaAdicaoIMG = telaAdicao.querySelector('img');
const telaAdicaoNome = telaAdicao.querySelector('h2');
const labelPeso = telaAdicao.querySelector('#label-peso');
const inputPeso = telaAdicao.querySelector('#input-peso');
const inputDificuldade = telaAdicao.querySelector('#input-dificuldade');

function novoTreino() {
    return {
        imagemEstatica: '',
        nome: '',
        siglaContagem: '',
        dificuldade: '',
        valor: '',
        id: '',
        data: `${diaDaSemana}-${dia}-${mes}`
    };
};

let treino = novoTreino();

// Event que controla todos os botões da tela de adição
telaAdicao.addEventListener('click', (click) => {
    const target = click.target.closest('button');

    if (!target) return;

    const tipo = target.getAttribute('name');
    const input = target.parentElement.querySelector('input');

    if (tipo === 'mais' || tipo === 'menos') {
        if (tipo === 'mais' && input.value < parseFloat(input.max)) input.value++;
        else if (tipo === 'menos' && input.value > input.min) input.value--;
    }
    else {
        if (tipo === 'adicionar') criarTreino();
        else abrirTelaAdicao();
    }
});

biblioteca.addEventListener('click', (click) => {
    const target = click.target.closest('li');

    if (!target || target.classList.contains('divisao')) return;

    abrirTelaAdicao(target);
});

function siglaContagem(data) {

    const tipos = {
        undefined: 'kg',
        repeticoes: 'rep',
        segundos: 's'
    };

    return tipos[data];
};

function abrirTelaAdicao(li) {
    telaAdicao.classList.toggle('aberto');

    if (telaAdicao.classList.contains('aberto')) renderTelaAdicao(li);
    else setTimeout(() => {
        telaAdicaoIMG.removeAttribute("src");
        inputPeso.value = inputPeso.min;
        inputDificuldade.value = 5;
    }, 500);
};

function renderTelaAdicao(li) {
    const img = li.querySelector('img');
    const nome = li.querySelector('.nome');
    const tipoContagem = li.dataset.contagem;

    telaAdicaoIMG.src = img.dataset.original ?? img.src;

    telaAdicaoNome.textContent = nome.textContent;

    labelPeso.textContent = (tipoContagem != 'undefined' ? tipoContagem : 'peso (kg)');

    // Prepara algumas informações do treino

    treino.imagemEstatica = telaAdicaoIMG.src;
    treino.nome = nome.textContent;
    treino.siglaContagem = siglaContagem(tipoContagem);
};

function criarTreino() {
    treino.dificuldade = inputDificuldade.value;
    treino.valor = inputPeso.value;
    treino.id = crypto.randomUUID();

    database.push(treino);

    save();

    renderizar(treino);

    treino = novoTreino();

    abrirTelaAdicao();
}

//#endregion 


// #region RENDER

// ESTUDAR SOBRE ISSO
function createElement(tag, options = {}) {
    const el = document.createElement(tag);

    if (options.className)
        el.className = options.className;

    if (options.text)
        el.textContent = options.text;

    if (options.html)
        el.innerHTML = options.html;

    if (options.attrs) {
        Object.entries(options.attrs).forEach(([k, v]) => {
            el.setAttribute(k, v);
        });
    }

    return el;
}

function renderizar(database) {
    let novo;

    if (!Array.isArray(database)) database = [database];

    const fragment = document.createDocumentFragment();

    database.forEach((el) => ren(el));

    function procurarDiaria(ulData) {
        const ulDiaria = fragment.querySelector(`#D${ulData}`) ?? vitrine.querySelector(`#D${ulData}`) ?? false;

        if (!ulDiaria) {

            const ul = createElement('ul', {
                className: 'diaria',
                attrs: {
                    id: 'D' + ulData
                }
            });

            casas.push('D' + ulData);

            casasCarrossel.carrosselUm.maximo++

            fragment.prepend(ul);

            novo = true;

            return ul;
        }

        return ulDiaria;
    }

    function ren(el) {
        const diaria = procurarDiaria(el.data);

        const li = document.createElement('li');
        li.classList.add('exercicio');
        li.id = "li" + el.id;

        if (el.dificuldade <= 5) li.classList.add('derrotado');

        // ----------------------------------------------------

        const img = createElement('img', {
            loading: 'lazy',
            decoding: 'async',
            attrs: {
                'data-original': el.imagemEstatica,
                'data-otimizado': `https://images.weserv.nl/?url=${encodeURIComponent(el.imagemEstatica)}&w=120&output=webp&we`
            }
        });

        const p = createElement('p', {
            className: 'nome',
            text: el.nome
        });

        observer.observe(img)

        li.append(img);

        const areaTextos = createElement('div', {
            className: 'area-textos'
        });

        // ----------------------------------------------------

        const areaTextosCima = createElement('div', {
            className: 'area-textos-cima'
        });

        const nome = createElement('h3', {
            className: 'nome',
            text: el.nome
        });

        const peso = createElement('h4', {
            className: 'peso',
            text: el.valor + el.siglaContagem
        });

        areaTextosCima.append(nome);

        const svgNS = 'http://www.w3.org/2000/svg';

        const svg = document.createElementNS(svgNS, 'svg');
        svg.classList.add('trofeu');

        const use = document.createElementNS(svgNS, 'use');

        use.setAttribute('href', '#icon-trofeu');
        svg.append(use);

        areaTextosCima.append(svg);

        areaTextosCima.append(peso);

        areaTextos.append(areaTextosCima);

        // ----------------------------------------------------

        const areaTextosBaixo = createElement('div', {
            className: 'area-textos-baixo'
        });

        const dificuldade = createElement('p', {
            className: 'dificuldade',
            text: (el.dificuldade <= 5 ? '' : `dificuldade: ${el.dificuldade}/10`)
        });

        areaTextosBaixo.append(dificuldade);

        const svgLixo = document.createElementNS(svgNS, 'svg');
        svgLixo.classList.add('delete-tarefa-btn');

        const useLixo = document.createElementNS(svgNS, 'use');

        useLixo.setAttribute('href', '#icon-lixo');
        svgLixo.append(useLixo);

        areaTextosBaixo.append(svgLixo);

        areaTextos.append(areaTextosBaixo);

        // ------------------------------------------------------

        li.append(areaTextos);

        diaria.append(li);
    };

    vitrine.prepend(fragment);

    dataShow(casasCarrossel.carrosselUm);

    if (novo) setTimeout(() => {
        vitrine.scrollLeft = 0;
    }, 500);
}

// #endregion


// #region VITRINE & DELETE

const telaDelete = document.getElementById('tela-delete');
const showcase = telaDelete.querySelector('#showcase');

vitrine.addEventListener('click', (click) => {
    const target = click.target.closest('.delete-tarefa-btn');

    if (!target) return

    abrirTelaDelete(target.closest('li').cloneNode(true));
});

function abrirTelaDelete(li) {
    telaDelete.classList.toggle('aberto');

    if (telaDelete.classList.contains('aberto')) showcase.append(li);
    else setTimeout(() => { showcase.innerHTML = '' }, 500);
};

telaDelete.addEventListener('click', (click) => {
    const target = click.target.closest('button');

    if (!target) return;

    const tipo = target.name;
    const id = telaDelete.querySelector('li').id.split('li')[1];

    if (tipo === 'confirmar') {
        const indexTreino = database.findIndex(el => el.id == id);
        const elemento = vitrine.querySelector(`#${id}`);

        database.splice(indexTreino, 1);

        observer.unobserve(elemento);
        elemento.remove();

        save();
    };

    abrirTelaDelete();
});

// #endregion


if (database.length > 0) renderizar(database);
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
