// ============================================================
// MULTIJUGADOR.JS - CORREGIDO
// ============================================================

let clienteMQTT = null;
let miId = Math.random().toString(36).substr(2, 9);
let salaActual = null;
let datosJugadores = {};
let miNombre = "Jugador";

// ============================================================
// FUNCIONES DE LOBBY
// ============================================================

function obtenerNombre() {
    let nombre = document.getElementById('playerName').value.trim();
    return nombre || "Jugador " + Math.floor(Math.random() * 100);
}

function mostrarUnirse() {
    // LIMPIAR EL CAMPO DE CÓDIGO CADA VEZ QUE SE ABRE
    const roomCodeInput = document.getElementById('roomCodeInput');
    if (roomCodeInput) {
        roomCodeInput.value = '';
        roomCodeInput.placeholder = 'ABCD';
    }
    
    document.getElementById('lobbyModal').style.display = 'none';
    document.getElementById('joinModal').style.display = 'flex';
}

function volverLobby() {
    // LIMPIAR EL CAMPO AL VOLVER
    const roomCodeInput = document.getElementById('roomCodeInput');
    if (roomCodeInput) {
        roomCodeInput.value = '';
        roomCodeInput.placeholder = 'ABCD';
    }
    
    document.getElementById('joinModal').style.display = 'none';
    document.getElementById('lobbyModal').style.display = 'flex';
}

function crearSala() {
    miNombre = obtenerNombre();
    const codigo = Math.random().toString(36).substring(2, 6).toUpperCase();
    conectarSala(codigo);
}

function unirseSala() {
    miNombre = obtenerNombre();
    const codigo = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    if (codigo.length !== 4) {
        alert("El código debe tener 4 letras/números.");
        return;
    }
    
    // LIMPIAR DESPUÉS DE USAR
    document.getElementById('roomCodeInput').value = '';
    
    conectarSala(codigo);
}

// ============================================================
// CONEXIÓN MQTT
// ============================================================

function conectarSala(codigo) {
    mostrarCargando("Conectando con la sala...");
    
    clienteMQTT = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    clienteMQTT.on('connect', () => {
        salaActual = codigo;
        const topic = `cleverdados_app/room/${codigo}`;
        clienteMQTT.subscribe(topic);
        
        // Inicializar datos del jugador con todos los valores necesarios
        actualizarDatosPropios();
        
        unirseExitoso(codigo);
        broadcastPuntaje('join');
    });

    clienteMQTT.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            
            // NO ignoramos el mensaje propio, lo procesamos para actualizar el leaderboard
            // pero solo si es un mensaje de sincronización o si es de otro jugador
            
            // Actualizar datos del jugador (incluso si es propio, para mantener consistencia)
            datosJugadores[data.id] = { 
                nombre: data.nombre, 
                puntaje: data.puntaje,
                movimientos: data.movimientos || [],
                valoresNaranja: data.valoresNaranja || null,
                valoresMorado: data.valoresMorado || null,
                puntajesPorArea: data.puntajesPorArea || null
            };
            
            // Renderizar leaderboard con los datos actualizados
            if (typeof renderizarLeaderboard === 'function') {
                renderizarLeaderboard();
            }

            if (data.accion === 'join') {
                broadcastPuntaje('sync');
            }
        } catch(e) {
            console.error("Mensaje inválido", e);
        }
    });

    clienteMQTT.on('error', (err) => {
        ocultarCargando();
        alert("Error de red. Revisa tu internet.");
    });
}

// ============================================================
// ACTUALIZAR DATOS PROPIOS
// ============================================================

function actualizarDatosPropios() {
    // Obtener puntajes por área
    let puntajesPorArea = null;
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        puntajesPorArea = PUNTAJES.obtenerPuntajesPorArea();
    } else {
        puntajesPorArea = {
            gris: typeof puntajesAreas !== 'undefined' ? puntajesAreas.gris || 0 : 0,
            amarilla: typeof puntajesAreas !== 'undefined' ? puntajesAreas.amarilla || 0 : 0,
            azul: typeof puntajesAreas !== 'undefined' ? puntajesAreas.azul || 0 : 0,
            verde: typeof puntajesAreas !== 'undefined' ? puntajesAreas.verde || 0 : 0,
            naranja: typeof puntajesAreas !== 'undefined' ? puntajesAreas.naranja || 0 : 0,
            morado: typeof puntajesAreas !== 'undefined' ? puntajesAreas.morado || 0 : 0,
            bonificacion: puntosBonificacion || 0,
            total: puntajeTotal || 0
        };
    }
    
    datosJugadores[miId] = { 
        nombre: miNombre, 
        puntaje: puntajeTotal || 0, 
        movimientos: [...historialMovimientos],
        valoresNaranja: typeof valoresNaranja !== 'undefined' ? [...valoresNaranja] : null,
        valoresMorado: typeof valoresMorado !== 'undefined' ? [...valoresMorado] : null,
        puntajesPorArea: puntajesPorArea
    };
}

// ============================================================
// BROADCAST - CORREGIDO
// ============================================================

function broadcastPuntaje(accion = 'sync') {
    // Primero actualizar datos propios
    actualizarDatosPropios();
    
    // Obtener puntajes por área SIEMPRE actualizados
    let puntajesPorArea = null;
    let miPuntajeTotal = 0;
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        puntajesPorArea = PUNTAJES.obtenerPuntajesPorArea();
        miPuntajeTotal = puntajesPorArea.total || 0;
    } else {
        puntajesPorArea = {
            gris: typeof puntajesAreas !== 'undefined' ? puntajesAreas.gris || 0 : 0,
            amarilla: typeof puntajesAreas !== 'undefined' ? puntajesAreas.amarilla || 0 : 0,
            azul: typeof puntajesAreas !== 'undefined' ? puntajesAreas.azul || 0 : 0,
            verde: typeof puntajesAreas !== 'undefined' ? puntajesAreas.verde || 0 : 0,
            naranja: typeof puntajesAreas !== 'undefined' ? puntajesAreas.naranja || 0 : 0,
            morado: typeof puntajesAreas !== 'undefined' ? puntajesAreas.morado || 0 : 0,
            bonificacion: puntosBonificacion || 0,
            total: puntajeTotal || 0
        };
        miPuntajeTotal = puntajeTotal || 0;
    }
    
    // Actualizar el puntaje total global
    if (typeof puntajeTotal !== 'undefined') {
        window.puntajeTotal = miPuntajeTotal;
    }
    
    // Actualizar datos del jugador en memoria local
    datosJugadores[miId] = { 
        nombre: miNombre, 
        puntaje: miPuntajeTotal,
        movimientos: [...historialMovimientos],
        valoresNaranja: typeof valoresNaranja !== 'undefined' ? [...valoresNaranja] : null,
        valoresMorado: typeof valoresMorado !== 'undefined' ? [...valoresMorado] : null,
        puntajesPorArea: puntajesPorArea
    };
    
    if (clienteMQTT && salaActual) {
        const topic = `cleverdados_app/room/${salaActual}`;
        
        const payload = JSON.stringify({
            accion: accion,
            id: miId,
            nombre: miNombre,
            puntaje: miPuntajeTotal,  // <--- USAR EL TOTAL CALCULADO
            movimientos: [...historialMovimientos],
            valoresNaranja: typeof valoresNaranja !== 'undefined' ? [...valoresNaranja] : null,
            valoresMorado: typeof valoresMorado !== 'undefined' ? [...valoresMorado] : null,
            puntajesPorArea: puntajesPorArea
        });
        clienteMQTT.publish(topic, payload);
    }
    
    // Siempre renderizar el leaderboard localmente
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
}

// ============================================================
// UI DE SALA
// ============================================================

function unirseExitoso(codigo) {
    ocultarCargando();
    document.getElementById('lobbyModal').style.display = 'none';
    document.getElementById('joinModal').style.display = 'none';
    
    const info = document.getElementById('roomInfoDisplay');
    info.style.display = 'inline-block';
    info.textContent = `SALA: ${codigo}`;
    
    // Mostrar el leaderboard
    const leaderboardPanel = document.getElementById('leaderboardPanel');
    if (leaderboardPanel) {
        leaderboardPanel.style.display = 'flex';
    }
    
    // Renderizar leaderboard
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
}

// ============================================================
// UTILIDADES
// ============================================================

function mostrarCargando(texto) {
    const loadingText = document.getElementById('loadingText');
    const loadingModal = document.getElementById('loadingModal');
    if (loadingText) loadingText.textContent = texto;
    if (loadingModal) loadingModal.style.display = 'flex';
}

function ocultarCargando() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) loadingModal.style.display = 'none';
}

// ============================================================
// EXPORTAR
// ============================================================

window.clienteMQTT = clienteMQTT;
window.miId = miId;
window.salaActual = salaActual;
window.datosJugadores = datosJugadores;
window.miNombre = miNombre;
window.obtenerNombre = obtenerNombre;
window.mostrarUnirse = mostrarUnirse;
window.volverLobby = volverLobby;
window.crearSala = crearSala;
window.unirseSala = unirseSala;
window.conectarSala = conectarSala;
window.unirseExitoso = unirseExitoso;
window.mostrarCargando = mostrarCargando;
window.ocultarCargando = ocultarCargando;
window.broadcastPuntaje = broadcastPuntaje;
window.actualizarDatosPropios = actualizarDatosPropios;