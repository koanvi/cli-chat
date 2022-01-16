//SERVER

import { createServer } from "./serverOLD";
import { Server as SimpleServer } from "./server";

main();
function main() {
  // createServer();
  new SimpleServer();

}

function testDelete() {
  const clients: { [key: string]: any } = {};
  clients["asd"] = { id: 1 }
  clients["qwe"] = { id: 2 }
  let toRemoveKey = Object.keys(clients).find(key => clients[key].id == 1);
  if (toRemoveKey) {
    delete clients[toRemoveKey];
  }
  console.log(clients);

}