export interface VoiceUser {
  id: string;
  name: string;
  isMuted: boolean;
  isSpeaking: boolean;
  volume: number;
  stream?: MediaStream;
}

export interface VoiceConnection {
  peerId: string;
  connection?: RTCPeerConnection;
  remoteStream?: MediaStream;
}

export class VoiceChat {
  private localStream?: MediaStream;
  private connections: Map<string, VoiceConnection> = new Map();
  private isConnected: boolean = false;
  private isMuted: boolean = false;
  private roomId: string;
  private userId: string;
  
  private onUserJoined?: (user: VoiceUser) => void;
  private onUserLeft?: (userId: string) => void;
  private onUserMuted?: (userId: string, isMuted: boolean) => void;
  private onSpeakingChanged?: (userId: string, isSpeaking: boolean) => void;

  constructor(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;
  }

  async initializeAudio(): Promise<boolean> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      this.setupVoiceDetection();
      return true;
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
      return false;
    }
  }

  async joinVoiceChat(): Promise<boolean> {
    if (!this.localStream) {
      const audioInitialized = await this.initializeAudio();
      if (!audioInitialized) return false;
    }

    try {
      // В реальном приложении здесь был бы WebSocket/SignalR для сигналинга
      this.isConnected = true;
      console.log(`Подключен к голосовому чату комнаты ${this.roomId}`);
      return true;
    } catch (error) {
      console.error('Ошибка подключения к голосовому чату:', error);
      return false;
    }
  }

  async leaveVoiceChat(): Promise<void> {
    this.isConnected = false;
    
    // Закрываем все соединения
    this.connections.forEach(connection => {
      if (connection.connection) {
        connection.connection.close();
      }
    });
    this.connections.clear();

    // Останавливаем локальный поток
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = undefined;
    }
  }

  async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const peerConnection = new RTCPeerConnection(config);
    
    // Добавляем локальный аудио поток
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.localStream) {
          peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    // Обработка входящего потока
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      this.handleRemoteStream(peerId, remoteStream);
    };

    // Обработка ICE кандидатов
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(peerId, {
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(`Состояние соединения с ${peerId}: ${peerConnection.connectionState}`);
    };

    this.connections.set(peerId, { peerId, connection: peerConnection });
    return peerConnection;
  }

  async sendOffer(peerId: string): Promise<void> {
    const peerConnection = await this.createPeerConnection(peerId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    this.sendSignal(peerId, {
      type: 'offer',
      offer: offer
    });
  }

  async handleOffer(peerId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = await this.createPeerConnection(peerId);
    await peerConnection.setRemoteDescription(offer);
    
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    this.sendSignal(peerId, {
      type: 'answer',
      answer: answer
    });
  }

  async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const connection = this.connections.get(peerId);
    if (connection?.connection) {
      await connection.connection.setRemoteDescription(answer);
    }
  }

  async handleIceCandidate(peerId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const connection = this.connections.get(peerId);
    if (connection?.connection) {
      await connection.connection.addIceCandidate(candidate);
    }
  }

  toggleMute(): boolean {
    if (!this.localStream) return false;

    this.isMuted = !this.isMuted;
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = !this.isMuted;
    });

    // Уведомляем других пользователей
    this.broadcastSignal({
      type: 'user-muted',
      userId: this.userId,
      isMuted: this.isMuted
    });

    return this.isMuted;
  }

  setVolume(volume: number): void {
    // В реальной реализации здесь была бы настройка громкости для каждого пользователя
    console.log(`Установка громкости: ${volume}%`);
  }

  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' {
    if (!this.isConnected) return 'disconnected';
    
    const activeConnections = Array.from(this.connections.values())
      .filter(conn => conn.connection?.connectionState === 'connected');
    
    return activeConnections.length > 0 ? 'connected' : 'connecting';
  }

  getConnectedUsers(): VoiceUser[] {
    return Array.from(this.connections.values()).map(conn => ({
      id: conn.peerId,
      name: `User ${conn.peerId}`,
      isMuted: false,
      isSpeaking: false,
      volume: 100
    }));
  }

  setEventHandlers(handlers: {
    onUserJoined?: (user: VoiceUser) => void;
    onUserLeft?: (userId: string) => void;
    onUserMuted?: (userId: string, isMuted: boolean) => void;
    onSpeakingChanged?: (userId: string, isSpeaking: boolean) => void;
  }): void {
    this.onUserJoined = handlers.onUserJoined;
    this.onUserLeft = handlers.onUserLeft;
    this.onUserMuted = handlers.onUserMuted;
    this.onSpeakingChanged = handlers.onSpeakingChanged;
  }

  private setupVoiceDetection(): void {
    if (!this.localStream) return;

    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(this.localStream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let isSpeaking = false;
      
      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        const currentlySpeaking = average > 10; // Порог детекции речи
        
        if (currentlySpeaking !== isSpeaking) {
          isSpeaking = currentlySpeaking;
          this.onSpeakingChanged?.(this.userId, isSpeaking);
        }
        
        requestAnimationFrame(checkAudioLevel);
      };
      
      checkAudioLevel();
    } catch (error) {
      console.error('Ошибка настройки детекции голоса:', error);
    }
  }

  private handleRemoteStream(peerId: string, stream: MediaStream): void {
    const connection = this.connections.get(peerId);
    if (connection) {
      connection.remoteStream = stream;
      
      // Создаем аудио элемент для воспроизведения
      const audio = new Audio();
      audio.srcObject = stream;
      audio.autoplay = true;
      audio.volume = 1.0;
      
      this.onUserJoined?.({
        id: peerId,
        name: `User ${peerId}`,
        isMuted: false,
        isSpeaking: false,
        volume: 100,
        stream
      });
    }
  }

  private sendSignal(peerId: string, signal: any): void {
    // В реальном приложении здесь был бы отправка через WebSocket
    console.log(`Отправка сигнала для ${peerId}:`, signal);
  }

  private broadcastSignal(signal: any): void {
    // В реальном приложении здесь была бы отправка всем участникам
    console.log('Отправка сигнала всем:', signal);
  }
}