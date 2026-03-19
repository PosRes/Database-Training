// _supabase and requireAuth() are provided by auth.js (loaded first)

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
    
    try {
        // Get the REAL total count from the database
        const { count: totalCount, error: countError } = await _supabase
            .from('clients')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // Fetch ALL rows (Supabase defaults to 1000 max per request)
        // We need to paginate if there are more than 1000
        let allData = [];
        const pageSize = 1000;
        let from = 0;
        let keepFetching = true;

        while (keepFetching) {
            const { data, error } = await _supabase
                .from('clients')
                .select('*')
                .order('nama_institusi', { ascending: true })
                .range(from, from + pageSize - 1);

            if (error) throw error;

            if (data && data.length > 0) {
                allData = allData.concat(data);
                from += pageSize;
            }
            
            // Stop when we get fewer rows than pageSize (last page)
            if (!data || data.length < pageSize) {
                keepFetching = false;
            }
        }

        allClients = allData;
        
        if (allClients.length === 0) {
            loader.innerHTML = `<p style="color: var(--text-muted); text-align: center; width: 100%;">No data found in Cloud. Please import data to Supabase.</p>`;
        } else {
            renderTable(allClients);
            updateStats(totalCount);
            loader.style.display = 'none';
        }
    } catch (err) {
        console.error('Fetch error:', err);
        loader.innerHTML = `
            <div style="text-align: center; color: #ef4444;">
                <p>Connection to Cloud Failed.</p>
                <p style="font-size: 0.8rem; margin-top: 8px; opacity: 0.7;">Check Supabase Policies or Table name.</p>
            </div>
        `;
    }
}

function renderTable(clients) {
    const fragment = document.createDocumentFragment();
    clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${client.nama_institusi || '-'}</strong></td>
            <td>${client.kota || '-'}</td>
            <td>${client.provinsi || '-'}</td>
            <td>
                ${client.categories_1 ? `<span class="badge badge-primary">${client.categories_1}</span>` : '-'}
                ${client.categories_2 ? `<span class="badge badge-secondary" style="margin-left:5px; opacity:0.8; font-size:0.8em; border:1px solid var(--glass-border); padding:2px 6px; border-radius:4px;">${client.categories_2}</span>` : ''}
            </td>
            <td>${client.cp || '-'} / ${client.no_telepon || '-'}</td>
            <td class="action-buttons">
                <a href="edit-client.html?id=${client.id}" class="btn-edit" title="Edit">✏️</a>
                <button class="btn-detail" onclick="showDetails(${client.id})">View</button>
            </td>
        `;
        fragment.appendChild(row);
    });
    clientTableBody.innerHTML = '';
    clientTableBody.appendChild(fragment);
}

function updateStats(totalCount) {
    // Use the real database count, not the JS array length
    totalCountEl.innerText = totalCount;
    const regions = new Set(allClients.map(c => c.provinsi).filter(Boolean)).size;
    activeRegionsEl.innerText = regions;
}

// Debounced search — waits 250ms after you stop typing before filtering
let searchTimer;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        const term = e.target.value.toLowerCase();
        if (!term) {
            renderTable(allClients);
            return;
        }
        const filtered = allClients.filter(c => 
            (c.nama_institusi && c.nama_institusi.toLowerCase().includes(term)) ||
            (c.kota && c.kota.toLowerCase().includes(term)) ||
            (c.provinsi && c.provinsi.toLowerCase().includes(term)) ||
            (c.categories_1 && c.categories_1.toLowerCase().includes(term)) ||
            (c.categories_2 && c.categories_2.toLowerCase().includes(term)) ||
            (c.cp && c.cp.toLowerCase().includes(term)) ||
            (c.no_telepon && c.no_telepon.toLowerCase().includes(term))
        );
        renderTable(filtered);
    }, 250);
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

// Initial load — require auth first
requireAuth().then(session => {
    if (session) fetchClients();
});
