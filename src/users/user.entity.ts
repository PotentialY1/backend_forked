import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ChannelRelation } from 'src/channels/entities/channel-relation.entity';
import { ChannelInvitation } from '../channels/entities/channel-invitation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  nickname: string;

  @Column({ default: 0 })
  ladderPoint: number;

  @Column({ default: 'default image path' })
  avatar: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  bio: string;

  @Column({ default: false })
  is2fa: boolean;

  @Column()
  otpSecret: string;

  @OneToMany(() => ChannelRelation, (channelRelation) => channelRelation.user)
  channelRelations: ChannelRelation[];

  @OneToMany(() => ChannelInvitation, (channelInvitation) => channelInvitation.user)
  channelInvitations: ChannelInvitation[];
}
