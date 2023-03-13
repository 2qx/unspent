from __future__ import print_function
import mainnet
import math
from mainnet.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://rest-unstable.mainnet.cash
# See configuration.py for a list of all supported configuration parameters.
configuration = mainnet.Configuration(
    host="https://rest-unstable.mainnet.cash"
    #host="http://localhost:3000"
)

configuration.access_token = None

decay = 100
executorFee = 5460

# Enter a context with an instance of the API client
with mainnet.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = mainnet.ContractApi(api_client)

    contract_init = {
        "network": "mainnet",
        "script": "pragma cashscript >= 0.7.1;contract Perpetuity(int period,bytes recipientLockingBytecode,int executorAllowance,int decay) {function execute() {require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);require(tx.age >= period);require(tx.outputs[1].lockingBytecode == new LockingBytecodeP2SH(hash160(this.activeBytecode)));int currentValue = tx.inputs[this.activeInputIndex].value;int installment = currentValue/decay;int returnedValue = currentValue - installment - executorAllowance;require(tx.outputs[0].value >= installment);require(tx.outputs[1].value >= returnedValue);}}",
        "parameters": [
            4000,
            "76a914ebdeb6430f3d16a9c6758d6c0d7a400c8e6bbee488ac",
            executorFee,
            decay
        ]
    }
    try:
        # Serialize a contract
        perp = api_instance.create_contract(contract_init)

        pprint(perp)
    except ApiException as e:
        print("Exception when calling ContractApi->create_contract: %s\n" % e)

    utxo_request = {
        "contractId": perp.contract_id
    }

    try:
        # Call a method on a contract
        utxo_response = api_instance.contract_utxos(utxo_request)
        value = utxo_response.utxos[0].value
        pprint(utxo_response)
    except ApiException as e:
        print("Exception when calling ContractApi->contract_utxo: %s\n" % e)

    payout = math.floor(value/decay)
    principal = value-(payout+executorFee)

    execute_request = {
        "contractId": "contract:mainnet:TkRBd01BPT06TVRFNExERTJPU3d5TUN3eU16VXNNakl5TERFNE1pdzJOeXd4TlN3Mk1Td3lNaXd4Tmprc01UazRMREV4Tnl3eE5ERXNNVEE0TERFekxERXlNaXcyTkN3eE1pd3hORElzTVRBM0xERTVNQ3d5TWpnc01UTTJMREUzTWc9PTpOVFEyTUE9PTpNVEF3:cHJhZ21hIGNhc2hzY3JpcHQgPj0gMC43LjE7Y29udHJhY3QgUGVycGV0dWl0eShpbnQgcGVyaW9kLGJ5dGVzIHJlY2lwaWVudExvY2tpbmdCeXRlY29kZSxpbnQgZXhlY3V0b3JBbGxvd2FuY2UsaW50IGRlY2F5KSB7ZnVuY3Rpb24gZXhlY3V0ZSgpIHtyZXF1aXJlKHR4Lm91dHB1dHNbMF0ubG9ja2luZ0J5dGVjb2RlID09IHJlY2lwaWVudExvY2tpbmdCeXRlY29kZSk7cmVxdWlyZSh0eC5hZ2UgPj0gcGVyaW9kKTtyZXF1aXJlKHR4Lm91dHB1dHNbMV0ubG9ja2luZ0J5dGVjb2RlID09IG5ldyBMb2NraW5nQnl0ZWNvZGVQMlNIKGhhc2gxNjAodGhpcy5hY3RpdmVCeXRlY29kZSkpKTtpbnQgY3VycmVudFZhbHVlID0gdHguaW5wdXRzW3RoaXMuYWN0aXZlSW5wdXRJbmRleF0udmFsdWU7aW50IGluc3RhbGxtZW50ID0gY3VycmVudFZhbHVlL2RlY2F5O2ludCByZXR1cm5lZFZhbHVlID0gY3VycmVudFZhbHVlIC0gaW5zdGFsbG1lbnQgLSBleGVjdXRvckFsbG93YW5jZTtyZXF1aXJlKHR4Lm91dHB1dHNbMF0udmFsdWUgPj0gaW5zdGFsbG1lbnQpO3JlcXVpcmUodHgub3V0cHV0c1sxXS52YWx1ZSA+PSByZXR1cm5lZFZhbHVlKTt9fQ==:2120607467",
            "action": "send",
            "function": "execute",
            "to": [
                {
                    "cashaddr": "bitcoincash:qr4aadjrpu73d2wxwkxkcrt6gqxgu6a7usxfm96fst",
                    "unit": "sats",
                    "value": payout
                },
                {
                    "cashaddr": perp.cashaddr,
                    "unit": "sats",
                    "value": principal
                },
                {
                    "cashaddr": "bitcoincash:qr4aadjrpu73d2wxwkxkcrt6gqxgu6a7usxfm96fst",
                    "unit": "sats",
                    "value": 5000
                }
            ],
        "withoutChange": 'true'
    }

    try:
        # Call a method on a contract
        fn_response = api_instance.contract_fn(execute_request)
        pprint(fn_response)
    except ApiException as e:
        print("Exception when calling ContractApi->contract_utxo: %s\n" % e.body)
