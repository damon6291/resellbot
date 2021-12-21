const CronJob = require('cron').CronJob;
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
var userAgent = require('user-agents');


const url = 'https://www.bestbuy.com/site/sony-playstation-5-console/6426149.p?skuId=6426149';
//const url = 'https://www.bestbuy.com/site/marvels-spider-man-miles-morales-standard-launch-edition-playstation-5/6430146.p?skuId=6430146';
const skuid = url.substring(url.indexOf("=") + 1, url.length);

var page = null;

async function initBrowser() {
    const browser = await puppeteer.launch({headless: false});
    const newpage = await browser.newPage();
    await newpage.setRequestInterception(true)
    await newpage.setDefaultNavigationTimeout(0);
    await newpage.setUserAgent(userAgent.toString());
    await newpage.goto(url);
    await newpage.setDefaultTimeout(5000);
    page = newpage;
}

async function addToCart() {
    console.log("addToCart");
    try {await page.waitForSelector(`button[data-sku-id='${skuid}']`, { timeout: 0 }); }
    catch (err) {await page.screenshot({ path: 'testresult.png', fullPage: true })}
    var buttonName = await page.$eval(`button[data-sku-id='${skuid}']`, elem => elem.getAttribute("data-button-state"));
    var available = buttonName.includes("ADD");
    await page.click(`button[data-sku-id='${skuid}']`);

    if (available) {
        await page.click("span.cart-label");
        await clickCheckout();
        if (await notLoggedIn()) await login();
        await submitOrder();
    } else {
        page.reload();
        addToCart();
    }

}

async function clickCheckout() {
    await page.waitForSelector("button[data-track='Checkout - Top']", {timeout: 10000});
    await page.waitForTimeout(500);
    await page.click("button[data-track='Checkout - Top']");


}

async function login() {
        await page.waitForSelector("input#fld-e", {timeout: 0});
        await page.type("input#fld-e", "damon6291@gmail.com");
        await page.type("input#fld-p1", "willtoria629")
        await page.click("button[data-track='Sign In']");
}

async function submitOrder() {
    await page.waitForSelector("input#cvv", {timeout: 0});
    await page.type("input#cvv", "7199");
    await page.waitForSelector("button.btn.btn-lg.btn-block.btn-primary.button__fast-track", {timeout: 0})
    await page.click("button.btn.btn-lg.btn-block.btn-primary.button__fast-track");
}


async function signIn() {
    if (await notLoggedIn()) {
        await page.waitForSelector("span.plButton-label.v-ellipsis", {timeout:0});
        await page.click("span.plButton-label.v-ellipsis");
        await page.waitForSelector("a.sign-in-btn", {timeout: 0});
        await page.click("a.sign-in-btn");
        await login();
    }
    
}

async function notLoggedIn() {
    var text = await page.$eval("span.plButton-label.v-ellipsis", elem => elem.textContent);
    return text.includes("Account");  
}

async function buyItem() {
    await addToCart();
}

async function runBot() {
    await signIn();
    buyItem();
}

async function main() {
    await initBrowser();
    runBot();
    // let job = new CronJob("*/15 * * * *", function() {
    //     console.log("new Job");
    //     runBot();
    // }, null, true, null, null, true);
    // job.start();
}

main();
