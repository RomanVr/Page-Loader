[![Build Status](https://travis-ci.org/RomanVr/project-lvl3-s406.svg?branch=master)](https://travis-ci.org/RomanVr/project-lvl3-s406)
[![Maintainability](https://api.codeclimate.com/v1/badges/0d232f4641791ae44cba/maintainability)](https://codeclimate.com/github/RomanVr/project-lvl3-s406/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/0d232f4641791ae44cba/test_coverage)](https://codeclimate.com/github/RomanVr/project-lvl3-s406/test_coverage)
# project-lvl3-s406
---
This utility allows you to download pages from the network to the directory (output).

## Install
---
Type a command in the terminal:
`git clone https://github.com/RomanVr/project-lvl3-s406.git`

go to the folder you created: `cd project-lvl3-s394`

then sequentially: `make install` `make build` `sudo npm link`

you can run the utility

## Usage
---
page-loader [options] `<address>`

Options:

    * -V, --version        output the version number

    * -o, --output [dir]  Directory destination (default: "<current directory>")

    * -h, --help           output usage information

to usage with debug logging: DEBUG=page-loader page-loader [options] `address`

[Sample usage](https://asciinema.org/a/Usa88CsFQopZSp9U3HxLW52vq)

[Sample usage with debug ](https://asciinema.org/a/xSFwj5YzWEtSoIJpMRLj3fsqE)

[Error handling with tests](https://asciinema.org/a/6Dgof4AP41qa2Ufpobllm2tcG)
