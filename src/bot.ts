import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import type { Interaction } from 'discord.js';
import { playCommand } from './commands/play.js';
import { pauseCommand } from './commands/pause.js';
import { skipCommand } from './commands/skip.js';
import { clearCommand } from './commands/clear.js';
import { leaveCommand } from './commands/leave.js';

const commands = [
  {
    name: 'play',
    description: 'Play music',
    options: [{ name: 'query', type: 3, required: true, description: 'Search query or URL' }],
  },
  { name: 'pause', description: 'Pause music' },
  { name: 'skip', description: 'Skip track' },
  { name: 'clear', description: 'Clear queue' },
  { name: 'leave', description: 'Leave voice channel' },
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
    }
  });

  await client.login(process.env.DISCORD_TOKEN);
}