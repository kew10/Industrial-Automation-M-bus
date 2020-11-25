var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const { Z_BUF_ERROR } = require('zlib');
const { Buffer } = require('buffer');

//var //createConnection
var connection = mysql.createPool({
    connectionLimit : 100,
	host     : 'db.project.pxl-ea-ict.be',
	user     : 'project_ia-serre',
	password : '9Sxgk99RDcLUHHhQ',
	database : 'project_ia-serre'
});


var app = express();
const port = process.env.PORT || 8000;

app.use(express.static('public'));

app.use(session({
	secret: 'kew1001',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

/*
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});*/

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            console.log("query result:", results);
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
			
				response.redirect('/realtimedata');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/logout', function(request, response) {
	if (request.session.loggedin) {
		
		request.session.destroy();
		response.redirect('/index.html');
	}else{
		response.send('Log in to log out!');
	}
	response.end();
	
});


/*
app.get('/home', function(request, response) {
	if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/realtime.html'));
	} else {
		response.send('Please login to view this page!');
	}
	//response.end();
});
*/

app.get('/chart', function(request, response) {
	if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/chart.html'));
	} else {
		response.send('Please login to view this page!');
	}
	//response.end();
});


app.get('/chartinfo', function(request, response) {
	if (request.session.loggedin) {


	//response.sendFile(path.join(__dirname + '/public/chart.html'));
		connection.query('SELECT temperatuur, vochtigheid, date, vermogen FROM ' +  request.session.username, function(error,results, fields) {
		if (results.length > 0) 
		{
			
			console.log(results);
			response.json(results);
			//response.sendFile(path.join(__dirname + '/public/chart.html'));

		} 
		else{
			response.send('Empty database...');
			}			
		});
	}else{
		response.send('Please login to view this page!');
	}
	
}); 




app.get('/realtimedata', function(request, response) {
	if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/realtime.html'));
	} else {
		response.send('Please login to view this page!');
	}
	//response.end();
});


app.get('/realtime', function(request, response) {

	if (request.session.loggedin) {
			//response.sendFile(path.join(__dirname + '/public/chart.html'));
			connection.query('SELECT temperatuur, vochtigheid, date, vermogen, raam FROM ' + request.session.username + ' ORDER BY id DESC LIMIT 1' , function(error,resultsr, fields) {
			if (resultsr.length > 0) 
			{

				console.log(resultsr);
				response.json(resultsr);
				//response.sendFile(path.join(__dirname + '/public/chart.html'));

			} 
			else{
				response.send('Empty database...');
				}	
			
		});
	}else {
		response.send('Please login to view this page!');
	}
	
}); 


/*
app.get('/table', function(request, response) {
	if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/public/table.html'));
	} else {
		response.send('Please login to view this page!');
	}
	//response.end();
});


app.get('/tableinfo', function(request, response) {


	//response.sendFile(path.join(__dirname + '/public/chart.html'));

		connection.query('SELECT temperatuur, vochtigheid, date, vermogen FROM serreinfo', function(error, results, fields) {
		if (results.length > 0) 
		{
			
			//console.log(results);
			response.json(results);
			//response.sendFile(path.join(__dirname + '/public/chart.html'));

		} 
		else{
			response.send('Empty database...');
			}			
	});
	
}); 



app.get('/table', function(request, response) {
	if (request.session.loggedin) {
        //response.send('Welcome back, ' + request.session.username + '!');
        fetchData(response)
        //response.sendFile('home.html');
	} else {
		response.send('Please login to view this page!');
	}
	//response.end();
});

app.get('/chart', function(request, response) {
	if (request.session.loggedin) {
		response.json({test: 123});
		response.sendFile(path.join(__dirname + '/chart.html'));
		connection.query('SELECT temperatuur,vochtigheid FROM serreinfo', function(error, results, fields) {
		if (results.length > 0) {
			var tdata=[];
			var vdata=[];
			//request.session.loggedin = true;

			for(let i =0; i< results.length; i++){
				for (const [key, value] of Object.entries(results[i])) {
					if(key == "temperatuur"){
						tdata.push(value);
						response.send(new ArrayBuffer(tdata));
					}else if(key == "vochtigheid"){
						vdata.push(value);
					}
				}
			}
		} else {
			response.send('Empty database...');
		}			
		response.end();
	});
	
       // response.sendFile(path.join(__dirname + '/chart.html'));
	} else {
		response.send('Please login to view this page!');
	}
		
});



connection.connect(function(error){
    if (error) {throw error;}
    console.log("connected to database")
})

function executeQuery(sql , cb){
    connection.query(sql, function(error, result, fields){
        if (error) {throw error;}
        cb(result);
    })
}




function fetchData(response){
   executeQuery("SELECT temperatuur, vochtigheid, vermogen FROM serreinfo", function(result){
        console.log(result);
        response.write('<table><tr>');
        for(var column in result[0]){
            response.write('<td><label>' + column + '</label></td>');
            response.write('</tr>');
        }

        for(var row in result){
            response.write('<tr>');
            for(var column in result[row]){
                response.write('<td><label>' + result[row][column] + '</label></td>');
            }
            response.write('</tr>');
        }

        response.end('</table>');

   });

}
*/


app.listen(port);
console.log("Server running at port 8000");