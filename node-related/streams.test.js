const fs = require('fs');
const { Readable, finished } = require('stream');
const { promisify } = require('util');

async function handleChunks(cb, stream) {
  for await(const chunk of stream) {
    cb(chunk);
  }
}

describe('streams', () => {
  it('handles readable stream', async () => {
    const readableStream = fs.createReadStream(
      './node-related/stream.test.txt',
      {
        encoding: 'utf-8',
        highWaterMark: 2,
      },
    );
    let content = '';
    
    await handleChunks(chunk => content += chunk, readableStream);
    expect(content).toBe('test');
  })
  it('create stream from async iterator', async () => {
    async function* generate() {
      yield 'test';
    }

    const readableStream = Readable.from(generate());

    readableStream.on('data', chunk => expect(chunk).toBe('test'));
  })
  it('creates simple write stream', async () => {
    const writableStream = fs.createWriteStream('./node-related/stream.test2.txt');

    writableStream.write('content');
    writableStream.end();

    const readableStream = fs.createReadStream(
      './node-related/stream.test2.txt',
      {
        encoding: 'utf-8',
        highWaterMark: 2,
      },
    );
    let content = '';
    
    await handleChunks(chunk => content += chunk, readableStream);
    expect(content).toBe('content');
  })
  it('create write stream from iterator', async () => {
    const whenFinish = promisify(finished);

    async function writeIterableToFile(iterable, pathToFile) {
      const writableStream = fs.createWriteStream(pathToFile);

      for await(const chunk of iterable) {
        writableStream.write(chunk);
      }
      writableStream.end();

      await whenFinish(writableStream);
    }

    
  })
})

