import requests

url = "http://localhost:8000/api/inference/predict"
# Make sure you have a test image in your directory
files = {'file': open('test_component.jpg', 'rb')} 

response = requests.post(url, files=files)
print(response.json())