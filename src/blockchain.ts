import { SHA256 } from "crypto-js";
import { NetworkNodeProxy } from "./network-node-proxy";

interface IBlock {
    index: number;
    timestamp: Date;
    transactions: ITransaction[];
    nonce: number;
    hash: string;
    previousBlockHash: string;
}

interface ITransaction {
    amount: number;
    sender: string;
    recipient: string;
}

class Blockchain {
    chain: IBlock[] = [];
    pendingTransactions: ITransaction[] = [];
    networkNodeProxies: NetworkNodeProxy[] = [];

    constructor(private _currentNodeUrl: string) {
        this.createNewBlock(100, "0", "0");
    }

    public async registerNode(newNodeUrl: string): Promise<void> {
        const proxy = this.registerAndgetNodeProxy(newNodeUrl);
        await this.broadcastNode(newNodeUrl);
        await proxy.registerNodesBulk(this.networkNodeProxies.map(p => p.baseUrl));
    }

    private registerAndgetNodeProxy(newNodeUrl: string): NetworkNodeProxy {
        let proxy = this.networkNodeProxies.find(p => p.baseUrl === newNodeUrl);
        if (!proxy) {
            proxy = new NetworkNodeProxy(newNodeUrl);
            this.networkNodeProxies.push(proxy);
        }
        return proxy;
    }

    private async broadcastNode(newNodeUrl: string): Promise<void> {
        const promises = this.networkNodeProxies.map(proxy => proxy.registerNode(newNodeUrl));
        await Promise.all(promises);
    }

    public createNewBlock(nonce: number, previousBlockHash: string, hash: string): IBlock {
        const newBlock: IBlock = {
            index: this.chain.length + 1,
            timestamp: new Date(),
            transactions: this.pendingTransactions,
            nonce,
            hash,
            previousBlockHash
        }
        this.pendingTransactions = [];
        this.chain.push(newBlock);
        return newBlock;
    }

    public getLastBlock(): IBlock {
        return this.chain[this.chain.length - 1];
    }

    public createNewTransaction(amount: number, sender: string, recipient: string): number {
        const newTransaction: ITransaction = {
            amount,
            sender,
            recipient
        }
        this.pendingTransactions.push(newTransaction);
        return this.getLastBlock().index + 1;
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
        while (hash.substring(0, 4) !== "0000");
        return { nonce, hash };
    }
}

export { IBlock, ITransaction, Blockchain };