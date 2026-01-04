import {
  loadPub,
  type MWBSchedule,
  type WSchedule
} from 'meeting-schedules-parser/dist/node/index.js'

export const getPublicationSchedule = async <T extends 'mwb' | 'wt'>(
  url: string,
  _type: T
): Promise<T extends 'mwb' ? MWBSchedule[] : WSchedule[]> => {
  const schedule: T extends 'mwb' ? MWBSchedule[] : WSchedule[] = await loadPub({ url })
  return schedule
}
