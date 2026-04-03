import { queues } from '../music/queue.js';

export function skipCommand(interaction: any) {
  const queue = queues.get(interaction.guildId);
  if (!queue || queue.tracks.length === 0) return interaction.reply('Nothing to skip');

  // Remove the current track and mark it handled so the Idle event
  // that fires from stop() doesn't shift again.
  queue.tracks.shift();
  queue.skipHandled = true;
  queue.player.stop();

  interaction.reply('Skipped');
}