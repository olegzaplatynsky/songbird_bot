import { queues } from '../music/queue.js';

export function clearCommand(interaction: any) {
  const queue = queues.get(interaction.guildId);
  if (!queue) return interaction.reply('Queue empty');

  queue.tracks = [];
  queue.loop = false;
  queue.skipHandled = true;
  queue.player.stop();

  interaction.reply('Queue cleared');
}