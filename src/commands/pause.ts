import { queues } from '../music/queue.js';

export function pauseCommand(interaction: any) {
  const queue = queues.get(interaction.guildId);
  if (!queue) return interaction.reply('Nothing playing');

  queue.player.pause();
  interaction.reply('Paused');
}