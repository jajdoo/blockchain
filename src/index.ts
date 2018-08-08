import { server } from "./api";

const port = 3001;

server.listen(port, function(){
    console.log(`listening on ${port}`)
});