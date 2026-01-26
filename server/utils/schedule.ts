import {
  loadPub,
  type MWBSchedule,
  type WSchedule
} from 'meeting-schedules-parser/dist/node/index.js'

interface WatchtowerSchedule extends WSchedule {
  w_study_date: ISODate
}

interface WorkbookSchedule extends MWBSchedule {
  mwb_week_date: ISODate
}

export const getPublicationSchedule = async <T extends 'mwb' | 'wt'>(
  url: string,
  _type: T
): Promise<T extends 'mwb' ? WorkbookSchedule[] : WatchtowerSchedule[]> => {
  const schedule: T extends 'mwb' ? WorkbookSchedule[] : WatchtowerSchedule[] = (
    await loadPub({ url })
  ).map((item: MWBSchedule | WSchedule) => {
    return 'w_study_date' in item
      ? { ...item, w_study_date: item.w_study_date?.replaceAll('/', '-') }
      : { ...item, mwb_week_date: item.mwb_week_date?.replaceAll('/', '-') }
  })
  return schedule
}
