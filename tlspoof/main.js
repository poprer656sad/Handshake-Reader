const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const express = require('express');
const bodyParser = require('body-parser');
const url = require('url');
const ghostCursor = require("ghost-cursor");
const adyenEncrypt = require('node-adyen-encrypt')(18);
var util = require('util');
var page, captchaWindow;
const page_list = ['https://www.footlocker.com/product/model/starter-sweatshirt-womens/318828.html','https://www.footlocker.com/product/model/starter-sweatshirt-womens/318828.html','https://www.footlocker.com/product/model/nike-satin-hook-t-shirt-mens/323947.html','https://www.footlocker.com/product/model/reebok-vector-crew-mens/318979.html','https://www.footlocker.com/product/model/converse-all-star-ox-boys-grade-school/191450.htm','https://www.footlocker.com/product/model/converse-all-star-ox-womens/149982.html','https://www.footlocker.com/product/model/nike-air-force-1-low-boys-grade-school/100214.html','https://www.footlocker.com/product/nike-air-fear-of-god-moc-mens/M8086200.html', 'https://footlocker.com', 'https://www.footlocker.com/product/nike-lebron-17-low-mens/D5007101.html'];
const string_list = ['fear of god', 'air max', 'air force 1', 'sweater', 'vans', 'jordan 1', 'jordan 3', 'jordan 4', 'jordan 11'];
//, '--proxy-server=204.150.214.211:65016'

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
};


    puppeteer.launch({ headless: true, args: ['--window-size=1366,768'] }).then(async browser => {
  page = await browser.newPage();
  page.setViewport({width: 1366, height:728})
  await page.goto('https://footlocker.com');
  await page.addScriptTag({path: "px.js"});
  await page.evaluate(()=>{
    window.innerHeight = 657;
    window.innerWidth = 1366;
  });
  const cursor = ghostCursor.createCursor(page)
  setInterval(async function(){
    try{
        try{await cursor.move('main[id=main]')}catch(e){};
        if(Math.random()>.9){
                await page.evaluate(()=>{ $x('//*[@id="app"]/div/header/nav[2]/div[3]/button[1]/span')[0].click()});
                await page.type('#input_search_query', string_list[parseInt(Math.random()*9)], {delay: 0});
                await page.evaluate(()=>{$x('//*[@id="HeaderSearch"]/div[3]/button')[0].click()});
                await new Promise(r => setTimeout(r, 1500));
        }
        if(Math.random() > 0.85){
            await cursor.click();
        }
    }catch(e){};
    }, 500)
})

async function check_cookies(cookiename){
        var cookies = await page.cookies();
        for(i = 0; i < cookies.length; i++){
            if(cookies[i].name == cookiename){
                if (!cookies[i].value.slice(-12).includes('==')){
                     return(cookies[i].value);
                }
            }
        }
        return false
}

async function sensor(abckcookie, link, indx){
    const cookie = {
          name: '_abck',
          value: abckcookie,
          domain: '.footlocker.com',
          url: 'https://www.footlocker.com/',
          path: '/',
          httpOnly: false,
          secure: true
        }
    var tc = check_cookies('_abck');
    if(!tc){
        return {'type':'cookie','value': sensor_val};
    }
    await page.setCookie(cookie);
    try{
        var sensor_val = await page.evaluate((link, indx)=>{
            history.pushState({},'',link);
            bmak.cma(MouseEvent, 1);
            bmak.cdma(DeviceMotionEvent);
            bmak.aj_type = 1;
            bmak.aj_index = indx;
            bmak.bpd();
            return bmak.sensor_data;
        }, link, indx)
    }catch(e){
        await page.addScriptTag({path: 'akamai.js'});
        var sensor_val = await page.evaluate((link, indx)=>{
            history.pushState({},'',link);
            bmak.cma(MouseEvent, 1);
            bmak.cdma(DeviceMotionEvent);
            bmak.aj_type = 1;
            bmak.aj_index = indx;
            bmak.bpd();
            return bmak.sensor_data;
        }, link, indx)
    }
    return {'type':'sensor','value': sensor_val};
}

async function adyen_encrypt(adyenkey, card_num, card_month, card_year, card_cvv, card_name){
//dfValue: "ryEGX8eZpJ0030000000000000bsx09CX6tD00255378005WpYWiKzBGUPaGpG7NwM5S16Goh5Mk004mvcujCW8QL00000qZkTE00000VbreruJ83I1B2M2Y8Asg:40"
     const options = {};
     const cardData = {
         number : card_num,       // 'xxxx xxxx xxxx xxxx'
         cvc : card_cvv,                 //'xxx'
         holderName : card_name,   // 'John Doe'
         expiryMonth : card_month, //'MM'
         expiryYear : card_year,   // 'YYYY'
         generationtime : new Date().toISOString() // new Date().toISOString()
     };
     const cseInstance = adyenEncrypt.createEncryption(adyenkey, options);
     var encrypteddata = {"encryptedCardNumber":cseInstance.encrypt({number: card_num, generationtime : new Date().toISOString()}),
        "encryptedExpiryMonth":cseInstance.encrypt({expiryMonth : card_month, generationtime : new Date().toISOString()}),
        "encryptedExpiryYear":cseInstance.encrypt({expiryYear : card_year, generationtime : new Date().toISOString()}),
        "encryptedSecurityCode":cseInstance.encrypt({cvc : card_cvv, generationtime : new Date().toISOString()})
     }
     console.log(encrypteddata);
     return encrypteddata;
}

async function pxjs(sid, vid, cs, px3){
    if(vid != null){
        const pxvid = {
                  name: '_pxvid',
                  value: vid,
                  domain: '.footlocker.com',
                  url: 'https://www.footlocker.com/',
                  path: '/',
                  httpOnly: false,
                  secure: true
        };
        await page.setCookie(pxvid);
    }
    if(px3 != null){
        const px3cookie = {
                  name: '_px3',
                  value: px3,
                  domain: '.footlocker.com',
                  url: 'https://www.footlocker.com/',
                  path: '/',
                  httpOnly: false,
                  secure: true
        };
        await page.setCookie(px3cookie);
    }
    try{
        if(cs != null){
            respdata = await page.evaluate((cs, sid)=>{
                sr(cs);
                window.sessionStorage.pxsid = sid;
                return Ya();
            }, cs, sid)
        }else{
            respdata = await page.evalute(()=>{return Ya()})
        }
    }catch(e){
        await page.addScriptTag({path: "px.js"});
        if(cs != null){
        respdata = await page.evaluate((cs, sid)=>{
            sr(cs);
            window.sessionStorage.pxsid = sid;
            return Ya();
        }, cs, sid)
        }else{
            respdata = await page.evalute(()=>{return Ya()})
        }
    }
    return respdata;
}

function initBankServer() {
	bankExpressApp = express();

	let port = '7000';
	let address = '127.0.0.1';

	console.log('Bank server listening on port: ' + port);
	bankExpressApp.set('port', port);
	bankExpressApp.set('address', address);
	bankExpressApp.use(bodyParser.json());
	bankExpressApp.use(bodyParser.urlencoded({ extended: true }));

	bankExpressApp.get('/sensor', async function(req, res) {
	    console.log('recieved');
	    var forminf = req.query;
	    var return_data = await sensor(forminf.abck, forminf.url, forminf.indx);
        res.send(return_data);
        res.end();
    });

    bankExpressApp.get('/px', async function(req, res) {
	    console.log('recieved');
	    var forminf = req.query;
	    var responsedata = await pxjs(forminf.sid, forminf.vid, forminf.cs, forminf.px3);
	    console.log(responsedata);
	    res.send(responsedata);
	    res.end();
    });

    bankExpressApp.get('/alternatepage', async function(req, res){
       var new_link = page_list[parseInt(Math.random()*11)];
       while (typeof(new_link) === "undefined"){
           new_link = page_list[parseInt(Math.random()*11)];
       }
       console.log(new_link);
       await page.goto(new_link);
       await page.addScriptTag({path: "px.js"});
       res.send('reloaded');
       res.end();
    });

    bankExpressApp.get('/adyen', async function(req, res){
        var forminf = req.query;
        res.send(await adyen_encrypt(forminf.adyen_key, forminf.number, forminf.month, forminf.year, forminf.cvv, forminf.name));
        res.end();
    });

	bankServer = bankExpressApp.listen(bankExpressApp.get('port'), bankExpressApp.get('address'));
	}

initBankServer();
