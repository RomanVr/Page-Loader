import axios from 'axios';
import url from 'url';
import _ from 'lodash';
import path from 'path';
import cheerio from 'cheerio';
import { promises as fs } from 'fs';

export const getNamePage = (address) => {
  const urlObj = url.parse(address);
  return `${urlObj.host}${_.trimEnd(urlObj.pathname, '/')}`.replace(/\W/g, '-');
};

export const getNameAttr = (address) => {
  const urlObj = url.parse(address);
  urlObj.path = _.trimStart(urlObj.path, '/');
  const ext = path.extname(urlObj.path);
  urlObj.path = urlObj.path.substring(0, urlObj.path.length - ext.length);
  const convertedNameAttr = `${urlObj.path.replace(/\W/g, '-')}${ext}`;
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
  .then(response => fs.writeFile(output, response.data));

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
    .then(response => response.data)
    .then(html => downloadLocalResources(html, address, output))
    .then(newHtml => fs.writeFile(fileName, newHtml));
};

export default loadPage;
