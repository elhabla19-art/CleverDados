// ============================================================
// ÁREA VERDE - CLEVERDADOS (CORREGIDO - PUNTAJES ESTÁTICOS Y LOBOS)
// ============================================================

// Puntajes visuales (siempre estáticos)
const PUNTAJES_VERDE = [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66];

// Tabla interactiva (11 casillas) - UNA SOLA FILA
const TABLA_VERDE = [
    { valor: '≥1', bonus: null },
    { valor: '≥2', bonus: null },
    { valor: '≥3', bonus: null },
    { valor: '≥4', bonus: '+1' },
    { valor: '≥5', bonus: null },
    { valor: '≥1', bonus: 'XAzul' },
    { valor: '≥2', bonus: 'Lobo' },
    { valor: '≥3', bonus: null },
    { valor: '≥4', bonus: '6Morado' },
    { valor: '≥5', bonus: 'Espiral' },
    { valor: '≥6', bonus: null }
];

// Mapeo de bonificaciones de Verde
const BONUS_MAP = {
    '+1': { color: '#78909c', simbolo: '+1', tipo: 'mas1', indiceGris: 3 },
    'XAzul': { color: '#1e88e5', simbolo: '✖', tipo: 'x', indiceGris: 2 },
    'Lobo': { color: '#d32f2f', simbolo: '♦', tipo: 'lobo', indiceGris: 2 },
    '6Morado': { color: '#7b1fa2', simbolo: '6', tipo: 'seis', indiceGris: 5 },
    'Espiral': { color: '#78909c', simbolo: '♻', tipo: 'espiral', indiceGris: 3 }
};

// Índices que tienen bonificación
const BONUS_INDICES = [3, 5, 6, 8, 9];

// Estado
let progresoVerde = 0;
let bonificacionesVerde = [false, false, false, false, false];

// ============================================================
// INICIALIZACIÓN
// ============================================================

function inicializarAreaVerde() {
    const container = document.getElementById('area-verde-content');
    if (!container) return;
    
    actualizarProgresoVerde();
    
    let html = `<div class="verde-grid">`;
    
    // --- FILA DE PUNTAJES (VISUAL) - SIEMPRE ESTÁTICOS ---
    html += `<div class="verde-puntajes-fila">`;
    PUNTAJES_VERDE.forEach((puntaje, index) => {
        // SIEMPRE la misma clase, sin importar el progreso
        html += `
            <div class="puntaje-circulo" data-verde-puntaje="${index}" style="opacity:0.5;">
                ${puntaje}
            </div>
        `;
    });
    html += `</div>`;
    
    // --- TABLA INTERACTIVA ---
    html += `<div class="verde-tabla-container">`;
    html += `<div class="verde-fila">`;
    
    TABLA_VERDE.forEach((celda, index) => {
        const id = `verde-tabla-${index}`;
        const estaMarcada = historialMovimientos.includes(id);
        const claseMarcada = estaMarcada ? 'marcada' : '';
        
        html += `
            <div class="verde-celda-wrapper">
                <div class="cell ${claseMarcada}" 
                     data-area="verde"
                     data-index="${index}"
                     onclick="manejarClickVerde(${index})">
                    ${celda.valor}
                </div>
            </div>
        `;
    });
    html += `</div>`;
    
    // --- BONIFICACIONES DEBAJO DE CADA CASILLA - SIEMPRE ESTÁTICAS ---
    html += `<div class="verde-bonus-fila">`;
    TABLA_VERDE.forEach((celda, index) => {
        const tieneBonus = celda.bonus !== null && BONUS_MAP[celda.bonus];
        if (tieneBonus) {
            const info = BONUS_MAP[celda.bonus];
            html += `
                <div class="verde-bonus-item">
                    <div class="verde-bonificacion-circulo" 
                         data-bonus-index="${index}"
                         style="background-color: ${info.color}; border-color: ${info.color}; opacity:0.5;">
                        ${info.simbolo}
                    </div>
                </div>
            `;
        } else {
            html += `<div class="verde-bonus-item vacio"></div>`;
        }
    });
    html += `</div>`;
    
    html += `</div>`;
    html += `</div>`;
    
    container.innerHTML = html;
    
    // Aplicar estado visual inicial
    actualizarVisuales();
}

// ============================================================
// ACTUALIZAR PROGRESO
// ============================================================

function actualizarProgresoVerde() {
    let marcadas = 0;
    if (typeof TABLA_VERDE !== 'undefined' && TABLA_VERDE && typeof historialMovimientos !== 'undefined') {
        TABLA_VERDE.forEach((celda, index) => {
            const id = `verde-tabla-${index}`;
            if (historialMovimientos.includes(id)) {
                marcadas++;
            }
        });
    }
    progresoVerde = marcadas;
}

// ============================================================
// MANEJAR CLICK EN CELDA - SOLO EN ORDEN
// ============================================================

function manejarClickVerde(index) {
    // SOLO permitir clicks en modo zoom
    if (typeof enModoZoom === 'undefined' || !enModoZoom) {
        return;
    }
    
    const id = `verde-tabla-${index}`;
    
    if (historialMovimientos.includes(id)) return;
    
    if (index !== progresoVerde) {
        const cell = document.querySelector(`.cell[data-area="verde"][data-index="${index}"]`);
        if (cell) {
            cell.style.borderColor = '#ff4444';
            setTimeout(() => {
                cell.style.borderColor = '';
            }, 500);
        }
        return;
    }
    
    // Marcar la casilla
    historialMovimientos.push(id);
    
    // Actualizar visuales
    actualizarVisuales();
    
    // Actualizar visuales del zoom si está abierto
    if (typeof actualizarVisualesZoom === 'function') {
        actualizarVisualesZoom();
    }
    
    // Actualizar progreso
    actualizarProgresoVerde();
    
    // Verificar bonificación individual (desbloquea en gris o registra lobo)
    verificarBonificacionIndividual(index);
    
    // Recalcular puntajes
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    } else {
        recalcularPuntajesVerde();
    }
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// VERIFICAR BONIFICACIÓN INDIVIDUAL - DESBLOQUEA EN GRIS O REGISTRA LOBO
// ============================================================

function verificarBonificacionIndividual(index) {
    const bonusIdx = BONUS_INDICES.indexOf(index);
    if (bonusIdx === -1) return;
    if (bonificacionesVerde[bonusIdx]) return;
    
    const celda = TABLA_VERDE[index];
    if (!celda.bonus) return;
    
    bonificacionesVerde[bonusIdx] = true;
    
    // Si es Lobo, registrar en lugar de desbloquear en Gris
    if (celda.bonus === 'Lobo') {
        if (typeof registrarLobo === 'function') {
            registrarLobo('verde');
        }
    } else {
        aplicarBonificacionVerde(celda.bonus);
    }
}

// ============================================================
// APLICAR BONIFICACIÓN - DESBLOQUEA EN GRIS
// ============================================================

function aplicarBonificacionVerde(bonus) {
    const info = BONUS_MAP[bonus];
    if (!info) return;
    
    const indiceGris = info.indiceGris;
    
    switch(info.tipo) {
        case 'mas1':
            desbloquearEnGrisVerde('mas1', indiceGris);
            break;
        case 'espiral':
            desbloquearEnGrisVerde('espiral', indiceGris);
            break;
        case 'x':
            desbloquearEnGrisVerde('x', indiceGris);
            break;
        case 'seis':
            desbloquearEnGrisVerde('seis', indiceGris);
            break;
        case 'lobo':
            // Los lobos ya se manejan en verificarBonificacionIndividual
            break;
    }
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    } else {
        recalcularPuntajesVerde();
    }
}

// ============================================================
// DESBLOQUEAR EN GRIS
// ============================================================

function desbloquearEnGrisVerde(habilidadId, indice) {
    const selector = `.celda-habilidad[data-habilidad="${habilidadId}"][data-col="${indice}"]`;
    const cell = document.querySelector(selector);
    
    if (cell && cell.classList.contains('bloqueada')) {
        cell.classList.remove('bloqueada');
        cell.classList.add('desbloqueada');
        if (cell.dataset.color) {
            cell.style.opacity = '1';
            cell.style.filter = 'none';
        }
        return true;
    }
    return false;
}

// ============================================================
// RECALCULAR PUNTAJES (FALLBACK)
// ============================================================

function recalcularPuntajesVerde() {
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
        return;
    }
    
    let puntos = 0;
    if (progresoVerde > 0) {
        for (let i = 0; i < progresoVerde && i < PUNTAJES_VERDE.length; i++) {
            puntos += PUNTAJES_VERDE[i];
        }
    }
    
    puntajesAreas.verde = puntos;
    const element = document.getElementById('score-verde');
    if (element) element.textContent = puntos;
    
    let total = 0;
    const areas = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
    areas.forEach(area => {
        total += puntajesAreas[area] || 0;
    });
    total += puntosBonificacion;
    
    puntajeTotal = total;
    const totalElement = document.getElementById('score-total');
    const bonusElement = document.getElementById('bonus-display');
    if (totalElement) totalElement.textContent = total;
    if (bonusElement) bonusElement.textContent = puntosBonificacion;
}

// ============================================================
// RESET
// ============================================================

function resetAreaVerde() {
    progresoVerde = 0;
    bonificacionesVerde = [false, false, false, false, false];
    
    document.querySelectorAll('.cell[data-area="verde"]').forEach(cell => {
        cell.classList.remove('marcada');
        cell.style.borderColor = '';
    });
    
    inicializarAreaVerde();
}

// ============================================================
// EXPORTAR
// ============================================================

window.inicializarAreaVerde = inicializarAreaVerde;
window.resetAreaVerde = resetAreaVerde;
window.recalcularPuntajesVerde = recalcularPuntajesVerde;
window.manejarClickVerde = manejarClickVerde;