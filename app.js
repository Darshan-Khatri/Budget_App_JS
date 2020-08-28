// Budget controller: This is internal calculation and algorithm program.
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1,
    };

    return {
        addItem: function (type, des, val) {
            var newItem;

            //create new id 
            if (data.allItems[type].length > 0) {

                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }

            //create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }


            //push it into our data structure. 
            data.allItems[type].push(newItem);

            //return element
            return newItem;
        },

        deleteItem: function (type, id) {

            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {

            data.allItems.exp.forEach(function (cur) {

                cur.calcPercentage(data.totals.inc);

            });
        },

        getPercentages: function () {

            var AllPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return AllPerc;
        },

        getBudget: function () {

            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }

        },

        testing: function () {
            console.log(data);
        }
    };

})();


/****UIController: ALL UI related program************************************************************************************************************************* */
var UIController = (function () {

    var DOM_strings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage'
    };

    return {
        getInput: function () {

            return {
                type: document.querySelector(DOM_strings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOM_strings.inputDescription).value,
                value: parseFloat(document.querySelector(DOM_strings.inputValue).value),
            };
        },

        addListItem: function (object, type) {

            var html, newHtml, element;
            //Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOM_strings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp') {
                element = DOM_strings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', object.id);
            newHtml = newHtml.replace('%description%', object.description);
            newHtml = newHtml.replace('%value%', object.value);

            //insert the HTML to the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOM_strings.inputDescription + ',' + DOM_strings.inputValue);

            //Output of 'querySelectorAll' is LIST (NOT array) so we have converted list into array and store copy of array in FiledArr.
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {

            document.querySelector(DOM_strings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOM_strings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOM_strings.expensesLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOM_strings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOM_strings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOM_strings.expensesPercLabel);

            var nodeListForEach = function (list, callbackFn) {
                for (let i = 0; i < list.length; i++) {

                    callbackFn(list[i], i);
                }
            };

            nodeListForEach(fields, function (current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else {
                    current.textContent = '---';
                }

            });


        },

        getDOM_strings: function () {
            return DOM_strings;
        }
    };

})();



//******************************************************************************************************************************* */
//GLOBAL APP CONTROLLER: It's module which combines and run, UI and Data-structure/Algorithm module.
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOM_strings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (eventCatch) {

            if (eventCatch.keyCode === 13 || eventCatch.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };


    var updateBudget = function () {

        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI 
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {

        // 1. calculate the %.
        budgetCtrl.calculatePercentages();

        //2. Read from the budget controller.
        var percentages = budgetCtrl.getPercentages();


        //3. Update the UI.
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {

        var input, new_Item;

        //1. get input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2. Add item to budget controller
            new_Item = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            UICtrl.addListItem(new_Item, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and update budget.
            updateBudget();

            //6. Calculate and update the %
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function (event_click) {
        var itemID, splitID, type, ID;
        itemID = (event_click.target.parentNode.parentNode.parentNode.parentNode.id);

        if (itemID) {

            //inc-1 or exp-3
            splitID = itemID.split('-'); //outPut:- ["inc","1"]
            type = splitID[0];
            ID = +splitID[1];

            //1. Delete the item from data structure.
            budgetCtrl.deleteItem(type, ID);

            //2. Delete items from the UI.
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget.
            updateBudget();

            //4. Calculate and update the %
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log("Application is started!");
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };



})(budgetController, UIController);

controller.init();