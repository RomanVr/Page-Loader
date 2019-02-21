import axios from 'axios';
import url from 'url';
import _ from 'lodash';
import path from 'path';
import cheerio from 'cheerio';
import debug from 'debug';
import { promises as fs } from 'fs';

const debugLog = debug('page-loader');

export const getNamePage = (address) => {
  const urlObj = url.parse(address);
  return `${urlObj.host}${_.trimEnd(urlObj.pathname, '/')}`.replace(/\W/g, '-');
};

export const getNameAttr = (address) => {
  const pathObj = path.parse(url.parse(address).path);
  const pathAttrWithName = path.join(_.trimStart(pathObj.dir, '/'), pathObj.name);
  const convertedNameAttr = `${pathAttrWithName.replace(/\W/g, '-')}${pathObj.ext}`;
  return convertedNameAttr;
};

const typesLocalResources = {
  link: { attr: 'href' },
  script: { attr: 'src' },
  img: { attr: 'src' },
};

const getSelector = tag => `${tag}[${typesLocalResources[tag].attr}^=\\/]`;

const loadArraybufferResource = (address, output) => axios
  .get(address, { responseType: 'arraybuffer' })
  .then(
    (response) => {
      debugLog(`Resource url: ${address} was loaded`);
      return fs.writeFile(output, response.data);
    },
    (error) => {
      console.error(`Resource at url: ${address} was not loaded!`);
      throw error;
    },
  )
  .then(() => {
    debugLog(`Resource ${path.basename(output)} is write to disk`);
  });

const downloadResourcesByTag = (tag, dom, dirLocal, address, output) => {
  const selector = getSelector(tag);
  const resources = dom(selector).map((index, elem) => {
    const attrValue = dom(elem).attr(typesLocalResources[tag].attr);// получили значение
    const newNameAttr = getNameAttr(attrValue);// новое значение аттрибута
    const fullPathAttr = path.join(output, dirLocal, newNameAttr);// путь сохраннеия ресурса на диск
    const addressAttr = url.resolve(address, attrValue);// url attr для загрузки
    dom(elem).attr(typesLocalResources[tag].attr, path.join(dirLocal, newNameAttr));
    return loadArraybufferResource(addressAttr, fullPathAttr);// Промис с загрузкой ресурса
  }).get();
  return resources;
};

const downloadLocalResources = (html, address, output) => {
  const dom = cheerio.load(html, {
    decodeEntities: false,
  });
  const dirLocal = `${getNamePage(address)}_files`;
  const pathDirLocal = path.join(output, dirLocal);
  return fs.mkdir(pathDirLocal)
    .then(() => {
      const localResources = _.keys(typesLocalResources)
        .reduce(
          (acc, tag) => [...acc, ...downloadResourcesByTag(tag, dom, dirLocal, address, output)],
          [],
        );
      return Promise.all(localResources);
    })
    .then(() => `${dom.html()}\n`);
};

const loadPage = (address, output) => {
  const fileName = path.join(output, `${getNamePage(address)}.html`);
  return axios.get(address)
    .then(
      (response) => {
        debugLog(`Page ${address} was loaded`);
        return response.data;
      },
      (error) => {
        console.error(`Page at url: ${address} was not loaded!\n
          error: ${error.message}`);
        process.exitCode = 1;
        throw error;
      },
    )
    .then(html => downloadLocalResources(html, address, output))
    .then(newHtml => fs.writeFile(fileName, newHtml))
    .then(
      () => {
        debugLog(`Page ${address} is write to disk`);
      },
      (error) => {
        console.error(`Page ${address} is not write to disk!\n
          error: ${error.message}`);
        throw error;
      },
    );
};

export default loadPage;
