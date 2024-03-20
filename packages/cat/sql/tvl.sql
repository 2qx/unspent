SELECT * FROM  (SELECT 
  Date(ts.timestamp) "day", 
  count(ts.locking_bytecode) "count_opened_cummulative",
  round(sum(ts.value),6) "tlv",
  round(sum(ts.value*f.value),2) "usd"
from mainnet_series ts 
left join mainnet_fiat f on Date(f.timestamp) = Date(ts.timestamp)
group by ts.timestamp order by ts.timestamp) a 
where usd is not null