import path from 'path';
import nock from 'nock';
import os from 'os';
import _ from 'lodash';
import url from 'url';
import { promises as fs } from 'fs';
import loadPage, * as loader from '../src';

nock.disableNetConnect();

const pathTemplate = './__tests__/__fixtures__/';

describe('Convert address to name', () => {
  it('set 1: https://hexlet.io/courses', () => {
    const address = 'https://hexlet.io/courses';
    const expected = 'hexlet-io-courses';

    const fileName = loader.getNamePage(address);
    return expect(fileName).toBe(expected);
  });
  it('set 2: https://yandex.ru', () => {
    const address = 'https://yandex.ru';
    const expected = 'yandex-ru';

    const fileName = loader.getNamePage(address);
    return expect(fileName).toBe(expected);
  });
});

describe('Converted local addres to name', () => {
  it('set 1: /courses', () => {
    const address = '/courses';
    const expected = 'courses';

    const fileName = loader.getNameAttr(address);
    return expect(fileName).toBe(expected);
  });
  it('set 2: /cgn-ccc/image.rt.img', () => {
    const address = '/cgn-ccc/image.rt.img';
    const expected = 'cgn-ccc-image-rt.img';

    const fileName = loader.getNameAttr(address);
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

  const outputFile = path.join(os.tmpdir(), `${loader.getNamePage(addressTest)}.html`);
  const actualFile = await fs.readFile(outputFile);

  expect(actualFile.toString()).toBe(expectedFile.toString());
});

const tagsResource = {
  link: { urlRes: '/local/courses', pathLocal: 'local/courses.html', contentType: 'text/html' },
  script: { urlRes: '/local/script.js', pathLocal: 'local/script.js', contentType: 'text/plain' },
  img: { urlRes: '/local/cats.jpg', pathLocal: 'local/cats.jpg', contentType: 'image/jpg' },
};

describe('Download page with resources', () => {
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
      const { urlRes, pathLocal, contentType } = tagsResource[key];
      const filePath = path.join(pathTemplate, pathLocal);
      nock(domain)
        .get(urlRes)
        .replyWithFile(
          200,
          filePath,
          { 'Content-Type': contentType },
        );
    });
  });

  test('Download resources', async () => {
    const addressTest = 'https://local.ru';
    const pageFileName = 'local-ru.html';

    await loadPage(addressTest, os.tmpdir());

    const actualPageFile = await fs.readFile(path.join(os.tmpdir(), pageFileName));
    const expectedPageFile = await fs.readFile(path.join(pathTemplate, pageFileName));

    expect(actualPageFile.toString()).toBe(expectedPageFile.toString());
  });
});

test('Download page with wrong response statusCode', async () => {
  nock('https://host')
    .get('/test')
    .reply(301);

  const addressTest = 'https://host/test';

  await expect(loadPage(addressTest, os.tmpdir())).rejects.toThrowErrorMatchingSnapshot();
});

describe('Download resources with errors', () => {
  const domain = 'https://localWrong.ru';
  const wrongStatus = 404;
  beforeAll(() => {
    _.keys(tagsResource).forEach((key) => {
      const { urlRes } = tagsResource[key];
      nock(domain)
        .get(urlRes)
        .reply(wrongStatus);
    });
  });

  _.keys(tagsResource).forEach(async (key) => {
    test(`Wrong response for tag ${key}`, async () => {
      const { urlRes } = tagsResource[key];
      const addressTest = url.resolve(domain, urlRes);

      const actualResponse = await loader.loadArraybufferResource(addressTest, os.tmpdir());
      expect(actualResponse).toMatch(`${wrongStatus.toString()}`);
    });
  });

  test('Test with no access to the local directory', async () => {
    const testLocalFile = 'localRes.html';
    const localePagePath = path.join(pathTemplate, testLocalFile);
    nock(domain)
      .get('/')
      .replyWithFile(
        200,
        localePagePath,
        { 'Content-Type': 'text/html' },
      );

    const pathDirLocal = path.join(os.tmpdir(), `${loader.getNamePage(domain)}_files`);
    await fs.mkdir(pathDirLocal);

    await expect(loadPage(domain, os.tmpdir())).rejects.toThrowErrorMatchingSnapshot();
  });
});
