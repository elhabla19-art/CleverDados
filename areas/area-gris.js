// ============================================================
// ÁREA GRIS - CLEVERDADOS
// ============================================================

// Configuración de turnos y sus bonificaciones
const TURNOS_CONFIG = [
    { numero: 1, bonificacion: '♻', efecto: 'Espiral', habilidad: 'espiral' },
    { numero: 2, bonificacion: '+1', efecto: '+1 punto', habilidad: 'mas1' },
    { numero: 3, bonificacion: '♻', efecto: 'Espiral', habilidad: 'espiral' },
    { numero: 4, bonificacion: '✖', efecto: 'X', habilidad: 'x' },
    { numero: 5, bonificacion: '•••', efecto: '1 dado adicional', habilidad: 'dados1' },
    { numero: 6, bonificacion: '•|••', efecto: '2 dados adicionales', habilidad: 'dados2' }
];

// Configuración de habilidades (todas las celdas)
const HABILIDADES_CONFIG = {
    espiral: {
        id: 'espiral',
        simbolo: '♻',
        celdas: 7,
        turnosDesbloqueo: [1, 3], // Turnos que desbloquean casillas
        columna: 1,
        fila: 0,
        indiceDesbloqueo: 0 // Lleva la cuenta de cuántas casillas se han desbloqueado
    },
    mas1: {
        id: 'mas1',
        simbolo: '+1',
        celdas: 7,
        turnosDesbloqueo: [2],
        columna: 1,
        fila: 1,
        indiceDesbloqueo: 0
    },
    dados1: {
        id: 'dados1',
        simbolo: '•••',
        celdas: 1,
        turnosDesbloqueo: [5],
        columna: 1,
        fila: 2,
        indiceDesbloqueo: 0
    },
    dados2: {
        id: 'dados2',
        simbolo: '•|••',
        celdas: 1,
        turnosDesbloqueo: [6],
        columna: 1,
        fila: 3,
        indiceDesbloqueo: 0
    },
    x: {
        id: 'x',
        simbolo: '✖',
        celdas: [
            { color: '#78909c', label: 'Gris' },
            { color: '#1e88e5', label: 'Azul' },
            { color: '#1e88e5', label: 'Azul' },
            { color: '#1e88e5', label: 'Azul' },
            { color: '#43a047', label: 'Verde' },
            { color: '#43a047', label: 'Verde' },
            { color: '#43a047', label: 'Verde' },
            { color: '#fdd835', label: 'Amarilla' },
            { color: '#fdd835', label: 'Amarilla' },
            { color: '#fdd835', label: 'Amarilla' }
        ],
        turnosDesbloqueo: [4],
        columna: 2,
        fila: 0,
        indiceDesbloqueo: 0
    },
    seis: {
        id: 'seis',
        simbolo: '6',
        celdas: [
            { color: '#78909c', label: 'Gris' },
            { color: '#ff6f00', label: 'Naranja' },
            { color: '#ff6f00', label: 'Naranja' },
            { color: '#ff6f00', label: 'Naranja' },
            { color: '#7b1fa2', label: 'Morado' },
            { color: '#7b1fa2', label: 'Morado' },
            { color: '#7b1fa2', label: 'Morado' }
        ],
        turnosDesbloqueo: [4],
        columna: 2,
        fila: 1,
        indiceDesbloqueo: 0
    }
};

// Estado de desbloqueo de turnos
let turnosCompletados = [];
let desbloqueosContador = {
    espiral: 0,
    mas1: 0,
    dados1: 0,
    dados2: 0,
    x: 0,
    seis: 0
};

// ============================================================
// INICIALIZACIÓN - Parte de las columnas
// ============================================================

function inicializarAreaGris() {
    const container = document.getElementById('area-gris-content');
    if (!container) return;
    
    let html = `
        <div class="gris-section">
            <!-- TURNOS -->
            <div class="gris-turnos">
                <div class="gris-etiqueta">Turnos</div>
                <div class="gris-turnos-grid">
    `;
    
    TURNOS_CONFIG.forEach((turno, index) => {
        const id = `gris-turno-${index}`;
        const estaMarcado = historialMovimientos.includes(id);
        const claseMarcada = estaMarcado ? 'marcada' : '';
        html += `
            <div class="gris-turno-cell ${claseMarcada}" 
                 data-area="gris" 
                 data-fila="turno" 
                 data-col="${index}"
                 data-turno="${turno.numero}"
                 data-bonificacion="${turno.bonificacion}"
                 onclick="manejarClickTurnoGris(${index})">
                <span class="turno-numero">${turno.numero}</span>
                <span class="turno-bonificacion">${turno.bonificacion}</span>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
            
            <!-- HABILIDADES -->
            <div class="gris-habilidades">
                <div class="gris-etiqueta">Habilidades</div>
                <div class="gris-habilidades-grid">
    `;
    
    // COLUMNA 1: ♻, +1, •••
    html += `<div class="gris-columna">`;
    html += generarFilaHabilidad('espiral');   // ♻
    html += generarFilaHabilidad('mas1');      // +1
    html += generarFilaHabilidad('dados1');    // •••
    html += `</div>`;
    
    // COLUMNA 2: ✖, 6, •|••
    html += `<div class="gris-columna">`;
    html += generarFilaHabilidad('x');         // ✖
    html += generarFilaHabilidad('seis');      // 6
    html += generarFilaHabilidad('dados2');    // •|••
    html += `</div>`;
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    actualizarEstadosGris();
}

// ============================================================
// GENERAR FILAS DE HABILIDADES
// ============================================================

function generarFilaHabilidad(habilidadId) {
    const config = HABILIDADES_CONFIG[habilidadId];
    if (!config) return '';
    
    let html = `<div class="gris-fila-habilidad" data-habilidad="${habilidadId}">`;
    
    // Símbolo de la habilidad
    html += `<span class="habilidad-simbolo">${config.simbolo}</span>`;
    
    // Celdas
    if (Array.isArray(config.celdas)) {
        // Para ✖ y 6 (celdas con colores)
        config.celdas.forEach((celda, index) => {
            const id = `gris-${habilidadId}-${index}`;
            const estaMarcada = historialMovimientos.includes(id);
            const estaDesbloqueada = estaDesbloqueadaGris(habilidadId, index);
            const claseEstado = estaMarcada ? 'usada' : (estaDesbloqueada ? 'desbloqueada' : 'bloqueada');
            
            html += `
                <div class="celda-habilidad ${claseEstado}" 
                     data-area="gris"
                     data-fila="${habilidadId}"
                     data-col="${index}"
                     data-habilidad="${habilidadId}"
                     data-color="${celda.color}"
                     onclick="manejarClickHabilidadGris('${habilidadId}', ${index})"
                     style="background-color: ${celda.color};">
                    ${estaMarcada ? '✓' : ''}
                </div>
            `;
        });
    } else {
        // Para ♻, +1, •••, •|•• (celdas vacías con fondo visible)
        for (let i = 0; i < config.celdas; i++) {
            const id = `gris-${habilidadId}-${i}`;
            const estaMarcada = historialMovimientos.includes(id);
            const estaDesbloqueada = estaDesbloqueadaGris(habilidadId, i);
            const claseEstado = estaMarcada ? 'usada' : (estaDesbloqueada ? 'desbloqueada' : 'bloqueada');
            
            html += `
                <div class="celda-habilidad celda-vacia ${claseEstado}" 
                     data-area="gris"
                     data-fila="${habilidadId}"
                     data-col="${i}"
                     data-habilidad="${habilidadId}"
                     onclick="manejarClickHabilidadGris('${habilidadId}', ${i})">
                    ${estaMarcada ? '✓' : ''}
                </div>
            `;
        }
    }
    
    html += `</div>`;
    return html;
}

// ============================================================
// VERIFICAR DESBLOQUEO - UNA CASILLA POR TURNO
// ============================================================

function estaDesbloqueadaGris(habilidadId, index) {
    const config = HABILIDADES_CONFIG[habilidadId];
    if (!config) return false;
    
    // Obtener cuántas casillas de esta habilidad deberían estar desbloqueadas
    let totalDesbloqueadas = 0;
    
    // Contar cuántos turnos de desbloqueo de esta habilidad están completados
    config.turnosDesbloqueo.forEach(turnoNum => {
        if (turnosCompletados.includes(turnoNum)) {
            totalDesbloqueadas++;
        }
    });
    
    // La casilla está desbloqueada si su índice es menor que el total desbloqueado
    return index < totalDesbloqueadas;
}

// ============================================================
// MANEJAR CLICKS
// ============================================================

function manejarClickTurnoGris(index) {
    const turno = TURNOS_CONFIG[index];
    const id = `gris-turno-${index}`;
    
    // Verificar si ya está marcado
    if (historialMovimientos.includes(id)) {
        return;
    }
    
    // Verificar si el turno anterior está completado
    if (index > 0) {
        const anterior = `gris-turno-${index - 1}`;
        if (!historialMovimientos.includes(anterior)) {
            return;
        }
    }
    
    // Marcar el turno
    historialMovimientos.push(id);
    turnosCompletados.push(turno.numero);
    
    // Actualizar visual
    const cell = document.querySelector(`[data-area="gris"][data-fila="turno"][data-col="${index}"]`);
    if (cell) {
        cell.classList.add('marcada');
    }
    
    // Desbloquear UNA casilla de la habilidad correspondiente
    const habilidadId = turno.habilidad;
    const config = HABILIDADES_CONFIG[habilidadId];
    if (config) {
        // La casilla se desbloquea automáticamente
        // Solo actualizamos los estados visuales
        actualizarEstadosGris();
    }
    
    recalcularPuntajes();
    actualizarVisuales();
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

function manejarClickHabilidadGris(habilidadId, index) {
    const config = HABILIDADES_CONFIG[habilidadId];
    if (!config) return;
    
    const id = `gris-${habilidadId}-${index}`;
    
    // Verificar si ya está marcada
    if (historialMovimientos.includes(id)) {
        return;
    }
    
    // Verificar si está desbloqueada
    if (!estaDesbloqueadaGris(habilidadId, index)) {
        return;
    }
    
    // Marcar la habilidad
    historialMovimientos.push(id);
    
    // Aplicar efecto de la bonificación
    aplicarBonificacionGris(habilidadId);
    
    // Actualizar visual
    actualizarEstadosGris();
    recalcularPuntajes();
    actualizarVisuales();
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// APLICAR BONIFICACIONES
// ============================================================

function aplicarBonificacionGris(habilidadId) {
    switch(habilidadId) {
        case 'espiral':
            puntosBonificacion += 1;
            break;
        case 'mas1':
            puntosBonificacion += 1;
            break;
        case 'dados1':
            // ••• - 1 dado adicional
            break;
        case 'dados2':
            // •|•• - 2 dados adicionales
            break;
        case 'x':
            puntosBonificacion += 2;
            break;
        case 'seis':
            puntosBonificacion += 2;
            break;
    }
}

// ============================================================
// ACTUALIZAR ESTADOS VISUALES
// ============================================================

function actualizarEstadosGris() {
    // Actualizar todas las celdas de habilidades
    document.querySelectorAll('.celda-habilidad').forEach(cell => {
        const habilidadId = cell.dataset.habilidad;
        const index = parseInt(cell.dataset.col);
        const id = `gris-${habilidadId}-${index}`;
        
        // Limpiar clases
        cell.classList.remove('bloqueada', 'desbloqueada', 'usada');
        
        if (historialMovimientos.includes(id)) {
            cell.classList.add('usada');
            cell.textContent = '✓';
        } else if (estaDesbloqueadaGris(habilidadId, index)) {
            cell.classList.add('desbloqueada');
            cell.textContent = '';
        } else {
            cell.classList.add('bloqueada');
            cell.textContent = '';
        }
    });
}

// ============================================================
// RECALCULAR PUNTAJES
// ============================================================

function recalcularPuntajes() {
    const marcasGris = historialMovimientos.filter(m => m.startsWith('gris-') && !m.includes('turno')).length;
    
    let puntos = 0;
    if (marcasGris > 0) {
        puntos = marcasGris * (marcasGris + 1) / 2;
    }
    
    puntajesAreas.gris = puntos;
    document.getElementById('score-gris').textContent = puntos;
    
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

function resetAreaGris() {
    turnosCompletados = [];
    document.querySelectorAll('.gris-turno-cell.marcada').forEach(cell => {
        cell.classList.remove('marcada');
    });
    actualizarEstadosGris();
}

// ============================================================
// EXPORTAR FUNCIONES PARA MAIN
// ============================================================

window.inicializarAreaGris = inicializarAreaGris;
window.resetAreaGris = resetAreaGris;