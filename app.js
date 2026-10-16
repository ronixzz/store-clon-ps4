// Archivo: app.js (Motor de inyección directa a GoldHEN)

const categoriasStore = [
    { id: "action", nombre: "Action", clase: "action" },
    { id: "comedy", nombre: "Comedy", clase: "comedy" },
    { id: "scifi", nombre: "Sci-Fi", clase: "scifi" },
    { id: "horror", nombre: "Horror", clase: "horror" },
    { id: "openworld", nombre: "Open World", clase: "openworld" }
];

const viewCategories = document.getElementById('view-categories');
const viewGames = document.getElementById('view-games');
const viewDetails = document.getElementById('view-details');
const gridCategorias = document.querySelector('.grid-categorias');
const gridJuegos = document.getElementById('contenedor-juegos');
const tituloSeccion = document.getElementById('titulo-seccion');

const btnCategories = document.getElementById('btn-categories');
const btnAllGames = document.getElementById('btn-allgames');
const btnVolver = document.getElementById('btn-volver');
const menuItems = document.querySelectorAll('.menu li');

let ultimaCategoria = 'all';

function renderCategorias() {
    gridCategorias.innerHTML = '';
    categoriasStore.forEach(cat => {
        const div = document.createElement('div');
        div.className = `card-categoria ${cat.clase}`;
        div.tabIndex = 0;
        div.innerHTML = `<span>${cat.nombre}</span>`;
        
        div.addEventListener('click', () => mostrarJuegosFiltro(cat.id, cat.nombre));
        div.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') mostrarJuegosFiltro(cat.id, cat.nombre);
        });
        
        gridCategorias.appendChild(div);
    });
}

function mostrarJuegosFiltro(filtroCat, titulo) {
    ultimaCategoria = filtroCat;
    activarMenu(btnAllGames);
    viewCategories.className = 'vista-oculta';
    viewDetails.className = 'vista-oculta';
    viewGames.className = 'vista-activa';
    tituloSeccion.textContent = titulo;
    
    gridJuegos.innerHTML = '';
    let juegosFiltrados = filtroCat === 'all' ? baseDeDatos : baseDeDatos.filter(j => j.categoria === filtroCat);

    juegosFiltrados.forEach(juego => {
        const div = document.createElement('div');
        div.className = 'tarjeta-juego';
        div.tabIndex = 0;
        
        let pesoTotal = juego.descargas.length + " Packages";

        div.innerHTML = `
            <img src="${juego.portada}" alt="${juego.titulo}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/8/87/PlayStation_4_logo_and_wordmark.svg'">
            <div class="info-juego">
                <h3>${juego.titulo}</h3>
                <p>${pesoTotal} available</p>
            </div>
        `;
        
        div.addEventListener('click', () => abrirDetalles(juego));
        div.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') abrirDetalles(juego);
        });

        gridJuegos.appendChild(div);
    });
}

// ==========================================
// MOTOR GOLDHEN BGDL (Background Downloader)
// ==========================================
function instalarPKG(link) {
    // Le pega al puerto local de GoldHEN para instalar directo en el sistema
    fetch('http://127.0.0.1:32038/api/install', {
        method: 'POST',
        mode: 'no-cors', // Evita bloqueos de seguridad del navegador
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'direct',
            packages: [link]
        })
    }).then(() => {
        // En vez de abrir una ventana, te avisa y sigue en la tienda
        alert("¡Enviado a Notificaciones!\nYa puedes cerrar la tienda, el juego se descargará en segundo plano a máxima velocidad.");
    }).catch(err => {
        alert("Error de conexión.\nAsegúrate de tener la opción 'Enable API' activada en los ajustes de GoldHEN.");
    });
}

function abrirDetalles(juego) {
    viewGames.className = 'vista-oculta';
    viewDetails.className = 'vista-activa';
    
    document.getElementById('detalle-portada').src = juego.portada;
    document.getElementById('detalle-titulo').textContent = juego.titulo;
    
    const listaDescargas = document.getElementById('lista-descargas');
    listaDescargas.innerHTML = '';
    
    juego.descargas.forEach(desc => {
        const a = document.createElement('a');
        a.href = '#'; // Anulamos el link normal
        a.className = 'btn-bajar btn-multi';
        a.tabIndex = 0;
        
        let colorBorde = '#00aaff'; // Azul para Base
        if(desc.tipo.toLowerCase().includes('update')) colorBorde = '#ffaa00'; // Naranja
        if(desc.tipo.toLowerCase().includes('dlc')) colorBorde = '#ff3366'; // Rojo
        
        a.style.borderLeft = `5px solid ${colorBorde}`;
        
        a.innerHTML = `
            <span class="btn-tipo">${desc.tipo}</span>
            <span class="btn-peso">${desc.peso}</span>
        `;
        
        // Disparamos la API de GoldHEN al presionar el botón o presionar X
        a.onclick = (e) => {
            e.preventDefault();
            instalarPKG(desc.link);
        };
        a.onkeypress = (e) => {
            if(e.key === 'Enter') {
                e.preventDefault();
                instalarPKG(desc.link);
            }
        };
        
        listaDescargas.appendChild(a);
    });
    
    btnVolver.focus();
}

function activarMenu(botonActivo) {
    menuItems.forEach(btn => btn.classList.remove('active'));
    botonActivo.classList.add('active');
}

btnCategories.addEventListener('click', () => {
    activarMenu(btnCategories);
    viewGames.className = 'vista-oculta';
    viewDetails.className = 'vista-oculta';
    viewCategories.className = 'vista-activa';
});

btnAllGames.addEventListener('click', () => {
    mostrarJuegosFiltro('all', 'All Games');
});

btnVolver.addEventListener('click', () => {
    mostrarJuegosFiltro(ultimaCategoria, ultimaCategoria === 'all' ? 'All Games' : 'Filtered Games');
});

// ARRANCAR
renderCategorias();
