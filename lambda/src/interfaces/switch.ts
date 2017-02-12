export type Status = 'on' | 'off';

export interface Switch {
  id: string,
  codes: {
    // Both 'on' and 'off' codes, TODO figure out how to better type this
    [s: string]: number
  },
  number: number,
  purpose: string,
  status: Status,
  alexaSpeakWord: string
}

