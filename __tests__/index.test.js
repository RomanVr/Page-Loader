import path from 'path';
import nock from 'nock';
import os from 'os';
import _ from 'lodash';
import { promises as fs } from 'fs';
import loadPage, { getNamePage, getNameAttr } from '../src';

nock.disableNetConnect();

const pathTemplate = './__tests__/__fixtures__/';

describe('Convert address to name', () => {
  it('set 1: https://hexlet.io/courses', () => {
    const address = 'https://hexlet.io/courses';
    const expected = 'hexlet-io-courses';

    const fileName = getNamePage(address);
    return expect(fileName).toBe(expected);
  });
  it('set 2: https://yandex.ru', () => {
    const address = 'https://yandex.ru';
    const expected = 'yandex-ru';

    const fileName = getNamePage(address);
    return expect(fileName).toBe(expected);
  });
});

describe('Converted local addres to name', () => {
  it('set 1: /courses', () => {
    const address = '/courses';
    const expected = 'courses';

    const fileName = getNameAttr(address);
    return expect(fileName).toBe(expected);
  });
  it('set 2: /cgn-ccc/image.rt.img', () => {
    const address = '/cgn-ccc/image.rt.img';
    const expected = 'cgn-ccc-image-rt.img';

    const fileName = getNameAttr(address);
    return expect(fileName).toBe(expected);
  });
});

test('Download page', async () => {
  const pageFile = path.join(pathTemplate, 'host.test.html');
  nock('https://host')
    .get('/test')
    .replyWithFile(
      200,
      pageFile,
      { 'Content-Type': 'text/html' },
    );

  const testExpectedFile = 'host-test.html';
  const addressTest = 'https://host/test';

  await loadPage(addressTest, os.tmpdir());

  const expectedFilePath = path.join(pathTemplate, testExpectedFile);
  const expectedFile = await fs.readFile(expectedFilePath);

  const outputFile = path.join(os.tmpdir(), `${getNamePage(addressTest)}.html`);
  const actualFile = await fs.readFile(outputFile);

  expect(actualFile.toString()).toBe(expectedFile.toString());
});

const tagsResource = {
  link: { url: '/local/courses', pathLocal: 'local/courses.html', contentType: 'text/html' },
  script: { url: '/local/script.js', pathLocal: 'local/script.js', contentType: 'text/plain' },
  img: { url: '/local/cats.jpg', pathLocal: 'local/cats.jpg', contentType: 'image/jpg' },
};

beforeAll(() => {
  const testLocalFile = 'localRes.html';
  const domain = 'https://local.ru';
  const localePagePath = path.join(pathTemplate, testLocalFile);
  nock(domain)
    .get('/')
    .replyWithFile(
      200,
      localePagePath,
      { 'Content-Type': 'text/html' },
    );
  _.keys(tagsResource).forEach((key) => {
    const { url, pathLocal, contentType } = tagsResource[key];
    const filePath = path.join(pathTemplate, pathLocal);
    nock(domain)
      .get(url)
      .replyWithFile(
        200,
        filePath,
        { 'Content-Type': contentType },
      );
  });
});

test('Download page with resources', async () => {
  const addressTest = 'https://local.ru';
  const pageFileName = 'local-ru.html';

  await loadPage(addressTest, os.tmpdir());

  const actualPageFile = await fs.readFile(path.join(os.tmpdir(), pageFileName));
  const expectedPageFile = await fs.readFile(path.join(pathTemplate, pageFileName));

  expect(actualPageFile.toString()).toBe(expectedPageFile.toString());
});
