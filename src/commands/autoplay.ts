import { queues } from '../music/queue.js';
import { getDisplayName } from '../config/nicknames.js';

const DEFAULT_LIMIT = 10;

export function autoplayCommand(interaction: any) {
  const queue = queues.get(interaction.guildId);
  if (!queue) return interaction.reply('Nothing playing');

  queue.autoplay = !queue.autoplay;
  const name = getDisplayName(interaction);

  if (queue.autoplay) {
    const limit: number = interaction.options.getInteger('songs') ?? DEFAULT_LIMIT;
    queue.autoplayLimit = limit;
    queue.autoplayCount = 0;
    interaction.reply(`**${name}** enabled autoplay — will add up to **${limit}** similar songs`);
  } else {
    interaction.reply(`**${name}** disabled autoplay`);
  }
}
