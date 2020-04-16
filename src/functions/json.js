let chromium = require('chrome-aws-lambda');
let htmlToJson = require('html-to-json');

exports.handler = async (event, context) => {

    let url = "https://github.com"

    if (event.httpMethod == "GET") {
        url = event.queryStringParameters.url || url
    }

    if (event.httpMethod == "POST") {
        url = JSON.parse(event.body).url || url
    }

    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: process.env.NETLIFY_DEV ? null : await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    let html = await page.evaluate(() => document.body.innerHTML)
    let json = await htmlToJson.parse(html, {
        'images': ['img', function ($img) {
            return $img.attr('src');
        }]
    }, function (err, result) {
        console.log(result);
    });

    await browser.close();

    return {
        statusCode: 200,
        body: JSON.stringify(json)
    }

}
