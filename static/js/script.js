const map = L.map('map').setView([-7.282163, 112.795003], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const locations = {
    "Hotel 1": [-7.290, 112.738],
    "Hotel 2": [-7.297, 112.734],
    "Hotel 3": [-7.284, 112.752],
    "Fakultas Teknik Industri": [-7.285163, 112.796003],
    "Fakultas Teknik Elektro": [-7.283163, 112.798003],
    "Fakultas Komputer": [-7.281163, 112.795803],
    "Fakultas Teknik Mesin": [-7.286163, 112.794003],
    "Fakultas Desain dan Seni": [-7.288163, 112.792003],
    "Apartement Educity Tower Y-P-H By Prafi": [-7.271413801548055, 112.80716829264938],
    "Frank's Hotel": [-7.260325462811474, 112.79558793780397],
    "OYO 90143 Gosepa Keputih Syariah": [-7.28922905937865, 112.80396784766772],
    "Oakwood Hotel & Residence Surabaya": [-7.279689109431955, 112.78112011087363],
};

// Menambahkan marker untuk setiap lokasi
Object.entries(locations).forEach(([name, coords]) => {
    const marker = L.marker(coords).addTo(map).bindPopup(name);
});

// Fungsi untuk membuat frame informasi
function createInfoFrame(content) {
    const frame = document.createElement('div');
    frame.style.border = '1px solid black';
    frame.style.padding = '10px';
    frame.style.margin = '10px';
    frame.style.backgroundColor = 'white';
    frame.style.position = 'absolute';
    frame.style.top = '10px';
    frame.style.right = '10px';
    frame.style.zIndex = '1000';
    frame.innerHTML = content;
    return frame;
}

// Tombol "Cari Rute" untuk menampilkan rute
document.getElementById('findRoute').addEventListener('click', function () {
    const start = document.getElementById('start').value;
    const goal = document.getElementById('goal').value;
    const vehicle = document.getElementById('vehicle').value;

    if (start && goal && vehicle) {
        fetch(`/calculate_route?start=${start}&goal=${goal}&vehicle=${vehicle}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.path) {
                    if (window.routingControl) {
                        map.removeControl(window.routingControl);
                    }

                    const waypoints = data.path.map(location => L.latLng(...locations[location]));
                    window.routingControl = L.Routing.control({
                        waypoints: waypoints,
                        routeWhileDragging: true
                    }).addTo(map);

                    // Hapus frame informasi lama jika ada
                    const oldFrame = document.getElementById('routeInfo');
                    if (oldFrame) {
                        oldFrame.remove();
                    }

                    // Buat frame baru untuk informasi rute
                    const content = `
                        <h4>Informasi Rute</h4>
                        <p><strong>Rute:</strong> ${data.path.join(' -> ')}</p>
                        <p><strong>Total Biaya:</strong> ${data.cost.toFixed(2)}</p>
                    `;
                    const infoFrame = createInfoFrame(content);
                    infoFrame.id = 'routeInfo';
                    document.body.appendChild(infoFrame);
                } else {
                    alert('Rute tidak ditemukan.');
                }
            })
            .catch(error => {
                console.error('Error fetching route:', error);
                alert('Terjadi kesalahan saat mencari rute.');
            });
    } else {
        alert('Pilih lokasi awal, tujuan, dan jenis kendaraan!');
    }
});
