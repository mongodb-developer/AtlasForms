# AtlasForms
Forms Based UI for MongoDB Atlas


## Introduction

Atlas forms is a Forms based, End user interface to allow users to Create, Find, Update, Delete and Link Records. It is similar to a Fourth Generation Language (4GL) in that it abstracts away all
database development where required and makes a Zero Coding solution to building an internal GUI
to interact with Data.

It differs from a 4GL in having no proprietery coding language - it si instead a skeleton application in modern Javascript running with serverless function on MongoDBs Atlas Developer Data PLatform. It is intended to be modified to fit rewuirements and has been designed to me modular and easily modified.

## Installation


Change xxxab to your own appid throught this repo and import.

## Known BUGS to fix
- Needs a Delete Button
- Need to verify field contents in AF_Doctypes
- Offer sensible message if appid not set.


## Code Overview

## Decision Log

_Here we note anything we made an explicit decision about in the design and why_

30/9/2022 - Initial version is only supporting two levels of depth, so arrays and objects only at the top level or objects in a top level array. It is hard to render lower nicely in a basic GUI and also just not a nice schema. Objects might get extended one more level though.



## Coding Standards

  - All Server Side non private functions return ok(boolean) and message(string) which should be an end user
appropriate message.
  - variuable and function nameing are camelCase
  - Things that can fail are wrapped in try catch
  - ES6 syntax wherever possible
  - Multiline comments should be in a single multiline-comment
  - Use TODO: for things we need to get back to
  - 
  
## Questions
  - What shoudl _id look like, I like the idea of sequences and a fixed format TBH, if we are linking this matters maybe.
  - How Best oto handle date fields, are date pickers good
  - How do we *best* handle date not datetime?
  - Will we add support for Range queries? If so how >5 in a text box
  - How *critical* are dropdown picklists - Very!
   


## Work in Progress / TODO / Ideas

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


- Add an optional authorization for signup
  - In ours if you have mongodb.com address then you get superuser
  - Although we don't want others to implement that.

- create function  to auto generate *all* picklists for a source.
  - Hook into import?? Or provide button to run somewhere?
- Add an authorizarion hook *per document* on read

- Generate demo setup - full set of picklists, bootstrap functions?
- Error Handling review, Refactor, lint,tidy code

- All Strings in a consts class, inc errors and fieldnames
  

  
*** V1 at this point for reInvent ***

Test with - https://github.com/jdorfman/awesome-json-datasets

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
    - ~~Better Layout (Will be an ongoing battle)~~
    - Formview rememeber personal layout changes
    - Controls
      - ~~Numbers~~
      - boolean support (button/box)
      - Constraints & Validation 
        - On submit and on Change (Download JS to client??)

    - Date Only Chooser
- Printing (Stylesheet)
- Charts?
- Acessability
- Add Links (Does this need done)
  
