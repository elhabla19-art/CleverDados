// ============================================================
// MULTIJUGADOR.JS - CORREGIDO (CON MODO AUTOMÁTICO)
// ============================================================

// ===== DETECTAR MODO AUTOMATICO =====
const urlParams = new URLSearchParams(window.location.search);
const isAutoMode = urlParams.get('auto') === '1';
const AUTO_ROOM_CODE = 'GRIL';

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
    // Limpiar el campo de código
    const roomCodeInput = document.getElementById('roomCodeInput');
    if (roomCodeInput) {
        roomCodeInput.value = '';
        roomCodeInput.placeholder = 'ABCD';
        roomCodeInput.readOnly = false;
        roomCodeInput.style.opacity = '1';
        roomCodeInput.style.color = 'white';
    }
    
    // Si estamos en modo automatico, precargar el codigo
    if (isAutoMode) {
        const roomInput = document.getElementById('roomCodeInput');
        if (roomInput) {
            roomInput.value = AUTO_ROOM_CODE;
            roomInput.readOnly = true;
            roomInput.style.opacity = '0.7';
            roomInput.style.color = '#4CAF50';
        }
    }
    
    document.getElementById('lobbyModal').style.display = 'none';
    document.getElementById('joinModal').style.display = 'flex';
}

function volverLobby() {
    // Limpiar el campo al volver
    const roomCodeInput = document.getElementById('roomCodeInput');
    if (roomCodeInput) {
        roomCodeInput.value = '';
        roomCodeInput.placeholder = 'ABCD';
        roomCodeInput.readOnly = false;
        roomCodeInput.style.opacity = '1';
        roomCodeInput.style.color = 'white';
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
    let codigo;
    
    if (isAutoMode) {
        codigo = AUTO_ROOM_CODE;
    } else {
        codigo = document.getElementById('roomCodeInput').value.trim().toUpperCase();
        if (codigo.length !== 4) {
            alert("El código debe tener 4 letras/números.");
            return;
        }
    }
    
    // Limpiar después de usar
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
            
            // Actualizar datos del jugador
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
// ACTUALIZAR DATOS PROPIOS (CON LOBOS INCLUIDOS)
// ============================================================

function actualizarDatosPropios() {
    // Obtener puntajes por área (incluye lobos en el total)
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
            lobos: (typeof lobos !== 'undefined' && lobos) ? lobos.totalPuntos || 0 : 0,
            total: puntajeTotal || 0
        };
    }
    
    datosJugadores[miId] = { 
        nombre: miNombre, 
        puntaje: puntajesPorArea.total || 0,
        movimientos: [...historialMovimientos],
        valoresNaranja: typeof valoresNaranja !== 'undefined' ? [...valoresNaranja] : null,
        valoresMorado: typeof valoresMorado !== 'undefined' ? [...valoresMorado] : null,
        puntajesPorArea: puntajesPorArea
    };
}

// ============================================================
// BROADCAST - CORREGIDO (CON LOBOS INCLUIDOS)
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
        // Calcular manual incluyendo lobos
        let total = 0;
        const areas = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
        areas.forEach(area => {
            total += puntajesAreas[area] || 0;
        });
        total += puntosBonificacion || 0;
        if (typeof lobos !== 'undefined' && lobos) {
            total += lobos.totalPuntos || 0;
        }
        miPuntajeTotal = total;
        
        puntajesPorArea = {
            gris: puntajesAreas.gris || 0,
            amarilla: puntajesAreas.amarilla || 0,
            azul: puntajesAreas.azul || 0,
            verde: puntajesAreas.verde || 0,
            naranja: puntajesAreas.naranja || 0,
            morado: puntajesAreas.morado || 0,
            bonificacion: puntosBonificacion || 0,
            lobos: (typeof lobos !== 'undefined' && lobos) ? lobos.totalPuntos || 0 : 0,
            total: miPuntajeTotal
        };
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
            puntaje: miPuntajeTotal,
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
window.isAutoMode = isAutoMode;
window.AUTO_ROOM_CODE = AUTO_ROOM_CODE;
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