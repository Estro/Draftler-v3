
/*
 * GET home page.
 */


var testObj = {
    books: [{
        id: 1,
        title: "test",
        picture: "http://takehomesalary.com/draftler/app/css/img/bookimage.jpg",
        rating:4,
        chapter:3,
        comments:4,
        stage:"voting",
        description: "hello"
    },{
        id: 2,
        title: "test2",
        picture: "http://takehomesalary.com/draftler/app/css/img/bookimage.jpg",
        rating:4,
        chapter:3,
        comments:4,
        stage:"voting",
        description: "hello"
    },{
        id: 3,
        title: "test2",
        picture: "http://takehomesalary.com/draftler/app/css/img/bookimage.jpg",
        rating:4,
        chapter:3,
        comments:4,
        stage:"voting",
        description: "hello"
    }],
    newBooks: {
        id: 4,
        title: "Martin",
        picture: "http://takehomesalary.com/draftler/app/css/img/bookimage.jpg",
        rating:4,
        chapter:3,
        comments:4,
        stage:"voting",
        description: "hello"
    },
    topBooks: {
        id: 5,
        title: "hello",
        picture: "http://takehomesalary.com/draftler/app/css/img/bookimage.jpg",
        rating:4,
        chapter:3,
        comments:4,
        stage:"voting",
        description: "hello"
    }
};


exports.index = function(req, res){
  res.render('home', testObj);
};

