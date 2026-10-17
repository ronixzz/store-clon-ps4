// Archivo: app.js (Tienda PS4 - Formato de Payload Corregido)

const categoriasStore = [
    { id: "action", nombre: "Action", clase: "action" },
    { id: "comedy", nombre: "Comedy", clase: "comedy" },
    { id: "scifi", nombre: "Sci-Fi", clase: "scifi" },
    { id: "horror", nombre: "Horror", clase: "horror" },
    { id: "openworld", nombre: "Open World", clase: "openworld" }
];

let ultimaCategoria = 'all';

document.addEventListener('DOMContentLoaded', () => {
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

    if (gridCategorias) {
        renderCategorias(gridCategorias);
    }

    if (btnCategories) {
        btnCategories.addEventListener('click', () => {
            activarMenu(btnCategories, menuItems);
            if (viewGames) viewGames.className = 'vista-oculta';
            if (viewDetails) viewDetails.className = 'vista-oculta';
            if (viewCategories) viewCategories.className = 'vista-activa';
        });
    }

    if (btnAllGames) {
        btnAllGames.addEventListener('click', () => {
            mostrarJuegosFiltro('all', 'All Games', viewCategories, viewDetails, viewGames, gridJuegos, tituloSeccion, menuItems, btnAllGames);
        });
    }

    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            mostrarJuegosFiltro(ultimaCategoria, ultimaCategoria === 'all' ? 'All Games' : 'Filtered Games', viewCategories, viewDetails, viewGames, gridJuegos, tituloSeccion, menuItems, btnAllGames);
        });
    }
});

function renderCategorias(gridCategorias) {
    gridCategorias.innerHTML = '';
    categoriasStore.forEach(cat => {
        const div = document.createElement('div');
        div.className = `card-categoria ${cat.clase}`;
        div.tabIndex = 0;
        div.innerHTML = `<span>${cat.nombre}</span>`;
        
        div.addEventListener('click', () => mostrarJuegosFiltro(cat.id, cat.nombre, document.getElementById('view-categories'), document.getElementById('view-details'), document.getElementById('view-games'), document.getElementById('contenedor-juegos'), document.getElementById('titulo-seccion'), document.querySelectorAll('.menu li'), document.getElementById('btn-allgames')));
        
        gridCategorias.appendChild(div);
    });
}

function mostrarJuegosFiltro(filtroCat, titulo, viewCategories, viewDetails, viewGames, gridJuegos, tituloSeccion, menuItems, btnAllGames) {
    ultimaCategoria = filtroCat;
    if (btnAllGames) activarMenu(btnAllGames, menuItems);
    if (viewCategories) viewCategories.className = 'vista-oculta';
    if (viewDetails) viewDetails.className = 'vista-oculta';
    if (viewGames) viewGames.className = 'vista-activa';
    if (tituloSeccion) tituloSeccion.textContent = titulo;
    
    if (gridJuegos) {
        gridJuegos.innerHTML = '';
        let juegosFiltrados = (typeof baseDeDatos !== 'undefined') ? (filtroCat === 'all' ? baseDeDatos : baseDeDatos.filter(j => j.categoria === filtroCat)) : [];

        juegosFiltrados.forEach(juego => {
            const div = document.createElement('div');
            div.className = 'tarjeta-juego';
            div.tabIndex = 0;
            
            let pesoTotal = juego.descargas ? juego.descargas.length + " Packages" : "0 Packages";

            div.innerHTML = `
                <img src="${juego.portada}" alt="${juego.titulo}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/8/87/PlayStation_4_logo_and_wordmark.svg'">
                <div class="info-juego">
                    <h3>${juego.titulo}</h3>
                    <p>${pesoTotal} available</p>
                </div>
            `;
            
            div.addEventListener('click', () => abrirDetalles(juego, viewGames, viewDetails));
            gridJuegos.appendChild(div);
        });
    }
}

// ==========================================
// MOTOR PAYLOAD SERVER (Sintaxis JSON Estricta GoldHEN)
// ==========================================
function instalarPKG(link) {
    // Formato JSON puro que espera GoldHEN en el puerto 9090
    const payloadData = JSON.stringify({
        type: "direct",
        packages: [link]
    });

    const urlDestino = "http://127.0.0.1:9090";

    const form = document.createElement('form');
    form.action = urlDestino;
    form.method = 'POST';
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'json';
    input.value = payloadData;

    form.appendChild(input);
    document.body.appendChild(form);
    
    try {
        form.submit();
        alert("¡Paquete enviado al gestor de la PS4!");
    } catch (e) {
        const img = new Image();
        img.src = `${urlDestino}/?cmd=` + encodeURIComponent(payloadData);
        alert("¡Enviado a la cola de la consola!");
    } finally {
        setTimeout(() => {
            if (form.parentNode) {
                document.body.removeChild(form);
            }
        }, 1000);
    }
}

function abrirDetalles(juego, viewGames, viewDetails) {
    if (viewGames) viewGames.className = 'vista-oculta';
    if (viewDetails) viewDetails.className = 'vista-activa';
    
    const imgPortada = document.getElementById('detalle-portada');
    const txtTitulo = document.getElementById('detalle-titulo');
    if (imgPortada) imgPortada.src = juego.portada;
    if (txtTitulo) txtTitulo.textContent = juego.titulo;
    
    const listaDescargas = document.getElementById('lista-descargas');
    if (listaDescargas && juego.descargas) {
        listaDescargas.innerHTML = '';
        
        juego.descargas.forEach(desc => {
            const a = document.createElement('a');
            a.href = '#'; 
            a.className = 'btn-bajar btn-multi';
            a.tabIndex = 0;
            
            let colorBorde = '#00aaff'; 
            if(desc.tipo && desc.tipo.toLowerCase().includes('update')) colorBorde = '#ffaa00'; 
            if(desc.tipo && desc.tipo.toLowerCase().includes('dlc')) colorBorde = '#ff3366'; 
            
            a.style.borderLeft = `5px solid ${colorBorde}`;
            
            a.innerHTML = `
                <span class="btn-tipo">${desc.tipo || 'Base'}</span>
                <span class="btn-peso">${desc.peso || ''}</span>
            `;
            
            a.onclick = (e) => {
                e.preventDefault();
                instalarPKG(desc.link);
            };
            
            listaDescargas.appendChild(a);
        });
    }
    
    const btnVolver = document.getElementById('btn-volver');
    if (btnVolver) btnVolver.focus();
}

function activarMenu(botonActivo, menuItems) {
    if (menuItems) {
        menuItems.forEach(btn => btn.classList.remove('active'));
    }
    if (botonActivo) {
        botonActivo.classList.add('active');
    }
}
