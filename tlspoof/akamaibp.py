import subprocess, sys, json, time, re, random
from collections import defaultdict

def install_dependencies():
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'lxml'])
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'httpx'])

try:
    import httpx, lxml.html as html
except:
    install_dependencies()
    import httpx, lxml.html as html

class akamaibp():
    def __init__(self):
        self.url = 'www.footlocker.com'
        self.session = httpx.Client(http2=True)
        self.get_abck()
        self.get_sensor()
        self.pass_ja3()

    def get_abck(self):
        headers = {
            'authority': 'www.footlocker.com',
            'pragma': 'no-cache',
            'cache-control': 'no-cache',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'sec-fetch-site': 'none',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-user': '?1',
            'sec-fetch-dest': 'document',
            'accept-language': 'en-US,en;q=0.9',
        }
        r = self.session.get('https://www.footlocker.com/', headers=headers)

    def get_sensor(self):
        params = {'url': self.url, 'abck': self.session.cookies['_abck'], 'indx': random.randint(1,5)}
        data = httpx.get('http://127.0.0.1:7000/sensor', params=params).text
        self.sensor_data = json.loads(data)['value']

    def normal_pass(self):
        headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
        }
        r = self.session.post('https://www.footlocker.com/assets/606f343aui18045c24c7dce0795d42',json={'sensor_data': self.sensor_data}, headers=headers)
        print(r, r.text, r.headers)

    def pass_ja3(self):
        param = {"sd": self.sensor_data,'abck': self.session.cookies['_abck'], 'bmsz': self.session.cookies['bm_sz']}
        print('sending sensor')
        r = self.session.get('http://127.0.0.1:8090/sensor', params = param)
        print(r, r.text)

akamaibp()
