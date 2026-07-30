// ============================================================
// ÁREA AMARILLA
// ============================================================

function inicializarAreaAmarilla() {
    const container = document.getElementById('area-amarilla-content');
    
    const filas = [
        ['3', '6', '5', '❌', '❌'],
        ['2', '1', '❌', '5', '4'],
        ['1', '❌', '2', '4', '❌'],
        ['❌', '3', '4', '6', '🐺']
    ];
    
    let html = `<div class="amarilla-grid">`;
    
    filas.forEach((fila, idx) => {
        html += `<div class="amarilla-fila">`;
        fila.forEach((valor, col) => {
            const esBonus = col === 4;
            const esPreMarcada = valor === '❌';
            const claseBonus = esBonus ? 'bonus-cell' : '';
            const clasePre = esPreMarcada ? 'pre-marcada' : '';
            html += `
                <div class="cell ${claseBonus} ${clasePre}" 
                     data-area="amarilla" 
                     data-fila="${idx}" 
                     data-col="${col}">
                    ${valor}
                </div>
            `;
        });
        html += `</div>`;
    });
    
    // Fila de bonificación
    html += `
        <div class="amarilla-bonus">
            <span>10</span>
            <span>14</span>
            <span>16</span>
            <span>20</span>
            <span>+1</span>
        </div>
    `;
    
    html += `</div>`;
    container.innerHTML = html;
}

function puedeMarcarAmarilla(fila, col) {
    const colNum = parseInt(col);
    
    // Si es celda de bonificación (col 4)
    if (colNum === 4) {
        // Solo se puede marcar si toda la fila está completa
        const filaCells = document.querySelectorAll(`[data-area="amarilla"][data-fila="${fila}"]`);
        let marcadas = 0;
        filaCells.forEach(c => {
            if (c.classList.contains('marcada') || c.classList.contains('pre-marcada')) {
                marcadas++;
            }
        });
        return marcadas >= 4;
    }
    
    // Si es una X, no se puede marcar
    const cell = document.querySelector(`[data-area="amarilla"][data-fila="${fila}"][data-col="${col}"]`);
    if (cell && cell.textContent.trim() === '❌') return false;
    
    // Verificar si ya hay una X en la fila
    const filaCells = document.querySelectorAll(`[data-area="amarilla"][data-fila="${fila}"]`);
    let tieneX = false;
    filaCells.forEach(c => {
        if (c.textContent.trim() === '❌' && 
            (c.classList.contains('marcada') || c.classList.contains('pre-marcada'))) {
            tieneX = true;
        }
    });
    if (tieneX) return false;
    
    return true;
}