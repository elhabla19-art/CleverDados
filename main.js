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

// Variable para controlar si estamos en modo zoom
let enModoZoom = false;

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
        const totalElement = document.getElementById('score-total');
        const bonusElement = document.getElementById('bonus-display');
        if (totalElement) totalElement.textContent = total;
        if (bonusElement) bonusElement.textContent = puntosBonificacion || 0;
        
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
        
        const element = document.getElementById(`score-${area}`);
        if (element) element.textContent = puntos;
    });

    bonus = puntosBonificacion;
    total += bonus;
    
    puntajeTotal = total;
    const totalElement = document.getElementById('score-total');
    const bonusElement = document.getElementById('bonus-display');
    if (totalElement) totalElement.textContent = total;
    if (bonusElement) bonusElement.textContent = bonus;
    
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
// ACTUALIZAR VISUALES - VERSIÓN UNIFICADA
// ============================================================

function actualizarVisuales() {
    document.querySelectorAll('.cell').forEach(cell => {
        const area = cell.dataset.area;
        if (!area) return;
        
        const fila = cell.dataset.fila;
        const col = cell.dataset.col;
        const index = cell.dataset.index;
        
        let id = '';
        let estaMarcada = false;
        
        if (area === 'amarilla' && fila !== undefined && col !== undefined) {
            id = `amarilla-${fila}-${col}`;
        } else if (area === 'azul' && index !== undefined) {
            id = `azul-tabla-${index}`;
        } else if (area === 'verde' && index !== undefined) {
            id = `verde-tabla-${index}`;
        } else if (area === 'naranja' && index !== undefined) {
            id = `naranja-${index}`;
        } else if (area === 'morado' && index !== undefined) {
            id = `morado-${index}`;
        } else if (area === 'gris') {
            return;
        }
        
        if (id) {
            estaMarcada = historialMovimientos.includes(id);
        }
        
        if (estaMarcada) {
            cell.classList.add('marcada');
            
            // Naranja: mostrar valor numérico
            if (area === 'naranja' && typeof valoresNaranja !== 'undefined' && valoresNaranja[index] !== null && valoresNaranja[index] !== undefined) {
                cell.textContent = valoresNaranja[index];
                cell.style.color = '#ffffff';
            } 
            // Morado: mostrar valor numérico
            else if (area === 'morado' && typeof valoresMorado !== 'undefined' && valoresMorado[index] !== null && valoresMorado[index] !== undefined) {
                cell.textContent = valoresMorado[index];
                cell.style.color = '#ffffff';
            }
            // Otras áreas: mantener su valor original
            else if (area === 'amarilla' && typeof AMARILLA_CONFIG !== 'undefined' && AMARILLA_CONFIG.filas && AMARILLA_CONFIG.filas[fila]) {
                cell.textContent = AMARILLA_CONFIG.filas[fila].numeros[col] || '';
            } else if (area === 'azul' && typeof TABLA_AZUL !== 'undefined' && TABLA_AZUL[index]) {
                cell.textContent = TABLA_AZUL[index].valor || '';
            } else if (area === 'verde' && typeof TABLA_VERDE !== 'undefined' && TABLA_VERDE[index]) {
                cell.textContent = TABLA_VERDE[index].valor || '';
            }
        } else {
            cell.classList.remove('marcada');
            
            // Restaurar valores originales
            if (area === 'amarilla' && typeof AMARILLA_CONFIG !== 'undefined' && AMARILLA_CONFIG.filas && AMARILLA_CONFIG.filas[fila]) {
                cell.textContent = AMARILLA_CONFIG.filas[fila].numeros[col] || '';
            }
            if (area === 'azul' && typeof TABLA_AZUL !== 'undefined' && TABLA_AZUL[index]) {
                cell.textContent = TABLA_AZUL[index].valor || '';
            }
            if (area === 'verde' && typeof TABLA_VERDE !== 'undefined' && TABLA_VERDE[index]) {
                cell.textContent = TABLA_VERDE[index].valor || '';
            }
            if (area === 'naranja' && typeof NARANJA_CONFIG !== 'undefined' && NARANJA_CONFIG[index]) {
                cell.textContent = NARANJA_CONFIG[index].valor || '';
                cell.style.color = '';
            }
            if (area === 'morado' && typeof MORADO_CONFIG !== 'undefined' && MORADO_CONFIG[index]) {
                cell.textContent = MORADO_CONFIG[index].valor || '';
                cell.style.color = '';
            }
        }
    });
}


// ============================================================
// ACTUALIZAR VISUALES EN EL ZOOM - VERSIÓN MEJORADA
// ============================================================

function actualizarVisualesZoom() {
    const zoomContent = document.getElementById('zoomAreaContent');
    if (!zoomContent) return;
    
    zoomContent.querySelectorAll('.cell').forEach(cell => {
        const area = cell.dataset.area;
        const fila = cell.dataset.fila;
        const col = cell.dataset.col;
        const index = cell.dataset.index;
        
        if (!area) return;
        
        let id = '';
        let estaMarcada = false;
        
        if (area === 'amarilla' && fila !== undefined && col !== undefined) {
            id = `amarilla-${fila}-${col}`;
        } else if (area === 'azul' && index !== undefined) {
            id = `azul-tabla-${index}`;
        } else if (area === 'verde' && index !== undefined) {
            id = `verde-tabla-${index}`;
        } else if (area === 'naranja' && index !== undefined) {
            id = `naranja-${index}`;
        } else if (area === 'morado' && index !== undefined) {
            id = `morado-${index}`;
        }
        
        if (id) {
            estaMarcada = historialMovimientos.includes(id);
        }
        
        if (estaMarcada) {
            cell.classList.add('marcada');
            
            // Naranja: mostrar valor numérico
            if (area === 'naranja' && typeof valoresNaranja !== 'undefined' && valoresNaranja[index] !== null && valoresNaranja[index] !== undefined) {
                cell.textContent = valoresNaranja[index];
                cell.style.color = '#ffffff';
            } 
            // Morado: mostrar valor numérico
            else if (area === 'morado' && typeof valoresMorado !== 'undefined' && valoresMorado[index] !== null && valoresMorado[index] !== undefined) {
                cell.textContent = valoresMorado[index];
                cell.style.color = '#ffffff';
            }
            // Otras áreas: mantener su valor original
            else if (area === 'amarilla' && typeof AMARILLA_CONFIG !== 'undefined' && AMARILLA_CONFIG.filas && AMARILLA_CONFIG.filas[fila]) {
                cell.textContent = AMARILLA_CONFIG.filas[fila].numeros[col] || '';
            } else if (area === 'azul' && typeof TABLA_AZUL !== 'undefined' && TABLA_AZUL[index]) {
                cell.textContent = TABLA_AZUL[index].valor || '';
            } else if (area === 'verde' && typeof TABLA_VERDE !== 'undefined' && TABLA_VERDE[index]) {
                cell.textContent = TABLA_VERDE[index].valor || '';
            }
        } else {
            cell.classList.remove('marcada');
            
            // Restaurar valores originales
            if (area === 'amarilla' && typeof AMARILLA_CONFIG !== 'undefined' && AMARILLA_CONFIG.filas && AMARILLA_CONFIG.filas[fila]) {
                cell.textContent = AMARILLA_CONFIG.filas[fila].numeros[col] || '';
            }
            if (area === 'azul' && typeof TABLA_AZUL !== 'undefined' && TABLA_AZUL[index]) {
                cell.textContent = TABLA_AZUL[index].valor || '';
            }
            if (area === 'verde' && typeof TABLA_VERDE !== 'undefined' && TABLA_VERDE[index]) {
                cell.textContent = TABLA_VERDE[index].valor || '';
            }
            if (area === 'naranja' && typeof NARANJA_CONFIG !== 'undefined' && NARANJA_CONFIG[index]) {
                cell.textContent = NARANJA_CONFIG[index].valor || '';
                cell.style.color = '';
            }
            if (area === 'morado' && typeof MORADO_CONFIG !== 'undefined' && MORADO_CONFIG[index]) {
                cell.textContent = MORADO_CONFIG[index].valor || '';
                cell.style.color = '';
            }
        }
    });
}

// ============================================================
// MANEJAR CLICK EN CELDA
// ============================================================

function manejarClickCelda(cell) {
    const area = cell.dataset.area;
    const fila = cell.dataset.fila;
    const col = cell.dataset.col;
    const index = cell.dataset.index;
    
    // Si no tiene area, ignorar
    if (!area) return;
    
    // Si está en modo zoom, usar el manejador específico del área
    if (enModoZoom) {
        // Buscar el área correspondiente y usar su manejador
        if (area === 'amarilla' && fila !== undefined && col !== undefined) {
            if (typeof manejarClickAmarilla === 'function') {
                manejarClickAmarilla(parseInt(fila), parseInt(col));
            }
            return;
        }
        if (area === 'azul' && index !== undefined) {
            if (typeof manejarClickAzul === 'function') {
                manejarClickAzul(parseInt(index));
            }
            return;
        }
        if (area === 'verde' && index !== undefined) {
            if (typeof manejarClickVerde === 'function') {
                manejarClickVerde(parseInt(index));
            }
            return;
        }
        if (area === 'naranja' && index !== undefined) {
            if (typeof manejarClickNaranja === 'function') {
                manejarClickNaranja(parseInt(index));
            }
            return;
        }
        if (area === 'morado' && index !== undefined) {
            if (typeof manejarClickMorado === 'function') {
                manejarClickMorado(parseInt(index));
            }
            return;
        }
        return;
    }
    
    // Si NO está en modo zoom, solo permitir clicks en gris
    if (area !== 'gris') {
        return;
    }
    
    // Para gris, no hacer nada aquí (tiene sus propios manejadores)
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
// ZOOM DE ÁREA - FUNCIONALIDAD MEJORADA
// ============================================================

function abrirZoomArea(area) {
    // No abrir zoom para área gris
    if (area === 'gris') return;
    
    const modal = document.getElementById('zoomAreaModal');
    const content = document.getElementById('zoomAreaContent');
    
    // Obtener el contenido del área
    const areaElement = document.getElementById(`area-${area}`);
    const areaContent = areaElement ? areaElement.querySelector(`#area-${area}-content`) : null;
    
    if (areaContent) {
        // Clonar el contenido para el zoom
        const clone = areaContent.cloneNode(true);
        content.innerHTML = '';
        content.appendChild(clone);
        
        // Reorganizar verde, naranja y morado en 2 filas (6 + 5)
        if (area === 'verde' || area === 'naranja' || area === 'morado') {
            reorganizarEnDosFilas(content, area);
        }
        
        // Activar modo zoom
        enModoZoom = true;
        
        // IMPORTANTE: Actualizar las visuales del zoom inmediatamente
        // con el estado actual del historial
        setTimeout(() => {
            actualizarVisualesZoom();
        }, 50);
        
    } else {
        content.innerHTML = '<p style="color: var(--text-muted);">Contenido no disponible</p>';
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function reorganizarEnDosFilas(container, area) {
    // Buscar la fila principal
    const fila = container.querySelector(`.${area}-fila`);
    if (!fila) return;
    
    // Obtener todos los wrappers de celdas
    const wrappers = fila.querySelectorAll(`.${area}-celda-wrapper`);
    if (wrappers.length === 0) return;
    
    // Limpiar la fila original
    fila.innerHTML = '';
    fila.style.display = 'flex';
    fila.style.flexWrap = 'wrap';
    fila.style.gap = '6px';
    fila.style.justifyContent = 'center';
    fila.style.width = '100%';
    fila.style.maxWidth = '650px';
    
    // Añadir todos los wrappers en orden
    wrappers.forEach((w, index) => {
        w.style.flex = '0 0 auto';
        // Los primeros 6 van a la primera fila, los siguientes 5 a la segunda
        if (index >= 6) {
            w.style.marginTop = '6px';
        }
        fila.appendChild(w);
    });
    
    // También reorganizar la fila de bonificaciones si existe
    const bonusFila = container.querySelector(`.${area}-bonus-fila`);
    if (bonusFila) {
        const bonusItems = bonusFila.querySelectorAll(`.${area}-bonus-item`);
        if (bonusItems.length > 0) {
            bonusFila.innerHTML = '';
            bonusFila.style.display = 'flex';
            bonusFila.style.flexWrap = 'wrap';
            bonusFila.style.gap = '6px';
            bonusFila.style.justifyContent = 'center';
            bonusFila.style.width = '100%';
            bonusFila.style.maxWidth = '650px';
            
            bonusItems.forEach((item, index) => {
                item.style.flex = '0 0 auto';
                if (index >= 6) {
                    item.style.marginTop = '6px';
                }
                bonusFila.appendChild(item);
            });
        }
    }
}

// ============================================================
// CERRAR ZOOM AREA
// ============================================================

function cerrarZoomArea() {
    const modal = document.getElementById('zoomAreaModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        enModoZoom = false;
        
        // Actualizar el área principal después de cerrar el zoom
        actualizarVisuales();
        
        // Recalcular puntajes
        if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
            PUNTAJES.calcularTotal();
        } else {
            calcularPuntajes();
        }
        
        // Actualizar leaderboard
        if (typeof renderizarLeaderboard === 'function') {
            renderizarLeaderboard();
        }
    }
}

// ============================================================
// PROPAGAR CLICKS DESDE EL ZOOM - CORREGIDO
// ============================================================

function propagarClickZoom(cell) {
    // Evitar propagación si ya está marcada
    if (cell.classList.contains('marcada') || cell.classList.contains('pre-marcada')) {
        return false;
    }
    
    const area = cell.dataset.area;
    const fila = cell.dataset.fila;
    const col = cell.dataset.col;
    const index = cell.dataset.index;
    
    if (!area) return false;
    
    let resultado = false;
    
    // Llamar al manejador correspondiente según el área
    try {
        if (area === 'amarilla' && fila !== undefined && col !== undefined) {
            if (typeof manejarClickAmarilla === 'function') {
                manejarClickAmarilla(parseInt(fila), parseInt(col));
                resultado = true;
            }
        } else if (area === 'azul' && index !== undefined) {
            if (typeof manejarClickAzul === 'function') {
                manejarClickAzul(parseInt(index));
                resultado = true;
            }
        } else if (area === 'verde' && index !== undefined) {
            if (typeof manejarClickVerde === 'function') {
                manejarClickVerde(parseInt(index));
                resultado = true;
            }
        } else if (area === 'naranja' && index !== undefined) {
            if (typeof manejarClickNaranja === 'function') {
                manejarClickNaranja(parseInt(index));
                resultado = true;
            }
        } else if (area === 'morado' && index !== undefined) {
            if (typeof manejarClickMorado === 'function') {
                manejarClickMorado(parseInt(index));
                resultado = true;
            }
        }
    } catch(e) {
        console.warn('Error al propagar click:', e);
        return false;
    }
    
    // Si se marcó correctamente, actualizar visuales del zoom
    if (resultado) {
        // Actualizar visuales del zoom inmediatamente
        if (typeof actualizarVisualesZoom === 'function') {
            actualizarVisualesZoom();
        }
        // También actualizar el tablero principal
        if (typeof actualizarVisuales === 'function') {
            actualizarVisuales();
        }
    }
    
    return resultado;
}

// ============================================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================================

window.calcularPuntajes = calcularPuntajes;
window.actualizarVisuales = actualizarVisuales;
window.actualizarVisualesZoom = actualizarVisualesZoom;
window.manejarClickCelda = manejarClickCelda;
window.aplicarBonificacion = aplicarBonificacion;
window.reiniciarTablero = reiniciarTablero;
window.mostrarModalReinicio = mostrarModalReinicio;
window.cerrarModal = cerrarModal;
window.confirmarReinicio = confirmarReinicio;
window.jugarSolo = jugarSolo;
window.abrirZoomArea = abrirZoomArea;
window.cerrarZoomArea = cerrarZoomArea;
window.propagarClickZoom = propagarClickZoom;
window.reorganizarEnDosFilas = reorganizarEnDosFilas;
window.enModoZoom = enModoZoom;

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
    
    // Agregar event listeners SOLO a celdas del área gris (fuera del zoom)
    document.querySelectorAll('.area-gris .cell:not(.pre-marcada)').forEach(cell => {
        if (cell.dataset.area && cell.dataset.fila !== undefined && cell.dataset.col !== undefined) {
            cell.addEventListener('click', () => manejarClickCelda(cell));
        }
    });
    
    // Event listener para propagar clicks desde el zoom
    document.addEventListener('click', function(e) {
        const cell = e.target.closest('.cell');
        if (!cell) return;
        
        // Si está dentro del zoom
        const zoomModal = document.getElementById('zoomAreaModal');
        if (zoomModal && zoomModal.style.display === 'flex' && zoomModal.contains(cell)) {
            // Evitar que el click se propague al área principal
            e.stopPropagation();
            e.preventDefault();
            propagarClickZoom(cell);
        }
    });
    
    // Cerrar zoom con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarZoomArea();
        }
    });
    
    // Cerrar zoom al hacer clic fuera del modal
    document.getElementById('zoomAreaModal').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarZoomArea();
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