// ============================================================
// ÁREA AMARILLA - CLEVERDADOS
// ============================================================

// Configuración del área amarilla
const AMARILLA_CONFIG = {
    filas: [
        { numeros: [3, 6, 5, 'X'], bonificacion: 'XAzul', color: '#1e88e5', simbolo: '✖', habilidadGris: 'x', indiceGris: 1 },
        { numeros: [2, 1, 'X', 5], bonificacion: '4Naranja', color: '#ff6f00', simbolo: '6', habilidadGris: 'seis', indiceGris: 1 },
        { numeros: [1, 'X', 2, 4], bonificacion: 'XVerde', color: '#43a047', simbolo: '✖', habilidadGris: 'x', indiceGris: 4 },
        { numeros: ['X', 3, 4, 6], bonificacion: 'Lobo', color: '#7b1fa2', simbolo: '🐺', habilidadGris: 'lobo', indiceGris: 0 }
    ],
    columnas: [10, 14, 16, 20],
    bonusTotal: '+1'
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
        
        // Círculo de bonificación de fila (5ª columna) - SIEMPRE VISIBLE CON SU SÍMBOLO
        const bonifDesbloqueada = bonificacionesAmarilla[`fila${filaIndex}`];
        const claseBonif = bonifDesbloqueada ? 'bonif-desbloqueada' : 'bonif-bloqueada';
        
        html += `
            <div class="bonificacion-circulo ${claseBonif}" 
                 data-fila="${filaIndex}"
                 data-bonificacion="${fila.bonificacion}"
                 style="${bonifDesbloqueada ? `background-color: ${fila.color}; border-color: ${fila.color};` : ''}">
                ${fila.simbolo}
            </div>
        `;
        
        html += `</div>`;
    });
    
    // Fila de círculos de puntajes
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
    
    // Actualizar visual
    const cell = document.querySelector(`[data-area="amarilla"][data-fila="${filaIndex}"][data-col="${colIndex}"]`);
    if (cell) {
        cell.classList.add('marcada');
    }
    
    // Verificar si la fila está completa
    verificarFilaCompleta(filaIndex);
    
    // Verificar si la columna está completa
    verificarColumnaCompleta(colIndex);
    
    // Verificar si todo está completo
    verificarTodoCompleto();
    
    // Recalcular puntajes
    recalcularPuntajesAmarilla();
    actualizarVisuales();
    
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
        
        // Actualizar círculo de bonificación
        const circulo = document.querySelector(`.bonificacion-circulo[data-fila="${filaIndex}"]`);
        if (circulo) {
            circulo.classList.remove('bonif-bloqueada');
            circulo.classList.add('bonif-desbloqueada');
            circulo.style.backgroundColor = config.color;
            circulo.style.borderColor = config.color;
        }
        
        bonificacionesAmarilla[`fila${filaIndex}`] = true;
        
        // DESBLOQUEAR EN ÁREA GRIS - Usar el índice específico
        desbloquearEnGris(config.habilidadGris, config.indiceGris);
    }
}

// ============================================================
// DESBLOQUEAR EN ÁREA GRIS - CON ÍNDICE ESPECÍFICO
// ============================================================

function desbloquearEnGris(habilidadId, indice) {
    // Buscar la celda específica en Gris por habilidad e índice
    const celdas = document.querySelectorAll(`.celda-habilidad[data-habilidad="${habilidadId}"]`);
    
    // Buscar la celda con el índice específico
    for (let cell of celdas) {
        const cellIndex = parseInt(cell.dataset.col);
        if (cellIndex === indice && cell.classList.contains('bloqueada')) {
            cell.classList.remove('bloqueada');
            cell.classList.add('desbloqueada');
            
            if (cell.dataset.color) {
                cell.style.opacity = '1';
                cell.style.filter = 'none';
            }
            return;
        }
    }
    
    // Si no se encontró el índice específico, desbloquear la primera bloqueada
    for (let cell of celdas) {
        if (cell.classList.contains('bloqueada')) {
            cell.classList.remove('bloqueada');
            cell.classList.add('desbloqueada');
            
            if (cell.dataset.color) {
                cell.style.opacity = '1';
                cell.style.filter = 'none';
            }
            return;
        }
    }
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
        const circulos = document.querySelectorAll('.puntaje-circulo');
        if (circulos[colIndex]) {
            circulos[colIndex].classList.remove('puntaje-pendiente');
            circulos[colIndex].classList.add('puntaje-completado');
            circulos[colIndex].textContent = '✓';
        }
        
        const puntos = AMARILLA_CONFIG.columnas[colIndex];
        puntosBonificacion += puntos;
        recalcularPuntajesAmarilla();
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
        
        const circulos = document.querySelectorAll('.puntaje-circulo');
        const ultimoCirculo = circulos[circulos.length - 1];
        if (ultimoCirculo) {
            ultimoCirculo.classList.remove('puntaje-pendiente');
            ultimoCirculo.classList.add('puntaje-completado');
            ultimoCirculo.textContent = '✓';
        }
        
        puntosBonificacion += 1;
        recalcularPuntajesAmarilla();
    }
}

// ============================================================
// RECALCULAR PUNTAJES
// ============================================================

function recalcularPuntajesAmarilla() {
    const marcasAmarilla = historialMovimientos.filter(m => 
        m.startsWith('amarilla-') && !m.includes('bonif')
    ).length;
    
    let puntos = 0;
    if (marcasAmarilla > 0) {
        puntos = marcasAmarilla * (marcasAmarilla + 1) / 2;
    }
    
    let puntosColumnas = 0;
    columnasCompletadas.forEach((completada, index) => {
        if (completada) {
            puntosColumnas += AMARILLA_CONFIG.columnas[index];
        }
    });
    
    const totalAmarilla = puntos + puntosColumnas;
    
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