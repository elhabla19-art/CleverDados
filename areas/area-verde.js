// ============================================================
// ÁREA VERDE
// ============================================================

function inicializarAreaVerde() {
    const container = document.getElementById('area-verde-content');
    
    const topRow = [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66];
    const bottomRow = ['≥1', '≥2', '≥3', '≥4', '≥5', '≥1', '≥2', '≥3', '≥4', '≥5', '≥6'];
    const bonusIndices = [3, 5, 6, 8, 9, 10]; // Índices con bonificación
    const bonusRow = ['+1', '❌', '🐺', '6', '🌀'];
    
    let html = `<div class="verde-grid">`;
    
    // Fila superior
    html += `<div class="verde-fila">`;
    topRow.forEach((val, col) => {
        html += `
            <div class="cell" data-area="verde" data-fila="top" data-col="${col}">
                ${val}
            </div>
        `;
    });
    html += `</div>`;
    
    // Fila inferior
    html += `<div class="verde-fila">`;
    bottomRow.forEach((val, col) => {
        const esBonus = bonusIndices.includes(col);
        const claseBonus = esBonus ? 'bonus-cell' : '';
        html += `
            <div class="cell ${claseBonus}" data-area="verde" data-fila="bottom" data-col="${col}">
                ${val}
            </div>
        `;
    });
    html += `</div>`;
    
    // Fila de bonificación
    html += `<div class="verde-bonus">`;
    bonusRow.forEach(val => {
        html += `<span>${val}</span>`;
    });
    html += `</div>`;
    
    html += `</div>`;
    container.innerHTML = html;
}

function puedeMarcarVerde(fila, col) {
    const colNum = parseInt(col);
    
    if (fila === 'top') {
        // Fila superior: se marcan en orden creciente
        if (colNum > 0) {
            const anterior = `verde-top-${colNum - 1}`;
            if (!historialMovimientos.includes(anterior)) {
                return false;
            }
        }
        return true;
    }
    
    if (fila === 'bottom') {
        // Fila inferior: condiciones ≥, se pueden marcar según dados
        return true;
    }
    
    return true;
}