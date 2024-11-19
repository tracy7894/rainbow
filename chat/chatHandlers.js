//聊天室
module.exports = (io) => {
const MessageData = require('../data/MessageData'); //

io.on('connection', async function(socket) {
 const groupId = socket.handshake.query.groupId || 'publicRoom';

 socket.join(groupId);
 console.log(`A user connected to room: ${groupId}`);


 if (!groupId) {
    console.error('No groupId provided');
    socket.disconnect();
    return;
  }
 socket.join(groupId);
 console.log(`A user connected to group: ${groupId}`);

try {
  const chatHistory = await MessageData.find({ groupId: groupId })
     .sort({ createdAt: -1 })  // 以時間倒序排列
     .limit(200);  // 最近 200 條訊息
     const orderedChatHistory = chatHistory.reverse();
  // 發送歷史記錄給當前用戶
  socket.emit('chatHistory',orderedChatHistory); // 返回升序排列的訊息
} catch (err) {
  console.error('讀取歷史記錄失敗:', err);
}

  // 處理文字消息
socket.on('message', async (msg) => {
    console.log('Received message:', msg);
    const newMessage = new MessageData({
          username: msg.username,
          message: msg.message,
          groupId:msg.groupId
      });

      // 儲存文字訊息
      newMessage.save()
          .then(() => {
              console.log('訊息已儲存到資料庫');
              io.to(msg.groupId).emit('message', msg)  
          })
          .catch(err => {
              console.error('儲存訊息失敗:', err);
          });
  });

  // 圖片
  socket.on('image', async(data) => {
    console.log(`${data.username} 發送了一張圖片 ${data.groupId}`);
  
    const newImageMessage = new MessageData({
       username: data.username,
        image: data.image, // 圖片的 base64 字符串
        groupId: data.groupId, 
    });

    newImageMessage.save()
        .then(() => {
            console.log('圖片已儲存到資料庫');
            io.to(data.groupId).emit('image', data);  
        })
        .catch(err => {
            console.error('儲存圖片失敗:', err);
        });
});

  socket.on('disconnect', () => {
      console.log('一位使用者已離開');
  });
});
}