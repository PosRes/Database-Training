const SUPABASE_URL = 'https://sjbunfizoblfqyepnepw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYnVuZml6b2JsZnF5ZXBuZXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NTk0MDQsImV4cCI6MjA4OTIzNTQwNH0.8cFfp4F-oVlB5nq2BHI0Q3lI4F-IwwBbUeS1xcRoexA';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const clientTableBody = document.getElementById('clientTableBody');
const searchInput = document.getElementById('searchInput');
const loader = document.getElementById('loader');
const totalCountEl = document.getElementById('totalCount');
const activeRegionsEl = document.getElementById('activeRegions');

// Modal Elements
const modal = document.getElementById('detailModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.querySelector('.close-button');

let allClients = [];

async function fetchClients() {
    loader.style.display = 'flex';
    clientTableBody.innerHTML = '';
    
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('nama_institusi', { ascending: true });

    if (error) {
        console.error('Error fetching clients:', error);
        loader.innerHTML = `<p style="color: #ef4444">Error loading data. Check Supabase connection.</p>`;
        return;
    }

    allClients = data;
    renderTable(allClients);
    updateStats(allClients);
    loader.style.display = 'none';
}

function renderTable(clients) {
    clientTableBody.innerHTML = '';
    clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${client.nama_institusi || '-'}</strong></td>
            <td>${client.kota || '-'}</td>
            <td>${client.provinsi || '-'}</td>
            <td><span class="badge">${client.categories_1 || '-'}</span></td>
            <td>${client.cp || '-'} / ${client.no_telepon || '-'}</td>
            <td><button class="btn-detail" onclick="showDetails(${client.id})">View</button></td>
        `;
        clientTableBody.appendChild(row);
    });
}

function updateStats(clients) {
    totalCountEl.innerText = clients.length;
    const regions = new Set(clients.map(c => c.provinsi)).size;
    activeRegionsEl.innerText = regions;
}

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allClients.filter(c => 
        (c.nama_institusi && c.nama_institusi.toLowerCase().includes(term)) ||
        (c.kota && c.kota.toLowerCase().includes(term)) ||
        (c.categories_1 && c.categories_1.toLowerCase().includes(term)) ||
        (c.categories_2 && c.categories_2.toLowerCase().includes(term))
    );
    renderTable(filtered);
});

window.showDetails = (id) => {
    const client = allClients.find(c => c.id === id);
    if (!client) return;

    modalTitle.innerText = client.nama_institusi;
    modalBody.innerHTML = `
        <div class="detail-item"><label>Address</label><p>${client.alamat || '-'}</p></div>
        <div class="detail-item"><label>City / Prov</label><p>${client.kota || '-'}, ${client.provinsi || '-'}</p></div>
        <div class="detail-item"><label>Contact Person</label><p>${client.cp || '-'}</p></div>
        <div class="detail-item"><label>Phone</label><p>${client.no_telepon || '-'}</p></div>
        <div class="detail-item"><label>Email</label><p>${client.e_mail || '-'}</p></div>
        <div class="detail-item"><label>Categories</label><p>${client.categories_1 || '-'}, ${client.categories_2 || '-'}</p></div>
    `;
    modal.style.display = 'block';
};

closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (event) => { if (event.target === modal) modal.style.display = 'none'; };

// Initial load
fetchClients();
