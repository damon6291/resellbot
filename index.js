const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
const cheerio = require('cheerio');

//const url = 'https://www.bestbuy.com/site/sony-playstation-5-console/6426149.p?skuId=6426149';
const url = 'https://www.bestbuy.com/site/marvels-spider-man-miles-morales-standard-launch-edition-playstation-5/6430146.p?skuId=6430146';

const skuid = url.substring(url.indexOf("=") + 1, url.length);

var page = null;
var $ = '';

async function initBrowser() {
    const browser = await puppeteer.launch({headless: false});
    const newpage = await browser.newPage();
    await newpage.goto(url);
    page = newpage;
}

// async function loadPageHTML() {
//     await page.reload();
//     var content = await page.evaluate(() => document.body.innerHTML);
//     $ = cheerio.load(content);
// }

// async function checkStock() {
//     var stock;
//     await $(`button[data-sku-id='${skuid}']`).each(function() {
//         stock = $(this).attr('data-button-state').toLowerCase().includes("add");
//     })
//     return stock;
// }

async function addToCart() {
    var buttonName = await page.$eval(`button[data-sku-id='${skuid}']`, elem => elem.getAttribute("data-button-state"));
    var available = buttonName.includes("ADD");
    await page.$eval(`button[data-sku-id='${skuid}']`, elem => elem.click());

    if (available) {
        await page.$eval("span.cart-label", elem => elem.click());
        clickCheckout();    
    }

}

async function clickCheckout() {
    try {
        await page.$eval("button[data-track='Cart_PayPal_Checkout_Button']", elem => elem.click());
    }
    catch (err) {
        clickCheckout();
    }
}

async function delivery() {

}

async function payment() {

}

async function submitOrder() {

}

async function buyItem() {
    await addToCart();
    await delivery();
    await payment();
    await submitOrder();
}

async function runBot() {
    //await loadPageHTML();
    //var inStock = await checkStock();
    buyItem();
}

async function main() {
    await initBrowser();
    runBot();
    // let job = new CronJob("*/15 * * * *", function() {
    //     buyItem(page);
    // }, null, true, null, null, true);
    // job.start();
}

main();
