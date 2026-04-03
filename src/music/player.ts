import {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
} from '@discordjs/voice';
import youtubedl from 'youtube-dl-exec';
import { queues } from './queue.js';

const IDLE_LEAVE_MS = 5 * 60 * 1000; // 5 minutes

export function createPlayer(guildId: string) {
  const player = createAudioPlayer();

  player.on(AudioPlayerStatus.Idle, () => {
    const queue = queues.get(guildId);
    if (!queue) return;

    // If the track was already removed by skip/clear/error, don't shift again.
    if (!queue.skipHandled && !queue.loop) {
      queue.tracks.shift();
    }
    queue.skipHandled = false;

    playNext(guildId).catch(console.error);
  });

  // On error, shift the bad track and set skipHandled so the Idle event that
  // fires right after this doesn't double-shift.
  player.on('error', (err) => {
    console.error('Player error:', err);
    const queue = queues.get(guildId);
    if (queue) {
      queue.tracks.shift();
      queue.skipHandled = true;
    }
  });

  return player;
}

export async function playNext(guildId: string) {
  const queue = queues.get(guildId);
  if (!queue) return;

  if (queue.tracks.length === 0) {
    queue.playing = false;
    scheduleLeave(guildId);
    return;
  }

  // Clear any pending idle leave timer since we're about to play.
  if (queue.idleTimer) {
    clearTimeout(queue.idleTimer);
    delete queue.idleTimer;
  }

  const track = queue.tracks[0]!;

  try {
    const proc = youtubedl.exec(track.url, {
      format: 'bestaudio',
      output: '-',
      quiet: true,
    });

    // tinyspawn (used internally by youtube-dl-exec) rejects the process
    // promise when yt-dlp exits with a non-zero code. A "Broken pipe" exit
    // (code 1) is expected whenever we stop/skip mid-stream, so we absorb it
    // here to prevent an unhandled rejection from crashing the process.
    (proc as any).catch?.((err: any) => {
      const stderr: string = err?.stderr ?? '';
      if (!stderr.includes('Broken pipe') && !stderr.includes('broken pipe')) {
        console.error('yt-dlp error:', stderr || err);
      }
    });

    if (!proc.stdout) {
      throw new Error('youtube-dl produced no stdout');
    }

    const resource = createAudioResource(proc.stdout, { inputType: StreamType.Arbitrary });
    queue.player.play(resource);
    queue.playing = true;
  } catch (err) {
    console.error(`Failed to stream "${track.title}":`, err);
    queue.tracks.shift();
    return playNext(guildId);
  }
}

function scheduleLeave(guildId: string) {
  const queue = queues.get(guildId);
  if (!queue) return;

  if (queue.idleTimer) clearTimeout(queue.idleTimer);

  queue.idleTimer = setTimeout(() => {
    const q = queues.get(guildId);
    if (q && !q.playing) {
      q.connection.destroy();
      queues.delete(guildId);
    }
  }, IDLE_LEAVE_MS);
}
