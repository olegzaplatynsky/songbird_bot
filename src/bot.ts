import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import type { Interaction } from 'discord.js';
import play from 'play-dl';
import { playCommand } from './commands/play.js';
import { pauseCommand } from './commands/pause.js';
import { skipCommand } from './commands/skip.js';
import { clearCommand } from './commands/clear.js';
import { leaveCommand } from './commands/leave.js';
import { loopCommand } from './commands/loop.js';
import { queueCommand } from './commands/queue.js';
import { shuffleCommand } from './commands/shuffle.js';
import { continueCommand } from './commands/continue.js';
import { playNextCommand } from './commands/playnext.js';
import { playShuffleCommand } from './commands/playshuffle.js';
import { helpCommand } from './commands/help.js';
import { autoplayCommand } from './commands/autoplay.js';
import { queues } from './music/queue.js';

// Autocomplete is enabled for these commands (the ones that accept a query).
const QUERY_OPTION = { name: 'query', type: 3, required: true, autocomplete: true, description: 'Search query, YouTube URL, or Spotify link' };

const commands = [
  { name: 'play',        description: 'Play music',                                    options: [QUERY_OPTION] },
  { name: 'playnext',    description: 'Add a track to play right after the current one', options: [QUERY_OPTION] },
  { name: 'playshuffle', description: 'Add tracks shuffled to the end of the queue',    options: [QUERY_OPTION] },
  { name: 'pause',    description: 'Pause music' },
  { name: 'continue', description: 'Resume paused playback' },
  { name: 'skip',     description: 'Skip current track' },
  { name: 'loop',     description: 'Toggle loop for the current track' },
  { name: 'queue',    description: 'Show the current queue' },
  { name: 'shuffle',  description: 'Shuffle the queue' },
  { name: 'clear',    description: 'Clear the queue and stop playback' },
  { name: 'leave',    description: 'Leave voice channel' },
  { name: 'help',     description: 'Show all available commands' },
  {
    name: 'autoplay',
    description: '(Experimental) Toggle autoplay — queues similar songs when the queue ends',
    options: [{
      name: 'songs',
      type: 4,
      required: false,
      description: 'How many autoplay songs to add (default: 10)',
      min_value: 1,
      max_value: 100,
    }],
  },
];

export async function startBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  client.once('clientReady', async () => {
    console.log(`Logged in as ${client.user?.tag}`);

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

    for (const guildId of client.guilds.cache.map(g => g.id)) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId),
        { body: commands },
      );
      console.log(`Commands registered for guild: ${guildId}`);
    }
  });

  client.on('interactionCreate', async (interaction: Interaction) => {
    // ── Autocomplete ─────────────────────────────────────────────────────────
    if (interaction.isAutocomplete()) {
      const query = interaction.options.getFocused();

      // Don't try to search URLs or very short strings
      if (!query || query.startsWith('http://') || query.startsWith('https://') || query.length < 2) {
        return interaction.respond([]);
      }

      try {
        const results = await play.search(query, { limit: 10, source: { youtube: 'video' } });
        await interaction.respond(
          results.map(r => ({
            name: (r.title ?? 'Unknown').slice(0, 100),
            value: r.url,
          }))
        );
      } catch {
        await interaction.respond([]);
      }
      return;
    }

    // ── Slash commands ────────────────────────────────────────────────────────
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {
      case 'play':        return playCommand(interaction);
      case 'playnext':    return playNextCommand(interaction);
      case 'playshuffle': return playShuffleCommand(interaction);
      case 'pause':       return pauseCommand(interaction);
      case 'continue':    return continueCommand(interaction);
      case 'skip':        return skipCommand(interaction);
      case 'loop':        return loopCommand(interaction);
      case 'queue':       return queueCommand(interaction);
      case 'shuffle':     return shuffleCommand(interaction);
      case 'clear':       return clearCommand(interaction);
      case 'leave':       return leaveCommand(interaction);
      case 'help':        return helpCommand(interaction);
      case 'autoplay':    return autoplayCommand(interaction);
    }
  });

  // Leave 2 minutes after everyone leaves the bot's voice channel.
  client.on('voiceStateUpdate', (oldState, newState) => {
    const guildId = oldState.guild.id;
    const queue = queues.get(guildId);
    if (!queue) return;

    const botChannel = oldState.guild.members.me?.voice.channel;
    if (!botChannel) return;

    // Only react to changes that affected the bot's own channel.
    if (oldState.channelId !== botChannel.id && newState.channelId !== botChannel.id) return;

    const humans = botChannel.members.filter(m => !m.user.bot).size;

    if (humans === 0) {
      if (!queue.aloneTimer) {
        queue.aloneTimer = setTimeout(() => {
          const q = queues.get(guildId);
          if (q) {
            if (q.idleTimer) clearTimeout(q.idleTimer);
            q.connection.destroy();
            queues.delete(guildId);
          }
        }, 2 * 60 * 1000);
      }
    } else {
      if (queue.aloneTimer) {
        clearTimeout(queue.aloneTimer);
        delete queue.aloneTimer;
      }
    }
  });

  await client.login(process.env.DISCORD_TOKEN);
}
