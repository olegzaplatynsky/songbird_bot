import { queues } from '../music/queue.js';
import { getDisplayName } from '../config/nicknames.js';

export function leaveCommand(interaction: any) {
  const queue = queues.get(interaction.guildId);
  if (!queue) return interaction.reply('Not in a channel');

  if (queue.idleTimer)  clearTimeout(queue.idleTimer);
  if (queue.aloneTimer) clearTimeout(queue.aloneTimer);
  queue.connection.destroy();
  queues.delete(interaction.guildId);

  interaction.reply(`**${getDisplayName(interaction)}** kicked me out`);
}