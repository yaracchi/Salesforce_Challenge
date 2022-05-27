var jsforce = require('jsforce');
const express = require('express');
var fs = require('fs');
var path = require('path');

const app = express()
app.use(express.json())

//###################################### User CREDENTIAL.################################

let creds = JSON.parse(fs.readFileSync(path.resolve(__dirname, './SF_creds.json')).toString());

//######################################################### User authentification.################################
//###########################################Methode 1 : Users identification once and then initiate connection when http request

//VEREFYING IDENTITY OF USER
const authObject = new jsforce.OAuth2({
    loginUrl: creds.instanceURL+'.my.salesforce.com/',
    ClientId : creds.clientID,
    clientSecret : creds.clientSecret,
    redirectUri : 'http://localhost:1000/myapi/token' 
});

app.get("/myapi/auth/login", function(req, res) {
    console.log("/myapi/auth/login worked, SF redirected me to login page that needs the token route")
    res.redirect(authObject.getAuthorizationUrl({scope: 'full'}));//check in app manager
  });
//**** error is in the auth callback: invalid_client_id: client identifier invalid */
//*****ERROR error=invalid_client_id&error_description=client%20identifier%20invalid */
app.get('/myapi/token', (req, res) => {
    const connect = new jsforce.Connection({oauth2: authObject});
    
    connect.login(creds.username, creds.password, function(err, userInfo) {
    if (err) { return console.error(err); }const code = req.query.code;
    conn.authorize(code, function(err, userInfo) {
        if (err) { return console.error("This error is in the auth callback: " + err); }//******* */
        // Now you can get the access token and instance URL information.
        console.log('Access Token: ' + conn.accessToken);
        console.log('Instance URL: ' + conn.instanceUrl);
        console.log('refreshToken: ' + conn.refreshToken);
        // logged in user property
        console.log('User ID: ' + userInfo.id);
        console.log('Org ID: ' + userInfo.organizationId);
        req.session.accessToken = conn.accessToken;
        req.session.instanceUrl = conn.instanceUrl;
        req.session.refreshToken = conn.refreshToken;

    res.send("authentification succeded");
  });
})
})

//########################################### Methode 2 : Users identification for each request
var conn = new jsforce.Connection({
    loginUrl: creds.instanceURL+'.my.salesforce.com/',
    ClientId : creds.clientID,
    clientSecret : creds.clientSecret,
    redirectUri : 'http://localhost:1000/myapi/token'//******BE WARRY OF, check if same as in app SF connected */
  });

//#################################### GET REQUESTS ######################
//fetching the accounts of my companies
app.get('/myapi/accounts', (req, res) => {
    //i am logging eachtime manually and not using the authentif session info   
   conn.login(creds.username, creds.password, function(err, userInfo) {
     if (err) { return console.error(err); }
     let soql = 'SELECT id, Site, name FROM account LIMIT 5';
     conn.query(soql, function(err, result1) {
       if (err) { return console.error(err); }
       res.send(result1)
     });
     
   }); })
//#################################### POST REQUESTS ######################
//Single 

//multiple

//#################################### UPDATE REQUESTS ######################

//#################################### DELETE REQUESTS ######################



const port = process.env.PORT || 1000
    app.listen(port, ()=>{
        console.log(`im listening on port ${port}`)
})