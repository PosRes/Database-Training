const SUPABASE_URL = 'https://sjbunfizoblfqyepnepw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYnVuZml6b2JsZnF5ZXBuZXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NTk0MDQsImV4cCI6MjA4OTIzNTQwNH0.8cFfp4F-oVlB5nq2BHI0Q3lI4F-IwwBbUeS1xcRoexA';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('editClientForm');
const submitBtn = document.getElementById('submitBtn');
const subtitle = document.getElementById('editSubtitle');

// Get client ID from URL
const urlParams = new URLSearchParams(window.location.search);
const clientId = parseInt(urlParams.get('id'));

const fields = [
    'nama_institusi', 'kota', 'provinsi', 'cp',
    'no_telepon', 'e_mail', 'alamat', 'categories_1', 'categories_2'
];

// Load existing data into the form
async function loadClient() {
    if (!clientId) {
        subtitle.innerText = 'Error: No client ID provided.';
        return;
    }

    try {
        const { data, error } = await _supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single();

        if (error) throw error;

        subtitle.innerText = `Editing: ${data.nama_institusi || 'Unknown'}`;

        // Pre-fill all form fields
        fields.forEach(field => {
            const el = document.getElementById('f_' + field);
            if (el && data[field]) {
                el.value = data[field];
            }
        });
    } catch (err) {
        console.error('Load error:', err);
        subtitle.innerText = 'Error loading client data.';
    }
}

// Save changes
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.innerText = 'Saving...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const clientData = Object.fromEntries(formData.entries());

    // Format phone number to +62
    if (clientData.no_telepon) {
        let phone = clientData.no_telepon.replace(/\D/g, '');
        if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
        } else if (phone.startsWith('8')) {
            phone = '62' + phone;
        } else if (!phone.startsWith('62')) {
            phone = '62' + phone;
        }
        clientData.no_telepon = '+' + phone;
    }

    try {
        const { error } = await _supabase
            .from('clients')
            .update(clientData)
            .eq('id', clientId);

        if (error) throw error;

        alert('✅ Client updated successfully!');
        window.location.href = 'index.html';
    } catch (err) {
        console.error('Update error:', err);
        alert('❌ Error: ' + err.message);
        submitBtn.innerText = 'Save Changes';
        submitBtn.disabled = false;
    }
});

// Load on page open
loadClient();
