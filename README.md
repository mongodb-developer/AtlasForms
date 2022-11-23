# AtlasForms
Forms Based UI for MongoDB Atlas

# Docs

Docs are being written in google Docs for now

Getting Started: https://mdb.link/AtlasForms
Manual: https://mdb.link/AtlasFormsManual


## Introduction

Atlas forms is a Forms based, End user interface to allow users to Create, Find, Update, Delete and Link Records. It is similar to a Fourth Generation Language (4GL) in that it abstracts away all
database development where required and makes a Zero Coding solution to building an internal GUI
to interact with Data.

It differs from a 4GL in having no proprietery coding language - it si instead a skeleton application in modern Javascript running with serverless function on MongoDBs Atlas Developer Data PLatform. It is intended to be modified to fit rewuirements and has been designed to me modular and easily modified.

## Installation

Change xxxab to your own appid throught this repo and import.
If required edit data_sources/mongodb-atlas/config.json to point at your cluster

## Known BUGS to fix
- Needs a Delete Button
- Need to verify field contents in AF_Doctypes
- Offer sensible message if appid not set

## Improvements we could implelent


- Error Handling review, Refactor, lint,tidy code

- All Strings in a consts class, inc errors and fieldnames
  

- Find a wat to Lint the JS for
  - use await not then
  - non ES6 style?
  - camel case
  - use of global vars
  - unchecked returns 
  - All Strings in a consts class, inc errors and fieldnames client and server.

- Hide buttons
  - If a user doesn't have the permissions to do something, hide the buttons related to that, eg. no write permissions should mean edit  and create are hidden

- Delete
 - Users with the correct permissions should have the ability to delete a document

- Mobile Layout CSS/swipes (Lots of this bootstrap gives us)

- Listview
  - Choose Columns from Cient

- FormView
    - Formview rememeber personal layout changes
    - Controls
      - boolean support (button/box)
      - Constraints & Validation 
        - On submit and on Change (Download JS to client??)
    - Date Only Chooser
    - 
- Printing (Stylesheet)
- Charts?
- Acessability
- Add Links (Does this need done)
  



## Work in Progress / Completed

- Listview
  - ~~Resize Column~~
  - ~~Show selected row~~
  - ~~Defaut to 99/N % wide~~
  - ~~dotpath hitlist columns~~
  - ~~Sort by Column~~
  - ~~Server side default columns~~
  - ~~Column name formatting~~
  - ~~BUG: Cannot resize smaller then content~~
  - ~~listview code in own js file~~
  
- Formview
  - Use Template Form
    - ~~Simple~~
    - ~~Nested~~
    - ~~Arrays (Add, Remove)~~
      - ~~On an Empty form display a Single Empty array element~~
      - ~~Numbers~~
      
  - Query By Form
    - ~~Change capture~~
    - ~~Data Typing (Server End)~~
    - ~~Date Handling~~  
    - ~~Basic Data Typing (Client end?)~~
      - ~~Dates~~
      - ~~Numbers~~

  - New Record
    - ~~Disable manual _id provision~~
    - ~~Create New~~


- Editing
  - ~~Locking~~
  - ~~Cancel~~
  - ~~Commit~~
  - ~~Download hitlist only~~
  - ~~Update hitlist on edit~~
  -  ~~Combine Cancel Edit and Commit Edit into one function each end~~
  - ~~Array Editing (Add and Remove elements as needed)~~
  - ~~Need to be able to add Array Elements when Creating a Document (and Querying?)~~
    - ~~Needs to handle Query when sending multiepl array elements ... Implicit AND $elemMAtch~~


- Authorization [John Working on This now]
  - ~~User Details (and user editing?)~~
  - ~~Concepts of 'UserAdmin'~~
  - ~~Pre Operation Trigger - allows cancellation or modification.~~
  - Read (Field Based)
  - ~~Update (Field Based)~~

- *Picklists* (Key feature) (John)
  - ~~Picklist Config?~~
  - ~~Picklist Determination~~
  
- ~~*Make it look nicer*~~

- ~~Basic Import (Luce)~~
  - ~~Add  page with form for entry values needed~~  
  - ~~Create import function~~
    - ~~Request file from URL passed in (start with json)~~    
    - ~~Write data to db and collection~~
    - ~~Add to doc types database~~
    - ~~Add message to report success or error~~
    - ~~Display button to navigate to formsapp~~
- ~~DocTypeSchema should be in doctype record~~

- ~~Range Queries (> and < support)~~
- ~~Fuzzy (Atlas) Search~~
  
- Linking 
  - ~~Follow Links~~
    - ~~Add to non top level fields.~~ 

- Bootstrap for CSS? (1 day sprint to see if this is quick)
  - ~~Login~~
  - ~~New User~~
  - ~~Reset Password~~
  - ~~Import~~
  - ~~Forms App~~

- ~~create function  to auto generate *all* picklists for a source.~~

 
- ~~Add an authorizarion hook *per document* on read~~
