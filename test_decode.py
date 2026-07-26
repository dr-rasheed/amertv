import base64
import json
with open('encoded.txt', 'r') as f:
    encoded = f.read().strip()
decoded = json.loads(base64.b64decode(encoded).decode('utf-8'))
print(decoded)
