import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);

  const mockPlaylist = [
    { id: 1, title: 'Атака титанов - 1 сезон', duration: '24:30', thumbnail: '🎬', status: 'playing' },
    { id: 2, title: 'Человек-паук: Нет пути домой', duration: '148:00', thumbnail: '🦸', status: 'queue' },
    { id: 3, title: 'Stranger Things S4', duration: '42:15', thumbnail: '👾', status: 'queue' },
    { id: 4, title: 'Топ Ган: Мэверик', duration: '131:00', thumbnail: '✈️', status: 'queue' }
  ];

  const mockChatMessages = [
    { id: 1, user: 'Алекс', message: 'Эта сцена невероятная! 🔥', time: '19:32', avatar: '👨‍💻' },
    { id: 2, user: 'Мария', message: 'Согласна, операторская работа на высоте', time: '19:34', avatar: '👩‍🎨' },
    { id: 3, user: 'Дмитрий', message: 'Кто-нибудь знает название саундтрека?', time: '19:35', avatar: '🎵' },
    { id: 4, user: 'Катя', message: 'Hans Zimmer - "Time"', time: '19:36', avatar: '👩‍🎤' }
  ];

  const mockFriends = [
    { name: 'Алекс', status: 'online', watching: 'Атака титанов', avatar: '👨‍💻' },
    { name: 'Мария', status: 'online', watching: 'В голосовом чате', avatar: '👩‍🎨' },
    { name: 'Дмитрий', status: 'away', watching: null, avatar: '🎵' },
    { name: 'Катя', status: 'online', watching: 'Stranger Things', avatar: '👩‍🎤' }
  ];

  const mockRooms = [
    { id: 1, name: 'Аниме клуб', viewers: 24, current: 'Атака титанов', isLive: true },
    { id: 2, name: 'Кино по пятницам', viewers: 8, current: 'Топ Ган: Мэверик', isLive: true },
    { id: 3, name: 'Марвел-марафон', viewers: 15, current: 'Перерыв', isLive: false }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-streaming rounded-lg flex items-center justify-center">
                <Icon name="Play" size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold">WATCH TOGETHER</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-streaming-teal">
              <Icon name="Users" size={14} className="mr-1" />
              32 онлайн
            </Badge>
            <Button size="sm" className="bg-streaming-coral hover:bg-streaming-coral/90">
              <Icon name="Plus" size={16} className="mr-2" />
              Создать комнату
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-3 space-y-4">
            {/* Video Player */}
            <Card className="bg-card border-streaming-border">
              <CardContent className="p-6">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-streaming-coral/20 to-streaming-teal/20">
                    <div className="text-center space-y-4">
                      <Icon name="Play" size={64} className="text-white/60 mx-auto" />
                      <p className="text-white/80">Загрузите видео для начала просмотра</p>
                    </div>
                  </div>
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center space-x-4">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        <Icon name={isPlaying ? "Pause" : "Play"} size={20} />
                      </Button>
                      
                      <div className="flex-1 flex items-center space-x-2">
                        <span className="text-sm text-white/80">19:32</span>
                        <div className="flex-1 h-1 bg-white/20 rounded-full">
                          <div className="w-1/3 h-full bg-streaming-coral rounded-full"></div>
                        </div>
                        <span className="text-sm text-white/80">24:30</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Icon name="Volume2" size={16} className="text-white/80" />
                        <div className="w-16 h-1 bg-white/20 rounded-full">
                          <div className="w-4/5 h-full bg-white rounded-full"></div>
                        </div>
                      </div>
                      
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                        <Icon name="Maximize" size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* URL Input */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Вставьте ссылку на видео (YouTube, Twitch, прямая ссылка...)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="bg-streaming-coral hover:bg-streaming-coral/90">
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sync Status */}
            <Card className="bg-card border-streaming-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm">Синхронизировано</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Users" size={16} className="text-muted-foreground" />
                      <span className="text-sm">8 зрителей</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Icon name="Mic" size={14} className="mr-2" />
                      Голос
                    </Button>
                    <Button size="sm" variant="outline">
                      <Icon name="Settings" size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Chat */}
            <Card className="bg-card border-streaming-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Icon name="MessageCircle" size={20} />
                  <span>Чат</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64 px-4">
                  <div className="space-y-3">
                    {mockChatMessages.map((msg) => (
                      <div key={msg.id} className="flex space-x-3">
                        <div className="text-lg">{msg.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{msg.user}</span>
                            <span className="text-xs text-muted-foreground">{msg.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground break-words">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-streaming-border">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Написать сообщение..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" className="bg-streaming-teal hover:bg-streaming-teal/90">
                      <Icon name="Send" size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Playlist */}
            <Card className="bg-card border-streaming-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Icon name="List" size={20} />
                  <span>Плейлист</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 px-4 pb-4">
                  {mockPlaylist.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg hover-scale cursor-pointer ${
                        item.status === 'playing' ? 'bg-streaming-coral/10 border border-streaming-coral/20' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="text-lg">{item.thumbnail}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.duration}</p>
                      </div>
                      {item.status === 'playing' && (
                        <Icon name="Play" size={14} className="text-streaming-coral" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Tabs */}
        <Tabs defaultValue="rooms" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rooms">Комнаты</TabsTrigger>
            <TabsTrigger value="friends">Друзья</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
            <TabsTrigger value="playlists">Сборки</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rooms" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockRooms.map((room) => (
                <Card key={room.id} className="bg-card border-streaming-border hover-scale cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold">{room.name}</h3>
                      {room.isLive && (
                        <Badge className="bg-red-500 text-white text-xs">
                          <div className="w-1 h-1 bg-white rounded-full animate-pulse mr-1"></div>
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{room.current}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Icon name="Users" size={14} className="text-muted-foreground" />
                        <span className="text-sm">{room.viewers}</span>
                      </div>
                      <Button size="sm" variant="outline">Войти</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="friends" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockFriends.map((friend, index) => (
                <Card key={index} className="bg-card border-streaming-border">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="text-2xl">{friend.avatar}</div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                          friend.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{friend.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {friend.watching || 'Не активен'}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Icon name="MessageCircle" size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <Card className="bg-card border-streaming-border">
              <CardContent className="p-6 text-center">
                <Icon name="Clock" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">История просмотров</h3>
                <p className="text-muted-foreground">Здесь будет отображаться ваша история просмотров</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="playlists" className="mt-4">
            <Card className="bg-card border-streaming-border">
              <CardContent className="p-6 text-center">
                <Icon name="PlayCircle" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Готовые сборки</h3>
                <p className="text-muted-foreground">Кураторские подборки фильмов и сериалов</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;