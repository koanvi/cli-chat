//CLIENT

import { Client } from "./client"
import readline from 'readline-promise';

//at console:
//npm run runClient
(async function () { await Main(); })();

async function Main() {
  try {

    console.log(`You can read log messages here and mesages from chat.`);
    console.log(`You can send messages`);
    const client = new Client();
    client.onStateChanged.on("onStateChanged", stateChanged);
    await client.connect();

    testConsole(client);
    // process.argv
  } catch (error) {
    console.error(`❌ ${(error as Error).message}`)
  }
}

function stateChanged(client: Client) {
  console.log(`\r\n[log]:✅${client.stage}`);
}

async function testConsole(client: Client) {

  const rlp = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const msg = {
    message: null,
    recipientId: null,
  };

  // if (!msg.recipientId) {
  //   question = "you print recipientId";
  // }

  // if (!msg.message) {
  //   question = "you print message text";
  // }
  // send(client);return;
  while (true) {
    await rlp.questionAsync("enter message").then(answer => {
      msg.message = answer;
    });
    await rlp.questionAsync("enter recipientId").then(answer => {
      msg.recipientId = answer;
    });

    try {
      console.log(`[sending]: ✅ ${msg.message} to ${msg.recipientId}`);

      client.sendMessage({ message: msg.message, recipientId: msg.recipientId });
    } catch (error) { console.error(`❌ ${(error as Error).message}`) }

  }

  return;
  readline.question("question", blablabla => {
    console.log(`message ${msg.message}, recipientId${msg.recipientId}`)
    if (!msg.recipientId) {
      console.log("👽⚡ - need recipientId");
      return;
    }
    if (!msg.message) {
      console.log("👽⚡ - need message text");
      return;
    }
    try {
      console.log(`[sending]: ✅ ${blablabla}`)
      client.sendMessage({ message: msg.message, recipientId: msg.recipientId });
    } catch (error) { console.error(`❌ ${(error as Error).message}`) }

  });
}

function send(client: Client) {
  const msg = {
    message: "test message",
    recipientId: -1,
  }
  try {
    client.sendMessage({ message: msg.message, recipientId: msg.recipientId });
  } catch (error) {
    console.error(`❌ ${(error as Error).message}`);
  }

}