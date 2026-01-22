import io from 'socket.io-client';

let socket;

export const initSocket = (userId) => {  
    return socket = io('http://localhost:5000', {
        query: {
            userId
        }
    })
}

export const getSocket = () => socket;