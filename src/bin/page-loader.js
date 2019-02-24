#!/usr/bin/env node
import programm from 'commander';
import loadPage from '..';

const currentDir = process.cwd();

programm
  .version('1.0.0')
  .description('Utility to download the address from the network')
  .option('-o, --output [dir]', 'Directory destination', currentDir)
  .arguments('<address>')
  .action(address => loadPage(address, programm.output)
    .then(nameFilePage => console.log(`Page was downloaded as '${nameFilePage}`))
    .catch((error) => {
      console.error(`${error.code}: ${error.message}`);
      process.exit(1);
    }));
programm.parse(process.argv);
