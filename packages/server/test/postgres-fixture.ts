import { createServer, Socket } from 'net';
import { createSecureContext, TLSSocket } from 'tls';

// The peer records authentication and simple queries without evaluating SQL.
// The SDK uses the real pg driver, including SSL and connection callbacks.
export async function postgresFixture(
  tls?: { key: Buffer; cert: Buffer },
  auth: {
    method?: 'oauth' | 'cleartext' | 'md5' | 'scram' | 'trust';
    failure?: string;
    onStartup?: () => void;
  } = {}
) {
  const passwords: string[] = [];
  const sasl: { mechanism: string; length: number; response: Buffer }[] = [];
  const acknowledgements: Buffer[] = [];
  const queries: string[] = [];
  const sockets = new Set<Socket>();
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.on('error', () => socket.destroy());
    if (tls) {
      socket.once('data', (request) => {
        if (request.length !== 8 || request.readInt32BE(4) !== 80877103) {
          socket.destroy();
          return;
        }
        socket.write('S');
        const secure = new TLSSocket(socket, {
          isServer: true,
          secureContext: createSecureContext(tls),
        });
        sockets.add(secure);
        secure.on('close', () => {
          sockets.delete(secure);
          socket.destroy();
        });
        secure.on('error', () => {
          secure.destroy();
          socket.destroy();
        });
        authenticate(secure);
      });
    } else {
      authenticate(socket);
    }
  });
  function authenticate(socket: Socket) {
    let buffer = Buffer.alloc(0);
    let startup = true;
    let challenged = false;
    let transactionStatus = 73;
    function authentication(code: number, payload = Buffer.alloc(0)) {
      const header = Buffer.alloc(9);
      header[0] = 82;
      header.writeInt32BE(8 + payload.length, 1);
      header.writeInt32BE(code, 5);
      socket.write(Buffer.concat([header, payload]));
    }
    socket.on('data', (data) => {
      buffer = Buffer.concat([buffer, data]);
      for (;;) {
        if (startup) {
          if (buffer.length < 4 || buffer.length < buffer.readInt32BE(0))
            return;
          buffer = buffer.subarray(buffer.readInt32BE(0));
          startup = false;
          auth.onStartup?.();
          if (auth.method === 'oauth' || auth.method === 'scram') {
            authentication(
              10,
              Buffer.from(
                auth.method === 'oauth'
                  ? 'OAUTHBEARER\0\0'
                  : 'SCRAM-SHA-256\0\0'
              )
            );
          } else if (auth.method === 'md5') {
            authentication(5, Buffer.from([1, 2, 3, 4]));
          } else if (auth.method === 'trust') {
            authentication(0);
            socket.write(Buffer.from([90, 0, 0, 0, 5, 73]));
          } else {
            authentication(3);
          }
        } else {
          if (buffer.length < 5 || buffer.length < buffer.readInt32BE(1) + 1)
            return;
          const length = buffer.readInt32BE(1) + 1;
          if (buffer[0] === 112) {
            if (challenged) {
              acknowledgements.push(Buffer.from(buffer.subarray(5, length)));
              const payload = Buffer.from(
                'SFATAL\0C28P01\0Mprivate bearer token\0\0'
              );
              const header = Buffer.alloc(5);
              header[0] = 69;
              header.writeInt32BE(4 + payload.length, 1);
              socket.end(Buffer.concat([header, payload]));
            } else if (auth.method === 'oauth' || auth.method === 'scram') {
              const terminator = buffer.indexOf(0, 5);
              sasl.push({
                mechanism: buffer.subarray(5, terminator).toString(),
                length: buffer.readInt32BE(terminator + 1),
                response: Buffer.from(buffer.subarray(terminator + 5, length)),
              });
              if (auth.failure) {
                challenged = true;
                authentication(11, Buffer.from(auth.failure));
              } else {
                authentication(0);
                socket.write(Buffer.from([90, 0, 0, 0, 5, 73]));
              }
            } else {
              passwords.push(buffer.subarray(5, length - 1).toString());
              authentication(0);
              socket.write(Buffer.from([90, 0, 0, 0, 5, 73]));
            }
          } else if (buffer[0] === 81) {
            const query = buffer.subarray(5, length - 1).toString();
            queries.push(query);
            const command = query.trim().split(/\s+/)[0].toUpperCase();
            if (command === 'BEGIN') transactionStatus = 84;
            if (command === 'COMMIT' || command === 'ROLLBACK')
              transactionStatus = 73;
            const tag = Buffer.from(
              `${command === 'SELECT' ? 'SELECT 0' : command}\0`
            );
            const tagLength = Buffer.alloc(4);
            tagLength.writeInt32BE(tag.length + 4);
            socket.write(
              Buffer.concat([
                Buffer.from([67]),
                tagLength,
                tag,
                Buffer.from([90, 0, 0, 0, 5, transactionStatus]),
              ])
            );
          } else if (buffer[0] === 88) {
            socket.end();
          }
          buffer = buffer.subarray(length);
        }
      }
    });
  }
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Fixture port unavailable.');
  return {
    port: address.port,
    passwords,
    sasl,
    acknowledgements,
    queries,
    close: async () => {
      sockets.forEach((socket) => socket.destroy());
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
