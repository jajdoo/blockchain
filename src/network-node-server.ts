import { ITransaction, Blockchain } from "./blockchain";

import { v4 as uuid } from 'uuid';
import * as bodyParser from "body-parser";
import { Express, Request, Response } from "express";

import express = require('express');

const endpoints = {
    blockchainEndpoint: "/blockchain",
    TransactionEndpoint: "/transaction",
    mineEndpoint: "/mine",
    registerAndBroadcastNodeEndpoint: "/register-and-broadcast-node",
    registerNodeEndpoint: "/register-node",
    registerNodesBulkEndpoint: "/register-nodes-bulk"
};

function getNetworkNodeServer(currentNodeUrl: string): Express {
    const bitcoin = new Blockchain(currentNodeUrl);
    const nodeAddress = uuid().split("-").join("");
    
    const server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({extended: false}));
    
    server.get(endpoints.blockchainEndpoint, (req: Request, res: Response) => {
        res.send(bitcoin);
    });

    server.post(endpoints.TransactionEndpoint, (req: Request, res: Response) => {
        let tx: ITransaction = req.body;
        const index = bitcoin.createNewTransaction(tx.amount, tx.sender, tx.recipient);
        res.json({note: `transaction create in block number ${index}`});
    });

    server.get(endpoints.mineEndpoint, (req: Request, res: Response) => {
        const lastBlock = bitcoin.getLastBlock();
        const {nonce, hash} = bitcoin.proofOfWork(lastBlock.hash, bitcoin.pendingTransactions);
        bitcoin.createNewTransaction(12.5, "00", nodeAddress);
        const newBlock = bitcoin.createNewBlock(nonce, lastBlock.hash, hash);
        res.json({
            note: `new block mined`,
            block: newBlock
        });
    });

    server.post(endpoints.registerAndBroadcastNodeEndpoint, (req: Request, res: Response) => {
        const newNodeUrl = req.body.newNodeUrl;
        bitcoin.registerNode(newNodeUrl);
    });

    server.post(endpoints.registerNodeEndpoint, (req: Request, res: Response) => {

    });

    server.post(endpoints.registerNodesBulkEndpoint, (req: Request, res: Response) => {
        
    });

    return server;
}

export {getNetworkNodeServer, endpoints}