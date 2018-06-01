# Node js micro server for slothking

This server is based on great [zeit/micro](https://github.com/zeit/micro) library. This is kind of type guard for your project. It is also best nodejs server to use with typescript version of [slothking.online](https://slothking.online)

## Installation

```sh
$ npm install @slothking-online/node
```

## Usage

```ts
import run from "@slothking-online/node";
import { mailbase, users, sloth } from "./slothking";
export default run([users, mailbase, sloth], process.env.MONGO);
```

## Editor

If you like this project I invite you to check slothking visual api designer demo on  [slothking.online](https://slothking.online) website