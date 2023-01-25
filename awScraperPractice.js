import puppeteer from 'puppeteer';
import ExcelJS from 'exceljs';
import path from 'path';

const scraper = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  let results = [];
  
// async end brace
}
