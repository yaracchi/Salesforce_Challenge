var jsforce = require('jsforce');
const express = require('express');
var fs = require('fs');
var path = require('path');

const app = express()
app.use(express.json())

//###################################### User CREDENTIAL.#########################################################

let creds = JSON.parse(fs.readFileSync(path.resolve(__dirname, './SF_creds.json')).toString());

//###################################### User authentification.####################################################
//########### Methode 1 : Users identification once and then initiate connection when http request.#################

const authObject = new jsforce.OAuth2({
    loginUrl: creds.instanceURL,
    ClientId : creds.clientID,
    clientSecret : creds.clientSecret,
    redirectUri : 'http://localhost:1000/myapi/token' 
});

app.get("/myapi/auth/login", function(req, res) {
    console.log("/myapi/auth/login worked, SF redirected me to login page that needs the token route")
    res.redirect(authObject.getAuthorizationUrl({scope: 'full'}));//***** */
  });
app.get('/myapi/token', (req, res) => {
    const connect = new jsforce.Connection({oauth2: authObject});
    console.log("redirected to /token")
    connect.login(creds.username, creds.password, function(err, userInfo) {
    if (err) { return console.error(err); }const code = req.query.code;
    conn.authorize(code, function(err, userInfo) {
        if (err) { return console.error("This error is in the auth callback: " + err); }//**stops here */
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

//######################### Methode 2 : Users identification for each request(that works for me) #####################
var conn = new jsforce.Connection({
    loginUrl: creds.instanceURL,
    ClientId : creds.clientID,
    clientSecret : creds.clientSecret,
    redirectUri : 'http://localhost:1000/myapi/token'
  });

//#################################### GET REQUESTS #########################
//task 1 : Fetch a given candidate
app.get('/myapi/candidate/:candidateID', (req, res) => {
    //to use in postman params
    //ID = a004L000002gCJK
conn.login(creds.username, creds.password, function(err, userInfo) {
    if (err) { return console.error(err); }

    conn.sobject("Candidature__c").retrieve(req.params.candidateID , function(err, cand) {
        if (err) { return console.error(err); }
            console.log("First_Name__c : " + cand.First_Name__c);
            console.log("Last_Name__c : " + cand.Last_Name__c);
            console.log("Year__c : " + cand.Year__c);
            console.log("Year_Of_Experience__c : " + cand.Year_Of_Experience__c);
  
}) }) })

//#################################### Post REQUESTS ######################
//Task 2 : add new candidate with my data

app.post('/myapi/candidate',(req,res)=>{
    //to use in postman
   /* const cand = {
        "First_Name__c" : "yara" , 
        "Last_Name__c" : "elmhamid" ,
        "Year_Of_Experience__c" : 1     
       }*/
       const p = req.body
       const candidate = {
            First_Name__c : p.First_Name__c , 
            Last_Name__c : p.Last_Name__c ,
            Year_Of_Experience__c : p.Year_Of_Experience__c     
       }
       conn.login(creds.username, creds.password, function(err, userInfo) {
            if (err) { return console.error(err); }
            conn.sobject("Candidature__c").create(candidate, function(err, ret) {
                if (err || !ret.success) { return console.error(err, ret); }
                console.log(ret)
                })
});
    res.send(candidate)
  })

//#################################### UPDATE REQUESTS ######################
//Task 3: Edit Last_Name__c with my last name

app.put('/myapi/candidate/:candidateID',(req,res)=>{
    //to use in in postman
    //params: candidateID = a004L000002gCJK
    //body { "Id" : "a004L000002gCJK", "Last_Name__c" : "El mhamid" }
   let    candidate = { 
       Id : req.body.Id,
       Last_Name__c : req.body.Last_Name__c
     }
       conn.login(creds.username, creds.password, function(err, userInfo) {
            if (err) { return console.error(err); }
      
       conn.sobject("Candidature__c").update(candidate , function(err, ret) {
           if (err || !ret.success) { return console.error(err, ret); }
           console.log('Updated Successfully : ' + ret.id);
           res.send(ret)
         });
   })
})

//#################################### GET REQUESTS ######################
//Task 4 : Get all candidates
app.get('/myapi/candidates', (req, res) => {
   conn.login(creds.username, creds.password, function(err, userInfo) {
     if (err) { return console.error(err); }
     
        let soql = 'SELECT First_Name__c, Last_Name__c, Year__c , Year_Of_Experience__c FROM Candidature__c ';
        conn.query(soql, function(err, result) {
            if (err) { return console.error(err); }
            console.log("candidates fetched: "+ result.totalSize)
            res.send(result)
     });
     
   }); })

//#################################### GET REQUESTS ######################
//Task 5 : Searching a candidate using their Name

//############################# User Login Credential check ######################
//Extra task: Check the user credentials
app.get('/myapi/',(req,res) =>{
    conn.login(creds.username, creds.password, function(err, userInfo) {
        if (err) { return console.error(err); }
        console.log("User ID: " + userInfo.id); 
        console.log("Org ID: " + userInfo.organizationId); 
        console.log("Access token: " + conn.accessToken); 
        console.log("Instance URL: " + conn.instanceUrl);
        res.send(userInfo)
    })
    
})

//#################################### DELETE REQUESTS ######################
//Extra task: Delete a candidate using their ID
//id = a004L000002gCJK
app.delete('/myapi/candidate/:candidateID', (req,res) => {
    conn.login(creds.username, creds.password, function(err, userInfo) {
        if (err) { return console.error(err); }
        conn.sobject('Candidature__c')
       .find({ ID : req.params.candidateID })
       .destroy(function(err, rets) {
            if (err) { return console.error(err); }
            console.log(rets)
            res.send(rets)
       });
       })
}) 


//Extra task: fetching all the candidates with years of experience > 3 
app.get('/myapi/candidateExpert/', (req,res) => {
    conn.login(creds.username, creds.password, function(err, userInfo) {
        if (err) { return console.error(err); }
        conn.sobject("Candidature__c")
        .select('*, Candidature__c.*') // asterisk means all fields in specified level are targeted.
        .where("Year_Of_Experience__c >= 3") // conditions in raw SOQL where clause.
        .execute(function(err, candidates) {
            for (var i=0; i<candidates.length; i++) {
                var record = candidates[i];
                console.log("First_Name: " + record.First_Name__c);
                console.log("Year_Of_Experience__c: " + record.Year_Of_Experience__c);
    }
    res.send(candidates)
    });
   
  })
})


const port = process.env.PORT || 1000
    app.listen(port, ()=>{
        console.log(`im listening on port ${port}`)
})