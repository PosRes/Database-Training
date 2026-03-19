// _supabase and requireAuth() are provided by auth.js (loaded first)
requireAuth();

const form = document.getElementById('addClientForm');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    submitBtn.innerText = 'Syncing...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const clientData = Object.fromEntries(formData.entries());

    // Format phone number to start with +62
    if (clientData.no_telepon) {
        let phone = clientData.no_telepon.replace(/\D/g, ''); // Remove non-numeric characters just in case
        if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
        } else if (phone.startsWith('8')) {
            phone = '62' + phone;
        } else if (phone.startsWith('62')) {
            // Do nothing
        } else {
            phone = '62' + phone;
        }
        clientData.no_telepon = '+' + phone;
    }

    try {
        const { error } = await _supabase
            .from('clients')
            .insert([clientData]);

        if (error) throw error;

        alert('Client added successfully!');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Submission error:', error);
        
        // Provide much clearer feedback to the user
        let message = error.message || 'Unknown error';
        if (message.includes('403') || message.includes('row-level security')) {
            message = "Permission Denied (RLS). Please check your Supabase 'INSERT' policies.";
        } else if (message.includes('404') || message.includes('relation "clients" does not exist')) {
            message = "Table 'clients' not found. Did you run the SQL in Supabase?";
        }

        alert('❌ Error: ' + message);
        submitBtn.innerText = 'Register Client';
        submitBtn.disabled = false;
    }
});
