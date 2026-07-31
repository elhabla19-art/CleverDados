// ============================================================
// ÁREA NARANJA - CLEVERDADOS
// ============================================================

// Configuración del área naranja
const NARANJA_CONFIG = [
    { index: 0, valor: '', bonus: null, requiereNumero: true, multiplicador: 1 },
    { index: 1, valor: '', bonus: null, requiereNumero: true, multiplicador: 1 },
    { index: 2, valor: '', bonus: 'Espiral', color: '#78909c', simbolo: '♻', tipo: 'espiral', indiceGris: 4, requiereNumero: true, multiplicador: 1 },
    { index: 3, valor: '×2', bonus: '+1', color: '#ffd700', simbolo: '+1', tipo: 'mas1', indiceGris: 4, requiereNumero: true, multiplicador: 2 },
    { index: 4, valor: '', bonus: null, requiereNumero: true, multiplicador: 1 },
    { index: 5, valor: '', bonus: 'XAmarilla', color: '#fdd835', simbolo: '✖', tipo: 'x', indiceGris: 8, requiereNumero: true, multiplicador: 1 },
    { index: 6, valor: '×2', bonus: '+1', color: '#ffd700', simbolo: '+1', tipo: 'mas1', indiceGris: 4, requiereNumero: true, multiplicador: 2 },
    { index: 7, valor: '', bonus: null, requiereNumero: true, multiplicador: 1 },
    { index: 8, valor: '×2', bonus: 'Lobo', color: '#7b1fa2', simbolo: '🐺', tipo: 'lobo', indiceGris: 0, requiereNumero: true, multiplicador: 2 },
    { index: 9, valor: '', bonus: null, requiereNumero: true, multiplicador: 1 },
    { index: 10, valor: '×3', bonus: '6Morado', color: '#7b1fa2', simbolo: '6', tipo: 'seis', indiceGris: 6, requiereNumero: true, multiplicador: 3 }
];

// Estado
let valoresNaranja = new Array(11).fill(null);
let bonificacionesNaranja = [
    false, // index 2: Espiral
    false, // index 3: +1
    false, // index 5: XAmarilla
    false, // index 6: +1
    false, // index 8: Lobo
    false  // index 10: 6Morado
];

// Índices que tienen bonificación (CORREGIDO - incluye índice 2)
const BONUS_INDICES_NARANJA = [2, 3, 5, 6, 8, 10];

// Estado de progreso para orden
let progresoNaranja = 0;

// ============================================================
// INICIALIZACIÓN
// ============================================================

function inicializarAreaNaranja() {
    const container = document.getElementById('area-naranja-content');
    if (!container) return;
    
    actualizarProgresoNaranja();
    
    let html = `<div class="naranja-grid">`;
    html += `<div class="naranja-tabla-container">`;
    
    // Fila de casillas
    html += `<div class="naranja-fila">`;
    NARANJA_CONFIG.forEach((celda, index) => {
        const id = `naranja-${index}`;
        const estaMarcada = historialMovimientos.includes(id);
        const valorGuardado = valoresNaranja[index];
        const claseMarcada = estaMarcada ? 'marcada' : '';
        const esMultiplicador = celda.multiplicador > 1;
        const claseMultiplicador = esMultiplicador ? 'multiplicador' : '';
        const tieneBonus = celda.bonus !== null;
        const claseBonus = tieneBonus ? 'bonus-cell' : '';
        
        let displayValor = celda.valor;
        if (estaMarcada && valorGuardado !== null) {
            displayValor = valorGuardado;
        }
        
        html += `
            <div class="naranja-celda-wrapper">
                <div class="naranja-cell cell ${claseMarcada} ${claseMultiplicador} ${claseBonus}" 
                     data-index="${index}"
                     data-requiere-numero="${celda.requiereNumero}"
                     data-tiene-bonus="${tieneBonus}"
                     onclick="manejarClickNaranja(${index})">
                    ${displayValor}
                </div>
            </div>
        `;
    });
    html += `</div>`;
    
    // Fila de bonificaciones (debajo de cada casilla)
    html += `<div class="naranja-bonus-fila">`;
    NARANJA_CONFIG.forEach((celda, index) => {
        const tieneBonus = celda.bonus !== null;
        if (tieneBonus) {
            const bonusIdx = BONUS_INDICES_NARANJA.indexOf(index);
            const completada = bonificacionesNaranja[bonusIdx];
            const clase = completada ? 'puntaje-completado' : 'puntaje-pendiente';
            html += `
                <div class="naranja-bonus-item">
                    <div class="naranja-bonificacion-circulo puntaje-circulo ${clase}" 
                         data-naranja-bonus="${bonusIdx}"
                         style="background-color: ${celda.color}; border-color: ${celda.color};">
                        ${completada ? '✓' : celda.simbolo}
                    </div>
                </div>
            `;
        } else {
            html += `<div class="naranja-bonus-item vacio"></div>`;
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

function actualizarProgresoNaranja() {
    let marcadas = 0;
    NARANJA_CONFIG.forEach((celda, index) => {
        const id = `naranja-${index}`;
        if (historialMovimientos.includes(id)) {
            marcadas++;
        }
    });
    progresoNaranja = marcadas;
}

// ============================================================
// MANEJAR CLICK EN CELDA - SOLO EN ORDEN
// ============================================================

function manejarClickNaranja(index) {
    const celda = NARANJA_CONFIG[index];
    const id = `naranja-${index}`;
    
    if (historialMovimientos.includes(id)) return;
    
    if (index !== progresoNaranja) {
        const cell = document.querySelector(`.naranja-cell[data-index="${index}"]`);
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
                let valorFinal = numero * celda.multiplicador;
                valoresNaranja[index] = valorFinal;
                marcarNaranja(index, valorFinal);
            }, titulo, subtitulo);
        } else {
            const numero = prompt('Ingresa un número del 1 al 6:');
            if (numero !== null) {
                const num = parseInt(numero);
                if (num >= 1 && num <= 6) {
                    let valorFinal = num * celda.multiplicador;
                    valoresNaranja[index] = valorFinal;
                    marcarNaranja(index, valorFinal);
                }
            }
        }
        return;
    }
}

// ============================================================
// MARCAR CASILLA
// ============================================================

function marcarNaranja(index, numero) {
    const celda = NARANJA_CONFIG[index];
    const id = `naranja-${index}`;
    
    if (historialMovimientos.includes(id)) return;
    
    historialMovimientos.push(id);
    
    const cell = document.querySelector(`.naranja-cell[data-index="${index}"]`);
    if (cell) {
        cell.classList.add('marcada');
        if (numero !== null) {
            cell.textContent = numero;
        }
    }
    
    actualizarProgresoNaranja();
    verificarBonificacionNaranja(index);
    recalcularPuntajesNaranja();
    actualizarVisuales();
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// VERIFICAR BONIFICACIÓN
// ============================================================

function verificarBonificacionNaranja(index) {
    const bonusIdx = BONUS_INDICES_NARANJA.indexOf(index);
    if (bonusIdx === -1) return;
    if (bonificacionesNaranja[bonusIdx]) return;
    
    const celda = NARANJA_CONFIG[index];
    if (!celda.bonus) return;
    
    bonificacionesNaranja[bonusIdx] = true;
    
    const circulo = document.querySelector(`.naranja-bonificacion-circulo[data-naranja-bonus="${bonusIdx}"]`);
    if (circulo) {
        circulo.classList.remove('puntaje-pendiente');
        circulo.classList.add('puntaje-completado');
        circulo.textContent = '✓';
    }
    
    aplicarBonificacionNaranja(celda);
}

// ============================================================
// APLICAR BONIFICACIÓN CON ÍNDICE ESPECÍFICO
// ============================================================

function aplicarBonificacionNaranja(celda) {
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
            if (typeof window.desbloquearLoboExterno === 'function') {
                window.desbloquearLoboExterno(celda.indiceGris);
            }
            break;
    }
    recalcularPuntajesNaranja();
}

// ============================================================
// RECALCULAR PUNTAJES
// ============================================================

function recalcularPuntajesNaranja() {
    const marcasNaranja = historialMovimientos.filter(m => m.startsWith('naranja-')).length;
    
    let puntos = 0;
    if (marcasNaranja > 0) {
        puntos = marcasNaranja * (marcasNaranja + 1) / 2;
    }
    
    let multiplicadorTotal = 1;
    NARANJA_CONFIG.forEach((celda, index) => {
        if (celda.multiplicador > 1) {
            const id = `naranja-${index}`;
            if (historialMovimientos.includes(id)) {
                multiplicadorTotal *= celda.multiplicador;
            }
        }
    });
    
    puntos *= multiplicadorTotal;
    
    puntajesAreas.naranja = puntos;
    document.getElementById('score-naranja').textContent = puntos;
    
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

function resetAreaNaranja() {
    valoresNaranja = new Array(11).fill(null);
    bonificacionesNaranja = [false, false, false, false, false, false];
    progresoNaranja = 0;
    
    document.querySelectorAll('.naranja-cell').forEach(cell => {
        cell.classList.remove('marcada');
        cell.style.borderColor = '';
    });
    
    inicializarAreaNaranja();
}

// ============================================================
// EXPORTAR
// ============================================================

window.inicializarAreaNaranja = inicializarAreaNaranja;
window.resetAreaNaranja = resetAreaNaranja;
window.recalcularPuntajesNaranja = recalcularPuntajesNaranja;