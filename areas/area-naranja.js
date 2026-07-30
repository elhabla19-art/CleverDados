// ============================================================
// ÁREA NARANJA
// ============================================================

function inicializarAreaNaranja() {
    const container = document.getElementById('area-naranja-content');
    
    const fila = ['', '', '🌀', '×2', '❌', '+1', '×2', '🐺', '×2', '6', '×3'];
    const bonusIndices = [2, 4, 5, 7, 9];
    
    let html = `<div class="naranja-grid">`;
    html += `<div class="naranja-fila">`;
    
    fila.forEach((val, col) => {
        const esBonus = bonusIndices.includes(col);
        const esPreMarcada = val === '❌';
        const claseBonus = esBonus ? 'bonus-cell' : '';
        const clasePre = esPreMarcada ? 'pre-marcada' : '';
        html += `
            <div class="cell ${claseBonus} ${clasePre}" 
                 data-area="naranja" 
                 data-fila="0" 
                 data-col="${col}">
                ${val}
            </div>
        `;
    });
    
    html += `</div>`;
    html += `</div>`;
    container.innerHTML = html;
}

function puedeMarcarNaranja(fila, col) {
    // Área naranja: se puede marcar cualquier celda disponible
    const cell = document.querySelector(`[data-area="naranja"][data-fila="0"][data-col="${col}"]`);
    if (cell && cell.textContent.trim() === '❌') return false;
    return true;
}