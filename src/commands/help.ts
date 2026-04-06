export function helpCommand(interaction: any) {
  const message = [
    '**/play** <query> — Add a song or playlist to the end of the queue (YouTube URL, Spotify link, or search text)',
    '**/playnext** <query> — Add a song right after the currently playing track',
    '**/playshuffle** <query> — Add tracks to the queue in shuffled order (existing queue untouched)',
    '**/skip** — Skip the current track and play the next one',
    '**/pause** — Pause playback',
    '**/continue** — Resume paused playback',
    '**/loop** — Toggle looping the current track on/off',
    '**/queue** — Show the current queue',
    '**/shuffle** — Shuffle all queued tracks (keeps current track playing)',
    '**/clear** — Remove all tracks from the queue and stop playback',
    '**/leave** — Disconnect the bot from the voice channel',
    '**/help** — Show this message',
  ].join('\n');

  interaction.reply(message);
}
