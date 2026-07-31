// ============================================================
// PUNTAJES.JS - CLEVERDADOS (CORREGIDO - CON VERIFICACIONES)
// ============================================================

/**
 * Sistema de puntuación para cada área
 * Cada área tiene su propia lógica de cálculo
 */

const PUNTAJES = {
    // ============================================================
    // ÁREA AMARILLA
    // SOLO puntos por columnas completadas: [10, 14, 16, 20]
    // NO da puntos por casillas individuales
    // ============================================================
    amarilla: {
        columnas: [10, 14, 16, 20],
        calcular: function() {
            let puntos = 0;
            
            // SOLO puntos por columnas completadas
            // Verificar si la variable existe y está definida
            if (typeof columnasCompletadas !== 'undefined' && columnasCompletadas) {
                columnasCompletadas.forEach((completada, index) => {
                    if (completada) {
                        puntos += this.columnas[index];
                    }
                });
            }
            
            return puntos;
        }
    },

    // ============================================================
    // ÁREA AZUL
    // Puntajes progresivos: 1, 2, 4, 7, 11, 16, 22, 29, 37, 46, 56
    // ============================================================
    azul: {
        puntajes: [1, 2, 4, 7, 11, 16, 22, 29, 37, 46, 56],
        calcular: function() {
            let puntos = 0;
            
            // Contar cuántas casillas están marcadas en el área azul
            const marcas = historialMovimientos ? historialMovimientos.filter(m => m.startsWith('azul-tabla-')).length : 0;
            
            // Sumar los puntajes progresivos según las casillas marcadas
            for (let i = 0; i < marcas && i < this.puntajes.length; i++) {
                puntos += this.puntajes[i];
            }
            
            // Puntos por columnas completadas (bonificaciones de columna)
            if (typeof columnasCompletadasAzul !== 'undefined' && columnasCompletadasAzul) {
                columnasCompletadasAzul.forEach((completada, index) => {
                    if (completada) {
                        // Cada columna completada da 5 puntos
                        puntos += 5;
                    }
                });
            }
            
            return puntos;
        }
    },

    // ============================================================
    // ÁREA VERDE
    // Puntajes progresivos: 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66
    // ============================================================
    verde: {
        puntajes: [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66],
        calcular: function() {
            let puntos = 0;
            
            // Contar cuántas casillas están marcadas en el área verde
            const marcas = historialMovimientos ? historialMovimientos.filter(m => m.startsWith('verde-tabla-')).length : 0;
            
            // Sumar los puntajes progresivos según las casillas marcadas
            for (let i = 0; i < marcas && i < this.puntajes.length; i++) {
                puntos += this.puntajes[i];
            }
            
            return puntos;
        }
    },

    // ============================================================
    // ÁREA NARANJA
    // Puntaje = (número elegido × multiplicador) sumado por cada casilla
    // Multiplicadores: ×1 (normal), ×2, ×3
    // ============================================================
    naranja: {
        calcular: function() {
            let puntos = 0;
            
            // Obtener los valores guardados de area-naranja.js
            if (typeof valoresNaranja !== 'undefined' && valoresNaranja && typeof NARANJA_CONFIG !== 'undefined' && NARANJA_CONFIG) {
                NARANJA_CONFIG.forEach((celda, index) => {
                    const id = `naranja-${index}`;
                    if (historialMovimientos && historialMovimientos.includes(id)) {
                        const valor = valoresNaranja[index] || 0;
                        puntos += valor;
                    }
                });
            }
            
            return puntos;
        }
    },

    // ============================================================
    // ÁREA MORADO
    // Puntaje = suma de los números elegidos en cada casilla
    // ============================================================
    morado: {
        calcular: function() {
            let puntos = 0;
            
            // Obtener los valores guardados de area-morado.js
            if (typeof valoresMorado !== 'undefined' && valoresMorado && typeof MORADO_CONFIG !== 'undefined' && MORADO_CONFIG) {
                MORADO_CONFIG.forEach((celda, index) => {
                    const id = `morado-${index}`;
                    if (historialMovimientos && historialMovimientos.includes(id)) {
                        const valor = valoresMorado[index] || 0;
                        puntos += valor;
                    }
                });
            }
            
            return puntos;
        }
    },

    // ============================================================
    // ÁREA GRIS
    // Puntaje = número de habilidades usadas (suma triangular)
    // ============================================================
    gris: {
        calcular: function() {
            // Contar habilidades usadas (excluyendo turnos)
            const marcas = historialMovimientos ? historialMovimientos.filter(m => 
                m.startsWith('gris-') && !m.includes('turno')
            ).length : 0;
            
            let puntos = 0;
            if (marcas > 0) {
                puntos = marcas * (marcas + 1) / 2;
            }
            
            return puntos;
        }
    },

    // ============================================================
    // BONIFICACIONES GLOBALES
    // ============================================================
    bonificaciones: {
        calcular: function() {
            return puntosBonificacion || 0;
        }
    },

    // ============================================================
    // CALCULAR PUNTAJE TOTAL
    // ============================================================
    calcularTotal: function() {
        let total = 0;
        const areas = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
        
        // Asegurar que historialMovimientos existe
        if (typeof historialMovimientos === 'undefined') {
            console.warn('historialMovimientos no definido, creando array vacío');
            window.historialMovimientos = [];
        }
        
        areas.forEach(area => {
            if (this[area] && typeof this[area].calcular === 'function') {
                try {
                    const puntos = this[area].calcular();
                    // Actualizar el puntaje en el objeto global
                    if (typeof puntajesAreas !== 'undefined' && puntajesAreas) {
                        puntajesAreas[area] = puntos;
                    }
                    total += puntos;
                } catch(e) {
                    console.warn(`Error calculando área ${area}:`, e);
                }
            }
        });
        
        // Agregar bonificaciones
        const bonus = this.bonificaciones.calcular();
        total += bonus;
        
        // Actualizar UI - verificar que los elementos existan
        const totalElement = document.getElementById('score-total');
        const bonusElement = document.getElementById('bonus-display');
        if (totalElement) totalElement.textContent = total;
        if (bonusElement) bonusElement.textContent = bonus;
        
        // Actualizar puntajes individuales
        if (typeof puntajesAreas !== 'undefined' && puntajesAreas) {
            const areasList = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
            areasList.forEach(area => {
                const element = document.getElementById(`score-${area}`);
                if (element) {
                    element.textContent = puntajesAreas[area] || 0;
                }
            });
        }
        
        // Actualizar variable global
        if (typeof puntajeTotal !== 'undefined') {
            window.puntajeTotal = total;
        }
        
        return total;
    },

    // ============================================================
    // OBTENER PUNTAJE POR ÁREA (para leaderboard)
    // ============================================================
    obtenerPuntajesPorArea: function() {
        // Primero calcular para asegurar que los valores están actualizados
        const total = this.calcularTotal();
        
        // Devolver los valores de puntajesAreas (que ya fueron actualizados por calcularTotal)
        return {
            gris: (typeof puntajesAreas !== 'undefined' && puntajesAreas) ? puntajesAreas.gris || 0 : 0,
            amarilla: (typeof puntajesAreas !== 'undefined' && puntajesAreas) ? puntajesAreas.amarilla || 0 : 0,
            azul: (typeof puntajesAreas !== 'undefined' && puntajesAreas) ? puntajesAreas.azul || 0 : 0,
            verde: (typeof puntajesAreas !== 'undefined' && puntajesAreas) ? puntajesAreas.verde || 0 : 0,
            naranja: (typeof puntajesAreas !== 'undefined' && puntajesAreas) ? puntajesAreas.naranja || 0 : 0,
            morado: (typeof puntajesAreas !== 'undefined' && puntajesAreas) ? puntajesAreas.morado || 0 : 0,
            bonificacion: puntosBonificacion || 0,
            total: total  // <--- USAR EL TOTAL CALCULADO
        };
    }

};

// ============================================================
// EXPORTAR
// ============================================================

window.PUNTAJES = PUNTAJES;

console.log('📊 Sistema de puntuaciones cargado correctamente');