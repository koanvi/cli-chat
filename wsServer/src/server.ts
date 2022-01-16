//SERVER

import net from "net";

export class Server {
  clients: Client[] = [];
  methodList: { [key: string]: any } = {};
  maxClientId: number = 0;

  constructor() {

    const server = this.createServer();

    this.registerMethods();

    //TODO адрес вытащить в параметры:
    const addres = { ip: "127.0.0.1", port: 1337 };
    server.listen(addres.port, addres.ip);
    console.log(`🚀🚀🚀 server started at ws://${addres.ip}:${addres.port}`);

  }

  createServer() {
    return net.createServer((socket: net.Socket) => {

      this.registerClient(socket);

      socket.on('data', (data: any) => { this.processRequest(data, socket); });

      socket.on('close', () => { this.unRegisterClient(socket); });

      socket.on('error', err => console.error(err));

    });

  }

  registerMethods() {
    this.methodList["sendMessage"] = this.sendMessage.bind(this);
    this.methodList["setName"] = this.setName.bind(this);
    this.methodList["getClientList"] = this.getClientList.bind(this);
  }

  registerClient(socket: net.Socket) {

    const response: any = {};
    response.methodName = "registerClient";

    try {
      if ((socket as any).clientId) { throw new Error("client already registered"); }

      const newClientId = ++this.maxClientId;

      (socket as any).clientId = newClientId;
      this.clients[newClientId] = { socket, clientId: newClientId };
      response.clientId = newClientId;
      response.status = "ok";

    } catch (error) {
      console.error(`🙀🙀🙀${(error as any).message}`);
      response.error = { message: `🙀🙀🙀${(error as any).message}` };
      response.status = "error";
    } finally {
      const dataToSend = JSON.stringify(response)
      console.log(dataToSend);
      socket.write(dataToSend);
    }

  }

  unRegisterClient(socket: net.Socket) {
    delete this.clients[(socket as any).clientId];
    console.log(`client ${(socket as any).clientId} quit`);
  }

  //первоначальная обработка запроса
  processRequest(data: any, socket: net.Socket) {

    const response: any = {};

    try {

      data = data.toString();
      data = JSON.parse(data);
      if (!data?.method?.name) { throw new Error("no method.name param"); }

      response.methodName = data.method.name;
      response.result = this.processMethod({ data, socket });

    } catch (error) {
      console.error(`🙀🙀🙀${(error as any).message}`);
      response.error = { message: `🙀🙀🙀${(error as any).message}` };
    } finally {
      const dataToSend = JSON.stringify(response)
      console.log(dataToSend);
      socket.write(dataToSend);
    }

  }

  //обработка и запуск метода
  processMethod(params: any) {

    const client = { clientId: (params.socket as any).clientId, socket: params.socket };

    return this.methodList[params.data.method.name](params.data.method?.params, client);

  }

  sendMessage(params: any, client: any) {
    if (!params?.msg) { throw new Error("no msg param"); }
    if (!params?.recipientId) { throw new Error("no recipientId param"); }
    const message: any = {
      message: params.msg,
      date: new Date().toISOString(),
      from: client.clientId,
      methodName: "newMessage",
    };

    if (params.recipientId == -1) {
      this.clients.forEach(element => {
        if (element.clientId == client.clientId) { return; }
        const dataToSend = JSON.stringify(message)
        console.log(dataToSend);
        this.clients[element.clientId].socket.write(dataToSend);
      });
    } else {
      const dataToSend = JSON.stringify(message)
      console.log(dataToSend);
      this.clients[params.recipientId].socket.write(dataToSend);
    }

    return ({ status: "ok" });

  }

  setName(params: any, client: any) {
    if (!params?.name) { throw new Error("no name param"); }
    this.clients[client.clientId].name = params.name.toString();
    return ({ status: "ok" });
  }

  getClientList() {
    return ({ status: "ok", clients: this.clients });
  }


}


class Client {
  public socket: net.Socket;
  public clientId: number;
  public name?: string;

}
class Socket extends net.Socket {
  public clientId: number;
  constructor(parameters) {
    super();
  }
}