// ============================================================
// MAIN - CLEVERDADOS
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

// Sistema de puntuación
function calcularPuntajes() {
    let total = 0;
    let bonus = 0;

    AREAS.forEach(area => {
        const marks = historialMovimientos.filter(m => m.startsWith(area));
        const count = marks.length;
        
        // Puntos base: suma triangular
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

    // Bonificaciones
    bonus = puntosBonificacion;
    total += bonus;
    
    puntajeTotal = total;
    document.getElementById('score-total').textContent = total;
    document.getElementById('bonus-display').textContent = bonus;
}

// Actualizar visuales del tablero
function actualizarVisuales() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('marcada', 'deshabilitada');
        
        const area = cell.dataset.area;
        const fila = cell.dataset.fila;
        const col = cell.dataset.col;
        const id = `${area}-${fila}-${col}`;
        
        if (historialMovimientos.includes(id)) {
            cell.classList.add('marcada');
        }
    });
}

// Manejar clic en celda
function manejarClickCelda(cell) {
    const area = cell.dataset.area;
    const fila = cell.dataset.fila;
    const col = cell.dataset.col;
    const id = `${area}-${fila}-${col}`;
    
    // Si ya está marcada o es pre-marcada, no hacer nada
    if (cell.classList.contains('marcada') || cell.classList.contains('pre-marcada')) {
        return;
    }
    
    // Verificar si se puede marcar según las reglas del área
    const puedeMarcar = window[`puedeMarcar${capitalize(area)}`] 
        ? window[`puedeMarcar${capitalize(area)}`](fila, col) 
        : true;
    
    if (!puedeMarcar) return;
    
    // Marcar la celda
    cell.classList.add('marcada');
    historialMovimientos.push(id);
    
    // Aplicar efecto de bonificación
    aplicarBonificacion(area, fila, col);
    
    // Actualizar puntuación
    calcularPuntajes();
    actualizarVisuales();
    
    // Broadcast a otros jugadores
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// Aplicar bonificaciones
function aplicarBonificacion(area, fila, col) {
    const cell = document.querySelector(`[data-area="${area}"][data-fila="${fila}"][data-col="${col}"]`);
    if (!cell) return;
    
    const texto = cell.textContent.trim();
    
    switch(texto) {
        case '🌀': // Espiral
            puntosBonificacion += 1;
            break;
        case '+1':
            puntosBonificacion += 1;
            break;
        case '×2':
            // Se aplica en el cálculo
            break;
        case '×3':
            // Se aplica en el cálculo
            break;
        case '🐺': // Lobo
            // Efecto especial
            break;
        case '6':
            // Efecto especial
            break;
    }
}

// Capitalizar primera letra
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Reiniciar tablero
function reiniciarTablero() {
    historialMovimientos = [];
    puntosBonificacion = 0;
    
    document.querySelectorAll('.cell.marcada').forEach(cell => {
        cell.classList.remove('marcada');
    });
    
    calcularPuntajes();
    actualizarVisuales();
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
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

function jugarSolo() {
    document.getElementById('lobbyModal').style.display = 'none';
}

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
    
    // Agregar event listeners a todas las celdas
    document.querySelectorAll('.cell:not(.pre-marcada)').forEach(cell => {
        cell.addEventListener('click', () => manejarClickCelda(cell));
    });
    
    calcularPuntajes();
});