let chromium = require('chrome-aws-lambda');
let htmlToJson = require('html-to-json');

exports.handler = async (event, context) => {

    const url = JSON.parse(event.body).url;

    if (!url) return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Page URL not defined' })
    }

    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    let html = await page.evaluate(() => document.body.innerHTML)
    let json = await htmlToJson.parse(html, {
        'text': function ($doc) {
            return $doc.find('div').text();
        }
    }, function (err, result) {
        console.log(result);
    });

    await browser.close();

    return {
        statusCode: 200,
        body: JSON.stringify(json)
    }

}
