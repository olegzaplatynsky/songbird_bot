import { queues } from '../music/queue.js';
import { getDisplayName } from '../config/nicknames.js';

export function continueCommand(interaction: any) {
  const queue = queues.get(interaction.guildId);
  if (!queue) return interaction.reply('Nothing to resume');

  const unpaused = queue.player.unpause();
  interaction.reply(unpaused ? `**${getDisplayName(interaction)}** resumed the music` : 'Not paused');
}
