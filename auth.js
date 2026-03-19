// auth.js — Shared authentication guard for all protected pages
// Include this BEFORE any page-specific JS

const SUPABASE_URL = 'https://sjbunfizoblfqyepnepw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYnVuZml6b2JsZnF5ZXBuZXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NTk0MDQsImV4cCI6MjA4OTIzNTQwNH0.8cFfp4F-oVlB5nq2BHI0Q3lI4F-IwwBbUeS1xcRoexA';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if user is authenticated AND approved
// Redirects to login if not logged in, or pending page if not approved
async function requireAuth() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return null;
    }

    // Check user profile status
    const { data: profile } = await _supabase
        .from('user_profiles')
        .select('status, role')
        .eq('id', session.user.id)
        .single();

    if (!profile || profile.status !== 'approved') {
        window.location.href = 'pending.html';
        return null;
    }

    // Store role for admin checks
    window._userRole = profile.role || 'user';

    return session;
}

// Logout function
async function logout() {
    await _supabase.auth.signOut();
    window.location.href = 'login.html';
}
