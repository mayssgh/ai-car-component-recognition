from app.core.supabase import supabase, supabase_admin

def get_db():
    return supabase

def get_admin_db():
    return supabase_admin