import axios from 'axios';
import url from 'url';
import _ from 'lodash';
import path from 'path';
import { promises as fs } from 'fs';

export const getNamePage = (address) => {
  const urlObj = url.parse(address);
  return `${urlObj.host}${_.trimEnd(urlObj.pathname, '/')}`.replace(/\W/g, '-');
};

const loadPage = (address, output) => {
  const fileName = path.join(output, `${getNamePage(address)}.html`);
  return axios.get(address)
    .then(response => response.data)
    .then(html => fs.writeFile(fileName, html));
};

export default loadPage;
