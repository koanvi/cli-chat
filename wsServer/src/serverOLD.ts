//SERVER

//вариант для клиентов с белыми айпишками
//сервер должен "видеть" (иметь возможность инициировать подключение) к клиентам

import net from "net";


const clients: any[] = [];

// createServer();
export function createServer() {
  const wsServer = net.createServer((socket) => {
    socket.write('Server is listening!\r\n');

    socket.on('data', function (data) {
      console.log('CLIENT:', data.toString());
    });

    socket.pipe(socket);
  });

  wsServer.listen(1337, '127.0.0.1');
}

function registerClient(params: any) {
  if (!params?.ip) { throw new Error("no ip param"); }
  if (!params?.port) { throw new Error("no port param"); }
  if (!params?.id) { throw new Error("no id param"); }

  // const doubleClient = clients.find(function (el) { return el.id == params.id });
  // if (doubleClient) { throw new Error("client already exists"); }
  if (clients[params.id]) { throw new Error("client already exists"); }

  clients[params.id] = {
    id: params.id,
    port: params.port,
    ip: params.ip,
  };

}

function gotMessage(params: any): any {

  const msg = JSON.parse(params.data);
  if (!msg?.id) { throw new Error("no id param"); }
  if (!params?.id) { throw new Error("no id param"); }


}

function sendMessage(params: any) {

  let client = new net.Socket();

  client.connect(params.port, params.ip, function () {
    console.log('Connected');
    // client.write('Hello, server! Love, Client.');
  });
  client.on('data', function (data) {
    // console.log('Received: ' + data);
    const answer = gotMessage({ data });

    client.destroy(); // kill client after server's response
  });

  client.on('close', function () {
    console.log('Connection closed');
  });

}


