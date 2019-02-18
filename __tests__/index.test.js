import path from 'path';
import nock from 'nock';
import os from 'os';
import { promises as fs } from 'fs';
import loadPage, { getNamePage } from '../src';

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
