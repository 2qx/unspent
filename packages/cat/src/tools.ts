// Copyright © 2019 Mael Nison

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// https://github.com/arcanis/clipanion/blob/e32ee0143363414f0ef796fac11c954cac14ba48/tests/tools.ts

import getStream from 'get-stream';
import { PassThrough } from 'stream';

import { Cli, CommandClass, Command, RunContext } from 'clipanion';

export const log = <T extends Command>(command: T, properties: Array<keyof T> = []) => {
  command.context.stdout.write(`Running ${command.constructor.name}\n`);

  for (const property of properties) {
    command.context.stdout.write(`${JSON.stringify(command[property])}\n`);
  }
};

export const useContext = async (cb: (context: RunContext) => Promise<number>) => {
  const stream = new PassThrough();
  const promise = getStream(stream);

  const exitCode = await cb({
    stdin: process.stdin,
    stdout: stream,
    stderr: stream,
  });

  stream.end();

  const output = await promise;

  if (exitCode !== 0)
    throw new Error(output);

  return output;
};

export const runCli = async (cli: Cli | (() => Array<CommandClass>), args: Array<string>) => {
  let finalCli: Cli;

  if (typeof cli === `function`) {
    finalCli = new Cli();

    for (const command of cli()) {
      finalCli.register(command);
    }
  } else {
    finalCli = cli;
  }

  return await useContext(async context => {
    return await finalCli.run(args, context);
  });
};