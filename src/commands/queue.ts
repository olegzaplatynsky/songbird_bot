import { queues } from '../music/queue.js';

export function queueCommand(interaction: any) {
  const queue = queues.get(interaction.guildId);
  if (!queue || queue.tracks.length === 0) return interaction.reply('Queue is empty');

  const MAX = 15;
  const lines = queue.tracks.slice(0, MAX).map((t, i) => {
    const prefix = i === 0 ? 'Now playing:' : `${i}.`;
    return `${prefix} ${t.title}`;
  });

  let message = lines.join('\n');
  if (queue.tracks.length > MAX) {
    message += `\n...and ${queue.tracks.length - MAX} more`;
  }
  if (queue.loop) message += '\nLoop: on';

  interaction.reply(message);
}
