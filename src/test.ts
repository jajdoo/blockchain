

import request from "superagent";
import { endpoints, ITransactionCreateRequest } from "./network-node-server";

const servers = [
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005"
];

async function test() {
    await registerServer(servers[0], servers[1]);
    await registerServer(servers[0], servers[2]);
    await registerServer(servers[0], servers[3]);
    await registerServer(servers[0], servers[4]);
    await tx(servers[0], { amount: 1, recipient: "gal", sender: "nir" });
    await tx(servers[2], { amount: 454, recipient: "omer", sender: "nir" });
}

test();

async function tx(serverUrl: string, tx: ITransactionCreateRequest) {
    try {
        console.log(`registering ${serverUrl}`)
        const response = await request
            .post(`${serverUrl}${endpoints.TransactionBroadcastEndpoint}`)
            .type("json")
            .send(tx);

        console.log(JSON.stringify(response.body));
    } catch (e) {
        console.log(`tx broadcast failed ${e}`);
        throw e;
    }
}

async function registerServer(where: string, newNodeUrl: string) {
    try {
        console.log(`registering ${newNodeUrl}`)
        const response = await request
            .post(`${where}${endpoints.registerAndBroadcastNodeEndpoint}`)
            .type("json")
            .send({ newNodeUrl });

        console.log(JSON.stringify(response.body));
    } catch (e) {
        console.log(`failed register ${e}`);
        throw e;
    }
}
