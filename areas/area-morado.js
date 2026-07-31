// ============================================================
// ÁREA MORADO - CLEVERDADOS (CORREGIDO FINAL)
// ============================================================

// Configuración del área morado
const MORADO_CONFIG = [
    { index: 0, valor: '', bonus: null, requiereNumero: true },
    { index: 1, valor: '', bonus: null, requiereNumero: true },
    // index 2: Espiral
    { index: 2, valor: '', bonus: 'Espiral', color: '#78909c', simbolo: '♻', tipo: 'espiral', indiceGris: 5, requiereNumero: true },
    // index 3: XAzul
    { index: 3, valor: '', bonus: 'XAzul', color: '#1e88e5', simbolo: '✖', tipo: 'x', indiceGris: 3, requiereNumero: true },
    // index 4: +1
    { index: 4, valor: '', bonus: '+1', color: '#ffd700', simbolo: '+1', tipo: 'mas1', indiceGris: 5, requiereNumero: true },
    // index 5: XAmarillo → AMARILLO (índice 9 en gris - el que funcionaba)
    { index: 5, valor: '', bonus: 'XAmarillo', color: '#fdd835', simbolo: '✖', tipo: 'x', indiceGris: 9, requiereNumero: true },
    // index 6: Lobo
    { index: 6, valor: '', bonus: 'Lobo', color: '#7b1fa2', simbolo: '🐺', tipo: 'lobo', indiceGris: 0, requiereNumero: true },
    // index 7: Espiral
    { index: 7, valor: '', bonus: 'Espiral', color: '#78909c', simbolo: '♻', tipo: 'espiral', indiceGris: 6, requiereNumero: true },
    // index 8: XVerde → VERDE (índice 6 en gris)
    { index: 8, valor: '', bonus: 'XVerde', color: '#43a047', simbolo: '✖', tipo: 'x', indiceGris: 6, requiereNumero: true },
    // index 9: 6Naranja
    { index: 9, valor: '', bonus: '6Naranja', color: '#ff6f00', simbolo: '6', tipo: 'seis', indiceGris: 3, requiereNumero: true },
    // index 10: +1
    { index: 10, valor: '', bonus: '+1', color: '#ffd700', simbolo: '+1', tipo: 'mas1', indiceGris: 6, requiereNumero: true }
];

// Estado
let valoresMorado = new Array(11).fill(null);
let bonificacionesMorado = [
    false, // index 2: Espiral
    false, // index 3: XAzul
    false, // index 4: +1
    false, // index 5: XAmarillo
    false, // index 6: Lobo
    false, // index 7: Espiral
    false, // index 8: XVerde
    false, // index 9: 6Naranja
    false  // index 10: +1
];

// Índices que tienen bonificación
const BONUS_INDICES_MORADO = [2, 3, 4, 5, 6, 7, 8, 9, 10];

// Estado de progreso para orden
let progresoMorado = 0;
let ultimoNumeroMorado = null;

// ============================================================
// INICIALIZACIÓN
// ============================================================

function inicializarAreaMorado() {
    const container = document.getElementById('area-morado-content');
    if (!container) return;
    
    actualizarProgresoMorado();
    
    let html = `<div class="morado-grid">`;
    html += `<div class="morado-tabla-container">`;
    
    // Fila de casillas
    html += `<div class="morado-fila">`;
    MORADO_CONFIG.forEach((celda, index) => {
        const id = `morado-${index}`;
        const estaMarcada = historialMovimientos.includes(id);
        const valorGuardado = valoresMorado[index];
        const claseMarcada = estaMarcada ? 'marcada' : '';
        const tieneBonus = celda.bonus !== null;
        const claseBonus = tieneBonus ? 'bonus-cell' : '';
        
        let displayValor = celda.valor;
        if (estaMarcada && valorGuardado !== null) {
            displayValor = valorGuardado;
        }
        
        html += `
            <div class="morado-celda-wrapper">
                <div class="morado-cell cell ${claseMarcada} ${claseBonus}" 
                     data-index="${index}"
                     data-requiere-numero="${celda.requiereNumero}"
                     data-tiene-bonus="${tieneBonus}"
                     onclick="manejarClickMorado(${index})">
                    ${displayValor}
                </div>
            </div>
        `;
    });
    html += `</div>`;
    
    // Fila de bonificaciones (debajo de cada casilla)
    html += `<div class="morado-bonus-fila">`;
    MORADO_CONFIG.forEach((celda, index) => {
        const tieneBonus = celda.bonus !== null;
        if (tieneBonus) {
            const bonusIdx = BONUS_INDICES_MORADO.indexOf(index);
            const completada = bonificacionesMorado[bonusIdx];
            const clase = completada ? 'puntaje-completado' : 'puntaje-pendiente';
            html += `
                <div class="morado-bonus-item">
                    <div class="morado-bonificacion-circulo puntaje-circulo ${clase}" 
                         data-morado-bonus="${bonusIdx}"
                         style="background-color: ${celda.color}; border-color: ${celda.color};">
                        ${completada ? '✓' : celda.simbolo}
                    </div>
                </div>
            `;
        } else {
            html += `<div class="morado-bonus-item vacio"></div>`;
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

function actualizarProgresoMorado() {
    let marcadas = 0;
    MORADO_CONFIG.forEach((celda, index) => {
        const id = `morado-${index}`;
        if (historialMovimientos.includes(id)) {
            marcadas++;
        }
    });
    progresoMorado = marcadas;
    
    if (progresoMorado > 0) {
        const ultimoIndex = progresoMorado - 1;
        ultimoNumeroMorado = valoresMorado[ultimoIndex];
    } else {
        ultimoNumeroMorado = null;
    }
}

// ============================================================
// MANEJAR CLICK EN CELDA
// ============================================================

function manejarClickMorado(index) {
    const celda = MORADO_CONFIG[index];
    const id = `morado-${index}`;
    
    if (historialMovimientos.includes(id)) return;
    
    if (index !== progresoMorado) {
        const cell = document.querySelector(`.morado-cell[data-index="${index}"]`);
        if (cell) {
            cell.style.borderColor = '#ff4444';
            setTimeout(() => {
                cell.style.borderColor = '';
            }, 500);
        }
        return;
    }
    
    if (celda.requiereNumero) {
        const titulo = celda.bonus ? `Marcar ${celda.bonus}` : 'Ingresa el dado';
        const subtitulo = celda.bonus ? `Selecciona el número para obtener ${celda.bonus}` : '¿Qué número obtuviste?';
        
        if (typeof mostrarModalNumerico === 'function') {
            mostrarModalNumerico(function(numero) {
                if (ultimoNumeroMorado !== null && ultimoNumeroMorado !== 6) {
                    if (numero <= ultimoNumeroMorado) {
                        const cell = document.querySelector(`.morado-cell[data-index="${index}"]`);
                        if (cell) {
                            cell.style.borderColor = '#ff4444';
                            setTimeout(() => {
                                cell.style.borderColor = '';
                            }, 1000);
                        }
                        alert(`El número debe ser mayor que ${ultimoNumeroMorado}. Si pones 6, se reinicia.`);
                        return;
                    }
                }
                
                valoresMorado[index] = numero;
                marcarMorado(index, numero);
            }, titulo, subtitulo);
        } else {
            const numero = prompt('Ingresa un número del 1 al 6:');
            if (numero !== null) {
                const num = parseInt(numero);
                if (num >= 1 && num <= 6) {
                    if (ultimoNumeroMorado !== null && ultimoNumeroMorado !== 6) {
                        if (num <= ultimoNumeroMorado) {
                            alert(`El número debe ser mayor que ${ultimoNumeroMorado}. Si pones 6, se reinicia.`);
                            return;
                        }
                    }
                    valoresMorado[index] = num;
                    marcarMorado(index, num);
                }
            }
        }
        return;
    }
}

// ============================================================
// MARCAR CASILLA
// ============================================================

function marcarMorado(index, numero) {
    const celda = MORADO_CONFIG[index];
    const id = `morado-${index}`;
    
    if (historialMovimientos.includes(id)) return;
    
    historialMovimientos.push(id);
    
    const cell = document.querySelector(`.morado-cell[data-index="${index}"]`);
    if (cell) {
        cell.classList.add('marcada');
        if (numero !== null) {
            cell.textContent = numero;
        }
    }
    
    actualizarProgresoMorado();
    verificarBonificacionMorado(index);
    recalcularPuntajesMorado();
    actualizarVisuales();
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// VERIFICAR BONIFICACIÓN
// ============================================================

function verificarBonificacionMorado(index) {
    const bonusIdx = BONUS_INDICES_MORADO.indexOf(index);
    if (bonusIdx === -1) return;
    if (bonificacionesMorado[bonusIdx]) return;
    
    const celda = MORADO_CONFIG[index];
    if (!celda.bonus) return;
    
    bonificacionesMorado[bonusIdx] = true;
    
    const circulo = document.querySelector(`.morado-bonificacion-circulo[data-morado-bonus="${bonusIdx}"]`);
    if (circulo) {
        circulo.classList.remove('puntaje-pendiente');
        circulo.classList.add('puntaje-completado');
        circulo.textContent = '✓';
    }
    
    aplicarBonificacionMorado(celda);
}

// ============================================================
// APLICAR BONIFICACIÓN CON ÍNDICE ESPECÍFICO
// ============================================================

function aplicarBonificacionMorado(celda) {
    if (!celda.bonus) return;
    
    switch(celda.tipo) {
        case 'espiral':
            if (typeof window.desbloquearEspiralExterno === 'function') {
                window.desbloquearEspiralExterno(celda.indiceGris);
            }
            break;
        case 'mas1':
            if (typeof window.desbloquearMas1Externo === 'function') {
                window.desbloquearMas1Externo(celda.indiceGris);
            }
            break;
        case 'x':
            if (typeof window.desbloquearXExterno === 'function') {
                window.desbloquearXExterno(celda.indiceGris);
            }
            break;
        case 'seis':
            if (typeof window.desbloquearSeisExterno === 'function') {
                window.desbloquearSeisExterno(celda.indiceGris);
            }
            break;
        case 'lobo':
            // Lobo fue eliminado de Gris, pero mantenemos la función por si acaso
            break;
    }
    recalcularPuntajesMorado();
}

// ============================================================
// RECALCULAR PUNTAJES
// ============================================================

function recalcularPuntajesMorado() {
    const marcasMorado = historialMovimientos.filter(m => m.startsWith('morado-')).length;
    
    let puntos = 0;
    if (marcasMorado > 0) {
        puntos = marcasMorado * (marcasMorado + 1) / 2;
    }
    
    puntajesAreas.morado = puntos;
    document.getElementById('score-morado').textContent = puntos;
    
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

function resetAreaMorado() {
    valoresMorado = new Array(11).fill(null);
    bonificacionesMorado = [false, false, false, false, false, false, false, false, false];
    progresoMorado = 0;
    ultimoNumeroMorado = null;
    
    document.querySelectorAll('.morado-cell').forEach(cell => {
        cell.classList.remove('marcada');
        cell.style.borderColor = '';
    });
    
    inicializarAreaMorado();
}

// ============================================================
// EXPORTAR
// ============================================================

window.inicializarAreaMorado = inicializarAreaMorado;
window.resetAreaMorado = resetAreaMorado;
window.recalcularPuntajesMorado = recalcularPuntajesMorado;