const SUPABASE_URL = 'https://sjbunfizoblfqyepnepw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYnVuZml6b2JsZnF5ZXBuZXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NTk0MDQsImV4cCI6MjA4OTIzNTQwNH0.8cFfp4F-oVlB5nq2BHI0Q3lI4F-IwwBbUeS1xcRoexA';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('addClientForm');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    submitBtn.innerText = 'Syncing...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const clientData = Object.fromEntries(formData.entries());

    try {
        const { error } = await _supabase
            .from('clients')
            .insert([clientData]);

        if (error) throw error;

        alert('Client added successfully!');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error adding client:', error);
        alert('Error: ' + error.message);
        submitBtn.innerText = 'Register Client';
        submitBtn.disabled = false;
    }
});
