// ============================================================
// KONFIGURASI MQTT (harus SAMA PERSIS dengan konfigurasi di main.py ESP32)
// ============================================================
// Broker publik gratis (HiveMQ). Browser WAJIB pakai WSS (bukan WS biasa)
// karena GitHub Pages di-serve lewat HTTPS -> mixed content akan diblokir
// kalau memakai ws:// biasa.
const MQTT_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';

// GANTI string ini menjadi sesuatu yang unik milik Anda (misal nama alat,
// lokasi, atau kode acak). Karena broker ini publik & dipakai banyak orang,
// topic generik seperti "plts/sensor/data" berisiko bentrok / bisa dibaca
// orang lain. Pastikan DEVICE_ID di sini SAMA dengan DEVICE_ID di main.py.
const DEVICE_ID = 'device01';
const MQTT_TOPIC = `plts_monitoring/${DEVICE_ID}/data`;

// Referensi DOM elemen
const els = {
    status: document.getElementById('connection-status'),
    time: document.getElementById('sys-time'),
    
    acV: document.getElementById('ac-v'),
    acI: document.getElementById('ac-i'),
    acP: document.getElementById('ac-p'),
    acE: document.getElementById('ac-e'),
    acF: document.getElementById('ac-f'),
    acPF: document.getElementById('ac-pf'),
    
    dc1V: document.getElementById('dc1-v'),
    dc1I: document.getElementById('dc1-i'),
    dc1P: document.getElementById('dc1-p'),
    
    dc2V: document.getElementById('dc2-v'),
    dc2I: document.getElementById('dc2-i'),
    dc2P: document.getElementById('dc2-p'),
    
    dc3V: document.getElementById('dc3-v'),
    dc3I: document.getElementById('dc3-i'),
    dc3P: document.getElementById('dc3-p'),
    
    logList: document.getElementById('log-list')
};

const formatNum = (num) => Number(num).toFixed(2);

// Membuat koneksi MQTT over WebSocket (memerlukan library mqtt.js yang
// sudah dimuat lebih dulu di index.html)
const client = mqtt.connect(MQTT_BROKER_URL, {
    clientId: 'plts_web_' + Math.random().toString(16).slice(2, 10),
    clean: true,
    connectTimeout: 5000,
    reconnectPeriod: 3000,
    protocolVersion: 4
});

// Saat koneksi MQTT berhasil dibuka
client.on('connect', () => {
    els.status.textContent = 'Terhubung (MQTT Real-time)';
    els.status.className = 'status connected';

    client.subscribe(MQTT_TOPIC, { qos: 0 }, (err) => {
        if (err) {
            console.error('Gagal subscribe topic MQTT:', err);
        }
    });
});

// Saat sedang mencoba menyambung ulang
client.on('reconnect', () => {
    els.status.textContent = 'Menghubungkan ulang...';
    els.status.className = 'status disconnected';
});

// Saat koneksi MQTT terputus / gagal
client.on('close', () => {
    els.status.textContent = 'Terputus (Coba Refresh)';
    els.status.className = 'status disconnected';
});

client.on('error', (err) => {
    console.error('MQTT error:', err);
});

// Saat data instan masuk dari ESP32 lewat broker MQTT
client.on('message', (topic, messagePayload) => {
    try {
        const data = JSON.parse(messagePayload.toString());

        els.time.textContent = data.time || '00:00:00';

        // Update AC
        els.acV.textContent = formatNum(data.ac.v);
        els.acI.textContent = formatNum(data.ac.i);
        els.acP.textContent = formatNum(data.ac.p);
        els.acE.textContent = formatNum(data.ac.energy);
        els.acF.textContent = formatNum(data.ac.freq);
        els.acPF.textContent = formatNum(data.ac.pf);

        // Update DC1
        els.dc1V.textContent = formatNum(data.dc1_ina226.v);
        els.dc1I.textContent = formatNum(data.dc1_ina226.i);
        els.dc1P.textContent = formatNum(data.dc1_ina226.p);

        // Update DC2
        els.dc2V.textContent = formatNum(data.dc2_ina226.v);
        els.dc2I.textContent = formatNum(data.dc2_ina226.i);
        els.dc2P.textContent = formatNum(data.dc2_ina226.p);

        // Update DC3
        els.dc3V.textContent = formatNum(data.dc3_ina238.v);
        els.dc3I.textContent = formatNum(data.dc3_ina238.i);
        els.dc3P.textContent = formatNum(data.dc3_ina238.p);

        // Update Logs
        renderLogs(data.logs);

    } catch (error) {
        console.error('Gagal membaca data MQTT:', error);
    }
});

function renderLogs(logsArray) {
    if (!logsArray || logsArray.length === 0) return;
    
    els.logList.innerHTML = '';
    logsArray.forEach(logText => {
        const li = document.createElement('li');
        li.textContent = logText;
        if (logText.includes("BAHAYA") || logText.includes("Peringatan")) {
            li.style.color = "#ff7b72";
        }
        els.logList.appendChild(li);
    });
}