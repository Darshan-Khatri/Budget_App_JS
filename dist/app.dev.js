"use strict";

// Budget controller
var budgetController = function () {
  var Expense = function Expense(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function Income(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function calculateTotal(type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };
  return {
    addItem: function addItem(type, des, val) {
      var newItem; //create new id 

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      } //create new item based on 'inc' or 'exp' type


      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      } //push it into our data structure.


      data.allItems[type].push(newItem); //return element

      return newItem;
    },
    calculateBudget: function calculateBudget() {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc'); // calculate the budget: income - expenses

      data.budget = data.totals.inc - data.totals.exp; // calculate the percentage of income that we spent

      if (data.totals.inc > 0) {
        data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
      } else {
        data.percentage = -1;
      }
    },
    getBudget: function getBudget() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    testing: function testing() {
      console.log(data);
    }
  };
}();
/****UIController********************************************************************************************************************************* */


var UIController = function () {
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
    percentageLabel: '.budget__expenses--percentage'
  };
  return {
    getInput: function getInput() {
      return {
        type: document.querySelector(DOM_strings.inputType).value,
        // will be either inc or exp
        description: document.querySelector(DOM_strings.inputDescription).value,
        value: parseFloat(document.querySelector(DOM_strings.inputValue).value)
      };
    },
    addListItem: function addListItem(object, type) {
      var html, newHtml, element; //Create HTML string with placeholder text

      if (type === 'inc') {
        element = DOM_strings.incomeContainer;
        html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOM_strings.expensesContainer;
        html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } //Replace the placeholder text with some actual data


      newHtml = html.replace('%id%', object.id);
      newHtml = newHtml.replace('%description%', object.description);
      newHtml = newHtml.replace('%value%', object.value); //insert the HTML to the DOM

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
    clearFields: function clearFields() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOM_strings.inputDescription + ',' + DOM_strings.inputValue); //Output of 'querySelectorAll' is LIST (NOT array) so we have converted list into array and store copy of array in FiledArr.

      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },
    displayBudget: function displayBudget(obj) {
      document.querySelector(DOM_strings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOM_strings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOM_strings.expensesLabel).textContent = obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(DOM_strings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOM_strings.percentageLabel).textContent = '---';
      }
    },
    getDOM_strings: function getDOM_strings() {
      return DOM_strings;
    }
  };
}(); //******************************************************************************************************************************* */
//GLOBAL APP CONTROLLER


var controller = function (budgetCtrl, UICtrl) {
  var setupEventListeners = function setupEventListeners() {
    var DOM = UICtrl.getDOM_strings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function (eventCatch) {
      if (eventCatch.keyCode === 13 || eventCatch.which === 13) {
        ctrlAddItem();
      }
    });
  };

  var updateBudget = function updateBudget() {
    //1. Calculate the budget
    budgetCtrl.calculateBudget(); //2. Return the budget

    var budget = budgetCtrl.getBudget(); //3. Display the budget on the UI 

    UICtrl.displayBudget(budget);
  };

  var ctrlAddItem = function ctrlAddItem() {
    var input, new_Item; //1. get input data

    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add item to budget controller
      new_Item = budgetCtrl.addItem(input.type, input.description, input.value); //3. Add the item to the UI

      UICtrl.addListItem(new_Item, input.type); //4. Clear the fields

      UICtrl.clearFields(); //5. Calculate and update budget.

      updateBudget();
    }
  };

  return {
    init: function init() {
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
}(budgetController, UIController);

controller.init();