// ============================================================
// ÁREA MORADO
// ============================================================

function inicializarAreaMorado() {
    const container = document.getElementById('area-morado-content');
    
    const fila = ['', '', '🌀', '❌', '+1', '❌', '🐺', '🌀', '❌', '6', '+1'];
    const bonusIndices = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    let html = `<div class="morado-grid">`;
    html += `<div class="morado-fila">`;
    
    fila.forEach((val, col) => {
        const esBonus = bonusIndices.includes(col);
        const esPreMarcada = val === '❌';
        const claseBonus = esBonus ? 'bonus-cell' : '';
        const clasePre = esPreMarcada ? 'pre-marcada' : '';
        html += `
            <div class="cell ${claseBonus} ${clasePre}" 
                 data-area="morado" 
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

function puedeMarcarMorado(fila, col) {
    // Área morado: se puede marcar cualquier celda disponible
    const cell = document.querySelector(`[data-area="morado"][data-fila="0"][data-col="${col}"]`);
    if (cell && cell.textContent.trim() === '❌') return false;
    return true;
}