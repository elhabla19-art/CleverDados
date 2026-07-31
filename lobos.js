// ============================================================
// LOBOS.JS - SISTEMA DE BONIFICACIÓN DE LOBOS (CORREGIDO)
// ============================================================

/**
 * Sistema de Lobos para CleverDados
 * 
 * Funcionamiento:
 * - Cada vez que se desbloquea un Lobo, se incrementa el contador
 * - El valor del Lobo es el puntaje del área de color con menos puntos
 * - Puntuación total = cantidadDeLobos × valorDelColorMenor
 */

// Estado de los lobos
let lobos = {
    cantidad: 0,
    valorActual: 0,
    totalPuntos: 0,
    desbloqueos: [],
    colores: ['amarilla', 'azul', 'verde', 'naranja', 'morado'],
    colorMenor: 'amarilla'
};

// ============================================================
// OBTENER EL COLOR CON MENOS PUNTOS - USA puntajesAreas DIRECTAMENTE
// ============================================================

function obtenerColorConMenosPuntos() {
    let puntajes = {};
    let menorPuntaje = Infinity;
    let colorMenor = null;
    
    // USAR DIRECTAMENTE puntajesAreas (que es donde se guardan los puntajes)
    if (typeof puntajesAreas !== 'undefined' && puntajesAreas) {
        lobos.colores.forEach(color => {
            const pts = puntajesAreas[color] || 0;
            puntajes[color] = pts;
        });
    } else {
        // Fallback: todos 0
        lobos.colores.forEach(color => {
            puntajes[color] = 0;
        });
    }
    
    // Encontrar el color con menos puntos
    for (const [color, pts] of Object.entries(puntajes)) {
        if (pts < menorPuntaje) {
            menorPuntaje = pts;
            colorMenor = color;
        }
    }
    
    // Si todos tienen 0, usar amarilla como predeterminado
    if (colorMenor === null || menorPuntaje === Infinity) {
        colorMenor = 'amarilla';
        menorPuntaje = 0;
    }
    
    // Guardar el color menor en el objeto lobos
    lobos.colorMenor = colorMenor;
    
    console.log('📊 Puntajes de colores:', puntajes);
    console.log(`🎯 Color con menos puntos: ${colorMenor} = ${menorPuntaje}pts`);
    
    return {
        color: colorMenor,
        puntaje: menorPuntaje,
        todos: puntajes
    };
}

// ============================================================
// ACTUALIZAR VALOR DEL LOBO - CALCULA CON EL COLOR MENOR
// ============================================================

function actualizarValorLobo() {
    // Obtener el color con menos puntos SIEMPRE
    const info = obtenerColorConMenosPuntos();
    
    // Actualizar el valor actual con el puntaje del color menor
    lobos.valorActual = info.puntaje;
    
    // Calcular el total: cantidad × valor
    lobos.totalPuntos = lobos.cantidad * lobos.valorActual;
    
    // Guardar el color menor
    lobos.colorMenor = info.color;
    
    console.log(`🐺 Actualizado: ${lobos.cantidad} lobos × ${lobos.valorActual}pts = ${lobos.totalPuntos}pts (color: ${lobos.colorMenor})`);
    
    return lobos;
}

// ============================================================
// DESBLOQUEAR UN LOBO
// ============================================================

function desbloquearLobo(origen = 'desconocido') {
    // Incrementar cantidad
    lobos.cantidad++;
    
    // Registrar el desbloqueo
    lobos.desbloqueos.push({
        timestamp: Date.now(),
        origen: origen,
        numero: lobos.cantidad
    });
    
    console.log(`🐺 Lobo #${lobos.cantidad} desbloqueado desde ${origen}`);
    
    // ACTUALIZAR EL VALOR INMEDIATAMENTE
    actualizarValorLobo();
    
    // Actualizar UI
    actualizarUI();
    
    // Recalcular puntajes totales
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    }
    
    // Sincronizar con otros jugadores
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
    
    return lobos;
}

// ============================================================
// OBTENER INFORMACIÓN DE LOBOS PARA EL LEADERBOARD
// ============================================================

function obtenerInfoLobos() {
    // Asegurar que el valor esté actualizado
    actualizarValorLobo();
    
    return {
        cantidad: lobos.cantidad,
        valorActual: lobos.valorActual,
        totalPuntos: lobos.totalPuntos,
        colorMenor: lobos.colorMenor || null,
        desbloqueos: lobos.desbloqueos
    };
}

// ============================================================
// GENERAR HTML PARA EL TAG DE LOBOS EN LEADERBOARD
// ============================================================

function generarTagLobos() {
    // Asegurar que el valor esté actualizado
    actualizarValorLobo();
    
    if (lobos.cantidad === 0) {
        return `
            <span class="puntaje-tag lobos-tag" style="border-color: #d32f2f; cursor: default; opacity: 0.6;">
                <span class="tag-dot" style="background: #d32f2f; font-size: 0.8rem; line-height: 1; display: inline-flex; align-items: center; justify-content: center;">
                    ♦
                </span>
                0pts
            </span>
        `;
    }
    
    const info = obtenerColorConMenosPuntos();
    const pts = info.puntaje;
    const total = lobos.cantidad * pts;
    const colorMenor = info.color;
    
    // Obtener el color del área menor para el dot
    const coloresMap = {
        'amarilla': '#fdd835',
        'azul': '#1e88e5',
        'verde': '#43a047',
        'naranja': '#ff6f00',
        'morado': '#7b1fa2'
    };
    const colorDot = coloresMap[colorMenor] || '#d32f2f';
    
    return `
        <span class="puntaje-tag lobos-tag" style="border-color: #d32f2f; cursor: default;">
            <span class="tag-dot" style="background: ${colorDot}; font-size: 1rem; line-height: 1; display: inline-flex; align-items: center; justify-content: center;">
                ♦
            </span>
            ${lobos.cantidad} × ${pts}pts = ${total}pts
        </span>
    `;
}

// ============================================================
// ACTUALIZAR UI DEL LEADERBOARD
// ============================================================

function actualizarUI() {
    // Asegurar que el valor esté actualizado
    actualizarValorLobo();
    
    const tagsContainer = document.querySelector('.puntajes-tags');
    if (!tagsContainer) return;
    
    const existingTag = tagsContainer.querySelector('.lobos-tag');
    const nuevoTag = generarTagLobos();
    
    if (nuevoTag) {
        if (existingTag) {
            existingTag.outerHTML = nuevoTag;
        } else {
            tagsContainer.insertAdjacentHTML('beforeend', nuevoTag);
        }
    }
}

// ============================================================
// FUNCIÓN PARA REGISTRAR LOBO DESDE OTRAS ÁREAS
// ============================================================

function registrarLobo(origen) {
    desbloquearLobo(origen);
}

// ============================================================
// RESET DE LOBOS
// ============================================================

function resetLobos() {
    lobos = {
        cantidad: 0,
        valorActual: 0,
        totalPuntos: 0,
        desbloqueos: [],
        colores: ['amarilla', 'azul', 'verde', 'naranja', 'morado'],
        colorMenor: 'amarilla'
    };
    
    actualizarUI();
    console.log('🐺 Lobos reiniciados');
}

// ============================================================
// INTEGRAR CON EL SISTEMA DE PUNTAJES
// ============================================================

// Extender PUNTAJES para incluir lobos
if (typeof PUNTAJES !== 'undefined') {
    // Guardar referencia al calcularTotal original
    const originalCalcularTotal = PUNTAJES.calcularTotal;
    
    // Sobrescribir calcularTotal para actualizar lobos
    PUNTAJES.calcularTotal = function() {
        // Llamar al método original
        const total = originalCalcularTotal.call(this);
        
        // ACTUALIZAR EL VALOR DEL LOBO DESPUÉS DE CALCULAR PUNTAJES
        actualizarValorLobo();
        
        // Actualizar UI
        actualizarUI();
        
        return total;
    };
    
    // Extender obtenerPuntajesPorArea para incluir lobos
    const originalObtenerPuntajesPorArea = PUNTAJES.obtenerPuntajesPorArea;
    PUNTAJES.obtenerPuntajesPorArea = function() {
        const result = originalObtenerPuntajesPorArea.call(this);
        result.lobos = {
            cantidad: lobos.cantidad,
            valorActual: lobos.valorActual,
            totalPuntos: lobos.totalPuntos,
            colorMenor: lobos.colorMenor
        };
        return result;
    };
}

// ============================================================
// EXPORTAR
// ============================================================

window.lobos = lobos;
window.desbloquearLobo = desbloquearLobo;
window.registrarLobo = registrarLobo;
window.obtenerInfoLobos = obtenerInfoLobos;
window.generarTagLobos = generarTagLobos;
window.actualizarUI = actualizarUI;
window.resetLobos = resetLobos;
window.obtenerColorConMenosPuntos = obtenerColorConMenosPuntos;
window.actualizarValorLobo = actualizarValorLobo;

console.log('🐺 Sistema de Lobos cargado correctamente');