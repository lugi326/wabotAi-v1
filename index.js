const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

let qrCode = null;
async function connectWhatsapp() {
  const auth = await useMultiFileAuthState("session");
  const socket = makeWASocket({
    printQRInTerminal: false, // Ubah menjadi false
    browser: ["DAPABOT", "", ""],
    auth: auth.state,
    logger: pino({ level: "silent" }),
  });

  socket.ev.on("creds.update", auth.saveCreds);
  socket.ev.on("connection.update", async ({ connection, qr }) => {
    if (connection === 'open') {
      console.log("WhatsApp Active..");
      qrCode = null; // Reset QR code ketika sudah terhubung
    } else if (connection === 'close') {
      console.log("WhatsApp Closed..");
      setTimeout(connectWhatsapp, 10000);
    } else if (connection === 'connecting') {
      console.log('WhatsApp Connecting');
    }
    if (qr && !qrCode) {
      console.log('New QR Code generated');
      qrCode = qr;
      fs.writeFileSync('qr.txt', qr);
    }

    socket.ev.on("messages.upsert", ({messages})=>{
        const pesan = messages[0].message.conversation
        const phone =  messages[0].key.remoteJid
        console.log(messages[0])
        if(!messages[0].key.fromMe){
        query({"question": pesan}).then(async (response) => {
            console.log(response);
            const {text} = response
            await socket.sendMessage(phone, { text: text })
        });
    }
    return

    }) 


  });

  // ... (kode lainnya tetap sama)
}
async function query(data) {
    const response = await fetch(
        "https://geghnreb.cloud.sealos.io/api/v1/prediction/28a6b79e-bd21-436c-ae21-317eee710cb0",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}

connectWhatsapp();

module.exports = { connectWhatsapp, getQRCode: () => qrCode };