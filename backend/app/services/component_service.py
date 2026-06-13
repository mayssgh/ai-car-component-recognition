from app.db.queries import get_all_components, get_component_by_id

def fetch_all_components():
    res = get_all_components()
    return res.data

def fetch_component(component_id: str):
    res = get_component_by_id(component_id)
    return res.data

def enrich_results_with_info(results: list) -> list:
    """Attach component DB info to AI results by name match"""
    all_components = fetch_all_components()
    components_map = {c["name"].lower(): c for c in all_components}

    enriched = []
    for result in results:
        name = result.get("component_name", "").lower()
        component_info = components_map.get(name, {})
        enriched.append({**result, "info": component_info})
    return enriched