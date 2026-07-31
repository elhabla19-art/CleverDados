// ============================================================
// MAIN - CLEVERDADOS (CORREGIDO)
// ============================================================

// Estado global del juego
let historialMovimientos = [];
let puntajeTotal = 0;
let puntosBonificacion = 0;
let puntajesAreas = {
    gris: 0,
    amarilla: 0,
    azul: 0,
    verde: 0,
    naranja: 0,
    morado: 0
};

// Configuración de áreas
const AREAS = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];

// ============================================================
// SISTEMA DE PUNTUACIÓN - CORREGIDO
// ============================================================

function calcularPuntajes() {
    // Si existe el sistema de puntuación, usarlo
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        // Esto actualiza puntajesAreas y puntajeTotal internamente
        const total = PUNTAJES.calcularTotal();
        
        // Asegurar que la variable global se actualice
        window.puntajeTotal = total;
        
        // Asegurar que puntajesAreas tenga los valores correctos
        const areas = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
        areas.forEach(area => {
            const element = document.getElementById(`score-${area}`);
            if (element) {
                element.textContent = puntajesAreas[area] || 0;
            }
        });
        
        // Actualizar total
        document.getElementById('score-total').textContent = total;
        document.getElementById('bonus-display').textContent = puntosBonificacion || 0;
        
        // Actualizar leaderboard local
        if (typeof renderizarLeaderboard === 'function') {
            renderizarLeaderboard();
        }
        
        // Sincronizar con otros jugadores
        if (typeof broadcastPuntaje === 'function') {
            broadcastPuntaje('sync');
        }
        return;
    }
 
    // Fallback: sistema antiguo (solo por si acaso)
    let total = 0;
    let bonus = 0;

    AREAS.forEach(area => {
        const marks = historialMovimientos.filter(m => m.startsWith(area));
        const count = marks.length;
        
        let puntos = count > 0 ? count * (count + 1) / 2 : 0;
        
        // Verificar multiplicadores (×2, ×3) en el área
        const tieneX2 = historialMovimientos.some(m => {
            const cell = document.querySelector(`[data-area="${area}"] .cell.marcada`);
            return cell && cell.textContent.trim() === '×2';
        });
        const tieneX3 = historialMovimientos.some(m => {
            const cell = document.querySelector(`[data-area="${area}"] .cell.marcada`);
            return cell && cell.textContent.trim() === '×3';
        });
        
        if (tieneX3) puntos *= 3;
        else if (tieneX2) puntos *= 2;
        
        puntajesAreas[area] = puntos;
        total += puntos;
        
        document.getElementById(`score-${area}`).textContent = puntos;
    });

    bonus = puntosBonificacion;
    total += bonus;
    
    puntajeTotal = total;
    document.getElementById('score-total').textContent = total;
    document.getElementById('bonus-display').textContent = bonus;
    
    // Actualizar leaderboard después de calcular
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
    
    // Sincronizar con otros jugadores
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// ACTUALIZAR VISUALES
// ============================================================

function actualizarVisuales() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('marcada', 'deshabilitada');
        
        const area = cell.dataset.area;
        const fila = cell.dataset.fila;
        const col = cell.dataset.col;
        
        // Solo procesar si tiene area, fila y col
        if (area && fila !== undefined && col !== undefined) {
            const id = `${area}-${fila}-${col}`;
            if (historialMovimientos.includes(id)) {
                cell.classList.add('marcada');
            }
        }
    });
}

// ============================================================
// MANEJAR CLICK EN CELDA (SOLO PARA CELDAS CON area, fila, col)
// ============================================================

function manejarClickCelda(cell) {
    const area = cell.dataset.area;
    const fila = cell.dataset.fila;
    const col = cell.dataset.col;
    
    // Si no tiene area, fila o col, ignorar (es una celda con manejador propio)
    if (!area || fila === undefined || col === undefined) {
        return;
    }
    
    const id = `${area}-${fila}-${col}`;
    
    if (cell.classList.contains('marcada') || cell.classList.contains('pre-marcada')) {
        return;
    }
    
    const puedeMarcar = window[`puedeMarcar${capitalize(area)}`] 
        ? window[`puedeMarcar${capitalize(area)}`](fila, col) 
        : true;
    
    if (!puedeMarcar) return;
    
    cell.classList.add('marcada');
    historialMovimientos.push(id);
    
    aplicarBonificacion(area, fila, col);
    
    calcularPuntajes();
    actualizarVisuales();
}

// ============================================================
// APLICAR BONIFICACIONES
// ============================================================

function aplicarBonificacion(area, fila, col) {
    const cell = document.querySelector(`[data-area="${area}"][data-fila="${fila}"][data-col="${col}"]`);
    if (!cell) return;
    
    const texto = cell.textContent.trim();
    
    switch(texto) {
        case '🌀':
        case '♻':
            puntosBonificacion += 1;
            break;
        case '+1':
            puntosBonificacion += 1;
            break;
        case '×2':
            break;
        case '×3':
            break;
        case '🐺':
            break;
        case '6':
            break;
    }
}

// ============================================================
// CAPITALIZAR
// ============================================================

function capitalize(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
// REINICIAR TABLERO
// ============================================================

function reiniciarTablero() {
    historialMovimientos = [];
    puntosBonificacion = 0;
    puntajesAreas = {
        gris: 0,
        amarilla: 0,
        azul: 0,
        verde: 0,
        naranja: 0,
        morado: 0
    };
    
    // Resetear valores de áreas
    if (typeof valoresNaranja !== 'undefined') {
        valoresNaranja = new Array(11).fill(null);
    }
    if (typeof valoresMorado !== 'undefined') {
        valoresMorado = new Array(11).fill(null);
    }
    if (typeof resetAreaGris === 'function') resetAreaGris();
    if (typeof resetAreaAmarilla === 'function') resetAreaAmarilla();
    if (typeof resetAreaAzul === 'function') resetAreaAzul();
    if (typeof resetAreaVerde === 'function') resetAreaVerde();
    if (typeof resetAreaNaranja === 'function') resetAreaNaranja();
    if (typeof resetAreaMorado === 'function') resetAreaMorado();
    
    document.querySelectorAll('.cell.marcada').forEach(cell => {
        cell.classList.remove('marcada');
    });
    
    // Recalcular puntajes después de reiniciar
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    } else {
        calcularPuntajes();
    }
    
    actualizarVisuales();
    
    // Actualizar leaderboard
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
    
    // Sincronizar con otros jugadores
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// FUNCIONES DE UI
// ============================================================

function mostrarModalReinicio() {
    document.getElementById('confirmModal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

function confirmarReinicio() {
    reiniciarTablero();
    cerrarModal();
}

function jugarSolo() {
    document.getElementById('lobbyModal').style.display = 'none';
    // Inicializar leaderboard en modo local
    if (typeof datosJugadores !== 'undefined') {
        datosJugadores = {};
        datosJugadores['local'] = {
            nombre: miNombre || 'Jugador',
            puntaje: 0,
            movimientos: [],
            valoresNaranja: null,
            valoresMorado: null,
            puntajesPorArea: null
        };
        // Actualizar miId para modo local
        miId = 'local';
    }
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
}

// ============================================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================================

window.calcularPuntajes = calcularPuntajes;
window.actualizarVisuales = actualizarVisuales;
window.manejarClickCelda = manejarClickCelda;
window.aplicarBonificacion = aplicarBonificacion;
window.reiniciarTablero = reiniciarTablero;
window.mostrarModalReinicio = mostrarModalReinicio;
window.cerrarModal = cerrarModal;
window.confirmarReinicio = confirmarReinicio;
window.jugarSolo = jugarSolo;

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar cada área
    if (typeof inicializarAreaGris === 'function') inicializarAreaGris();
    if (typeof inicializarAreaAmarilla === 'function') inicializarAreaAmarilla();
    if (typeof inicializarAreaAzul === 'function') inicializarAreaAzul();
    if (typeof inicializarAreaVerde === 'function') inicializarAreaVerde();
    if (typeof inicializarAreaNaranja === 'function') inicializarAreaNaranja();
    if (typeof inicializarAreaMorado === 'function') inicializarAreaMorado();
    
    // Agregar event listeners SOLO a celdas que tienen area, fila y col
    document.querySelectorAll('.cell:not(.pre-marcada)').forEach(cell => {
        // Solo agregar si tiene los atributos necesarios
        if (cell.dataset.area && cell.dataset.fila !== undefined && cell.dataset.col !== undefined) {
            cell.addEventListener('click', () => manejarClickCelda(cell));
        }
    });
    
    // Calcular puntajes iniciales
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    } else {
        calcularPuntajes();
    }
    
    // Inicializar leaderboard si está disponible
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
    
    console.log('🧠 CleverDados inicializado correctamente');
});