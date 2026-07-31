// ============================================================
// MODAL NUMÉRICO - CLEVERDADOS
// ============================================================

/**
 * Muestra un modal para seleccionar un número del 1 al 6
 * @param {Function} callback - Función que se ejecuta al seleccionar un número (recibe el número)
 * @param {string} titulo - Título del modal (opcional)
 * @param {string} subtitulo - Subtítulo del modal (opcional)
 */
function mostrarModalNumerico(callback, titulo = 'Selecciona un número', subtitulo = 'Elige del 1 al 6') {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-numerico-overlay';
    overlay.id = 'modalNumericoOverlay';
    
    // Crear contenido del modal
    overlay.innerHTML = `
        <div class="modal-numerico-box">
            <h2>${titulo}</h2>
            <p>${subtitulo}</p>
            <div class="modal-numerico-grid">
                <button class="modal-numerico-btn" data-numero="1">1</button>
                <button class="modal-numerico-btn" data-numero="2">2</button>
                <button class="modal-numerico-btn" data-numero="3">3</button>
                <button class="modal-numerico-btn" data-numero="4">4</button>
                <button class="modal-numerico-btn" data-numero="5">5</button>
                <button class="modal-numerico-btn" data-numero="6">6</button>
            </div>
            <button class="modal-numerico-cancelar" onclick="cerrarModalNumerico()">Cancelar</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Event listeners para los botones numéricos
    overlay.querySelectorAll('.modal-numerico-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const numero = parseInt(this.dataset.numero);
            cerrarModalNumerico();
            if (typeof callback === 'function') {
                callback(numero);
            }
        });
    });
}

/**
 * Cierra el modal numérico
 */
function cerrarModalNumerico() {
    const overlay = document.getElementById('modalNumericoOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// ============================================================
// EXPORTAR
// ============================================================

window.mostrarModalNumerico = mostrarModalNumerico;
window.cerrarModalNumerico = cerrarModalNumerico;