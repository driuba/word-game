import { Statistic } from '~/entities';

export function getStatistics(channelId: string) {
  return Statistic.find({
    where: {
      channelId
    }
  });
}
