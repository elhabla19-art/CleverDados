// ============================================================
// MULTIJUGADOR - CLEVERDADOS
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
    document.getElementById('lobbyModal').style.display = 'none';
    document.getElementById('joinModal').style.display = 'flex';
}

function volverLobby() {
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
        
        datosJugadores[miId] = { 
            nombre: miNombre, 
            puntaje: puntajeTotal, 
            movimientos: [...historialMovimientos]
        };
        
        unirseExitoso(codigo);
        broadcastPuntaje('join');
    });

    clienteMQTT.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.id === miId) return;

            datosJugadores[data.id] = { 
                nombre: data.nombre, 
                puntaje: data.puntaje,
                movimientos: data.movimientos || []
            };
            renderizarTablaPosiciones();

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
// BROADCAST
// ============================================================

function broadcastPuntaje(accion = 'sync') {
    if (clienteMQTT && salaActual) {
        const topic = `cleverdados_app/room/${salaActual}`;
        const payload = JSON.stringify({
            accion: accion,
            id: miId,
            nombre: miNombre,
            puntaje: puntajeTotal,
            movimientos: [...historialMovimientos]
        });
        clienteMQTT.publish(topic, payload);
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
    
    document.getElementById('leaderboardPanel').style.display = 'flex';
    renderizarTablaPosiciones();
}

function renderizarTablaPosiciones() {
    const list = document.getElementById('playersList');
    list.innerHTML = '';
    
    const jugadores = Object.keys(datosJugadores).map(id => ({
        id: id,
        ...datosJugadores[id]
    })).sort((a, b) => b.puntaje - a.puntaje);

    jugadores.forEach(j => {
        const soyYo = j.id === miId;
        const card = document.createElement('div');
        card.className = `player-card ${soyYo ? 'me' : ''}`;
        
        const movimientos = j.movimientos || [];
        const totalMarcas = movimientos.filter(m => !m.startsWith('penalty-')).length;
        
        card.innerHTML = `
            <div class="player-card-header">
                <span>${j.nombre}${soyYo ? ' (Tú)' : ''}</span>
                <span>${j.puntaje} pts</span>
            </div>
            <div class="player-stats">
                <span>Marcas: ${totalMarcas}</span>
            </div>
        `;
        
        list.appendChild(card);
    });
}

// ============================================================
// UTILIDADES
// ============================================================

function mostrarCargando(texto) {
    document.getElementById('loadingText').textContent = texto;
    document.getElementById('loadingModal').style.display = 'flex';
}

function ocultarCargando() {
    document.getElementById('loadingModal').style.display = 'none';
}