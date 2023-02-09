# AtlasForms

Free, open source, serverless frontend for managing data in your Organisation. Automatically generated forms, Document data storage plugin/configurable security and business rules.

![screenshot of atlas forms](https://github.com/mongodb-developer/AtlasForms/blob/main/AFScreenshot.png?raw=true)

# Docs

Docs are being written in Google Docs for now

Getting Started: https://mdb.link/AtlasForms
Manual: https://mdb.link/AtlasFormsManual


## Introduction

Atlas forms is a Forms based, End user interface to allow users to Create, Find, Update, Delete and Link Records. It is similar to a Fourth Generation Language (4GL) in that it abstracts away all
database development where required and makes a Zero Coding solution to building an internal GUI
to interact with Data.

It differs from a 4GL in having no proprietery coding language - it is instead a skeleton application in modern Javascript running with serverless function on MongoDBs Atlas Developer Data Platform. It is intended to be modified to fit requirements and has been designed to me modular and easily modified.

## Installation



Change xxxab to your own appid throught this repo and import.


## Known BUGS to fix

- Offer sensible message if appid not set correctly.



## Improvements we could implement

- Offer list of collections in AF_DocTypes
- ~~Allow Links to be labeled?~~ 

- Look at non Atlas hosting options for frontend
- 
- Optimise speed of server calls, 'Security' is slow in Global app due to fetch of user record.

- Error Handling review, Refactor, lint,tidy code
  - Make Errors and Messages seperate so message shown if provided regardless of error state
  - Can then provide positive messages - your form submitted with reference ABC

- All Strings in a consts class, inc errors and fieldnames

- Hide buttons
  - If a user doesn't have the permissions to do something, hide the buttons related to that, eg. no write permissions should mean edit  and create are hidden

- Mobile Layout CSS/swipes (Lots of this bootstrap gives us)

- Listview
  - Choose Columns by User 

- FormView
    - Formview rememeber personal layout changes
    - Controls
      - boolean support (button/box)
      - Show URLs?? , This may be super hard for edits so we may need 'Virtual' fields which show content of others.
      - Constraints & Validation 
        - On on Change as well as Submit (Download JS to client??)
    - Date Only Chooser
    
- Printing (Stylesheet to render to printer) - Actually it's not too bad right now but we need 
to disable scrolls and it only does one page. And we dont want ot print the hitlist.

- Charts Integration (Requested but not relevant for now)
- Accessability


  



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
