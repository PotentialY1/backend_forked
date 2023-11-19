import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelRelation } from './entities/channel-relation.entity';
import { ChannelInvitation } from './entities/channel-invitation.entity';
// import { ChatService } from './channels-chat.service';
// import { ChatGateway } from './channels.gateway';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Channel, ChannelRelation,
    ChannelInvitation])],
  controllers: [ChannelsController],
  providers: [ChannelsService] // ChatGateway, ChatService],
})
export class ChannelsModule {}
