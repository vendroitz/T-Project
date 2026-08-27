// Membuka koneksi WebSocket ke alamat IP ESP32
const ws = new WebSocket(`ws://${window.location.host}/ws`);

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

// Saat koneksi WebSocket berhasil dibuka
ws.onopen = () => {
    els.status.textContent = 'Terhubung (Real-time)';
    els.status.className = 'status connected';
};

// Saat data instan masuk dari ESP32
ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        
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
        console.error('Gagal membaca data:', error);
    }
};

// Saat koneksi WebSocket terputus
ws.onclose = () => {
    els.status.textContent = 'Terputus (Coba Refresh)';
    els.status.className = 'status disconnected';
};

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