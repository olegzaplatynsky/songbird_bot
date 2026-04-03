import { queues } from '../music/queue.js';

export function shuffleCommand(interaction: any) {
  const queue = queues.get(interaction.guildId);
  if (!queue || queue.tracks.length <= 1) return interaction.reply('Not enough tracks to shuffle');

  // Keep the currently playing track (index 0) in place, shuffle the rest.
  const current = queue.tracks[0]!;
  const rest = queue.tracks.slice(1);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j]!, rest[i]!];
  }
  queue.tracks = [current, ...rest];

  interaction.reply(`Shuffled ${rest.length} tracks`);
}
