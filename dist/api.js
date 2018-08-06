"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var server = express();
exports.server = server;
server.get('/', function (req, res) {
    // Reply with a hello world when no name param is provided
    res.send('Hello, World!');
});
