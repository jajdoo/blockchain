import { SHA256 } from "crypto-js";
import { v4 as uuid } from 'uuid';
import deepEqual from "deep-equal";

import { NetworkNodeClient } from "./network-node-client";

interface IBlock {
    index: number;
    timestamp: Date;
    transactions: ITransaction[];
    nonce: number;
    hash: string;
    previousBlockHash: string;
}

interface ITransaction {
    transactionId: string;
    amount: number;
    sender: string;
    recipient: string;
}

class Blockchain {
    private _chain: IBlock[] = [];
    private _pendingTransactions: ITransaction[] = [];
    private _networkNodeClients: NetworkNodeClient[] = [];

    get chain(): IBlock[] {
        return { ...this._chain };
    }

    get pendingTransactions(): ITransaction[] {
        return { ...this._pendingTransactions };
    }

    constructor(private _currentNodeUrl: string) {
        this.createNewBlock(100, "0", "0");
    }

    public tryAddBlock(newBlock: IBlock): boolean {
        const lastBlock = this.getLastBlock();
        const hashOk = newBlock.previousBlockHash === lastBlock.hash;
        const indexOk = lastBlock.index + 1 === newBlock.index;
        if (hashOk && indexOk) {
            this._chain.push(newBlock);
            this._pendingTransactions = [];
            return true;
        }
        return false;
    }

    public async registerAndBroadcastNode(newNodeUrl: string): Promise<void> {
        const proxy = this.registerAndGetNodeProxy(newNodeUrl);
        if (!proxy)
            throw "failed to register";

        await this.broadcastNode(newNodeUrl);
        await proxy.registerNodesBulk([this._currentNodeUrl, ...this._networkNodeClients.map(p => p.baseUrl)]);
    }

    public async registerNode(newNodeUrl: string): Promise<void> {
        this.registerAndGetNodeProxy(newNodeUrl);
    }

    public createNewBlock(nonce: number, previousBlockHash: string, hash: string): IBlock {
        const newBlock: IBlock = {
            index: this._chain.length + 1,
            timestamp: new Date(),
            transactions: this._pendingTransactions,
            nonce,
            hash,
            previousBlockHash
        }
        this._pendingTransactions = [];
        this._chain.push(newBlock);
        return newBlock;
    }

    public async broadcastBlock(block: IBlock): Promise<void> {
        const promises = this._networkNodeClients
            .map(proxy => proxy.receiveNewBlock(block));
        await Promise.all(promises);
    }

    public getLastBlock(): IBlock {
        return this._chain[this._chain.length - 1];
    }

    public createNewTransaction(amount: number, sender: string, recipient: string): ITransaction {
        return {
            transactionId: uuid().split("-").join(""),
            amount,
            sender,
            recipient
        }
    }

    public addTransaction(transaction: ITransaction): number {
        this._pendingTransactions.push(transaction);
        return this.getLastBlock().index + 1;
    }

    public async broadcastTransaction(transaction: ITransaction): Promise<void> {
        const promises = this._networkNodeClients
            .map(proxy => proxy.postTransaction(transaction));
        await Promise.all(promises);
    }

    private registerAndGetNodeProxy(newNodeUrl: string): NetworkNodeClient | undefined {
        let proxy = this._networkNodeClients.find(p => p.baseUrl === newNodeUrl);
        if (!proxy && this._currentNodeUrl !== newNodeUrl) {
            proxy = new NetworkNodeClient(newNodeUrl);
            this._networkNodeClients.push(proxy);
        }
        return proxy;
    }

    private async broadcastNode(newNodeUrl: string): Promise<void> {
        const promises = this._networkNodeClients
            .filter(proxy => proxy.baseUrl !== newNodeUrl)
            .map(proxy => proxy.registerNode(newNodeUrl));

        await Promise.all(promises);
    }

    private hashBlock(previousBlockHash: string, currentBlockData: ITransaction[], nonce: number): string {
        const dataAsString = `${previousBlockHash}${nonce}${JSON.stringify(currentBlockData)}`;
        const hash = SHA256(dataAsString);
        return hash.toString();
    }

    public proofOfWork(previousBlockHash: string, currentBlockData: ITransaction[]): { nonce: number, hash: string } {
        let nonce = -1;
        let hash: string = "";
        do {
            ++nonce;
            hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        }
        while (!this.hashIsCorrect(hash));
        return { nonce, hash };
    }

    private hashIsCorrect(hash: string) {
        return (hash.substring(0, 4) === "0000");
    }

    concensus(): void {
        this._networkNodeClients.map(c => c.get)
    }

    public chainIsValid(blockchain: IBlock[]): boolean {

        if (!this.genesisBlockConsistent(blockchain) || blockchain.length !== this._chain.length)
            return false;

        for (let i = 1; i < blockchain.length; ++i)
            if (!this.blocksHashConsistent(blockchain[i - 1], blockchain[i]))
                return false;

        return true;
    }

    private blocksHashConsistent(prevBlock: IBlock, currentBlock: IBlock): boolean {
        const recalculatedHash = this.hashBlock(prevBlock.hash, currentBlock.transactions, currentBlock.nonce);
        const recalculatedHashOk = this.hashIsCorrect(recalculatedHash);
        const hashInfoOk = currentBlock.previousBlockHash !== prevBlock.hash;
        return recalculatedHashOk && hashInfoOk;
    }

    private genesisBlockConsistent(blockchain: IBlock[]): boolean {
        return deepEqual(this._chain[0], blockchain[0]);
    }
}

export { IBlock, ITransaction, Blockchain };