const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
var userAgent = require('user-agents');
var nodemailer = require('nodemailer');
const log = require('log-to-file');
require('dotenv').config();


const url = process.env.WEBSITE;
//const url2 = 'https://www.bestbuy.com/site/marvels-spider-man-miles-morales-standard-launch-edition-playstation-5/6430146.p?skuId=6430146';
const skuid = url.substring(url.indexOf("=") + 1, url.length);
//var skuid2 = url2.substring(url2.indexOf("=") + 1, url2.length);

var page = null;
var browser = null;
var debugMsg = 'Debug: ';
var reloadCount = 0;

async function initBrowser() {
    browser = await puppeteer.launch({headless: false});
    const newpage = await browser.newPage();
    await newpage.setRequestInterception(true)
    await newpage.setDefaultNavigationTimeout(0);
    await newpage.setUserAgent(userAgent.toString());
    await newpage.goto(url);
    await newpage.setDefaultTimeout(5000);
    page = newpage;
}

async function addToCart() {
    try {
        reloadCount++;
        await page.waitForSelector(`button[data-sku-id='${skuid}']`, { timeout: 0 }); 
        var buttonName = await page.$eval(`button[data-sku-id='${skuid}']`, elem => elem.getAttribute("data-button-state"));
        var available = await buttonName.includes("ADD");
        await page.click(`button[data-sku-id='${skuid}']`);
    
        if (available) {
            addToDebugMessage(`addToCartEnded reload X${reloadCount} // `);
            await page.click("span.cart-label");
            await clickCheckout();
            if (await notLoggedIn()) await login();
            await submitOrder();
        } else {
            await page.reload();
            await page.waitForTimeout(1500);
            await addToCart();
        }
    }
    catch (err) {
        addToDebugMessage(`addToCartEndedWithError reload X${reloadCount} // `);
        restart();
    }

}

async function clickCheckout() {
    addToDebugMessage("clickCheckoutStarted // ");
    await page.waitForSelector("button[data-track='Checkout - Top']", {timeout: 10000});
    await page.waitForTimeout(500);
    await page.click("button[data-track='Checkout - Top']");
    addToDebugMessage("clickCheckoutEnded // ");
}

async function login() {
    addToDebugMessage("loginStarted // ");
    await page.waitForSelector("input#fld-e", {timeout: 0});
    await page.type("input#fld-e", process.env.BESTBUY_ID);
    await page.type("input#fld-p1", process.env.BESTBUY_PWD)
    await page.click("button[data-track='Sign In']");
    addToDebugMessage("loginEnded // ");
}

async function submitOrder() {
    addToDebugMessage("submitOrderStarted // ");
    await page.waitForSelector("button.btn.btn-lg.btn-block.btn-primary.button__fast-track", {timeout: 0})
    try {
        await page.waitForSelector("input#cvv", {timeout: 1000});
        await page.type("input#cvv", process.env.CVV);
    }
    catch (err) {
    }
    finally {
        await page.click("button.btn.btn-lg.btn-block.btn-primary.button__fast-track");
        await page.waitForTimeout(5000);
        await page.screenshot({ path: "AfterSubmitOrder.png", fullPage: true })
        browser.close();
        addToDebugMessage("submitOrderEnded // ");
        sendEmail();
    }
}

async function sendEmail() {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
      
      var mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: 'BesyBuy Purchase succeeded',
        text: 'Check this immediately'
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          addToDebugMessage("EmailFailed // ");
        } else {
          addToDebugMessage("EmailSent // ");
        }
        log(debugMsg);
      });
}

async function signIn() {
    if (await notLoggedIn()) {
        addToDebugMessage("signInStarted // ");
        await page.waitForSelector("span.plButton-label.v-ellipsis", {timeout:0});
        await page.click("span.plButton-label.v-ellipsis");
        await page.waitForSelector("a.sign-in-btn", {timeout: 0});
        await page.click("a.sign-in-btn");
        await login();
        addToDebugMessage("signInEnded // ");
    }
    
}

async function notLoggedIn() {
    var text = await page.$eval("span.plButton-label.v-ellipsis", elem => elem.textContent);
    return await text.includes("Account");  
}

async function runBot() {
    addToDebugMessage("RobotRunning // ");
    await signIn();
    try {
        addToDebugMessage("addToCartStarted // ");
        await addToCart();
    }
    catch (err) {
        restart();
    }
}

async function restart() {
    addToDebugMessage("RobotErrored // ");
    log(debugMsg);
    await page.screenshot({ path: "RobotErrorPage.png", fullPage: true })
    browser.close();

    debugMsg = 'Debug: ';
    reloadCount = 0;

    main();
}

function addToDebugMessage(msg) {
    debugMsg += msg;
}

async function main() {
    await initBrowser();
    runBot();
}

main();

