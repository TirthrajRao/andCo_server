const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const hbs = require('handlebars')
const path = require('path');
const moment = require('moment');


const compile = async function (templateName, data) {

    const filePath = path.join(process.cwd(), 'emailTemplate', `${templateName}.hbs`);
    const html = await fs.readFile(filePath, 'utf-8');
    return hbs.compile(html)(data);
}


hbs.registerHelper('dateFormat', function (value, format) {
    return moment(value).format(format);
});
hbs.registerHelper('formatCurrency', function (value) {
    console.log("what is value of sign", value)
})

async function pdfGenerate(dataDetails, eventDetails) {
    console.log("what is in=========", dataDetails)
    const data = {
        data: dataDetails,
        event: eventDetails,
    }
    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
        const page = await browser.newPage()
        await page.setDefaultNavigationTimeout(0);
        const content = await compile('pdfFile', data);

        await page.setContent(content);
        await page.emulateMedia('screen');
        const buffer = await page.pdf({
            path: 'myPdf.pdf',
            format: 'A4',
            printBackground: true
        });
        console.log("it is done", buffer)
        await browser.close();
        return buffer
        // process.exit();
    } catch (e) {
        console.log("our error", e)

    }
}



module.exports.pdfGenerate = pdfGenerate
