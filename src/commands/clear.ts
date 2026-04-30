import { queues } from '../music/queue.js';
import { getDisplayName } from '../config/nicknames.js';

export function clearCommand(interaction: any) {
  const queue = queues.get(interaction.guildId);
  if (!queue) return interaction.reply('Queue empty');

  queue.tracks = [];
  queue.loop = false;
  queue.skipHandled = true;
  queue.player.stop();

  interaction.reply(`**${getDisplayName(interaction)}** cleared the queue`);
}