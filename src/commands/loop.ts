import { queues } from '../music/queue.js';
import { getDisplayName } from '../config/nicknames.js';

export function loopCommand(interaction: any) {
  const queue = queues.get(interaction.guildId);
  if (!queue || queue.tracks.length === 0) return interaction.reply('Nothing playing');

  queue.loop = !queue.loop;
  const name = getDisplayName(interaction);
  interaction.reply(queue.loop ? `**${name}** enabled loop` : `**${name}** disabled loop`);
}
