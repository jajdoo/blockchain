import { Request, Response } from "express";

import express = require('express');

const server = express();
server.get('/', (req: Request, res: Response) => {
    // Reply with a hello world when no name param is provided
    res.send('Hello, World!');
});

export {server}