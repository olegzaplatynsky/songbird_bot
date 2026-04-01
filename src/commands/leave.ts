import { queues } from '../music/queue.js';

export function leaveCommand(interaction: any) {
  const queue = queues.get(interaction.guildId);
  if (!queue) return interaction.reply('Not in a channel');

  queue.connection.destroy();
  queues.delete(interaction.guildId);

  interaction.reply('Left channel');
}