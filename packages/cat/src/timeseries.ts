import { SeriesEntryI } from "./db";

export function getRegularSeries(irregularTs: any): SeriesEntryI[] {
  let regular = []

  if (irregularTs) {

    let dateVector = getDailyArray(new Date(irregularTs[0].date))


    let first = irregularTs.shift();
    let lockingBytecode = first.locking_bytecode

    if (irregularTs.length > 0) {
      let changes:{ [k: string]: any; } = []
      try{
        changes = Object.fromEntries(irregularTs.map((d: any) => [d.date.toISOString().split('T')[0], d.dv]))
      }catch (e:any){
        console.log(irregularTs)
      }

      for (let d of dateVector) {

        let tmpVal: number = regular.length > 0 ? regular.slice(-1)[0].value : first.dv
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
  return regular
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