// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   MessageBody,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway({
//   cors: {
//     origin: 'http://localhost:4000',
//   },
// })
// export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server;

//   handleConnection(client: Socket) {
//     console.log(`⚡: ${client.id} user just connected!`);
//   }

//   handleDisconnect(client: Socket) {
//     console.log(`'###: ${client.id} user disconnected`);
//   }

//   @SubscribeMessage('dis')
//   handleDisconnectMessage(@MessageBody() data: any): void {
//     console.log('@@@: A user');
//   }

//   @SubscribeMessage('consumer_msg')
//   handleConsumerMessage(@MessageBody() data: any): void {
//     console.log('***', data);
//     this.server.emit('consumer_msg', data);
//   }

//   @SubscribeMessage('ping')
//   handlePing(@MessageBody() data: any): void {
//     console.log('ping', data);
//   }

//   sendMessage(key: string, data: any): void {
//     this.server.emit(key, data);
//   }
// }

// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   MessageBody,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from "@nestjs/websockets";
// import { Server, Socket } from "socket.io";

// @WebSocketGateway({
//   cors: {
//     origin: "http://localhost:4000",
//   },
// })
// export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server;

//   private users: Map<string, string> = new Map(); // ✅ Store socket ID and email

//   handleConnection(client: Socket) {
//     console.log(`⚡: ${client.id} user just connected!`);
//     this.users.set(client.id, null);
//     console.log(`user data with client id ${this.users}`); // ✅ Placeholder for email, will be updated in register_user
//   }

//   handleDisconnect(client: Socket) {
//     console.log(`'###: ${client.id} user disconnected`);
//     this.users.delete(client.id); // ✅ Remove user on disconnect
//   }

//   @SubscribeMessage("register_user")
//   handleRegisterUser(client: Socket, @MessageBody() email: string): void {
//     console.log(`User registered: ${email} with Socket ID ddddddd: ${client}`);

//     // this.users.set(client.id, email);
//     // if (this.users.has(client.id)) {
//     //   this.users.set(client.id, email); // ✅ Update user map with email
//     // }
//   }

//   @SubscribeMessage("consumer_msg")
//   handleConsumerMessage(@MessageBody() data: any): void {
//     console.log("***", data);
//     this.server.emit("consumer_msg", data);
//   }

//   sendMessageToUser(email: string, key: string, data: any): void {
//     // ✅ Find socket ID by email and send message
//     const socketId = [...this.users.entries()].find(
//       ([_, e]) => e === email
//     )?.[0];
//     if (socketId) {
//       this.server.to(socketId).emit(key, data);
//       console.log(`Sent message to ${email} -> ${key}:`, data);
//     } else {
//       console.log(`User ${email} not found.`);
//     }
//   }
//   sendMessage(key: string, data: any): void {
//     this.server.emit(key, data);
//   }
// }
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "http://localhost:4000",
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users: Map<string, Set<string>> = new Map(); // ✅ User email -> clientId mapping

  // ✅ Jab client connect karega, tabhi client ID store karlo
  handleConnection(client: Socket) {
    console.log(`⚡: ${client.id} user just connected!`);
    client.emit("request_register", `${client.id}`); // ✅ Frontend ko trigger karo ki wo register kare
  }

  // ✅ Jab user register kare, toh pehli wali `client.id` ka hi use karo
  @SubscribeMessage("register_user")
  handleRegisterUser(
    @ConnectedSocket() client: Socket, // ✅ Get `client` properly
    @MessageBody() email: string // ✅ Extract email
  ): void {
    console.log(`✅ User registered: ${email} with Socket ID: ${client.id}`);
    if (!this.users.has(email)) {
      this.users.set(email, new Set());
    }
    this.users.get(email)?.add(client.id);
  }

  // ✅ Send message to specific user
  sendMessageToUser(email: string, key: string, data: any): void {
    const clientIds = this.users.get(email);
    if (clientIds) {
      clientIds.forEach((clientId) => {
        this.server.to(clientId).emit(key, data);
      });
      console.log(`✅ Sent message to ${email} on ${clientIds.size} devices`);
    } else {
      console.log(`⚠️ User ${email} not found.`);
    }
  }

  // ✅ Remove user on disconnect
  handleDisconnect(client: Socket) {
    this.users.forEach((clientIds, email) => {
      if (clientIds.has(client.id)) {
        clientIds.delete(client.id);
        if (clientIds.size === 0) {
          this.users.delete(email);
        }
      }
    });
  }
  sendMessage(key: string, data: any): void {
    this.server.emit(key, data);
  }
}
