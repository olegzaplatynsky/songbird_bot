import { ChatInputCommandInteraction } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import play from 'play-dl';
import { youtubeDl } from 'youtube-dl-exec';
import { queues } from '../music/queue.js';
import { createPlayer, playNext } from '../music/player.js';

export async function playNextCommand(interaction: ChatInputCommandInteraction) {
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

    queue = { connection, player, tracks: [], playing: false, loop: false, skipHandled: false };
    queues.set(interaction.guildId!, queue);
  }

  // Resolve tracks (same logic as /play)
  let tracks: { title: string; url: string }[] = [];

  if (play.sp_validate(query) !== false) {
    const spData = await play.spotify(query);
    const yt = await play.search(`${spData.name} ${(spData as any).artists?.[0]?.name ?? ''}`, {
      limit: 1,
    });
    if (yt[0]) tracks.push({ title: yt[0].title!, url: yt[0].url! });
  } else if (query.startsWith('http://') || query.startsWith('https://')) {
    const normalizedUrl = query.replace('music.youtube.com', 'www.youtube.com');
    const isPlaylist = normalizedUrl.includes('list=') || normalizedUrl.includes('/playlist');
    try {
      if (isPlaylist) {
        type Entry = { title?: string; url?: string; webpage_url?: string };
        const info = await youtubeDl(normalizedUrl, { dumpSingleJson: true, noWarnings: true, flatPlaylist: true, yesPlaylist: true }) as { entries?: Entry[] };
        for (const entry of info.entries ?? []) {
          const url = entry.webpage_url ?? entry.url;
          if (url) tracks.push({ title: entry.title ?? url, url });
        }
      } else {
        const info = await youtubeDl(normalizedUrl, { dumpSingleJson: true, noWarnings: true, noPlaylist: true }) as { title?: string };
        tracks.push({ title: info.title ?? normalizedUrl, url: normalizedUrl });
      }
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

  // Insert right after the current track (index 0) so it plays next.
  // If the queue is empty this is equivalent to a normal push.
  queue.tracks.splice(1, 0, ...tracks);

  await interaction.editReply(
    tracks.length === 1
      ? `**${tracks[0]!.title}** will play next`
      : `**${tracks.length} tracks** will play next`,
  );

  if (!queue.playing) {
    playNext(interaction.guildId!).catch(console.error);
  }
}
