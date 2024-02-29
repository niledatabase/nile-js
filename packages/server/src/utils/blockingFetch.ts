import http from 'http';
import https from 'https';
// startup fetch to be sure everything is set before we continue
export default function blockingFetch(url: string): object {
  if (process.env.NODE_ENV === 'TEST') {
    return {};
  }
  const protocol = url.startsWith('https') ? https : http;

  // Synchronously read the response data
  const data = protocol
    .get(url, (res) => {
      if (res.statusCode !== 200) {
        throw new Error(`Failed to fetch data: ${res.statusCode}`);
      }

      let rawData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          // Parse the response data
          const parsedData = JSON.parse(rawData);
          return parsedData;
        } catch (error) {
          if (error instanceof Error) {
            throw new Error('Error parsing response data:', error);
          }
        }
      });
    })
    .on('error', (error) => {
      throw new Error('Error fetching data:', error);
    });
  return data;
}
