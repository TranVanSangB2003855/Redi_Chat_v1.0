import { io } from 'socket.io-client';
import { useStore } from '../stores/Store';

class SocketioService {
  chatRoom ='';

  setupSocketFriendConnection(token, phone) {
    this.socketFriend = io(process.env.VUE_APP_SOCKET_ENDPOINT_CHAT_WITH_FRIEND, {
      auth: {
        token,
      },
    });
    
    console.log(`Connecting socket friend...`);
    // console.log(`socketFriend`, this.socketFriend);
    this.socketFriend.on('onlineStatus', data => {
      useStore().changeOnlineStatus(data.roomID, data.online);
    })

    this.socketFriend.emit('sendUser', phone)

    this.socketFriend.on('message',data => {
      useStore().reloadData();
      useStore().showNotify(data);
      // console.log("message",data);
    })

    this.socketFriend.on('updateMessages', (roomId) => {
      useStore().updateMessages(roomId);
    });

    this.socketFriend.on('receiveContentChatRoom', (messages) => {
      // console.log(messages);
      // lưu data vào Pinia
      useStore().setMessagesChatRoom(messages);
    });
  }

  loadContentChatRoom(roomID){
    this.socketFriend.emit("loadContentChatRoom", roomID)
  }

  findUserByPhone(phone){
    this.socketFriend.emit('findUser',phone);
    this.socketFriend.on('foundUser', data => {
      // console.log('foundUser',data)
      useStore().setFoundUserByPhone(data);
    })
  }

  actionFriendRequest(data){
    this.socketFriend.emit('actionFriendRequest', data);
  }

  sendFriendRequest(data){
    this.socketFriend.emit('sendFriendRequest',data);
  }

  receiveMessageFriend(cb){
    if(!this.socketFriend) return true;
    // console.log("receiveMessageFriend")
    this.socketFriend.on("receiveMessageFriend", data => {
      return cb(null, data);
    })
  }

  sendMessageFriend(message, cb) {
    // console.log(message);
    if(this.socketFriend) this.socketFriend.emit('sendMessageFriend',message,cb);
  }

  seenAllMessage(roomId){
    // console.log("seenAllMessage")
    if(this.socketFriend) this.socketFriend.emit('seenAllMessage',roomId);
  }

  disconnect() {
    if(this.socketFriend) {
      this.socketFriend.disconnect();
    }
  }
}

export default new SocketioService();