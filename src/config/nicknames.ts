export const nicknameAliases: Record<string, string> = {
  'threedaws': 'Nazariy MILFrieren',
  'green_banana': 'Karaoke Banana',
  'fizenberg': 'Бодя найкращий',
  'dirudik': 'Dream on, Dream on, I dream on, Dream a little, I`ll dream on, Dream on, I dream on, I dream on',
  'i.insomnia': 'Vibecoder with insomnia',
  'toroross0': '🦍 toroross0 🦍 jump 🦍 toroross0 🦍 zap 🦍 toroross0 🦍 ult 🦍 toroross0 🦍 nap 🦍',
};

export function getDisplayName(interaction: any): string {
  const raw: string =
    // interaction.member?.displayName ??
    // interaction.user?.displayName ??
    interaction.user?.username ??
    'Someone';

  return nicknameAliases[raw.toLowerCase()] ?? raw;
}
