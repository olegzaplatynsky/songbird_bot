import { queues } from '../music/queue.js';

export function loopCommand(interaction: any) {
  const queue = queues.get(interaction.guildId);
  if (!queue || queue.tracks.length === 0) return interaction.reply('Nothing playing');

  queue.loop = !queue.loop;
  interaction.reply(queue.loop ? 'Loop enabled' : 'Loop disabled');
}
