from app.core.supabase import supabase

def get_all_components():
    return supabase.table("components").select("*").execute()

def get_component_by_id(component_id: str):
    return supabase.table("components").select("*").eq("id", component_id).single().execute()

def get_scans_by_user(user_id: str):
    return supabase.table("scans").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()

def insert_scan(data: dict):
    return supabase.table("scans").insert(data).execute()

def insert_feedback(data: dict):
    return supabase.table("feedback").insert(data).execute()