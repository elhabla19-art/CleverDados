// ============================================================
// DESHACER.JS - SISTEMA DE DESHACER PARA CLEVERDADOS
// ============================================================

let pilaMovimientos = [];

// ============================================================
// GUARDAR ACCIÓN
// ============================================================

function guardarAccion(tipo, id, area, datosExtra = {}) {
    pilaMovimientos.push({
        tipo: tipo,
        id: id,
        area: area,
        datos: datosExtra,
        timestamp: Date.now()
    });
    
    if (pilaMovimientos.length > 100) {
        pilaMovimientos.shift();
    }
}

// ============================================================
// VERIFICAR SI ES EL ÚLTIMO MOVIMIENTO
// ============================================================

function esUltimoMovimiento(id) {
    if (pilaMovimientos.length === 0) return false;
    const ultimo = pilaMovimientos[pilaMovimientos.length - 1];
    return ultimo.id === id;
}

// ============================================================
// INTENTAR DESHACER
// ============================================================

function intentarDeshacer(id) {
    // 1. Verificar si hay movimientos
    if (pilaMovimientos.length === 0) {
        return { exito: false, mensaje: 'No hay movimientos para deshacer' };
    }
    
    // 2. Verificar si es el último movimiento
    if (!esUltimoMovimiento(id)) {
        return { exito: false, mensaje: 'Solo puedes deshacer el último movimiento' };
    }
    
    // 3. Obtener y eliminar el último movimiento
    const movimiento = pilaMovimientos.pop();
    
    // 4. Ejecutar el deshacer
    const resultado = ejecutarDeshacer(movimiento);
    
    return {
        exito: resultado,
        movimiento: movimiento,
        mensaje: resultado ? 'Movimiento deshecho' : 'Error al deshacer'
    };
}

// ============================================================
// EJECUTAR DESHACER
// ============================================================

function ejecutarDeshacer(movimiento) {
    const { tipo, id, area, datos } = movimiento;
    
    console.log(`↩️ Deshaciendo: ${tipo} - ${id} en ${area}`);
    
    try {
        switch (tipo) {
            case 'marcar':
                return deshacerMarcar(id, area);
            case 'turno':
                return deshacerTurno(id);
            case 'habilidad':
                return deshacerHabilidad(id);
            case 'numero':
                return deshacerNumero(id, area, datos);
            case 'lobo':
                return deshacerLobo(datos);
            default:
                console.warn(`⚠️ Tipo desconocido: ${tipo}`);
                return false;
        }
    } catch (e) {
        console.error('Error al deshacer:', e);
        return false;
    }
}

// ============================================================
// DESHACER: MARCAR CASILLA
// ============================================================

function deshacerMarcar(id, area) {
    // 1. Remover del historial de movimientos
    if (typeof historialMovimientos !== 'undefined') {
        const index = historialMovimientos.indexOf(id);
        if (index !== -1) {
            historialMovimientos.splice(index, 1);
            console.log(`✅ Deshecho: ${id}`);
        } else {
            return false;
        }
    }
    
    // 2. Actualizar visuales
    if (typeof actualizarVisuales === 'function') {
        actualizarVisuales();
    }
    
    // 3. Recalcular puntajes
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    } else if (typeof calcularPuntajes === 'function') {
        calcularPuntajes();
    }
    
    // 4. Actualizar leaderboard
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
    
    // 5. Sincronizar
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
    
    return true;
}

// ============================================================
// DESHACER: TURNO (gris)
// ============================================================

function deshacerTurno(id) {
    // 1. Remover del historial de movimientos
    if (typeof historialMovimientos !== 'undefined') {
        const index = historialMovimientos.indexOf(id);
        if (index !== -1) {
            historialMovimientos.splice(index, 1);
        } else {
            return false;
        }
    }
    
    // 2. Remover de turnosCompletados
    const partes = id.split('-');
    if (partes.length === 3 && partes[0] === 'gris' && partes[1] === 'turno') {
        const turnoIndex = parseInt(partes[2]);
        if (typeof turnosCompletados !== 'undefined') {
            const turnoNumero = turnoIndex + 1;
            const idx = turnosCompletados.indexOf(turnoNumero);
            if (idx !== -1) {
                turnosCompletados.splice(idx, 1);
            }
        }
    }
    
    // 3. Actualizar estados de habilidades
    if (typeof reconstruirTurnosCompletados === 'function') {
        reconstruirTurnosCompletados();
    }
    if (typeof actualizarEstadosGris === 'function') {
        actualizarEstadosGris();
    }
    
    // 4. Actualizar visuales
    if (typeof actualizarVisuales === 'function') {
        actualizarVisuales();
    }
    
    // 5. Recalcular puntajes
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    }
    
    return true;
}

// ============================================================
// DESHACER: HABILIDAD (gris)
// ============================================================

function deshacerHabilidad(id) {
    // 1. Remover del historial de movimientos
    if (typeof historialMovimientos !== 'undefined') {
        const index = historialMovimientos.indexOf(id);
        if (index !== -1) {
            historialMovimientos.splice(index, 1);
        } else {
            return false;
        }
    }
    
    // 2. Actualizar visuales
    if (typeof actualizarEstadosGris === 'function') {
        actualizarEstadosGris();
    }
    if (typeof actualizarVisuales === 'function') {
        actualizarVisuales();
    }
    
    // 3. Recalcular puntajes
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    }
    
    return true;
}

// ============================================================
// DESHACER: NÚMERO (naranja, morado) - CORREGIDO
// ============================================================

function deshacerNumero(id, area, datos) {
    console.log(`↩️ Deshaciendo número: ${id} en ${area}`, datos);
    
    // 1. Remover del historial de movimientos
    if (typeof historialMovimientos !== 'undefined') {
        const index = historialMovimientos.indexOf(id);
        if (index !== -1) {
            historialMovimientos.splice(index, 1);
            console.log(`✅ Eliminado ${id} del historial`);
        } else {
            console.warn(`⚠️ No se encontró ${id} en historial`);
            return false;
        }
    }
    
    // 2. Restaurar el valor guardado
    const partes = id.split('-');
    if (partes.length === 2) {
        const index = parseInt(partes[1]);
        if (!isNaN(index)) {
            if (area === 'naranja' && typeof valoresNaranja !== 'undefined') {
                const valorAnterior = datos && datos.valorAnterior !== undefined ? datos.valorAnterior : null;
                valoresNaranja[index] = valorAnterior;
                console.log(`✅ Restaurado valoresNaranja[${index}] = ${valorAnterior}`);
            } else if (area === 'morado' && typeof valoresMorado !== 'undefined') {
                const valorAnterior = datos && datos.valorAnterior !== undefined ? datos.valorAnterior : null;
                valoresMorado[index] = valorAnterior;
                console.log(`✅ Restaurado valoresMorado[${index}] = ${valorAnterior}`);
            }
        }
    }
    
    // 3. Actualizar progreso
    if (area === 'naranja' && typeof actualizarProgresoNaranja === 'function') {
        actualizarProgresoNaranja();
    } else if (area === 'morado' && typeof actualizarProgresoMorado === 'function') {
        actualizarProgresoMorado();
    }
    
    // 4. Actualizar visuales específicas
    if (area === 'naranja' && typeof actualizarVisualesNaranja === 'function') {
        actualizarVisualesNaranja();
    } else if (area === 'morado' && typeof actualizarVisualesMorado === 'function') {
        actualizarVisualesMorado();
    }
    
    // 5. Actualizar visuales generales
    if (typeof actualizarVisuales === 'function') {
        actualizarVisuales();
    }
    
    // 6. Recalcular puntajes
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    } else if (area === 'naranja' && typeof recalcularPuntajesNaranja === 'function') {
        recalcularPuntajesNaranja();
    } else if (area === 'morado' && typeof recalcularPuntajesMorado === 'function') {
        recalcularPuntajesMorado();
    }
    
    // 7. Actualizar leaderboard
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
    
    // 8. Sincronizar
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
    
    return true;
}

// ============================================================
// DESHACER: LOBO
// ============================================================

function deshacerLobo(datos) {
    if (typeof lobos === 'undefined') return false;
    
    if (datos && datos.cantidadAnterior !== undefined) {
        lobos.cantidad = datos.cantidadAnterior;
    } else if (lobos.cantidad > 0) {
        lobos.cantidad--;
    }
    
    if (typeof actualizarValorLobo === 'function') {
        actualizarValorLobo();
    }
    
    if (typeof actualizarUI === 'function') {
        actualizarUI();
    }
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    }
    
    return true;
}

// ============================================================
// LIMPIAR PILA
// ============================================================

function limpiarPilaMovimientos() {
    const cantidad = pilaMovimientos.length;
    pilaMovimientos = [];
    if (cantidad > 0) {
        console.log(`🗑️ Pila de movimientos limpiada (${cantidad})`);
    }
}

// ============================================================
// FUNCIONES DE DEPURACIÓN
// ============================================================

function getPilaMovimientos() {
    return [...pilaMovimientos];
}

function getUltimoMovimiento() {
    return pilaMovimientos.length > 0 ? pilaMovimientos[pilaMovimientos.length - 1] : null;
}

function contarMovimientos() {
    return pilaMovimientos.length;
}

// ============================================================
// EXPONER FUNCIONES GLOBALES
// ============================================================

window.guardarAccion = guardarAccion;
window.esUltimoMovimiento = esUltimoMovimiento;
window.intentarDeshacer = intentarDeshacer;
window.limpiarPilaMovimientos = limpiarPilaMovimientos;
window.getPilaMovimientos = getPilaMovimientos;
window.getUltimoMovimiento = getUltimoMovimiento;
window.contarMovimientos = contarMovimientos;

console.log('↩️ Sistema de deshacer cargado correctamente');