// ============================================================
// ÁREA AZUL
// ============================================================

function inicializarAreaAzul() {
    const container = document.getElementById('area-azul-content');
    
    const topRow = [1, 2, 4, 7, 11, 16, 22, 29, 37, 46, 56];
    const midRow = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const bottomRows = [
        ['', '2', '3', '4', '5'],
        ['5', '6', '7', '8', '❌'],
        ['9', '10', '11', '12', '🐺']
    ];
    const bonusRow = ['🌀', '❌', '6', '+1'];
    
    let html = `<div class="azul-grid">`;
    
    // Fila superior
    html += `<div class="azul-fila">`;
    topRow.forEach((val, col) => {
        html += `
            <div class="cell" data-area="azul" data-fila="top" data-col="${col}">
                ${val}
            </div>
        `;
    });
    html += `</div>`;
    
    // Fila media
    html += `<div class="azul-fila">`;
    midRow.forEach((val, col) => {
        html += `
            <div class="cell" data-area="azul" data-fila="mid" data-col="${col}">
                ${val}
            </div>
        `;
    });
    html += `</div>`;
    
    // Filas inferiores
    bottomRows.forEach((fila, idx) => {
        html += `<div class="azul-fila-inferior">`;
        fila.forEach((val, col) => {
            const esBonus = col === 4 && val !== '';
            const esPreMarcada = val === '❌';
            const claseBonus = esBonus ? 'bonus-cell' : '';
            const clasePre = esPreMarcada ? 'pre-marcada' : '';
            const nombreFila = idx === 0 ? 'bottom' : idx === 1 ? 'bottom2' : 'bottom3';
            html += `
                <div class="cell ${claseBonus} ${clasePre}" 
                     data-area="azul" 
                     data-fila="${nombreFila}" 
                     data-col="${col}">
                    ${val}
                </div>
            `;
        });
        html += `</div>`;
    });
    
    // Fila de bonificación
    html += `<div class="azul-bonus">`;
    bonusRow.forEach(val => {
        html += `<span>${val}</span>`;
    });
    html += `</div>`;
    
    html += `</div>`;
    container.innerHTML = html;
}

function puedeMarcarAzul(fila, col) {
    const colNum = parseInt(col);
    
    if (fila === 'top') {
        // Fila superior: se deben marcar en orden creciente
        if (colNum > 0) {
            const anterior = `azul-top-${colNum - 1}`;
            if (!historialMovimientos.includes(anterior)) {
                return false;
            }
        }
        return true;
    }
    
    if (fila === 'mid') {
        // Fila media: se pueden marcar en cualquier orden
        return true;
    }
    
    if (fila === 'bottom' || fila === 'bottom2' || fila === 'bottom3') {
        // Filas inferiores: reglas específicas
        return true;
    }
    
    return true;
}