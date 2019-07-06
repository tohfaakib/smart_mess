var express = require('express');
var router = express.Router();
var moment = require('moment');

var ontime = require('ontime');

var expense_db = require.main.require('./models/expense-model');
var meal_db = require.main.require('./models/meal-model');
var user_db = require.main.require('./models/user-model');



ontime({
    cycle: ['18:04:00']
}, function (ot) {
    console.log("on time runs!");

    user_db.getAllMembers((results) => {
        if(results){
            for (var i =0; i < results.length; i++) {
                data ={
                    email: results[i].email,
                    mess_id: results[i].mess_id,
                    breakfast: 1,
                    lunch: 1,
                    dinner: 1
                };

                meal_db.insert(data, (result)=> {
                    if (result){
                        console.log("inserted");
                    } else {
                        console.log("not inserted");
                    }
                })
            }
        } else {
            console.log("Cannot find users")
        }
    });


});



router.get('*', (req, res, next) => {
    if (req.session.email != null) {
        next();
    } else {
        res.redirect('/');
    }
});


router.get('/', (req, res) => {

    var data={
      email: req.session.email,
    };
    meal_db.getMealByDate(data,(result) => {

        if(result)
        {
            res.render('meal', {page: 'Meal', menuId: 'dashboard', moment: moment, result: result[0]});
        }
        else{
            res.redirect('/meal');
        }
    });

});


router.post('/', (req, res) => {

    var data={
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        email: req.session.email,
    };
    if(req.body.breakfast == "on" )
    {
        data.breakfast = 1;
    }
    if(req.body.lunch == "on" )
    {
        data.lunch = 1;
    }
    if(req.body.dinner == "on" )
    {
        data.dinner = 1;
    }

    meal_db.updateMealByDate(data, (result) => {
        if (result) {
            res.redirect('/meal');
        } else {
            res.send("Meal updating failed");
        }
    });

});


module.exports = router;