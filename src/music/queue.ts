import { AudioPlayer, VoiceConnection } from '@discordjs/voice';

export type Track = {
  title: string;
  url: string;
};

export type GuildQueue = {
  connection: VoiceConnection;
  player: AudioPlayer;
  tracks: Track[];
  playing: boolean;
};

export const queues = new Map<string, GuildQueue>();