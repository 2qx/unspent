import { SeriesEntryI } from "./db";

export function getRegularSeries(irregularTs: any): SeriesEntryI[] {
  let regular = []
  let irregularTsCopy  =  irregularTs;
  if (irregularTs.length > 0) {

    let dateVector = getDailyArray(new Date(irregularTs[0].date))

    let first = irregularTs[0];
    let lockingBytecode = first.locking_bytecode

    if (irregularTs.length > 0) {
      let changes: { [k: string]: any; } = []
      try {
        changes = Object.fromEntries(irregularTs.map((d: any) => [d.date.toISOString().split('T')[0], d.dv]))
      } catch (e: any) {
        console.log(e)
        console.log("error mapping time series: ", irregularTs)
      }

      for (let d of dateVector) {
        let tmpVal: number = regular.length > 0 ? regular.slice(-1)[0].value : 0
        if (d in changes) {
          tmpVal += changes[d]
        }
        regular.push({
          id: lockingBytecode + d,
          timestamp: d,
          value: tmpVal,
          locking_bytecode: lockingBytecode
        })
      }
    }


  }

  if (regular.length > 1) {

    return regular
  } else {
    return irregularTsCopy;
  }
}

function getDailyArray(start: Date) {
  const date = new Date(start.getTime());
  const end = new Date(Date.now());

  const dates = [];
  while (date <= end) {
    dates.push(new Date(date).toISOString().split('T')[0]);
    date.setDate(date.getDate() + 1);
  }
  return dates;
}