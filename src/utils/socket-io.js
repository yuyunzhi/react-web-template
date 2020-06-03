import SocketIO from 'socket.io-client';

// 心跳检测
const heartCheck = (socket, userId) => {
  let timeout = 0;

  setInterval(() => {
    if (timeout <= 0) {
      socket.emit('refresh', { userId });
      timeout = 30;
    } else {
      timeout -= 1;
    }
  }, 1000);
};

function SocketIOClient(url, userId, token) {
  const socket = SocketIO(url, {
    transports: ['websocket', 'polling', 'flashsocket']
  });

  this.url = url;
  this.userId = userId;
  this.token = token;
  this.socket = socket;
}

// 打开连接&发送握手事件
SocketIOClient.prototype.openConnect = function () {
  const { socket } = this;
  const { userId } = this;
  const { token } = this;

  socket.on('connect', () => {
    heartCheck(socket, userId);
    // 发送握手事件
    socket.emit('handshake', { token: userId, auth: token }, res => {});
  });
};

// 接收消息
SocketIOClient.prototype.receive = function (socketStore) {
  const { socket } = this;
  socket.on('notification', ({ payload }) => {
    // alert(payload)
    if (!payload) return;
    // 拿到数据通知 前端
    socketStore.setSocketDetail(payload);
  });
};

export default SocketIOClient;

// 使用方式 初始化注册
//   const socket = new SocketIO(process.env.REACT_SOCKET_DOMAIN, userId, accessToken)
//   socket.openConnect()
//   socket.receive(socketStore)
