export interface Room {
  id: string;
  name: string;
  description: string;
  hostId: string;
  hostName: string;
  isPrivate: boolean;
  inviteCode?: string;
  maxUsers: number;
  currentUsers: RoomUser[];
  currentVideo?: VideoInfo;
  isPlaying: boolean;
  currentTime: number;
  settings: RoomSettings;
  createdAt: Date;
}

export interface RoomUser {
  id: string;
  name: string;
  avatar: string;
  role: 'host' | 'moderator' | 'member';
  isOnline: boolean;
  joinedAt: Date;
  voiceEnabled: boolean;
  isMuted: boolean;
}

export interface RoomSettings {
  allowGuestControl: boolean;
  requireApproval: boolean;
  chatEnabled: boolean;
  voiceEnabled: boolean;
  syncTolerance: number; // секунды
}

export interface VideoInfo {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  platform: string;
  embedUrl: string;
  originalUrl: string;
}

export interface RoomInvite {
  roomId: string;
  code: string;
  expiresAt?: Date;
  maxUses?: number;
  currentUses: number;
  createdBy: string;
}

export class RoomManager {
  private static rooms: Map<string, Room> = new Map();
  private static invites: Map<string, RoomInvite> = new Map();
  private static userRooms: Map<string, string[]> = new Map();

  static createRoom(hostId: string, hostName: string, roomData: Partial<Room>): Room {
    const roomId = this.generateRoomId();
    const inviteCode = roomData.isPrivate ? this.generateInviteCode() : undefined;

    const newRoom: Room = {
      id: roomId,
      name: roomData.name || 'Новая комната',
      description: roomData.description || '',
      hostId,
      hostName,
      isPrivate: roomData.isPrivate || false,
      inviteCode,
      maxUsers: roomData.maxUsers || 50,
      currentUsers: [{
        id: hostId,
        name: hostName,
        avatar: '👨‍💻',
        role: 'host',
        isOnline: true,
        joinedAt: new Date(),
        voiceEnabled: false,
        isMuted: false
      }],
      currentVideo: undefined,
      isPlaying: false,
      currentTime: 0,
      settings: {
        allowGuestControl: false,
        requireApproval: false,
        chatEnabled: true,
        voiceEnabled: true,
        syncTolerance: 2,
        ...roomData.settings
      },
      createdAt: new Date()
    };

    this.rooms.set(roomId, newRoom);
    
    if (inviteCode) {
      this.invites.set(inviteCode, {
        roomId,
        code: inviteCode,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 часа
        currentUses: 0,
        createdBy: hostId
      });
    }

    return newRoom;
  }

  static joinRoom(userId: string, userName: string, roomIdOrCode: string): { success: boolean; room?: Room; error?: string } {
    let room = this.rooms.get(roomIdOrCode);
    
    // Если не найдена комната по ID, попробуем по коду приглашения
    if (!room) {
      const invite = this.invites.get(roomIdOrCode);
      if (invite && this.isInviteValid(invite)) {
        room = this.rooms.get(invite.roomId);
        if (room) {
          invite.currentUses++;
        }
      }
    }

    if (!room) {
      return { success: false, error: 'Комната не найдена или код приглашения недействителен' };
    }

    if (room.currentUsers.length >= room.maxUsers) {
      return { success: false, error: 'Комната переполнена' };
    }

    // Проверяем, не находится ли пользователь уже в комнате
    const existingUser = room.currentUsers.find(u => u.id === userId);
    if (existingUser) {
      existingUser.isOnline = true;
      return { success: true, room };
    }

    const newUser: RoomUser = {
      id: userId,
      name: userName,
      avatar: this.getRandomAvatar(),
      role: 'member',
      isOnline: true,
      joinedAt: new Date(),
      voiceEnabled: false,
      isMuted: false
    };

    room.currentUsers.push(newUser);
    return { success: true, room };
  }

  static leaveRoom(userId: string, roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const userIndex = room.currentUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    const user = room.currentUsers[userIndex];
    
    // Если это хост, передаем права другому пользователю или удаляем комнату
    if (user.role === 'host') {
      const onlineUsers = room.currentUsers.filter(u => u.id !== userId && u.isOnline);
      if (onlineUsers.length > 0) {
        onlineUsers[0].role = 'host';
        room.hostId = onlineUsers[0].id;
        room.hostName = onlineUsers[0].name;
      } else {
        // Удаляем комнату, если нет других пользователей
        this.rooms.delete(roomId);
        return true;
      }
    }

    room.currentUsers.splice(userIndex, 1);
    return true;
  }

  static updateRoomVideo(roomId: string, userId: string, videoInfo: VideoInfo, startTime: number = 0): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const user = room.currentUsers.find(u => u.id === userId);
    if (!user) return false;

    // Проверяем права на управление видео
    if (!this.canControlVideo(user, room)) return false;

    room.currentVideo = videoInfo;
    room.currentTime = startTime;
    room.isPlaying = true;

    return true;
  }

  static updatePlaybackState(roomId: string, userId: string, isPlaying: boolean, currentTime: number): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const user = room.currentUsers.find(u => u.id === userId);
    if (!user || !this.canControlVideo(user, room)) return false;

    room.isPlaying = isPlaying;
    room.currentTime = currentTime;

    return true;
  }

  static generateInviteLink(roomId: string, userId: string, expiresInHours: number = 24, maxUses?: number): string | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const user = room.currentUsers.find(u => u.id === userId);
    if (!user || !this.canManageRoom(user, room)) return null;

    const code = this.generateInviteCode();
    const invite: RoomInvite = {
      roomId,
      code,
      expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000),
      maxUses,
      currentUses: 0,
      createdBy: userId
    };

    this.invites.set(code, invite);
    return `${window.location.origin}/join/${code}`;
  }

  static getRoomById(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  static getUserRooms(userId: string): Room[] {
    return Array.from(this.rooms.values()).filter(room => 
      room.currentUsers.some(user => user.id === userId)
    );
  }

  static getPublicRooms(limit: number = 20): Room[] {
    return Array.from(this.rooms.values())
      .filter(room => !room.isPrivate)
      .sort((a, b) => b.currentUsers.length - a.currentUsers.length)
      .slice(0, limit);
  }

  private static canControlVideo(user: RoomUser, room: Room): boolean {
    return user.role === 'host' || user.role === 'moderator' || room.settings.allowGuestControl;
  }

  private static canManageRoom(user: RoomUser, room: Room): boolean {
    return user.role === 'host' || user.role === 'moderator';
  }

  private static isInviteValid(invite: RoomInvite): boolean {
    if (invite.expiresAt && invite.expiresAt < new Date()) return false;
    if (invite.maxUses && invite.currentUses >= invite.maxUses) return false;
    return true;
  }

  private static generateRoomId(): string {
    return 'room_' + Math.random().toString(36).substr(2, 9);
  }

  private static generateInviteCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  private static getRandomAvatar(): string {
    const avatars = ['👨‍💻', '👩‍🎨', '🎵', '👩‍🎤', '👨‍🚀', '🧑‍🎓', '👩‍🔬', '🧑‍🎯'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }
}