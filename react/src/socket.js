import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
// eslint-disable-next-line no-undef
const URL = 'http://localhost:3001';

export const socket = io(URL);