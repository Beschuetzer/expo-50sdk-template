import { getS3ObjectKey } from './helpers';

describe('getS3ObjectKey', () => {
  test('it works', async () => {
    const objKey =
      '67597d722dd5447f76e93836/edd28da3-de27-452d-b20a-f11bfb60e1e6.jpeg';
    const url = `https://grocify.s3.us-east-1.amazonaws.com/${objKey}`;
    const actual = getS3ObjectKey(url);
    expect(actual).toStrictEqual(objKey);
  });
  test('it works without https', async () => {
    const objKey =
      '67597d722dd5447f76e93836/edd28da3-de27-452d-b20a-f11bfb60e1e6.jpeg';
    const url = `grocify.s3.us-east-1.amazonaws.com/${objKey}`;
    const actual = getS3ObjectKey(url);
    expect(actual).toStrictEqual(objKey);
  });
  test('it works without most of the stuff', async () => {
    const objKey =
      '67597d722dd5447f76e93836/edd28da3-de27-452d-b20a-f11bfb60e1e6.jpeg';
    const url = `amazonaws.com/${objKey}`;
    const actual = getS3ObjectKey(url);
    expect(actual).toStrictEqual(objKey);
  });
});
