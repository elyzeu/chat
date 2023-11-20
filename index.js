const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs').promises;  

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let messages = [];


async function readMessagesFromFile() {
    try {
        const data = await fs.readFile('messages.json', 'utf-8');
        messages = JSON.parse(data);
        console.log('Mensagens lidas com sucesso:', messages);
    } catch (error) {
        if (error.code === 'ENOENT') {
       
            console.log('Arquivo de mensagens não encontrado. Criando um novo.');
            await saveMessagesToFile();
        } else {
            console.error('Erro ao ler mensagens do arquivo:', error.message);
        }
    }
}


readMessagesFromFile();

io.on('connection', (socket) => {
    console.log('Novo usuário conectado');


    socket.emit('load more', messages);

socket.on('chat message', (data) => {
    const currentTime = getCurrentTime();
    const messageData = { nickname: data.nickname, message: data.message, time: currentTime };
    messages.push(messageData);
    io.emit('chat message', messageData);


    saveMessagesToFile();
});



    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
    });
});

const PORT = process.env.PORT || 80;
server.listen(PORT, () => {
    console.log(`Servidor ouvindo na porta ${PORT}`);
});

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

async function saveMessagesToFile() {

    try {
        await fs.writeFile('messages.json', JSON.stringify(messages));
        console.log('Mensagens salvas com sucesso.');
    } catch (err) {
        console.error('Erro ao salvar mensagens no arquivo:', err.message);

    }
}
