import net from "net";
import events from "events";

export class Client {

  public clientId?: number;
  client: net.Socket;
  public isConnected: boolean = false;
  public isRegistered: boolean = false;
  public onStateChanged: events.EventEmitter;
  public messageList: any[] = [];
  public stage: string = "...";

  constructor() {

    this.onStateChanged = new events.EventEmitter();

    this.stageChange("creating");

    this.client = new net.Socket();
    this.client.on('data', data => { this.processResponse(data); });
    this.client.on('close', data => { this.stageChange("Connection closed"); });
    this.client.on('error', err => { throw new Error(err.message); });
    this.stageChange("not connected");

  }

  processResponse(data: any) {
    try {
      this.stageChange("got data");
      data = data.toString();
      data = JSON.parse(data);
      if (data.status == "error") { console.error(data.error.message); }

      switch (data.methodName) {
        case "registerClient": {
          this.isRegistered = true;
          this.clientId = data.clientId;
          console.log(data);
          this.onStateChanged.emit('registered', this);
          break;
        }
        case "sendMessage": {
          this.onStateChanged.emit('sendMessage', this);
          break;
        }
        case "newMessage": {
          this.messageList.push(data);
          console.log(data);
          this.onStateChanged.emit('newMessage', this);
          break;
        }

        default: { throw new Error("no data.methodName at responce"); break; }
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.onStateChanged.emit('gotData', this);
      this.stageChange("data processed");
    }
  }

  public async connect(): Promise<net.Socket> {

    return new Promise((resolve, reject) => {
      this.stageChange("connecting");
      if (this.isConnected) { resolve(this.client); }

      this.client.connect(1337, '127.0.0.1', () => {
        this.isConnected = true;
        this.stageChange("connected");
        this.onStateChanged.emit('connected', this);
        resolve(this.client);
      });

    });
  }

  stageChange(stage: string) {
    this.stage = stage;
    this.onStateChanged.emit('onStateChanged', this);

  }

  public disconnect() {
    this.stageChange("disconnecting...");
    this.client.destroy(); this.isConnected = false;
    this.stageChange("disconnected");
  }

  public sendMessage(params: any) {

    if (!params.message) { throw new Error("no message"); }
    if (!params.recipientId) { throw new Error("no recipientId"); }

    this.stageChange("sending message");
    if (!this.isConnected) { throw new Error("not connected"); }
    let toSend = {
      method: {
        name: "sendMessage",
        params: { msg: params.message, recipientId: params.recipientId },
      },
      clientId: this.clientId
    }

    this.client.write(JSON.stringify(toSend));
    this.stageChange("message sent");

  }

}








