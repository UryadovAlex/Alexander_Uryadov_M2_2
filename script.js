import { res } from "./db.js";

class Deposit {
    constructor(initialAmount, monthlyFill, period, currency) {
        this.initialAmount = initialAmount;
        this.monthlyFill = monthlyFill;
        this.period = period;
        this.currency = currency;
    }
}

class BankProduct {
    constructor(bankName,
                investName,
                currency,
                incomeType,
                sumMin,
                sumMax,
                termMin,
                termMax,
                canDeposit) {
        this.bankName = bankName;
        this.investName = investName;
        this.currency = currency;
        this.incomeType = incomeType;
        this.sumMin = sumMin;
        this.sumMax = sumMax;
        this.termMin = termMin;
        this.termMax = termMax;
        this.canDeposit = canDeposit;
    }
}

class Calculator {
    constructor(bankProducts) {
        this.bankProducts = bankProducts;
    }

    filter(deposit) {
       let byCurrency = this.bankProducts.filter( bank => bank.currency === deposit.currency);
       let bySumMin = byCurrency.filter( bank => bank.sumMin <= deposit.initialAmount);
       let bySumMax = bySumMin.filter( bank => (bank.sumMax == null) ? true : bank.sumMax >= deposit.initialAmount);
       let byTermMin = bySumMax.filter( bank => bank.termMin <= deposit.period);
       let byTermMax = byTermMin.filter( bank => bank.termMax >= deposit.period);

       let canFill = [];
       if(deposit.monthlyFill > 0) {
            canFill = byTermMax.filter( bank => bank.canDeposit );
       }

       let sortByPercent = [];
       if (canFill.length === 0){
           sortByPercent = byTermMax.sort((a, b) => a.incomeType - b.incomeType);
       } else {
           sortByPercent = canFill.sort((a, b) => a.incomeType - b.incomeType);
       }
       if (sortByPercent.length === 0){
           return [];
       }
       let maxPercent = sortByPercent[sortByPercent.length - 1].incomeType;
       let filterByMaxPercent = sortByPercent.filter( bank => bank.incomeType === maxPercent);

       return filterByMaxPercent;
    }

    calculate(deposit) {
        let result = [];
        let arr = this.filter(deposit);
        if (arr.length > 0) {
            for (let bank of arr) {
                let fv = deposit.initialAmount;
                let monthlyFill = deposit.monthlyFill;
                let monthlyPercent = bank.incomeType / 100 / 12;
                let period = deposit.period;

                for (let i = 0; i < period; i++) {
                    fv += monthlyPercent * fv + monthlyFill;
                }
                fv = Math.round(fv);
                fv -= monthlyFill;
                let offer = {
                    bankName: bank.bankName,
                    investName: bank.investName,
                    incomeType: bank.incomeType,
                    fv: fv
                }
                result.push(offer);
            }
        }

        return result;
    }

}

class Application {

    constructor(resultArray) {
        this.resultArray = resultArray;
    }

    drawTable() {
        const container = document.getElementById('table');

        if (this.resultArray.length !== 0) {

            const arr = [];
            arr[0] = '<tr><th>Название банка</th><th>Сумма ежемесячного пополнения</th><th>Процент</th><th>Итоговая сумма</th></tr>';

            for (let i = 0; i < this.resultArray.length; i++) {
                const bankName = this.resultArray[i].bankName;
                const investName = this.resultArray[i].investName;
                const incomeType = this.resultArray[i].incomeType;
                const fv = this.resultArray[i].fv;
                arr[i + 1] = this.getRow(bankName, investName, incomeType, fv);
            }

            container.innerHTML = '<table>' + arr.join('') + '</table>';
        }else {
            container.innerHTML = '<p>Нет подходящих вариантов</p>';
        }
    }
    getRow(bankName, investName, incomeType, fv) {
        const namePart = '<td>'+bankName+'</td>' ;
        const investPart = '<td>'+investName+'</td>' ;
        const incomePart = '<td>'+incomeType+'</td>' ;
        const fvPart = '<td>'+fv+'</td>' ;

        let row = `<tr class="row">` + namePart + investPart + incomePart + fvPart + '</tr>' ;
        return row ;
    }

}

function fillAllBanks(dataBase) {
    let allBanksFromDb = [];
    for( let bank of dataBase) {

        let bankProduct = new  BankProduct(
            bank.bankName,
            bank.investName,
            bank.currency,
            bank.incomeType,
            bank.sumMin,
            bank.sumMax,
            bank.termMin,
            bank.termMax,
            bank.canDeposit
        )
        allBanksFromDb.push(bankProduct);
    }
    return allBanksFromDb;
}

function start() {
    let amountInput = +document.getElementById('amount').value; //initialAmount, monthlyFill, period, currency
    let monthlyFill = +document.getElementById('fill').value;
    let period = +document.getElementById('period').value;
    let currency = document.getElementById('currency').value;

    if (currency === 'RUB' || currency === 'USD') {
        let deposit = new Deposit(amountInput, monthlyFill, period, currency);

        let banks = fillAllBanks(res);
        let calc = new Calculator(banks);
        let result = calc.calculate(deposit);
        let app = new Application(result);
        app.drawTable();
    } else {
        alert('Некорректное значение валюты');
    }


}

let btn = document.getElementById('btn');
btn.addEventListener('click', start);

