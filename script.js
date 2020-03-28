/*
    Calculator by Alex 26 march 2020
*/
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
        let filtered = this.bankProducts.filter(bank => bank.currency === deposit.currency)
            .filter(bank => bank.sumMin <= deposit.initialAmount)
            .filter(bank => (bank.sumMax == null) ? true : bank.sumMax >= deposit.initialAmount)
            .filter(bank => bank.termMin <= deposit.period)
            .filter(bank => bank.termMax >= deposit.period);

        let canFill = [];
        if (deposit.monthlyFill > 0) {
            canFill = filtered.filter(bank => bank.canDeposit);
        }

        let sortByPercent;
        if (canFill.length === 0) {
            sortByPercent = filtered.sort((a, b) => a.incomeType - b.incomeType);
        } else {
            sortByPercent = canFill.sort((a, b) => a.incomeType - b.incomeType);
        }
        if (sortByPercent.length === 0) {
            return [];
        }
        let maxPercent = sortByPercent[sortByPercent.length - 1].incomeType;
        return sortByPercent.filter(bank => bank.incomeType === maxPercent);
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
                };
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
        } else {
            container.innerHTML = '<p>Нет подходящих вариантов</p>';
        }
    }

    getRow(bankName, investName, incomeType, fv) {
        const namePart = '<td>' + bankName + '</td>';
        const investPart = '<td>' + investName + '</td>';
        const incomePart = '<td>' + incomeType + '</td>';
        const fvPart = '<td>' + fv + '</td>';

        return `<tr class="row">` + namePart + investPart + incomePart + fvPart + '</tr>';
    }

}

function fillAllBanks(dataBase) {
    let allBanksFromDb = [];
    for (let bank of dataBase) {

        let bankProduct = new BankProduct(
            bank.bankName,
            bank.investName,
            bank.currency,
            bank.incomeType,
            bank.sumMin,
            bank.sumMax,
            bank.termMin,
            bank.termMax,
            bank.canDeposit
        );
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

let res = [{
    "bankName": "Газпромбанк",
    "investName": "Ваш успех",
    "currency": "RUB",
    "incomeType": 6.22,
    "sumMin": 50000,
    "sumMax": null,
    "termMin": 12,
    "termMax": 12,
    "canDeposit": false
},
    {
        "bankName": "Кредит Европа Банк",
        "investName": "Оптимальный на 2 года",
        "currency": "RUB",
        "incomeType": 6.45,
        "sumMin": 100000,
        "sumMax": null,
        "termMin": 24,
        "termMax": 24,
        "canDeposit": false
    },
    {
        "bankName": "Банк Зенит",
        "investName": "Праздничный 500+",
        "currency": "RUB",
        "incomeType": 6,
        "sumMin": 30000,
        "sumMax": null,
        "termMin": 17,
        "termMax": 17,
        "canDeposit": false
    },
    {
        "bankName": "Еврофинанс Моснарбанк",
        "investName": "Классический",
        "currency": "RUB",
        "incomeType": 6.95,
        "sumMin": 30000,
        "sumMax": null,
        "termMin": 12,
        "termMax": 24,
        "canDeposit": false
    },
    {
        "bankName": "Джей энд Ти Банк",
        "investName": "Магнус-Онлайн",
        "currency": "RUB",
        "incomeType": 6.8,
        "sumMin": 100000,
        "sumMax": null,
        "termMin": 6,
        "termMax": 6,
        "canDeposit": false
    },
    {
        "bankName": "МТС Банк",
        "investName": "В вашу пользу",
        "currency": "RUB",
        "incomeType": 6.75,
        "sumMin": 50000,
        "sumMax": null,
        "termMin": 12,
        "termMax": 12,
        "canDeposit": true
    },
    {
        "bankName": "Эс-Би-Ай Банк",
        "investName": "Свои правила Онлайн",
        "currency": "RUB",
        "incomeType": 6.7,
        "sumMin": 30000,
        "sumMax": 30000000,
        "termMin": 24,
        "termMax": 24,
        "canDeposit": false
    },
    {
        "bankName": "Банк Уралсиб",
        "investName": "Прогноз отличный",
        "currency": "RUB",
        "incomeType": 6.7,
        "sumMin": 100000,
        "sumMax": null,
        "termMin": 37,
        "termMax": 37,
        "canDeposit": false
    },
    {
        "bankName": "Инвестторгбанк",
        "investName": "ИТБ-Постоянный доход",
        "currency": "RUB",
        "incomeType": 6.6,
        "sumMin": 50000,
        "sumMax": null,
        "termMin": 37,
        "termMax": 37,
        "canDeposit": false
    },
    {
        "bankName": "Транскапиталбанк",
        "investName": "ТКБ.Постоянный доход",
        "currency": "RUB",
        "incomeType": 6.6,
        "sumMin": 50000,
        "sumMax": null,
        "termMin": 37,
        "termMax": 37,
        "canDeposit": false
    },
    {
        "bankName": "Совкомбанк",
        "investName": "Зимний праздник с Халвой",
        "currency": "RUB",
        "incomeType": 5.6,
        "sumMin": 50000,
        "sumMax": null,
        "termMin": 2,
        "termMax": 2,
        "canDeposit": true
    },
    {
        "bankName": "Агророс",
        "investName": "Медовый месяц",
        "currency": "RUB",
        "incomeType": 5.51,
        "sumMin": 20000,
        "sumMax": null,
        "termMin": 1,
        "termMax": 1,
        "canDeposit": true
    },
    {
        "bankName": "Росдорбанк",
        "investName": "Онлайн-1",
        "currency": "RUB",
        "incomeType": 5.1,
        "sumMin": 100000,
        "sumMax": 150000000,
        "termMin": 1,
        "termMax": 1,
        "canDeposit": true
    },
    {
        "bankName": "Национальный Стандарт",
        "investName": "Сберегательный стандарт",
        "currency": "RUB",
        "incomeType": 5.1,
        "sumMin": 100000,
        "sumMax": null,
        "termMin": 1,
        "termMax": 3,
        "canDeposit": true
    },
    {
        "bankName": "Россия",
        "investName": "Морозные узоры",
        "currency": "RUB",
        "incomeType": 5,
        "sumMin": 100000,
        "sumMax": null,
        "termMin": 1,
        "termMax": 1,
        "canDeposit": true
    },
    {
        "bankName": "Кузнецкий Мост",
        "investName": "Накопительный",
        "currency": "RUB",
        "incomeType": 4.85,
        "sumMin": 50000,
        "sumMax": null,
        "termMin": 1,
        "termMax": 3,
        "canDeposit": true
    },
    {
        "bankName": "Тексбанк",
        "investName": "Универсальный",
        "currency": "RUB",
        "incomeType": 4.6,
        "sumMin": 10000,
        "sumMax": null,
        "termMin": 1,
        "termMax": 1,
        "canDeposit": true
    },
    {
        "bankName": "Морской Банк",
        "investName": "Правильным курсом +",
        "currency": "RUB",
        "incomeType": 4.55,
        "sumMin": 100000,
        "sumMax": null,
        "termMin": 1,
        "termMax": 3,
        "canDeposit": true
    },
    {
        "bankName": "Норвик Банк",
        "investName": "Лаконичный",
        "currency": "RUB",
        "incomeType": 4.5,
        "sumMin": 500,
        "sumMax": 50000000,
        "termMin": 1,
        "termMax": 1,
        "canDeposit": true
    },
    {
        "bankName": "Промсельхозбанк",
        "investName": "Конструктор",
        "currency": "RUB",
        "incomeType": 4.5,
        "sumMin": 10000,
        "sumMax": null,
        "termMin": 1,
        "termMax": 3,
        "canDeposit": true
    },
    {
        "bankName": "Акибанк",
        "investName": "Онлайн",
        "currency": "RUB",
        "incomeType": 6.5,
        "sumMin": 1000,
        "sumMax": null,
        "termMin": 6,
        "termMax": 6,
        "canDeposit": true
    },
    {
        "bankName": "Банк БКФ",
        "investName": "Ключевой стандарт",
        "currency": "RUB",
        "incomeType": 6.5,
        "sumMin": 100000,
        "sumMax": null,
        "termMin": 6,
        "termMax": 13,
        "canDeposit": true
    },
    {
        "bankName": "Экспобанк",
        "investName": "Специальный (в конце срока)",
        "currency": "RUB",
        "incomeType": 6.35,
        "sumMin": 50000,
        "sumMax": 10000000,
        "termMin": 6,
        "termMax": 6,
        "canDeposit": true
    },
    {
        "bankName": "Инвестторгбанк",
        "investName": "ИТБ-Пополняемый",
        "currency": "RUB",
        "incomeType": 6.15,
        "sumMin": 50000,
        "sumMax": 30000000,
        "termMin": 6,
        "termMax": 6,
        "canDeposit": true
    },
    {
        "bankName": "Транскапиталбанк",
        "investName": "ТКБ.Пополняемый",
        "currency": "RUB",
        "incomeType": 6.15,
        "sumMin": 50000,
        "sumMax": 30000000,
        "termMin": 6,
        "termMax": 6,
        "canDeposit": true
    },
    {
        "bankName": "Евроазиатский Инвестиционный Банк",
        "investName": "Классика",
        "currency": "RUB",
        "incomeType": 6.1,
        "sumMin": 100000,
        "sumMax": null,
        "termMin": 6,
        "termMax": 12,
        "canDeposit": true
    },
    {
        "bankName": "Тимер Банк",
        "investName": "Надежный выбор",
        "currency": "RUB",
        "incomeType": 6,
        "sumMin": 10000,
        "sumMax": null,
        "termMin": 6,
        "termMax": 6,
        "canDeposit": true
    },
    {
        "bankName": "Евразийский Банк",
        "investName": "TURBO MAXIMUM",
        "currency": "RUB",
        "incomeType": 6,
        "sumMin": 30000,
        "sumMax": 299999,
        "termMin": 6,
        "termMax": 6,
        "canDeposit": true
    },
    {
        "bankName": "Таврический Банк",
        "investName": "Достижимый (онлайн)",
        "currency": "RUB",
        "incomeType": 6,
        "sumMin": 50000,
        "sumMax": null,
        "termMin": 6,
        "termMax": 6,
        "canDeposit": true
    },
    {
        "bankName": "Экспобанк",
        "investName": "Юбилейный 25 (в конце срока)",
        "currency": "RUB",
        "incomeType": 6.5,
        "sumMin": 100000,
        "sumMax": 20000000,
        "termMin": 12,
        "termMax": 12,
        "canDeposit": true
    },
    {
        "bankName": "Крокус-Банк",
        "investName": "Ежемесячный доход",
        "currency": "RUB",
        "incomeType": 6.35,
        "sumMin": 50000,
        "sumMax": null,
        "termMin": 12,
        "termMax": 12,
        "canDeposit": true
    },
    {
        "bankName": "Промсельхозбанк",
        "investName": "Ваш выбор",
        "currency": "RUB",
        "incomeType": 6.3,
        "sumMin": 10000,
        "sumMax": null,
        "termMin": 12,
        "termMax": 12,
        "canDeposit": true
    },
    {
        "bankName": "Нацинвестпромбанк",
        "investName": "Прибыльный",
        "currency": "RUB",
        "incomeType": 6.3,
        "sumMin": 50000,
        "sumMax": null,
        "termMin": 12,
        "termMax": 12,
        "canDeposit": true
    },
    {
        "bankName": "Ишбанк",
        "investName": "Накопительный",
        "currency": "RUB",
        "incomeType": 6.25,
        "sumMin": 100000,
        "sumMax": null,
        "termMin": 12,
        "termMax": 12,
        "canDeposit": true
    },
    {
        "bankName": "Примсоцбанк",
        "investName": "Новогодний чулок (333 дня)",
        "currency": "RUB",
        "incomeType": 6.2,
        "sumMin": 10000,
        "sumMax": null,
        "termMin": 11,
        "termMax": 11,
        "canDeposit": true
    },
    {
        "bankName": "Еврофинанс Моснарбанк",
        "investName": "Пополняемый",
        "currency": "RUB",
        "incomeType": 6.75,
        "sumMin": 1000000,
        "sumMax": null,
        "termMin": 12,
        "termMax": 24,
        "canDeposit": true
    },
    {
        "bankName": "Евроазиатский Инвестиционный Банк",
        "investName": "VIP",
        "currency": "RUB",
        "incomeType": 6.35,
        "sumMin": 1000000,
        "sumMax": null,
        "termMin": 9,
        "termMax": 12,
        "canDeposit": true
    },
    {
        "bankName": "Российская Финансовая Корпорация",
        "investName": "Универсальный",
        "currency": "RUB",
        "incomeType": 6,
        "sumMin": 5000,
        "sumMax": null,
        "termMin": 3,
        "termMax": 3,
        "canDeposit": true
    },
    {
        "bankName": "Московский Кредитный Банк",
        "investName": "МЕГА Онлайн",
        "currency": "RUB",
        "incomeType": 5.8,
        "sumMin": 1000,
        "sumMax": null,
        "termMin": 3,
        "termMax": 5,
        "canDeposit": true
    },
    {
        "bankName": "Александровский",
        "investName": "Черника 19/20",
        "currency": "RUB",
        "incomeType": 5.6,
        "sumMin": 20000,
        "sumMax": null,
        "termMin": 3,
        "termMax": 3,
        "canDeposit": true
    },
    {
        "bankName": "Финанс Бизнес Банк",
        "investName": "Мандариновый!",
        "currency": "RUB",
        "incomeType": 5.6,
        "sumMin": 50000,
        "sumMax": null,
        "termMin": 3,
        "termMax": 3,
        "canDeposit": true
    },
    {
        "bankName": "ЦентроКредит",
        "investName": "Доход Плюс",
        "currency": "USD",
        "incomeType": 1.15,
        "sumMin": 5000,
        "sumMax": null,
        "termMin": 3,
        "termMax": 3,
        "canDeposit": true
    },
    {
        "bankName": "Совкомбанк",
        "investName": "Удобный (в долларах)",
        "currency": "USD",
        "incomeType": 1,
        "sumMin": 500,
        "sumMax": null,
        "termMin": 3,
        "termMax": 6,
        "canDeposit": true
    },
    {
        "bankName": "Веста",
        "investName": "Веста - Копилка",
        "currency": "USD",
        "incomeType": 1,
        "sumMin": 10000,
        "sumMax": null,
        "termMin": 3,
        "termMax": 6,
        "canDeposit": true
    },
    {
        "bankName": "Славия",
        "investName": "Славный Капитал",
        "currency": "USD",
        "incomeType": 0.85,
        "sumMin": 5000,
        "sumMax": null,
        "termMin": 3,
        "termMax": 4,
        "canDeposit": true
    },
    {
        "bankName": "Роскосмосбанк",
        "investName": "Комфортный",
        "currency": "USD",
        "incomeType": 0.8,
        "sumMin": 500,
        "sumMax": null,
        "termMin": 3,
        "termMax": 6,
        "canDeposit": true
    },
    {
        "bankName": "ФорБанк",
        "investName": "Срочный накопительный",
        "currency": "USD",
        "incomeType": 0.8,
        "sumMin": 10000,
        "sumMax": 500000,
        "termMin": 3,
        "termMax": 3,
        "canDeposit": true
    },
    {
        "bankName": "Московский Областной Банк",
        "investName": "Гарантированный доллар",
        "currency": "USD",
        "incomeType": 0.75,
        "sumMin": 50,
        "sumMax": null,
        "termMin": 4,
        "termMax": 4,
        "canDeposit": true
    },
    {
        "bankName": "Объединенный Резервный Банк",
        "investName": "ОРБ-Накопительный (в конце срока)",
        "currency": "USD",
        "incomeType": 1.6,
        "sumMin": 1000,
        "sumMax": null,
        "termMin": 12,
        "termMax": 12,
        "canDeposit": true
    },
    {
        "bankName": "Банк Агора",
        "investName": "Срочный",
        "currency": "USD",
        "incomeType": 1.5,
        "sumMin": 1000,
        "sumMax": null,
        "termMin": 12,
        "termMax": 12,
        "canDeposit": true
    },
    {
        "bankName": "Тинькофф Банк",
        "investName": "СмартВклад (с повышенной ставкой)",
        "currency": "USD",
        "incomeType": 1.5,
        "sumMin": 1000,
        "sumMax": null,
        "termMin": 12,
        "termMax": 12,
        "canDeposit": true
    },
    {
        "bankName": "Первый Инвестиционный Банк",
        "investName": "Закон сохранения",
        "currency": "USD",
        "incomeType": 1.5,
        "sumMin": 1000,
        "sumMax": null,
        "termMin": 12,
        "termMax": 12,
        "canDeposit": true
    },
    {
        "bankName": "Новый Век",
        "investName": "Сберегательный",
        "currency": "USD",
        "incomeType": 1.5,
        "sumMin": 5000,
        "sumMax": 20000,
        "termMin": 12,
        "termMax": 12,
        "canDeposit": true
    }
];