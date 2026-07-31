// ============================================================
// LEADERBOARD.JS - CLEVERDADOS (CORREGIDO)
// ============================================================

// Colores de las áreas para los tags
const COLORES_AREA = {
    gris: '#78909c',
    amarilla: '#fdd835',
    azul: '#1e88e5',
    verde: '#43a047',
    naranja: '#ff6f00',
    morado: '#7b1fa2'
};

// Nombres de las áreas para mostrar
const NOMBRES_AREA = {
    gris: 'Gris',
    amarilla: 'Amarilla',
    azul: 'Azul',
    verde: 'Verde',
    naranja: 'Naranja',
    morado: 'Morado'
};

// ============================================================
// GENERAR MINIATURA DE ÁREA AMARILLA
// ============================================================
function generarMiniaturaAmarilla(marcas) {
    const filas = 4;
    const columnas = 5;
    let html = '<div class="mini-area mini-amarilla">';
    
    for (let f = 0; f < filas; f++) {
        html += '<div class="mini-fila">';
        for (let c = 0; c < columnas; c++) {
            const id = `amarilla-${f}-${c}`;
            const estaMarcada = marcas.includes(id);
            const esX = f === 0 && c === 3 || f === 1 && c === 2 || f === 2 && c === 1 || f === 3 && c === 0;
            const clase = estaMarcada ? 'mini-cell marcada' : (esX ? 'mini-cell pre-marcada' : 'mini-cell');
            html += `<div class="${clase}"></div>`;
        }
        html += '</div>';
    }
    html += '</div>';
    return html;
}

// ============================================================
// GENERAR MINIATURA DE ÁREA AZUL
// ============================================================
function generarMiniaturaAzul(marcas) {
    const filas = 3;
    const columnas = 4;
    let html = '<div class="mini-area mini-azul">';
    
    for (let f = 0; f < filas; f++) {
        html += '<div class="mini-fila">';
        for (let c = 0; c < columnas; c++) {
            const index = f * 4 + c;
            const id = `azul-tabla-${index}`;
            const estaMarcada = marcas.includes(id);
            const esVacio = (f === 0 && c === 0);
            const clase = estaMarcada ? 'mini-cell marcada' : (esVacio ? 'mini-cell vacia' : 'mini-cell');
            html += `<div class="${clase}"></div>`;
        }
        html += '</div>';
    }
    html += '</div>';
    return html;
}

// ============================================================
// GENERAR MINIATURA DE ÁREA VERDE
// ============================================================
function generarMiniaturaVerde(marcas) {
    const total = 11;
    let html = '<div class="mini-area mini-verde">';
    html += '<div class="mini-fila">';
    
    for (let i = 0; i < total; i++) {
        const id = `verde-tabla-${i}`;
        const estaMarcada = marcas.includes(id);
        const clase = estaMarcada ? 'mini-cell marcada' : 'mini-cell';
        html += `<div class="${clase}"></div>`;
    }
    
    html += '</div>';
    html += '</div>';
    return html;
}

// ============================================================
// GENERAR MINIATURA DE ÁREA NARANJA
// ============================================================
function generarMiniaturaNaranja(marcas, valores) {
    const total = 11;
    let html = '<div class="mini-area mini-naranja">';
    html += '<div class="mini-fila">';
    
    for (let i = 0; i < total; i++) {
        const id = `naranja-${i}`;
        const estaMarcada = marcas.includes(id);
        const valor = valores && valores[i] ? valores[i] : '';
        const esMultiplicador = typeof NARANJA_CONFIG !== 'undefined' && NARANJA_CONFIG[i] && NARANJA_CONFIG[i].multiplicador > 1;
        const clase = estaMarcada ? 'mini-cell marcada' : (esMultiplicador ? 'mini-cell multiplicador' : 'mini-cell');
        html += `<div class="${clase}">${estaMarcada ? valor : ''}</div>`;
    }
    
    html += '</div>';
    html += '</div>';
    return html;
}

// ============================================================
// GENERAR MINIATURA DE ÁREA MORADO
// ============================================================
function generarMiniaturaMorado(marcas, valores) {
    const total = 11;
    let html = '<div class="mini-area mini-morado">';
    html += '<div class="mini-fila">';
    
    for (let i = 0; i < total; i++) {
        const id = `morado-${i}`;
        const estaMarcada = marcas.includes(id);
        const valor = valores && valores[i] ? valores[i] : '';
        const clase = estaMarcada ? 'mini-cell marcada' : 'mini-cell';
        html += `<div class="${clase}">${estaMarcada ? valor : ''}</div>`;
    }
    
    html += '</div>';
    html += '</div>';
    return html;
}

// ============================================================
// GENERAR MINIATURA DE ÁREA GRIS
// ============================================================
function generarMiniaturaGris(marcas) {
    let html = '<div class="mini-area mini-gris">';
    
    // Turnos
    html += '<div class="mini-fila mini-turnos">';
    for (let i = 0; i < 6; i++) {
        const id = `gris-turno-${i}`;
        const estaMarcada = marcas.includes(id);
        const clase = estaMarcada ? 'mini-cell marcada' : 'mini-cell';
        html += `<div class="${clase}">${i + 1}</div>`;
    }
    html += '</div>';
    
    // Habilidades
    html += '<div class="mini-fila mini-habilidades">';
    const habilidades = ['espiral', 'mas1', 'dados1', 'x', 'seis', 'dados2'];
    habilidades.forEach(habilidad => {
        const encontrada = marcas.some(m => m.startsWith(`gris-${habilidad}-`));
        const clase = encontrada ? 'mini-cell marcada' : 'mini-cell';
        html += `<div class="${clase}"></div>`;
    });
    html += '</div>';
    
    html += '</div>';
    return html;
}

// ============================================================
// GENERAR MINIATURA COMPLETA DE UN JUGADOR
// ============================================================
function generarMiniaturasJugador(movimientos, valoresNaranja, valoresMorado) {
    const marcas = movimientos || [];
    
    return `
        <div class="miniaturas-container">
            <div class="mini-wrapper">
                <span class="mini-label">Amarilla</span>
                ${generarMiniaturaAmarilla(marcas)}
            </div>
            <div class="mini-wrapper">
                <span class="mini-label">Azul</span>
                ${generarMiniaturaAzul(marcas)}
            </div>
            <div class="mini-wrapper">
                <span class="mini-label">Verde</span>
                ${generarMiniaturaVerde(marcas)}
            </div>
            <div class="mini-wrapper">
                <span class="mini-label">Naranja</span>
                ${generarMiniaturaNaranja(marcas, valoresNaranja)}
            </div>
            <div class="mini-wrapper">
                <span class="mini-label">Morado</span>
                ${generarMiniaturaMorado(marcas, valoresMorado)}
            </div>
            <div class="mini-wrapper">
                <span class="mini-label">Gris</span>
                ${generarMiniaturaGris(marcas)}
            </div>
        </div>
    `;
}

// ============================================================
// GENERAR TAGS DE PUNTAJES POR ÁREA - CORREGIDO
// ============================================================
function generarTagsPuntajes(puntajesPorArea) {
    const areas = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
    let html = '<div class="puntajes-tags">';
    
    areas.forEach(area => {
        // Usar puntajesPorArea que viene del jugador
        let puntos = 0;
        if (puntajesPorArea && puntajesPorArea[area] !== undefined) {
            puntos = puntajesPorArea[area];
        }
        const color = COLORES_AREA[area];
        const nombre = NOMBRES_AREA[area];
        html += `
            <span class="puntaje-tag" style="border-color: ${color}">
                <span class="tag-dot" style="background: ${color}"></span>
                ${nombre}: ${puntos}pts
            </span>
        `;
    });
    
    // Bonus
    let bonus = 0;
    if (puntajesPorArea && puntajesPorArea.bonificacion !== undefined) {
        bonus = puntajesPorArea.bonificacion;
    }
    html += `
        <span class="puntaje-tag bonus-tag" style="border-color: #ffd700">
            <span class="tag-dot" style="background: #ffd700">⭐</span>
            Bonus: ${bonus}pts
        </span>
    `;
    
    html += '</div>';
    return html;
}

// ============================================================
// RENDERIZAR LEADERBOARD COMPLETO - CORREGIDO
// ============================================================
function renderizarLeaderboard() {
    const list = document.getElementById('playersList');
    if (!list) return;
    
    list.innerHTML = '';
    
    // Verificar si datosJugadores existe
    if (typeof datosJugadores === 'undefined' || !datosJugadores || Object.keys(datosJugadores).length === 0) {
        list.innerHTML = '<div class="no-players">Esperando jugadores...</div>';
        return;
    }
    
    // Obtener jugadores
    const jugadores = Object.keys(datosJugadores).map(id => ({
        id: id,
        ...datosJugadores[id]
    })).sort((a, b) => (b.puntaje || 0) - (a.puntaje || 0));
    
    if (jugadores.length === 0) {
        list.innerHTML = '<div class="no-players">Esperando jugadores...</div>';
        return;
    }
    
    jugadores.forEach((j, index) => {
        const soyYo = j.id === miId;
        const movimientos = j.movimientos || [];
        
        // OBTENER PUNTAJES POR ÁREA DEL JUGADOR
        let puntajesPorArea = j.puntajesPorArea || null;
        
        // Si no tiene puntajesPorArea, crear uno con el puntaje total
        if (!puntajesPorArea) {
            puntajesPorArea = {
                gris: 0,
                amarilla: 0,
                azul: 0,
                verde: 0,
                naranja: 0,
                morado: 0,
                bonificacion: 0,
                total: j.puntaje || 0
            };
        }
        
        // Asegurar que el total coincida con j.puntaje
        // Si el total en puntajesPorArea es diferente, usar j.puntaje
        if (j.puntaje !== undefined && j.puntaje !== null) {
            puntajesPorArea.total = j.puntaje;
        }
        
        // Medalla para top 3
        let medalla = '';
        if (index === 0) medalla = '🥇';
        else if (index === 1) medalla = '🥈';
        else if (index === 2) medalla = '🥉';
        
        // Miniaturas del jugador
        const miniaturas = generarMiniaturasJugador(
            movimientos,
            j.valoresNaranja || null,
            j.valoresMorado || null
        );
        
        // Tags de puntajes
        const tags = generarTagsPuntajes(puntajesPorArea);
        
        const card = document.createElement('div');
        card.className = `player-card ${soyYo ? 'me' : ''}`;
        
        card.innerHTML = `
            <div class="player-card-header">
                <div class="player-name">
                    ${medalla} ${j.nombre}${soyYo ? ' (Tú)' : ''}
                </div>
                <div class="player-total">
                    🏆 ${puntajesPorArea.total || 0} pts
                </div>
            </div>
            ${miniaturas}
            ${tags}
        `;
        
        list.appendChild(card);
    });
}

// ============================================================
// ACTUALIZAR LEADERBOARD
// ============================================================
function actualizarLeaderboard() {
    renderizarLeaderboard();
}

// ============================================================
// ESTILOS CSS PARA MINIATURAS
// ============================================================
const LEADERBOARD_STYLES = `
/* ============================================================
   LEADERBOARD - MINIATURAS
   ============================================================ */

.leaderboard {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.leaderboard h3 {
    font-size: 0.85rem;
    color: var(--text-muted);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.no-players {
    color: var(--text-muted);
    text-align: center;
    padding: 20px;
    font-size: 0.9rem;
}

.player-card {
    background: var(--bg-box);
    border-radius: 10px;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    transition: all 0.2s;
}

.player-card.me {
    border-left: 4px solid var(--color-azul);
}

.player-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.player-name {
    font-weight: bold;
    font-size: 0.9rem;
    color: #fff;
}

.player-total {
    font-weight: bold;
    font-size: 0.9rem;
    color: #ffd700;
}

/* ============================================================
   MINIATURAS DE ÁREAS
   ============================================================ */

.miniaturas-container {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
    margin-bottom: 8px;
}

.mini-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.mini-label {
    font-size: 0.45rem;
    text-transform: uppercase;
    color: var(--text-muted);
    letter-spacing: 0.3px;
}

.mini-area {
    background: var(--bg-main);
    border-radius: 3px;
    padding: 2px;
    border: 1px solid var(--border-color);
    width: 100%;
    max-width: 80px;
    overflow: hidden;
}

.mini-fila {
    display: flex;
    gap: 1px;
    justify-content: center;
}

.mini-cell {
    width: 7px;
    height: 7px;
    background: var(--bg-cell);
    border-radius: 1px;
    font-size: 0.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: all 0.1s;
}

.mini-cell.marcada {
    background: #4caf50;
    color: #4caf50;
}

.mini-cell.pre-marcada {
    background: rgba(255, 0, 0, 0.15);
}

.mini-cell.vacia {
    opacity: 0.2;
}

.mini-cell.multiplicador {
    border: 1px solid #ffd700;
}

/* Gris - turnos especiales */
.mini-turnos .mini-cell {
    width: 9px;
    height: 9px;
    font-size: 0.35rem;
    color: var(--text-muted);
}

.mini-turnos .mini-cell.marcada {
    color: #4caf50;
}

.mini-habilidades .mini-cell {
    width: 9px;
    height: 9px;
}

/* ============================================================
   TAGS DE PUNTAJES
   ============================================================ */

.puntajes-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    margin-top: 4px;
}

.puntaje-tag {
    font-size: 0.55rem;
    padding: 1px 6px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--bg-main);
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 3px;
}

.tag-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
}

.puntaje-tag.bonus-tag {
    border-color: #ffd700;
    color: #ffd700;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */

@media (max-width: 768px) {
    .miniaturas-container {
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
    }
    
    .mini-area {
        max-width: 60px;
    }
    
    .mini-cell {
        width: 6px;
        height: 6px;
    }
    
    .mini-turnos .mini-cell {
        width: 7px;
        height: 7px;
    }
    
    .mini-habilidades .mini-cell {
        width: 7px;
        height: 7px;
    }
    
    .puntaje-tag {
        font-size: 0.45rem;
        padding: 1px 4px;
    }
}

@media (max-width: 480px) {
    .miniaturas-container {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .mini-area {
        max-width: 50px;
    }
    
    .mini-cell {
        width: 5px;
        height: 5px;
    }
    
    .mini-turnos .mini-cell {
        width: 6px;
        height: 6px;
    }
    
    .mini-habilidades .mini-cell {
        width: 6px;
        height: 6px;
    }
    
    .puntaje-tag {
        font-size: 0.4rem;
        padding: 1px 3px;
    }
}

/* Landscape */
@media (orientation: landscape) and (max-height: 700px) {
    .miniaturas-container {
        grid-template-columns: repeat(6, 1fr);
        gap: 2px;
    }
    
    .mini-area {
        max-width: 55px;
    }
    
    .mini-cell {
        width: 5px;
        height: 5px;
    }
    
    .puntajes-tags {
        gap: 2px;
    }
    
    .puntaje-tag {
        font-size: 0.4rem;
        padding: 1px 3px;
    }
}
`;

// ============================================================
// INYECTAR ESTILOS
// ============================================================
(function injectLeaderboardStyles() {
    const style = document.createElement('style');
    style.textContent = LEADERBOARD_STYLES;
    document.head.appendChild(style);
})();

// ============================================================
// EXPORTAR
// ============================================================

window.renderizarLeaderboard = renderizarLeaderboard;
window.actualizarLeaderboard = actualizarLeaderboard;
window.generarMiniaturasJugador = generarMiniaturasJugador;