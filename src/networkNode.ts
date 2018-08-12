import { ITransaction, Blockchain } from "./blockchain";

import { v4 as uuid } from 'uuid';
import * as bodyParser from "body-parser";
import { Express, Request, Response } from "express";

import express = require('express');



function getServer(currentNodeUrl: string): Express {

    const bitcoin = new Blockchain(currentNodeUrl);
    const nodeAddress = uuid().split("-").join("");
    
    const server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({extended: false}));
    
    server.get('/blockchain', (req: Request, res: Response) => {
        console.log('as');
        res.send(bitcoin);
    });

    server.post('/transaction', (req: Request, res: Response) => {
        let tx: ITransaction = req.body;
        const index = bitcoin.createNewTransaction(tx.amount, tx.sender, tx.recipient);
        res.json({note: `transaction create in block number ${index}`});
    });

    server.get('/mine', (req: Request, res: Response) => {
        const lastBlock = bitcoin.getLastBlock();
        const {nonce, hash} = bitcoin.proofOfWork(lastBlock.hash, bitcoin.pendingTransactions);
        bitcoin.createNewTransaction(12.5, "00", nodeAddress);
        const newBlock = bitcoin.createNewBlock(nonce, lastBlock.hash, hash);
        res.json({
            note: `new block mined`,
            block: newBlock
        });
    });

    server.post('/register-and-broadcast-node', (req: Request, res: Response) => {
        const newNodeUrl = req.body.newNodeUrl;
    });

    server.post('/register-node', (req: Request, res: Response) => {
        
    });

    return server;
}

export {getServer}