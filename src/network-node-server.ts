import { ITransaction, Blockchain } from "./blockchain";

import { v4 as uuid } from 'uuid';
import * as bodyParser from "body-parser";
import { Express, Request, Response } from "express";

import express = require('express');
require('express-async-errors');

interface ITransactionCreateRequest {
    amount: number;
    sender: string;
    recipient: string;
}

const endpoints = {
    blockchainEndpoint: "/blockchain",
    TransactionEndpoint: "/transaction",
    TransactionBroadcastEndpoint: "/transaction/broadcast",
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
    server.use(bodyParser.urlencoded({ extended: false }));

    server.get(endpoints.blockchainEndpoint, (req: Request, res: Response) => {
        res.send(bitcoin);
    });

    server.post(endpoints.TransactionEndpoint, (req: Request, res: Response) => {
        let tx: ITransaction = req.body;
        console.log(`${endpoints.TransactionEndpoint} -> transaction: ${JSON.stringify(tx)}`);
        const index = bitcoin.addTransaction(tx);
        res.json({ note: `transaction created in block number ${index}` });
    });

    server.post(endpoints.TransactionBroadcastEndpoint, async (req: Request, res: Response) => {
        let tx: ITransactionCreateRequest = req.body;
        console.log(`${endpoints.TransactionBroadcastEndpoint} -> transaction: ${JSON.stringify(tx)}`);
        const transaction = bitcoin.createNewTransaction(tx.amount, tx.sender, tx.recipient);
        const index = bitcoin.addTransaction(transaction);
        await bitcoin.broadcastTransaction(transaction);
        res.json({ note: `transaction created in block number ${index}` });
    });

    server.get(endpoints.mineEndpoint, (req: Request, res: Response) => {
        console.log(`${endpoints.mineEndpoint}`);
        const lastBlock = bitcoin.getLastBlock();
        const { nonce, hash } = bitcoin.proofOfWork(lastBlock.hash, bitcoin.pendingTransactions);
        bitcoin.createNewTransaction(12.5, "00", nodeAddress);
        const newBlock = bitcoin.createNewBlock(nonce, lastBlock.hash, hash);
        res.json({
            note: `new block mined`,
            block: newBlock
        });
    });

    server.post(endpoints.registerAndBroadcastNodeEndpoint, async (req: Request, res: Response) => {
        const newNodeUrl = req.body.newNodeUrl;
        console.log(`${endpoints.registerAndBroadcastNodeEndpoint} -> newNodeUrl ${newNodeUrl}`);
        try {
            await bitcoin.registerAndBroadcastNode(newNodeUrl);
            res.json({ node: `new node registered` })
        } catch (e) {
            res.status(500).json({ note: e });
        }
    });

    server.post(endpoints.registerNodeEndpoint, (req: Request, res: Response) => {
        const newNodeUrl = req.body.newNodeUrl;
        console.log(`${endpoints.registerNodeEndpoint} -> newNodeUrl ${newNodeUrl}`);
        bitcoin.registerNode(newNodeUrl);
        res.json({ note: "new node registered successfuly." });
    });

    server.post(endpoints.registerNodesBulkEndpoint, (req: Request, res: Response) => {
        const allNetworkNodes = req.body.allNetworkNodes;
        console.log(`${endpoints.registerNodesBulkEndpoint} -> allNetworkNodes [${allNetworkNodes}]`);
        for (let nodeUrl of allNetworkNodes) {
            bitcoin.registerNode(nodeUrl);
        }
        res.json({ note: "bulk registeration successful." });
    });

    return server;
}

export { getNetworkNodeServer, endpoints, ITransactionCreateRequest }