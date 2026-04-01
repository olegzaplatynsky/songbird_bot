import { ChatInputCommandInteraction } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import play from 'play-dl';
import { youtubeDl } from 'youtube-dl-exec';
import { queues } from '../music/queue.js';
import { createPlayer, playNext } from '../music/player.js';

export async function playCommand(interaction: ChatInputCommandInteraction) {
  const query = interaction.options.getString('query', true);
  const member = interaction.member as any;

  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    return interaction.reply('Join a voice channel first');
  }

  await interaction.deferReply();

  let queue = queues.get(interaction.guildId!);

  if (!queue) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guildId!,
      adapterCreator: interaction.guild!.voiceAdapterCreator,
    });

    const player = createPlayer(interaction.guildId!);
    connection.subscribe(player);

    queue = { connection, player, tracks: [], playing: false };
    queues.set(interaction.guildId!, queue);
  }

  // Resolve Spotify/YouTube
  let tracks = [];

  if (play.sp_validate(query) !== false) {
    const spData = await play.spotify(query);
    const yt = await play.search(`${spData.name} ${(spData as any).artists?.[0]?.name ?? ''}`, {
      limit: 1,
    });
    if (yt[0]) tracks.push({ title: yt[0].title!, url: yt[0].url! });
  } else if (query.startsWith('http://') || query.startsWith('https://')) {
    const normalizedUrl = query.replace('music.youtube.com', 'www.youtube.com');
    try {
      const info = await youtubeDl(normalizedUrl, { dumpSingleJson: true, noWarnings: true, noPlaylist: true }) as { title?: string };
      tracks.push({ title: info.title ?? normalizedUrl, url: normalizedUrl });
    } catch {
      return interaction.editReply('Could not load that URL');
    }
  } else {
    const yt = await play.search(query, { limit: 1 });
    if (yt[0]) tracks.push({ title: yt[0].title!, url: yt[0].url! });
  }

  if (tracks.length === 0) {
    return interaction.editReply('No results found');
  }

  queue.tracks.push(...tracks);

  await interaction.editReply(`Added to queue`);

  if (!queue.playing) {
    playNext(interaction.guildId!).catch(console.error);
  }
}