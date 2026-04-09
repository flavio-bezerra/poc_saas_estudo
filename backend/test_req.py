import requests

url = "http://localhost:8000/api/upload"
files = {'file': ('dummy.pdf', b'dummy content', 'application/pdf')}
data = {'hours_per_day': 3}
response = requests.post(url, files=files, data=data)
print(response.status_code, response.text)
