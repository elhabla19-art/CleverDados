// ============================================================
// ÁREA AMARILLA - CLEVERDADOS (CORREGIDO - CON PUNTAJES Y LOBOS)
// ============================================================

// Configuración del área amarilla
const AMARILLA_CONFIG = {
    filas: [
        { numeros: [3, 6, 5, 'X'], bonificacion: 'XAzul', color: '#1e88e5', simbolo: '✖', habilidadGris: 'x', indiceGris: 1 },
        { numeros: [2, 1, 'X', 5], bonificacion: '4Naranja', color: '#ff6f00', simbolo: '4', habilidadGris: 'seis', indiceGris: 1 },
        { numeros: [1, 'X', 2, 4], bonificacion: 'XVerde', color: '#43a047', simbolo: '✖', habilidadGris: 'x', indiceGris: 4 },
        { numeros: ['X', 3, 4, 6], bonificacion: 'Lobo', color: '#d32f2f', simbolo: '♦', habilidadGris: 'lobo', indiceGris: 0 }
    ],
    columnas: [10, 14, 16, 20],
    bonusTotal: '+1',
    indiceBonusTotal: 1
};

// Estado de bonificaciones desbloqueadas
let bonificacionesAmarilla = {
    fila0: false, // XAzul
    fila1: false, // 4Naranja
    fila2: false, // XVerde
    fila3: false  // Lobo
};

let columnasCompletadas = [false, false, false, false];
let filasCompletadas = [false, false, false, false];
let todoCompletado = false;

// ============================================================
// INICIALIZACIÓN
// ============================================================

function inicializarAreaAmarilla() {
    const container = document.getElementById('area-amarilla-content');
    if (!container) return;
    
    let html = `<div class="amarilla-grid">`;
    
    // Generar filas
    AMARILLA_CONFIG.filas.forEach((fila, filaIndex) => {
        html += `<div class="amarilla-fila" data-fila="${filaIndex}">`;
        
        // Celdas de números (4 columnas)
        fila.numeros.forEach((valor, colIndex) => {
            const esX = valor === 'X';
            const id = `amarilla-${filaIndex}-${colIndex}`;
            const estaMarcada = historialMovimientos.includes(id);
            const clasePreMarcada = esX ? 'pre-marcada' : '';
            const claseMarcada = estaMarcada ? 'marcada' : '';
            
            html += `
                <div class="cell ${clasePreMarcada} ${claseMarcada}" 
                     data-area="amarilla"
                     data-fila="${filaIndex}"
                     data-col="${colIndex}"
                     data-esx="${esX}"
                     onclick="manejarClickAmarilla(${filaIndex}, ${colIndex})">
                    ${valor}
                </div>
            `;
        });
        
        // Círculo de bonificación de fila (5ª columna)
        const bonifDesbloqueada = bonificacionesAmarilla[`fila${filaIndex}`];
        const clase = bonifDesbloqueada ? 'puntaje-completado' : 'puntaje-pendiente';
        
        html += `
            <div class="amarilla-bonificacion-circulo puntaje-circulo ${clase}" 
                 data-amarilla-fila="${filaIndex}"
                 data-bonificacion="${fila.bonificacion}"
                 style="background-color: ${fila.color}; border-color: ${fila.color};">
                ${bonifDesbloqueada ? '✓' : fila.simbolo}
            </div>
        `;
        
        html += `</div>`;
    });
    
    // Fila de círculos de puntajes de columnas
    html += `<div class="amarilla-puntajes">`;
    AMARILLA_CONFIG.columnas.forEach((puntaje, colIndex) => {
        const completada = columnasCompletadas[colIndex];
        const clase = completada ? 'puntaje-completado' : 'puntaje-pendiente';
        html += `
            <div class="puntaje-circulo ${clase}" data-columna="${colIndex}">
                ${completada ? '✓' : puntaje}
            </div>
        `;
    });
    
    // Círculo de bonus total +1
    const claseTotal = todoCompletado ? 'puntaje-completado' : 'puntaje-pendiente';
    html += `
        <div class="puntaje-circulo ${claseTotal}">${todoCompletado ? '✓' : '+1'}</div>
    `;
    
    html += `</div>`;
    html += `</div>`;
    
    container.innerHTML = html;
}

// ============================================================
// MANEJAR CLICK EN CELDA
// ============================================================

function manejarClickAmarilla(filaIndex, colIndex) {
    // SOLO permitir clicks si estamos en modo zoom
    if (typeof enModoZoom === 'undefined' || !enModoZoom) {
        return;
    }
    
    const config = AMARILLA_CONFIG.filas[filaIndex];
    if (!config) return;
    
    const valor = config.numeros[colIndex];
    
    // Si es X, no se puede marcar
    if (valor === 'X') return;
    
    const id = `amarilla-${filaIndex}-${colIndex}`;
    
    // Si ya está marcada, no hacer nada
    if (historialMovimientos.includes(id)) return;
    
    // Marcar la celda
    historialMovimientos.push(id);
    
    // Actualizar visual en el zoom
    actualizarVisualesZoom();
    
    // Verificar si la fila está completa
    verificarFilaCompleta(filaIndex);
    
    // Verificar si la columna está completa
    verificarColumnaCompleta(colIndex);
    
    // Verificar si todo está completo
    verificarTodoCompleto();
    
    // ACTUALIZAR PUNTAJES SIEMPRE usando el sistema de puntuación
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    } else {
        recalcularPuntajesAmarilla();
    }
    actualizarVisuales();
    
    // Sincronizar con otros jugadores
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// VERIFICAR FILAS COMPLETAS
// ============================================================

function verificarFilaCompleta(filaIndex) {
    const config = AMARILLA_CONFIG.filas[filaIndex];
    if (!config) return;
    
    let marcadas = 0;
    let totalNumeros = 0;
    
    config.numeros.forEach((valor, colIndex) => {
        if (valor !== 'X') {
            totalNumeros++;
            const id = `amarilla-${filaIndex}-${colIndex}`;
            if (historialMovimientos.includes(id)) {
                marcadas++;
            }
        }
    });
    
    if (marcadas === totalNumeros && !filasCompletadas[filaIndex]) {
        filasCompletadas[filaIndex] = true;
        
        // Actualizar círculo de bonificación de fila
        const circulo = document.querySelector(`.amarilla-bonificacion-circulo[data-amarilla-fila="${filaIndex}"]`);
        if (circulo) {
            circulo.classList.remove('puntaje-pendiente');
            circulo.classList.add('puntaje-completado');
            circulo.textContent = '✓';
        }
        
        bonificacionesAmarilla[`fila${filaIndex}`] = true;
        
        // Desbloquear en Gris o registrar Lobo según corresponda
        if (config.habilidadGris === 'lobo') {
            if (typeof registrarLobo === 'function') {
                registrarLobo('amarilla');
            }
        } else {
            desbloquearEnGris(config.habilidadGris, config.indiceGris);
        }
    }
}

// ============================================================
// DESBLOQUEAR EN GRIS - CON ÍNDICE ESPECÍFICO
// ============================================================

function desbloquearEnGris(habilidadId, indice) {
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
// VERIFICAR COLUMNAS COMPLETAS
// ============================================================

function verificarColumnaCompleta(colIndex) {
    if (columnasCompletadas[colIndex]) return;
    
    let todasMarcadas = true;
    
    for (let fila = 0; fila < 4; fila++) {
        const config = AMARILLA_CONFIG.filas[fila];
        const valor = config.numeros[colIndex];
        
        if (valor === 'X') continue;
        
        const id = `amarilla-${fila}-${colIndex}`;
        if (!historialMovimientos.includes(id)) {
            todasMarcadas = false;
            break;
        }
    }
    
    if (todasMarcadas && !columnasCompletadas[colIndex]) {
        columnasCompletadas[colIndex] = true;
        
        // Actualizar círculo de puntaje
        const circulos = document.querySelectorAll('.amarilla-puntajes .puntaje-circulo');
        if (circulos[colIndex]) {
            circulos[colIndex].classList.remove('puntaje-pendiente');
            circulos[colIndex].classList.add('puntaje-completado');
            circulos[colIndex].textContent = '✓';
        }
        
        // ACTUALIZAR PUNTAJES INMEDIATAMENTE
        if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
            PUNTAJES.calcularTotal();
            // Actualizar leaderboard
            if (typeof renderizarLeaderboard === 'function') {
                renderizarLeaderboard();
            }
        } else {
            recalcularPuntajesAmarilla();
        }
    }
}

// ============================================================
// VERIFICAR TODO COMPLETO
// ============================================================

function verificarTodoCompleto() {
    if (todoCompletado) return;
    
    const todasFilas = filasCompletadas.every(f => f === true);
    const todasColumnas = columnasCompletadas.every(c => c === true);
    
    if (todasFilas && todasColumnas) {
        todoCompletado = true;
        
        // Actualizar círculo +1
        const circulos = document.querySelectorAll('.amarilla-puntajes .puntaje-circulo');
        const ultimoCirculo = circulos[circulos.length - 1];
        if (ultimoCirculo) {
            ultimoCirculo.classList.remove('puntaje-pendiente');
            ultimoCirculo.classList.add('puntaje-completado');
            ultimoCirculo.textContent = '✓';
        }
        
        // Desbloquear +1 en el índice correcto
        const indiceCorrecto = AMARILLA_CONFIG.indiceBonusTotal || 1;
        desbloquearEnGris('mas1', indiceCorrecto);
        
        // ACTUALIZAR PUNTAJES INMEDIATAMENTE
        if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
            PUNTAJES.calcularTotal();
            if (typeof renderizarLeaderboard === 'function') {
                renderizarLeaderboard();
            }
        } else {
            recalcularPuntajesAmarilla();
        }
    }
}

// ============================================================
// RECALCULAR PUNTAJES (FALLBACK - usado solo si PUNTAJES no existe)
// ============================================================

function recalcularPuntajesAmarilla() {
    // Si existe PUNTAJES, usarlo
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
        return;
    }
    
    // Fallback: solo columnas, sin puntos por casillas
    let puntosColumnas = 0;
    columnasCompletadas.forEach((completada, index) => {
        if (completada) {
            puntosColumnas += AMARILLA_CONFIG.columnas[index];
        }
    });
    
    const totalAmarilla = puntosColumnas;
    
    puntajesAreas.amarilla = totalAmarilla;
    document.getElementById('score-amarilla').textContent = totalAmarilla;
    
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

function resetAreaAmarilla() {
    bonificacionesAmarilla = {
        fila0: false,
        fila1: false,
        fila2: false,
        fila3: false
    };
    columnasCompletadas = [false, false, false, false];
    filasCompletadas = [false, false, false, false];
    todoCompletado = false;
    
    document.querySelectorAll('[data-area="amarilla"]').forEach(cell => {
        cell.classList.remove('marcada', 'desbloqueada', 'bloqueada', 'completada');
    });
    
    inicializarAreaAmarilla();
}

// ============================================================
// EXPORTAR
// ============================================================

window.inicializarAreaAmarilla = inicializarAreaAmarilla;
window.resetAreaAmarilla = resetAreaAmarilla;
window.recalcularPuntajesAmarilla = recalcularPuntajesAmarilla;
window.columnasCompletadas = columnasCompletadas;