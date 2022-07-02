import { SubscribeMessage, WebSocketGateway,OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors : {origin : '*'}
})
export class ChatAppGateway implements OnGatewayConnection,OnGatewayDisconnect{
  @WebSocketServer()
  socket : Server
  /// storing users and their name in a dict
  /// so that we can display the user disconnected
  idToUser : Map<string,string> = new Map();

  handleConnection(client :Socket){
    console.log(this.idToUser);
  }

  @SubscribeMessage('userConnected')
  userConnected(client : Socket,userName:string) {
    console.log('username',userName);
    this.idToUser.set(client.id,userName);
    this.socket.emit('userConnected',userName);
  }


  @SubscribeMessage('message')
  handleMessage(client: any, payload: any) {
    const msg = {user : this.idToUser.get(client.id),message : payload};
    console.log(msg);
    this.socket.emit('message',msg);
  }
  /// handle user disconnection
  handleDisconnect(client: Socket) {
    const name = this.idToUser.get(client.id)
    console.log('disconnected user ',name);
    this.socket.emit('userDisconnected',name);
  }
}
