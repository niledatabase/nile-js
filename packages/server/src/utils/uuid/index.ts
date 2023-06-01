import base from 'base-x';

type Prefix = 'usr_' | 'ten_';

const base62 = base(
  // order matters with these values
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
);

function pad(buf: string) {
  return `${'0'.repeat(32)}${buf}`.slice(-32);
}

export function decode(input: string) {
  const [, id] = input.split(/[_-]/, 2);
  const res = pad(Buffer.from(base62.decode(id)).toString('hex'));
  return `${res.slice(0, 8)}-${res.slice(8, 12)}-${res.slice(
    12,
    16
  )}-${res.slice(16, 20)}-${res.slice(20)}`;
}

export function encode(input: string, prefix: Prefix) {
  const buf = Buffer.from(input.replace(/-/g, ''), 'hex');
  const res = pad(base62.encode(buf));
  return `${prefix}${res.slice(10, res.length)}`;
}

export type UUID = {
  decode: (string: string) => string;
  encode: (string: string) => string;
};
