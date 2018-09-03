import { endpoints } from "./network-node-server";
import request from "superagent";
import { ITransaction } from "./blockchain";

export class NetworkNodeProxy {
    get baseUrl(): string {
        return this._baseUrl;
    }

    public constructor(private _baseUrl: string) {
    }

    public async getBlockchain(): Promise<void> {
        // endpoints.blockchainEndpoint 
        throw Error("not implemented");
    }

    public async postTransaction(transaction: ITransaction): Promise<void> {
        try {
            await request
                .post(`${this.baseUrl}${endpoints.TransactionEndpoint}`)
                .type("json")
                .send(transaction);
        }
        catch (e) {
            console.log(`failed postTransaction to ${this.baseUrl}. error: ${e}`);
        }
    }

    public async mine(): Promise<void> {
        // endpoints.mineEndpoint
        throw Error("not implemented");
    }

    public async registerAndBroadcastNode(): Promise<void> {
        // endpoints.registerAndBroadcastNodeEndpoint
        throw Error("not implemented");
    }

    public async registerNode(newNodeUrl: string): Promise<void> {
        try {
            await request
                .post(`${this.baseUrl}${endpoints.registerNodeEndpoint}`)
                .type("json")
                .send({ newNodeUrl });
        }
        catch (e) {
            console.log(`failed registerNode to ${this.baseUrl}. error: ${e}`);
        }
    }

    public async registerNodesBulk(allNetworkNodes: string[]): Promise<void> {
        try {
            await request
                .post(`${this.baseUrl}${endpoints.registerNodesBulkEndpoint}`)
                .type("json")
                .send({ allNetworkNodes });
        }
        catch (e) {
            console.log(`failed registerNodesBulk to ${this.baseUrl}. error: ${e}`);
        }
    }
}