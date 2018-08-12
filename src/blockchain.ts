import { SHA256 } from "crypto-js";

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
    networkNodes: string[] = [];


    constructor(private currentNodeUrl: string) {
        this.createNewBlock(100, "0", "0")
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

    public proofOfWork(previousBlockHash: string, currentBlockData: ITransaction[]): {nonce: number, hash: string} {
        let nonce = -1;
        let hash: string = "";
        do {
            ++nonce;
            hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        } 
        while (hash.substring(0, 4) !== "0000");
        return {nonce, hash};
    }
}

export { IBlock, ITransaction, Blockchain };