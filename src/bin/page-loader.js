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
    .catch((error) => {
      console.error(error.message);
    }));
programm.parse(process.argv);
