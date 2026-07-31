// ============================================================
// ÁREA VERDE - CLEVERDADOS (CORREGIDO)
// ============================================================

// Puntajes visuales (se actualizan automáticamente)
const PUNTAJES_VERDE = [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66];

// Tabla interactiva (11 casillas) - UNA SOLA FILA
const TABLA_VERDE = [
    { valor: '≥1', bonus: null },
    { valor: '≥2', bonus: null },
    { valor: '≥3', bonus: null },
    { valor: '≥4', bonus: '+1' },           // +1 índice 3
    { valor: '≥5', bonus: null },
    { valor: '≥1', bonus: 'XAzul' },        // ✖ índice 2
    { valor: '≥2', bonus: 'Lobo' },         // ♦ índice 2
    { valor: '≥3', bonus: null },
    { valor: '≥4', bonus: '6Morado' },      // 6 índice 5
    { valor: '≥5', bonus: 'Espiral' },      // ♻ índice 3
    { valor: '≥6', bonus: null }
];

// Mapeo de bonificaciones de Verde - CORREGIDO
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
    
    // --- FILA DE PUNTAJES (VISUAL) ---
    html += `<div class="verde-puntajes-fila">`;
    PUNTAJES_VERDE.forEach((puntaje, index) => {
        const completado = index < progresoVerde;
        const clase = completado ? 'puntaje-completado' : 'puntaje-pendiente';
        html += `
            <div class="puntaje-circulo ${clase}" data-index="${index}">
                ${completado ? '✓' : puntaje}
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
                <div class="verde-cell cell ${claseMarcada}" 
                     data-index="${index}"
                     onclick="manejarClickVerde(${index})">
                    ${celda.valor}
                </div>
            </div>
        `;
    });
    html += `</div>`;
    
    // --- BONIFICACIONES DEBAJO DE CADA CASILLA ---
    html += `<div class="verde-bonus-fila">`;
    TABLA_VERDE.forEach((celda, index) => {
        const tieneBonus = celda.bonus !== null && BONUS_MAP[celda.bonus];
        if (tieneBonus) {
            const bonusIdx = BONUS_INDICES.indexOf(index);
            const completada = bonificacionesVerde[bonusIdx];
            const info = BONUS_MAP[celda.bonus];
            const clase = completada ? 'puntaje-completado' : 'puntaje-pendiente';
            html += `
                <div class="verde-bonus-item">
                    <div class="verde-bonificacion-circulo puntaje-circulo ${clase}" 
                         data-bonus-index="${bonusIdx}"
                         style="background-color: ${info.color}; border-color: ${info.color};">
                        ${completada ? '✓' : info.simbolo}
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
}

// ============================================================
// ACTUALIZAR PROGRESO
// ============================================================

function actualizarProgresoVerde() {
    let marcadas = 0;
    TABLA_VERDE.forEach((celda, index) => {
        const id = `verde-tabla-${index}`;
        if (historialMovimientos.includes(id)) {
            marcadas++;
        }
    });
    progresoVerde = marcadas;
}

// ============================================================
// MANEJAR CLICK EN CELDA - SOLO EN ORDEN
// ============================================================

function manejarClickVerde(index) {
    const id = `verde-tabla-${index}`;
    
    if (historialMovimientos.includes(id)) return;
    
    if (index !== progresoVerde) {
        const cell = document.querySelector(`.verde-cell[data-index="${index}"]`);
        if (cell) {
            cell.style.borderColor = '#ff4444';
            setTimeout(() => {
                cell.style.borderColor = '';
            }, 500);
        }
        return;
    }
    
    historialMovimientos.push(id);
    
    const cell = document.querySelector(`.verde-cell[data-index="${index}"]`);
    if (cell) {
        cell.classList.add('marcada');
    }
    
    actualizarProgresoVerde();
    actualizarPuntajesVerde();
    verificarBonificacionIndividual(index);
    recalcularPuntajesVerde();
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// VERIFICAR BONIFICACIÓN INDIVIDUAL
// ============================================================

function verificarBonificacionIndividual(index) {
    const bonusIdx = BONUS_INDICES.indexOf(index);
    if (bonusIdx === -1) return;
    if (bonificacionesVerde[bonusIdx]) return;
    
    const celda = TABLA_VERDE[index];
    if (!celda.bonus) return;
    
    bonificacionesVerde[bonusIdx] = true;
    
    const circulo = document.querySelector(`.verde-bonificacion-circulo[data-bonus-index="${bonusIdx}"]`);
    if (circulo) {
        circulo.classList.remove('puntaje-pendiente');
        circulo.classList.add('puntaje-completado');
        circulo.textContent = '✓';
    }
    
    aplicarBonificacionVerde(celda.bonus);
}

// ============================================================
// APLICAR BONIFICACIÓN - CORREGIDO
// ============================================================

function aplicarBonificacionVerde(bonus) {
    const info = BONUS_MAP[bonus];
    if (!info) return;
    
    // Usar el índice específico de la configuración
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
            desbloquearEnGrisVerde('lobo', indiceGris);
            break;
    }
    recalcularPuntajesVerde();
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
// ACTUALIZAR PUNTAJES VISUALES
// ============================================================

function actualizarPuntajesVerde() {
    const circulos = document.querySelectorAll('.verde-puntajes-fila .puntaje-circulo');
    circulos.forEach((circulo, index) => {
        const completado = index < progresoVerde;
        circulo.classList.remove('puntaje-pendiente', 'puntaje-completado');
        circulo.classList.add(completado ? 'puntaje-completado' : 'puntaje-pendiente');
        circulo.textContent = completado ? '✓' : PUNTAJES_VERDE[index];
    });
}

// ============================================================
// RECALCULAR PUNTAJES
// ============================================================

function recalcularPuntajesVerde() {
    let puntos = 0;
    if (progresoVerde > 0) {
        for (let i = 0; i < progresoVerde && i < PUNTAJES_VERDE.length; i++) {
            puntos += PUNTAJES_VERDE[i];
        }
    }
    
    puntajesAreas.verde = puntos;
    document.getElementById('score-verde').textContent = puntos;
    
    let total = 0;
    const areas = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
    areas.forEach(area => {
        total += puntajesAreas[area] || 0;
    });
    total += puntosBonificacion;
    
    puntajeTotal = total;
    document.getElementById('score-total').textContent = total;
    document.getElementById('bonus-display').textContent = puntosBonificacion;
}

// ============================================================
// RESET
// ============================================================

function resetAreaVerde() {
    progresoVerde = 0;
    bonificacionesVerde = [false, false, false, false, false];
    
    document.querySelectorAll('.verde-cell').forEach(cell => {
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