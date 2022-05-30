# Salesforce_Challenge
This is a mini project that represents a REST API that communicates with Salesforce API in order to get and treat data from SF.

# Technologies used:
nodejs, expressjs, jsforce, nodemon
Just run "nodemon Server.js" in order to execute the code

# Exercices done with their Endpoints
* task 1:  Fetch a given candidate using their ID. /myapi/candidate/:candidateID'
* task 2:  Add new candidate with my data. /myapi/candidate
* task 3:  Edit Last_Name of a given candidate. /myapi/candidate/:candidateID
* task 4:  Get all candidates. /myapi/candidates

# Exercices not done
* task 5, 6, 7

# Extra exercices (Task 8)
* Check the users connection information: /myapi/candidateExpert/
* Delete a candidtae given their ID : '/myapi/candidate/:candidateID'
* Fetch all candidates with more than 3 years experience : 

# Clarification on the tests [edited]
I used soljit credentials in order to access to SF programmatically.

Link to the code execution: https://drive.google.com/drive/u/2/folders/1Uyfc4uyPez2XCbADCAkit3z7ZyVNA6qz

(As i couldnt authentificate the SF user provided by Soljit, i used my own SF user credentials that i created with a dev edition.
Knowing that the Candidature__c object is not available in my SF account, i used the Account object in order to test my Endpoints and the logic of my solutions.)

