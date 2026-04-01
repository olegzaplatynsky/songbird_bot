import {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
} from '@discordjs/voice';
import youtubedl from 'youtube-dl-exec';
import { queues } from './queue.js';

export function createPlayer(guildId: string) {
  const player = createAudioPlayer();

  player.on(AudioPlayerStatus.Idle, () => {
    const queue = queues.get(guildId);
    if (!queue) return;

    queue.tracks.shift();
    playNext(guildId).catch(console.error);
  });

  player.on('error', (err) => {
    console.error('Player error:', err);
    playNext(guildId).catch(console.error);
  });

  return player;
}

export async function playNext(guildId: string) {
  const queue = queues.get(guildId);
  if (!queue || queue.tracks.length === 0) {
    queue?.connection.destroy();
    queues.delete(guildId);
    return;
  }

  const track = queue.tracks[0];

  let resource;
  try {
    const proc = youtubedl.exec(track!.url, {
      format: 'bestaudio',
      output: '-',
      quiet: true,
    });
    resource = createAudioResource(proc.stdout!, { inputType: StreamType.Arbitrary });
  } catch (err) {
    console.error(`Failed to stream "${track!.title}":`, err);
    queue.tracks.shift();
    return playNext(guildId);
  }

  queue.player.play(resource);
  queue.playing = true;
}