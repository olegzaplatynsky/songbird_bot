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
  loop: boolean;
  // Set to true when the current track has already been removed so the Idle
  // handler knows not to shift() again (avoids double-shift on skip / clear).
  skipHandled: boolean;
  idleTimer?: NodeJS.Timeout;
};

export const queues = new Map<string, GuildQueue>();