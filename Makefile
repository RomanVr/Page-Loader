address="https://hexlet.io/courses"

start:
		npx babel-node -- src/bin/page-loader.js -h

start1:
		npx babel-node -- src/bin/page-loader.js $(address)

debug1:
		DEBUG=pageLoader npx babel-node -- src/bin/page-loader.js $(address)

start2:
		npx babel-node -- src/bin/page-loader.js https://yandex.ru

install:
		npm install

lint:
		npx eslint .

test:
		npm run test

test-coverage:
		npm test -- --coverage

testc:
		sudo DEBUG=pageLoader npm test -- --coverage

build:
		rm -rf dist
		npx babel src --out-dir dist

publish:
		npm publish

.PHONY: test
