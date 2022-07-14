import { SubscribeMessage, WebSocketGateway,OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { query } from 'express';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors : {origin : '*'},
  namespace : 'chat'
})
export class ChatAppGateway implements OnGatewayConnection,OnGatewayDisconnect{
  @WebSocketServer()
  socket : Server
  /// storing users and their name in a dict
  /// so that we can display the user disconnected
  idToUser : Map<string,string> = new Map();
  nameToRoom : Map<string,string> = new Map();

  handleConnection(client :Socket){
    // console.log(this.idToUser);
    console.log(client.handshake.query);
    const name: any = client.handshake.query.name;
    // const room : any = client.handshake.query.room;
    this.idToUser.set(client.id,name);
    // this.nameToRoom.set(name,room);
    // client.join(room);
    console.log(name,"connned to the");
    client.broadcast.emit("user",name);
  }

  getRoom(client :Socket){
    const name = this.idToUser.get(client.id);
    // const room = this.nameToRoom.get(name);
    // console.log(room);
    return name;
  }
  // getName(client :Socket){
  //   const name =  this.idToUser.get(client.id);
  //   console.log(name);
  // }


  @SubscribeMessage('userConnected')
  userConnected(client : Socket,userName:string) {
    console.log('username',userName);
    this.idToUser.set(client.id,userName);
  
    this.socket.emit('userConnected',userName);
  }
  @SubscribeMessage("users")
  handleName(client:Socket,payload:any){
    const user = payload;
    console.log(user,"hi user")
    const room = this.getRoom(client);
    this.socket.to(room).emit('users',user);
  }


  @SubscribeMessage('message')
  handleMessage(client:Socket, payload: any) {
    console.log(client.id);
    const msg = {user : this.idToUser.get(client.id),message : payload};
    // const msg = payload;
    
    console.log(msg,"from the new front");
    // const room = this.getRoom(client);
    
  client.broadcast.emit('message',msg);
  
  }
  /// handle user disconnection
  handleDisconnect(client: Socket) {
    const name = this.idToUser.get(client.id)
    console.log('disconnected user ',name);
    this.socket.emit('userDisconnected',name);
  }
}


