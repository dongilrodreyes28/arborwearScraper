import puppeteer from 'puppeteer';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportScraper=async(results) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('arborwearScraper');

  worksheet.columns = [
    {key: 'style', header: 'Style'},
    {key: 'title', header: 'Title'},
    {key: 'overview', header: 'Overview'},
    {key: 'description', header: 'Description'},
    {key: 'image', header:'Image'},
  ]

  results.forEach((item) => {
    worksheet.addRow(item);
  });

  const exportPath = path.resolve(__dirname, 'arborwearScraper.xlsx');
  await workbook.xlsx.writeFile(exportPath);

};

const awScraper = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const styleList = ['400340'];
  // const styleList = ['350230', '350330', '400340', '400460', '402638', '400761'];
  let results = [];

  await page.setDefaultNavigationTimeout(0);
  await page.goto('https://arborwear.com/'); 
  

  for (let x in styleList){
    let style = styleList[x];
    await page.waitForSelector('#search2');
    await page.type('#search2', style);
    await page.keyboard.press("Enter");
    await page.waitForSelector('div > div.image-container');
    await page.click('div > div.image-container');
    await page.waitForSelector('#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-price-review > div.product-info-stock-sku')

    let initialData = await page.evaluate(() => {
      let dataResults = [], description = [];
      const container = "#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-price-review > div.product-info-stock-sku";
      let style = document.querySelector(container + '> div.product.attibute.sku > span').textContent;
      let title = document.querySelector(container + '> div.product.attibute.name > h1').textContent;
      let overview = '#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-info-des > div > span > p';
      
      if(document.querySelector(overview)){
        overview= document.querySelector('#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-info-des > div > span > p').textContent;
      }else{
        overview="N/A";
      }

      const ulChecker = '#product-row-middle > div > div.product-details-block > div > ul';
      const spanChecker = '#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-info-des > div > span';
      const pBulletChecker = '#div.product-details-block > div > p';

      if (document.querySelector(ulChecker)) {
        let ulLength = document.querySelectorAll(ulChecker + ' li').length;
        for(let i = 1; i <= ulLength ; i++) {
          let bulletItem = document.querySelector(ulChecker + `> li:nth-child(${i})`).textContent;
          description.push(bulletItem);
        }

      }
      
      if (document.querySelector(pBulletChecker)){
        let pElements = document.querySelectorAll('#product-row-middle > div > div.product-details-block > div > p');
        for (i = 0; i < pElements.length; i++) {
          description.push(pElements[i].innerText);
        };

      }
      
      if (document.querySelector(spanChecker)) {
        let spanList=document.querySelector(spanChecker).innerHTML;
        description.push(spanList);        
      }

      dataResults.push({
        style: style,
        title: title,
        overview: overview,
        description: description,
      });

      return dataResults
    });

    await page.waitForSelector('#amasty-main-container > img');

    let imgData = await page.evaluate(() => {
      let imgResult = []
      let srcs = document.querySelector('#amasty-main-image').src;
      imgResult.push({
        image: srcs,
      })
      return imgResult
    });

    initialData[0].image = imgData[0].image;

    results.push({id: JSON.stringify(initialData) });
    console.log(style + ' - done');
  }

  const scrapeData = (results);
  console.log(JSON.stringify(scrapeData));
  await browser.close();
}

awScraper();

