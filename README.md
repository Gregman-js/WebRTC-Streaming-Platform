# WebRTC-Stream-Platform
Create room and talk with others, easily find rooms on homepage
![preview](https://raw.githubusercontent.com/Gregman-js/WebRTC-Streaming-Platform/master/preview.png)
## Installation
```bash
npm install
```

### Install certificates
```bash
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```


## Running
```bash
npm run devStart
```
OR
```bash
node server.js
```
### Parameters
- `--http-port=3000` http port (default: 3000)
- `--https-port=3001` https port (default: 3001)