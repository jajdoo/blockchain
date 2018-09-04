import { ITransaction, IBlock } from "./blockchain";

import * as bodyParser from "body-parser";
import { Express, Request, Response } from "express";

import express = require('express');
import { NetworkNodeController } from "./network-node-controller";
require('express-async-errors');

export interface ITransactionCreateRequest {
    amount: number;
    sender: string;
    recipient: string;
}

const endpoints = {
    blockchainEndpoint: "/blockchain",
    TransactionEndpoint: "/transaction",
    TransactionBroadcastEndpoint: "/transaction/broadcast",
    mineEndpoint: "/mine",
    receiveNewBlockEndpoint: "/receive-new-block",
    registerAndBroadcastNodeEndpoint: "/register-and-broadcast-node",
    registerNodeEndpoint: "/register-node",
    registerNodesBulkEndpoint: "/register-nodes-bulk"
};

function getNetworkNodeServer(currentNodeUrl: string): Express {

    const controller = new NetworkNodeController(currentNodeUrl);
    const server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: false }));

    server.get(endpoints.blockchainEndpoint, (req: Request, res: Response) => {
        const bitcoin = controller.getBlockChain();
        res.send(bitcoin);
    });

    server.post(endpoints.TransactionEndpoint, (req: Request, res: Response) => {
        let tx: ITransaction = req.body;
        console.log(`${endpoints.TransactionEndpoint} -> transaction: ${JSON.stringify(tx)}`);
        const index = controller.PostTransaction(tx);
        res.json({ note: `transaction created in block number ${index}` });
    });

    server.post(endpoints.TransactionBroadcastEndpoint, async (req: Request, res: Response) => {
        let tx: ITransactionCreateRequest = req.body;
        console.log(`${endpoints.TransactionBroadcastEndpoint} -> transaction: ${JSON.stringify(tx)}`);
        const index = await controller.transactionBroadcast(tx);
        res.json({ note: `transaction created in block number ${index} and broadcasted` });
    });

    server.post(endpoints.mineEndpoint, async (req: Request, res: Response) => {
        console.log(`${endpoints.mineEndpoint}`);
        const newBlock = await controller.mine();
        res.json({
            note: `new block mined`,
            block: newBlock
        });
    });

    server.post(endpoints.receiveNewBlockEndpoint, async (req: Request, res: Response) => {
        const newBlock: IBlock = req.body;
        console.log(`${endpoints.receiveNewBlockEndpoint} -> block ${JSON.stringify(newBlock)}`);
        if (await controller.tryReceiveNewBlock(newBlock)) {
            res.json({
                note: `new block accepted`,
                block: newBlock
            });
        } else {
            res.status(406)
                .json({
                    note: `new block rejected`
                })
        }
    });

    server.post(endpoints.registerAndBroadcastNodeEndpoint, async (req: Request, res: Response) => {
        const newNodeUrl = req.body.newNodeUrl;
        console.log(`${endpoints.registerAndBroadcastNodeEndpoint} -> newNodeUrl ${newNodeUrl}`);
        try {
            await controller.registerAndBroadcastNode(newNodeUrl);
            res.json({ node: `new node registered` })
        } catch (e) {
            res.status(500).json({ note: e });
        }
    });

    server.post(endpoints.registerNodeEndpoint, (req: Request, res: Response) => {
        const newNodeUrl = req.body.newNodeUrl;
        console.log(`${endpoints.registerNodeEndpoint} -> newNodeUrl ${newNodeUrl}`);
        controller.registerNode(newNodeUrl);
        res.json({ note: "new node registered successfuly." });
    });

    server.post(endpoints.registerNodesBulkEndpoint, (req: Request, res: Response) => {
        const allNetworkNodes = req.body.allNetworkNodes;
        console.log(`${endpoints.registerNodesBulkEndpoint} -> allNetworkNodes [${allNetworkNodes}]`);
        controller.registerNodesBulk(allNetworkNodes);
        res.json({ note: "bulk registeration successful." });
    });

    return server;
}

export { getNetworkNodeServer, endpoints }