import { queues } from '../music/queue.js';

export function skipCommand(interaction: any) {
  const queue = queues.get(interaction.guildId);
  if (!queue) return interaction.reply('Nothing to skip');

  queue.player.stop();
  interaction.reply('Skipped');
}