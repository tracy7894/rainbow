module.exports = (io) => {
  const MessageData = require('../data/MessageData'); // 訊息資料模型

  io.on('connection', async function(socket) {
    const groupId = socket.handshake.query.groupId || 'publicRoom';
    const identity = socket.handshake.query.identity ; // 從前端傳遞身份

    // 根據身份區分聊天室房間
    const room = `${groupId}_${identity}`; // 以 groupId 和 identity（學生或校外人士）區分房間
    socket.join(room); // 加入相應的聊天室
    console.log(`A ${identity} user connected to room: ${room}`);

    if (!groupId) {
      console.error('No groupId provided');
      socket.disconnect();
      return;
    }

    try {
      const chatHistory = await MessageData.find({ groupId: groupId, identity: identity }) // 根據 identity 查詢歷史訊息
        .sort({ createdAt: -1 })  // 以時間倒序排列
        .limit(200);  // 最近 200 條訊息
      const orderedChatHistory = chatHistory.reverse();  // 發送升序排列的訊息
      socket.emit('chatHistory', orderedChatHistory); // 返回歷史訊息
    } catch (err) {
      console.error('讀取歷史記錄失敗:', err);
    }

    // 處理文字消息
    socket.on('message', async (msg) => {
      console.log('Received message:', msg);
      const newMessage = new MessageData({
        username: msg.username,
        message: msg.message,
        groupId: msg.groupId,
        identity: msg.identity  // 記錄消息的身份
      });

      // 儲存訊息
      newMessage.save()
        .then(() => {
          console.log('訊息已儲存到資料庫');
          io.to(room).emit('message', msg);  // 發送訊息到對應房間
        })
        .catch(err => {
          console.error('儲存訊息失敗:', err);
        });
    });

    // 處理圖片消息
    socket.on('image', async (data) => {
      console.log(`${data.username} 發送了一張圖片 ${data.groupId}`);

      const newImageMessage = new MessageData({
        username: data.username,
        image: data.image,  // 圖片的 base64 字符串
        groupId: data.groupId,
        identity: data.identity  // 記錄圖片消息的身份
      });

      newImageMessage.save()
        .then(() => {
          console.log('圖片已儲存到資料庫');
          io.to(room).emit('image', data);  // 發送圖片到對應房間
        })
        .catch(err => {
          console.error('儲存圖片失敗:', err);
        });
    });

    socket.on('disconnect', () => {
      console.log('一位使用者已離開');
    });
  });
};
