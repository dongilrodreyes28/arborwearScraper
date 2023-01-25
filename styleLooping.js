import puppy from 'puppeteer';

const styleList = ['350230', '350330', '400340', '400460', '400550', '400761'];

for (let x in styleList) {
    const browser = await puppy.launch({ headless: false });
    const page = await browser.newPage();
    
    let style = styleList[x];
    
    await page.goto('https://www.google.com/', { waitUntil: 'load' });
    await page.waitForSelector('body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input');
    await page.type('body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input', style);
    await page.click('body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.FPdoLc.lJ9FBc > center > input.gNO89b');
};
