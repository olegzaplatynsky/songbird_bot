import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import type { Interaction } from 'discord.js';
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

const commands = [
  {
    name: 'play',
    description: 'Play music',
    options: [{ name: 'query', type: 3, required: true, description: 'Search query or URL' }],
  },
  { name: 'pause', description: 'Pause music' },
  { name: 'skip', description: 'Skip current track' },
  { name: 'clear', description: 'Clear the queue and stop playback' },
  { name: 'leave', description: 'Leave voice channel' },
  { name: 'loop', description: 'Toggle loop for the current track' },
  { name: 'queue', description: 'Show the current queue' },
  { name: 'shuffle', description: 'Shuffle the queue' },
  { name: 'continue', description: 'Resume paused playback' },
  {
    name: 'playnext',
    description: 'Add a track to play right after the current one',
    options: [{ name: 'query', type: 3, required: true, description: 'Search query or URL' }],
  },
];

export async function startBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  client.once('clientReady', async () => {
  console.log(`Logged in as ${client.user?.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

  const guilds = client.guilds.cache.map(g => g.id);

  for (const guildId of guilds) {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID!,
        guildId
      ),
      { body: commands }
    );

    console.log(`Commands registered for guild: ${guildId}`);
  }
  });

  client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {
      case 'play':
        return playCommand(interaction);
      case 'pause':
        return pauseCommand(interaction);
      case 'skip':
        return skipCommand(interaction);
      case 'clear':
        return clearCommand(interaction);
      case 'leave':
        return leaveCommand(interaction);
      case 'loop':
        return loopCommand(interaction);
      case 'queue':
        return queueCommand(interaction);
      case 'shuffle':
        return shuffleCommand(interaction);
      case 'continue':
        return continueCommand(interaction);
      case 'playnext':
        return playNextCommand(interaction);
    }
  });

  await client.login(process.env.DISCORD_TOKEN);
}