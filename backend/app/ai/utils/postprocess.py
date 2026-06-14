from typing import List, Dict, Any

def format_detection_results(
    boxes: List,
    class_names: List[str],
    confidences: List[float]
) -> List[Dict[str, Any]]:
    results = []
    for box, name, conf in zip(boxes, class_names, confidences):
        results.append({
            "component_name": name,
            "confidence": round(float(conf), 4),
            "bbox": [round(float(x), 2) for x in box]
        })
    results.sort(key=lambda x: x["confidence"], reverse=True)
    return results

def get_top_result(results: List[Dict]) -> Dict:
    if not results:
        return {
            "component_name": "Unknown",
            "confidence": 0.0,
            "bbox": []
        }
    return results[0]