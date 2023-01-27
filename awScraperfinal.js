import puppeteer from 'puppeteer';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { write } from 'fs';

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
    {key: 'bullet', header: 'Bullet'},
    {key: 'image', header:'Image'},
  ]

  results.forEach((item) => {
    worksheet.addRow(item);
  });

  const exportPath = path.resolve(__dirname, 'arborwearScraper2.xlsx');
  await workbook.xlsx.writeFile(exportPath);

};



const scraper = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const styleList = ['350330','400340','400761','350230','400460','402638'];
  // '350330','400340','400761','350230','400460','402638'
  let results = [];
  
  for(let x in styleList){
    let styleNum= styleList[x];
    await page.setDefaultNavigationTimeout(0);
    await page.goto(`https://arborwear.com/catalogsearch/result/?q=${styleNum}`);
    await page.click('div > div.image-container');
    await page.waitForSelector('#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-price-review > div.product-info-stock-sku',{timeout:0});


    let style= await page.evaluate(()=>{
      const style = document.querySelector('#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-price-review > div.product-info-stock-sku > div.product.attibute.sku > span').textContent;
      return style;
    })

    let title= await page.evaluate(()=>{
      const title = document.querySelector('#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-price-review > div.product-info-stock-sku > div.product.attibute.name > h1').textContent;
      return title;
    })

    let overview= await page.evaluate(()=>{
      let overview = '#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-info-des > div > span > p';
      if(document.querySelector(overview)){
        overview= document.querySelector('#product-row-upper > div:nth-child(1) > div > div:nth-child(2) > div > div > div.box-info-des > div > span > p').textContent;
      }else{
        overview="N/A";
      }
      return overview;
    })

    await page.waitForSelector('#product-row-middle > div > div.product-details-block > div',{timeout:0});


    let description= await page.evaluate(()=>{
      let descriptionItem= [];
      const ulChecker= '#product-row-middle > div > div.product-details-block > div';
      const pBulletChecker= '#product-row-middle > div > div.product-details-block > div > ul';
      // 350330 400340 400761 #product-row-middle > div > div.product-details-block > div > p:nth-child(11)
      // 350230 400460 402638 #product-row-middle > div > div.product-details-block > div > ul > li:nth-child(1)

      // 400761 - working
      // 350230 400460 402638- working - #product-row-middle > div > div.product-details-block > div > ul > li:nth-child(1)
      // div w bullets 350330: #product-row-middle > div > div.product-details-block > div > div:nth-child(11)
      // p w bullets 400340: #product-row-middle > div > div.product-details-block > div > p:nth-child(11)

      if (document.querySelector(pBulletChecker)){
        let elements= document.querySelectorAll('#product-row-middle > div > div.product-details-block > div > ul > li').length;
        for (i= 1; i<= elements; i++) {
          let elementItem= document.querySelector(`#product-row-middle > div > div.product-details-block > div > ul > li:nth-child(${i})`).innerHTML;
          descriptionItem.push(elementItem.replace("•",""));
        };
      } else {
        if (document.querySelector(ulChecker)) {
          let description= document.querySelectorAll('#product-row-middle > div > div.product-details-block > div')[0].children;
          for (let i= 0; i < description.length; i++) {
            if (description[i].innerHTML.includes('•')) {
                descriptionItem.push((description[i].innerHTML).replace("•",""));
            }
          }
        } else {
          descriptionItem.push('n/a')
        }
      }

      return descriptionItem;
    })

    let bullet= await page.evaluate((description)=>{
      bullet= description => {
        return description.map(bulletItem => bulletItem + "|");
      }
      return (bullet(description));

    },description)




    await page.waitForSelector('#amasty-main-image',{timeout:0});
    let image = await page.evaluate(() => {
      let image = document.querySelector('#amasty-main-image').src;
      return image
    });


    results.push({
      style: style,
      title: title,
      overview: overview,
      description: description,
      bullet: bullet,
      image: image,
    })


    console.log(styleNum + ' - done');
   
  }

  const writeData = exportScraper(results);
  console.log(results);
  await browser.close();

}

scraper();
// #amasty-gallery-images > a > img
