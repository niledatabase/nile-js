import { encode, decode } from './';

describe('uuid', () => {
  const RAW = 'usr_02tDeRKHVJ5Ljp3GKoqdmI';
  const BASE = '01882a67-5062-739b-a5c6-e36061a997ce';
  it('encodes', () => {
    expect(encode(BASE, 'usr_')).toEqual(RAW);
  });
  it('decodes', () => {
    expect(decode(RAW)).toEqual(BASE);
  });
});
