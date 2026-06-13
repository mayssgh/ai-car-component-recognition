from app.db.queries import get_scans_by_user

def fetch_user_history(user_id: str):
    res = get_scans_by_user(user_id)
    return res.data