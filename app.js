const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();
const _ = require('lodash');
const path = require('path');
let port = process.env.PORT;



app.use (bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

let today = new Date();
  
let options = {
  weekday : "long",
  day: "numeric",
  month:"long"
};

let day = today.toLocaleString("en-US",options);

mongoose.connect("mongodb+srv://database-vomi:test123@cluster0.fj3dr.mongodb.net/todolistDB",{useUnifiedTopology: true, useNewUrlParser: true });

const itemsSchema = new mongoose.Schema ({
  item : String
});
const Item = mongoose.model("Item" , itemsSchema);
const item1 = new Item ({
  item: "welcome to my to do list",
});
const item2 = new Item ({
  item: "het the + button to add a new item",
});
const item3 = new Item ({
  item: "<== Hit this to delete an item",
});
const defaultItems = [item1, item2 , item3];


const listSchema = new mongoose.Schema ({
  name: String,
  items : [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get('/favicon.ico', (req, res) => res.status(204));


app.get("/", function(req, res) {
  
  Item.find({} , function(err, foundItems) {
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
      if(err) {console.log(err)} 
      else {console.log(" First items save done!")}
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: day, newListItems : foundItems});
    }
  });

});


app.get("/:userRoute" , function(req, res) {

  let routeName = _.capitalize(req.params.userRoute);

  List.findOne({name : routeName}, function(err, foundList) {
    if(!err) {
      if(!foundList) {
        // where we create a new list
        const list = new List ({
          name: routeName,
          items: defaultItems
        });
      
        list.save();

        res.redirect("/" + routeName);

      }else {
        //show an existing list
        
          res.render("list", {listTitle: foundList.name, newListItems : foundList.items});
      
        }
    }

  });
});

app.post("/" , function(reqst,res) {

 let itemName = reqst.body.newitem;
 let listName = reqst.body.list;

    const itemNew = new Item({
      item: itemName
    }); 
 
    if(listName == day) {

      itemNew.save();
      res.redirect("/"); 

    }else {

      List.findOne({name: listName} , function(err, foundList) {

        if(!err) {

          foundList.items.push(itemNew);
          foundList.save();
          res.redirect("/" + listName);

        }else{

          console.log(err);

        }});
    }
});


app.post("/delete" , function(req, res) {

  const checkedID = req.body.checkbox;
  const listName = req.body.listName;
  console.log(checkedID);
  
  if(listName == day) {
    Item.findByIdAndRemove(checkedID, function(err) {
      if(err){
       console.log(err);
      }else{
        res.redirect("/");
      }
    });
  }else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: { _id : checkedID}}}, function(err, foundList) {
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});



if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(req, res) {
  console.log("server started on heroku or on  port 3000");
});
