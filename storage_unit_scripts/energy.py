import os,json
from web3 import Web3

class Energy:

    def constructor(self):
        pass

    def check(self):
        #Here the actual energy consumption reading will be done by the smart meter
        consumptions = []
        check = True
        while True:
            try:
                address = input("Consumer/Producer Address: ")
                if(not Web3.is_address(address)): break
                if (address == 'exit'): check = False
                wh = int(input("Consumption/Production: "))
                consumptions.append({'address':address,'wh':wh})
            except:
                break
        return consumptions,check