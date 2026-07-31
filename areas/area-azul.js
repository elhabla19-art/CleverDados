// ============================================================
// ÁREA AZUL - CLEVERDADOS (CORREGIDO)
// ============================================================

// Puntajes visuales (se actualizan automáticamente)
const PUNTAJES_AZUL = [1, 2, 4, 7, 11, 16, 22, 29, 37, 46, 56];

// Tabla interactiva (11 casillas)
const TABLA_AZUL = [
    { fila: 0, col: 0, valor: '', esX: false },
    { fila: 0, col: 1, valor: 2, esX: false },
    { fila: 0, col: 2, valor: 3, esX: false },
    { fila: 0, col: 3, valor: 4, esX: false },
    { fila: 1, col: 0, valor: 5, esX: false },
    { fila: 1, col: 1, valor: 6, esX: false },
    { fila: 1, col: 2, valor: 7, esX: false },
    { fila: 1, col: 3, valor: 8, esX: false },
    { fila: 2, col: 0, valor: 9, esX: false },
    { fila: 2, col: 1, valor: 10, esX: false },
    { fila: 2, col: 2, valor: 11, esX: false },
    { fila: 2, col: 3, valor: 12, esX: false }
];

// Bonificaciones de fila
const BONIFICACIONES_FILA = [
    { fila: 0, celdas: [1, 2, 3], bonificacion: '5Naranja', color: '#ff6f00', simbolo: '5', habilidadGris: 'seis', indiceGris: 2 },
    { fila: 1, celdas: [4, 5, 6, 7], bonificacion: 'XAmarillo', color: '#fdd835', simbolo: '✖', habilidadGris: 'x', indiceGris: 7 },
    { fila: 2, celdas: [8, 9, 10, 11], bonificacion: 'Lobo', color: '#7b1fa2', simbolo: '🐺', habilidadGris: 'lobo', indiceGris: 1 }
];

// Bonificaciones de columna - CORREGIDO
const BONIFICACIONES_COLUMNA = [
    { 
        col: 0, 
        celdas: [0, 4, 8], 
        bonificacion: 'Espiral', 
        simbolo: '♻', 
        color: '#78909c', 
        tipo: 'espiral',
        indiceGris: 2 // <--- CAMBIADO de 0 a 2
    },
    { 
        col: 1, 
        celdas: [1, 5, 9], 
        bonificacion: 'XVerde', 
        simbolo: '✖', 
        color: '#43a047', 
        tipo: 'gris', 
        habilidadGris: 'x', 
        indiceGris: 5 
    },
    { 
        col: 2, 
        celdas: [2, 6, 10], 
        bonificacion: '6Morado', 
        simbolo: '6', 
        color: '#7b1fa2', 
        tipo: 'gris', 
        habilidadGris: 'seis', 
        indiceGris: 4 
    },
    { 
        col: 3, 
        celdas: [3, 7, 11], 
        bonificacion: '+1', 
        simbolo: '+1', 
        color: '#ffd700', 
        tipo: 'mas1',
        indiceGris: 2 // <--- CAMBIADO de 0 a 2
    }
];

// Estado
let filasCompletadasAzul = [false, false, false];
let columnasCompletadasAzul = [false, false, false, false];
let progresoAzul = 0;

// ============================================================
// INICIALIZACIÓN
// ============================================================

function inicializarAreaAzul() {
    const container = document.getElementById('area-azul-content');
    if (!container) return;
    
    actualizarProgresoAzul();
    
    let html = `<div class="azul-grid">`;
    
    // --- FILA DE PUNTAJES (VISUAL) ---
    html += `<div class="azul-puntajes-fila">`;
    PUNTAJES_AZUL.forEach((puntaje, index) => {
        const completado = index < progresoAzul;
        const clase = completado ? 'puntaje-completado' : 'puntaje-pendiente';
        html += `
            <div class="puntaje-circulo ${clase}" data-index="${index}">
                ${completado ? '✓' : puntaje}
            </div>
        `;
    });
    html += `</div>`;
    
    // --- TABLA DE BONIFICACIONES (INTERACTIVA) ---
    for (let fila = 0; fila < 3; fila++) {
        html += `<div class="azul-fila" data-fila="${fila}">`;
        
        // 4 celdas de la tabla
        for (let col = 0; col < 4; col++) {
            const index = fila * 4 + col;
            const celda = TABLA_AZUL[index];
            if (!celda) continue;
            
            const id = `azul-tabla-${index}`;
            const estaMarcada = historialMovimientos.includes(id);
            const esVacio = celda.valor === '';
            const claseMarcada = estaMarcada ? 'marcada' : '';
            const claseVacio = esVacio ? 'celda-vacia' : '';
            
            html += `
                <div class="cell ${claseMarcada} ${claseVacio}" 
                     data-area="azul"
                     data-fila="${fila}"
                     data-col="${col}"
                     data-index="${index}"
                     data-esvacio="${esVacio}"
                     onclick="${!esVacio ? `manejarClickAzul(${index})` : ''}"
                     style="${esVacio ? 'opacity:0.3; cursor:default;' : ''}">
                    ${celda.valor}
                </div>
            `;
        }
        
        // Bonificación de fila (5ª columna)
        const bonifConfig = BONIFICACIONES_FILA[fila];
        const bonifDesbloqueada = filasCompletadasAzul[fila];
        const clase = bonifDesbloqueada ? 'puntaje-completado' : 'puntaje-pendiente';
        
        html += `
            <div class="azul-bonificacion-circulo puntaje-circulo ${clase}" 
                 data-azul-fila="${fila}"
                 data-bonificacion="${bonifConfig.bonificacion}"
                 style="background-color: ${bonifConfig.color}; border-color: ${bonifConfig.color};">
                ${bonifDesbloqueada ? '✓' : bonifConfig.simbolo}
            </div>
        `;
        
        html += `</div>`;
    }
    
    // --- BONIFICACIONES DE COLUMNA ---
    html += `<div class="azul-columnas">`;
    BONIFICACIONES_COLUMNA.forEach((bonif, colIndex) => {
        const completada = columnasCompletadasAzul[colIndex];
        const clase = completada ? 'puntaje-completado' : 'puntaje-pendiente';
        html += `
            <div class="azul-columna-circulo puntaje-circulo ${clase}" 
                 data-azul-columna="${colIndex}"
                 style="background-color: ${bonif.color}; border-color: ${bonif.color};">
                ${completada ? '✓' : bonif.simbolo}
            </div>
        `;
    });
    html += `</div>`;
    
    html += `</div>`;
    container.innerHTML = html;
}

// ============================================================
// ACTUALIZAR PROGRESO
// ============================================================

function actualizarProgresoAzul() {
    let marcadas = 0;
    TABLA_AZUL.forEach((celda, index) => {
        if (celda.valor !== '') {
            const id = `azul-tabla-${index}`;
            if (historialMovimientos.includes(id)) {
                marcadas++;
            }
        }
    });
    progresoAzul = marcadas;
}

// ============================================================
// MANEJAR CLICK EN CELDA
// ============================================================

function manejarClickAzul(index) {
    const celda = TABLA_AZUL[index];
    if (!celda || celda.valor === '') return;
    
    const id = `azul-tabla-${index}`;
    if (historialMovimientos.includes(id)) return;
    
    historialMovimientos.push(id);
    
    const cell = document.querySelector(`[data-area="azul"][data-index="${index}"]`);
    if (cell) {
        cell.classList.add('marcada');
    }
    
    actualizarProgresoAzul();
    actualizarPuntajesAzul();
    verificarFilasAzul();
    verificarColumnasAzul();
    recalcularPuntajesAzul();
    actualizarVisuales();
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// ACTUALIZAR PUNTAJES VISUALES
// ============================================================

function actualizarPuntajesAzul() {
    const circulos = document.querySelectorAll('.azul-puntajes-fila .puntaje-circulo');
    circulos.forEach((circulo, index) => {
        const completado = index < progresoAzul;
        circulo.classList.remove('puntaje-pendiente', 'puntaje-completado');
        circulo.classList.add(completado ? 'puntaje-completado' : 'puntaje-pendiente');
        circulo.textContent = completado ? '✓' : PUNTAJES_AZUL[index];
    });
}

// ============================================================
// VERIFICAR FILAS
// ============================================================

function verificarFilasAzul() {
    BONIFICACIONES_FILA.forEach((bonif, filaIndex) => {
        if (filasCompletadasAzul[filaIndex]) return;
        
        let todasMarcadas = true;
        bonif.celdas.forEach(celdaIndex => {
            const id = `azul-tabla-${celdaIndex}`;
            if (!historialMovimientos.includes(id)) {
                todasMarcadas = false;
            }
        });
        
        if (todasMarcadas) {
            filasCompletadasAzul[filaIndex] = true;
            
            // Actualizar círculo de bonificación de fila
            const circulo = document.querySelector(`.azul-bonificacion-circulo[data-azul-fila="${filaIndex}"]`);
            if (circulo) {
                circulo.classList.remove('puntaje-pendiente');
                circulo.classList.add('puntaje-completado');
                circulo.textContent = '✓';
            }
            
            // Desbloquear en Gris
            desbloquearEnGrisAzul(bonif.habilidadGris, bonif.indiceGris);
        }
    });
}

// ============================================================
// VERIFICAR COLUMNAS
// ============================================================

function verificarColumnasAzul() {
    BONIFICACIONES_COLUMNA.forEach((bonif, colIndex) => {
        if (columnasCompletadasAzul[colIndex]) return;
        
        let todasMarcadas = true;
        bonif.celdas.forEach(celdaIndex => {
            const celda = TABLA_AZUL[celdaIndex];
            if (celda.valor === '') return;
            const id = `azul-tabla-${celdaIndex}`;
            if (!historialMovimientos.includes(id)) {
                todasMarcadas = false;
            }
        });
        
        if (todasMarcadas) {
            columnasCompletadasAzul[colIndex] = true;
            
            // Actualizar círculo de bonificación de columna
            const circulo = document.querySelector(`.azul-columna-circulo[data-azul-columna="${colIndex}"]`);
            if (circulo) {
                circulo.classList.remove('puntaje-pendiente');
                circulo.classList.add('puntaje-completado');
                circulo.textContent = '✓';
            }
            
            // Aplicar efecto de la bonificación
            aplicarBonificacionColumnaAzul(bonif);
        }
    });
}

// ============================================================
// APLICAR BONIFICACIÓN DE COLUMNA - CORREGIDO
// ============================================================

function aplicarBonificacionColumnaAzul(bonif) {
    switch(bonif.tipo) {
        case 'espiral':
            // Desbloquear Espiral en el índice específico
            desbloquearEnGrisAzul('espiral', bonif.indiceGris);
            break;
        case 'mas1':
            // Desbloquear +1 en el índice específico
            desbloquearEnGrisAzul('mas1', bonif.indiceGris);
            break;
        case 'gris':
            desbloquearEnGrisAzul(bonif.habilidadGris, bonif.indiceGris);
            break;
    }
    recalcularPuntajesAzul();
}

// ============================================================
// DESBLOQUEAR EN GRIS
// ============================================================

function desbloquearEnGrisAzul(habilidadId, indice) {
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
// RECALCULAR PUNTAJES
// ============================================================

function recalcularPuntajesAzul() {
    let puntos = 0;
    if (progresoAzul > 0) {
        for (let i = 0; i < progresoAzul && i < PUNTAJES_AZUL.length; i++) {
            puntos += PUNTAJES_AZUL[i];
        }
    }
    
    let puntosColumnas = 0;
    columnasCompletadasAzul.forEach((completada, index) => {
        if (completada) {
            switch(index) {
                case 0: puntosColumnas += 5; break;
                case 1: puntosColumnas += 5; break;
                case 2: puntosColumnas += 5; break;
                case 3: puntosColumnas += 3; break;
            }
        }
    });
    
    const totalAzul = puntos + puntosColumnas;
    
    puntajesAreas.azul = totalAzul;
    document.getElementById('score-azul').textContent = totalAzul;
    
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

function resetAreaAzul() {
    filasCompletadasAzul = [false, false, false];
    columnasCompletadasAzul = [false, false, false, false];
    progresoAzul = 0;
    
    document.querySelectorAll('[data-area="azul"]').forEach(cell => {
        cell.classList.remove('marcada');
    });
    
    inicializarAreaAzul();
}

// ============================================================
// EXPORTAR
// ============================================================

window.inicializarAreaAzul = inicializarAreaAzul;
window.resetAreaAzul = resetAreaAzul;
window.recalcularPuntajesAzul = recalcularPuntajesAzul;