import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/users/user.entity';
import { Inject, UseFilters, UsePipes, ValidationPipe, forwardRef } from '@nestjs/common';
import { WebsocketExceptionsFilter } from 'src/filters/websocket-exception.fileter';
import { corsConfig } from '@configs/cors.config';
import { UserRelationService } from 'src/user-relation/user-relation.service';
import { NotificationType } from './enums/notification.enum';
import { MainGateway } from 'src/commons/main.gateway';
import { dtoSerializer } from 'src/utils/dtoSerializer.util';
import { NotiChannelInviteDto } from './dtos/noti-channel-invite.dto';
import { NotiFriendRequestDto } from './dtos/noti-friend-request.dto';
import { UserRelation } from 'src/user-relation/user-relation.entity';
import { ChannelInvitation } from 'src/channels/entities/channel-invitation.entity';
import { ChannelsService } from 'src/channels/channels.service';

type Noti = NotiChannelInviteDto | NotiFriendRequestDto;

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: corsConfig,
})
export class NotificationsGateway {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(forwardRef(() => UserRelationService))
    private userRelationsService: UserRelationService,
    @Inject(forwardRef(() => ChannelsService))
    private channelsService: ChannelsService,
    private mainGateway: MainGateway,
  ) {}

  @SubscribeMessage('noti-unread')
  async getUnreadNoti(@ConnectedSocket() clientSocket: Socket) {
    const userId = await this.mainGateway.socketToUser(clientSocket.id);
    const penddings = await this.userRelationsService.findAllPendingApproval(userId);
    const invitations = await this.channelsService.findAllInvitation(userId);

    const penddingDtos = dtoSerializer(NotiFriendRequestDto, penddings) as Noti[];
    const invitationDtos = dtoSerializer(NotiChannelInviteDto, invitations) as Noti[];

    const notis = penddingDtos
      .concat(invitationDtos)
      .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    return notis;
  }

  // prettier-ignore
  notiGameInvite(invitedUserId: number, invitingUser: User) {
    this.server
      .to(invitedUserId.toString())
      .emit('noti', { 
        type: NotificationType.GAME_INVITE,
        invitingUser
        // gameType
      });
  }

  // prettier-ignore
  notiChannelInvite(invitation: ChannelInvitation) {
    const invitedUserId = invitation.user.id.toString()
    const noti = dtoSerializer(NotiChannelInviteDto, invitation)
    this.server
      .to(invitedUserId)
      .emit('noti', noti);
  }

  // prettier-ignore
  notiFriendRequest(pendingRelation: UserRelation) {
    const requestedUserId = pendingRelation.user.id.toString()
    const noti = dtoSerializer(NotiFriendRequestDto, pendingRelation)
    this.server
      .to(requestedUserId)
      .emit('noti', noti)
  }
}
