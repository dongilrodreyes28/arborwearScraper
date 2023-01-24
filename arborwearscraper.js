import puppeteer from 'puppeteer';
import ExcelJS from 'exceljs';
import path from 'path';



const awScraper = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  // const url= await page.url();

  await page.goto('https://arborwear.com/'); 
  await page.waitForSelector('#search2');
  await page.type('#search2', '408043');
  await page.keyboard.press("Enter");
  await page.waitForSelector('div > div.image-container');
  await page.click('div > div.image-container');
  await page.waitForSelector('#accept-cookies');
  await page.click('#accept-cookies');



  // let color = await page.evaluate(() => document.querySelector('#product-options-wrapper > div.fieldset > div.swatch-opt > div.swatch-attribute.color > span').innerHTML);

  let data = await page.evaluate(() => {
    let results = [], description = [];
    let container = "#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-price-review > div.product-info-stock-sku";
    let style = document.querySelector(container + '> div.product.attibute.sku > span').textContent;
    let title = document.querySelector(container + '> div.product.attibute.name > h1').textContent;
    let overview = '#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-info-des > div > span > p';
    // let image = '#amasty-main-image';
    

    if(document.querySelector(overview)){
      overview= document.querySelector('#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-info-des > div > span > p').textContent;
    }else{
      overview="N/A";
    }
    
    const ulChecker = '#product-row-middle > div > div.product-details-block > div > ul';
    const spanChecker = '#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-info-des > div > span';
    const pBulletChecker = '#product-row-middle > div > div.product-details-block > div > p';

    if (document.querySelector(ulChecker)) {
      let ulLength = document.querySelectorAll(ulChecker + ' li').length;
      for(let i = 1; i <= ulLength ; i++) {
        let bulletItem = document.querySelector(ulChecker + `> li:nth-child(${i})`).textContent;
        description.push(bulletItem);
      }
    } else if (document.querySelectorAll(pBulletChecker)){
      // let pLength = document.querySelectorAll('#product-row-middle > div > div.product-details-block > div > p').length;
      // for(let i = 11; i <= (pLength+10); i++){ //6 8
      //   let pBullet = document.querySelector(`#product-row-middle > div > div.product-details-block > div > p:nth-child(${i})`).innerHTML; 
      //   description.push(pBullet);
      // }
      
      let pElements = document.querySelectorAll('#product-row-middle > div > div.product-details-block > div > p');
      for (i = 0; i < pElements.length; i++) {
        description.push(pElements[i].innerText);
      };

    } else if (document.querySelectorAll(spanChecker)) {
      let spanList = document.querySelectorAll(`#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-info-des > div > span`).textContent;
      let spanBullet = spanList.replace(/[\r\n]/gm,"");
      description.push(spanBullet);        
    }

    // let srcs= Array.from(document.querySelectorAll(image)).map((img) => img.getAttribute("src"));
    // let srcs = document.getElementById('amasty-main-image').src;

    results.push({
        style: style,
        title: title,
        overview: overview,
        description: description,
        // image: srcs,
        // color: color,

});

    return results
});
  console.log(data);
  await browser.close();
}
awScraper();