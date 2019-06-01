var express = require('express');
var app = express();
var fs = require('fs');
app.use(express.json())

var createDate = new Date()
var month_names= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
var TodayDate = createDate.getDate() +" "+ month_names[createDate.getMonth()] + " " + createDate.getFullYear()


// Update Errors
app.put('/allerrors/:lang/:err',(req,res)=>{
  `Example for request body input:
  {
    "description": "Raised when the parser encounters a syntax error.  This may occur in an\nimport statement, in a call to the built-in functions exec()\nor eval(), or when reading the initial script or standard input\n(also interactively).\nInstances of this class have attributes filename, lineno,\noffset and text for easier access to the details.  str()\nof the exception instance returns only the message.",
    "errorName": "syntaxerror",
    "example": "x = int(input('Enter a number: '))\nwhille x%2 == 0:\n\tprint('You have entered an even number.')\nelse:\n\tprint ('You have entered an odd number.')\n\nFile 'error.py', line 3\nwhille x%2 == 0:\n\t\t^\nSyntaxError: invalid syntax",
    "url": [
      "https://www.quora.com/What-does-syntax-error-or-invalid-syntax-mean-in-Python",
      "https://www.quora.com/Why-do-I-get-syntax-error-else"
    ]
  }`
  errorDict = req.body
  console.log(errorDict)
  fs.readFile( __dirname + '/data/errorCache.json',(err,data)=>{
    if(err){
      return res.json({"errorMsg":"Check your Json file"})
    }else{
      var allErrors = JSON.parse(data)
      for(var error of allErrors[req.params.lang]){
        if(error['errorName'] === req.params.err){
          if(req.body.hasOwnProperty('example')){
            error['example'] = req.body.example
          }
          if(req.body.hasOwnProperty('url')){
            error['url'] = req.body.url
          }
          break
        }
      }
      var myJSON = JSON.stringify(allErrors,null,2)
      fs.writeFile(__dirname + '/data/errorCache.json', myJSON, (err,data)=>{
        return res.json(error)
      })
    }
    // return res.json({"errorMsg":"Enter valid error name"})
  })
})

// From here all api's for users.

// Here we get all errors in diffrent language
app.get('/errorDetails',(req,res)=>{
  fs.readFile( __dirname + '/data/errorCache.json',(err,data)=>{
    if(err){
      return res.json({"errorMsg":"Check your Json file"})
    }else{
      var allErrors = JSON.parse(data.toString())
      return res.json(allErrors)
    }
  })
})

app.get('/errorDetails/:lang',(req,res)=>{
  fs.readFile( __dirname + '/data/errorCache.json',(err,data)=>{
    if(err){
      return res.json({"errorMsg":"Check your Json file"})
    }else{
      var allErrors = JSON.parse(data.toString())
      if(allErrors.hasOwnProperty(req.params.lang)){
        return res.json(allErrors[req.params.lang])
      }
      return res.json({"errorMsg":"Enter valid language name"})
    }
  })
})

app.get('/errorDetails/:lang/:err',(req,res)=>{
  var userName = req.query.username
  fs.readFile(__dirname + "/data/userdetailsCache.json",(err,data)=>{
    if(err){
      return res.json({"errorMsg":"Check your json file"})
    }
    else{
        var allusers = JSON.parse(data.toString())
        var errordict = {'errorName':req.params.err,'date':TodayDate}
        if(allusers.hasOwnProperty(userName)){
          allusers[userName].push(errordict)
        }else{
        allusers[userName] = []
        allusers[userName].push(errordict)
      }
    }
    var myJSON = JSON.stringify(allusers,null,2)
    fs.writeFile(__dirname + "/data/userdetailsCache.json",myJSON,(err,data)=>{
      if(err){return res.json({"errorMsg":"check your json file."})}
    })
    fs.readFile(__dirname + "/data/errorCache.json", (err, data)=>{
      if(err){
        return res.json(err)
      }else{
        var allErrors = JSON.parse(data.toString())
        var megaDict = {'details':'','pairs':[]}
        for(var exception of allErrors[req.params.lang]){
          if(exception['errorName'] == req.params.err){
            megaDict['details'] = exception
          }
        }
      }
      fs.readFile(__dirname + "/data/userdetailsCache.json",(err,data)=>{
        var allusersdict = JSON.parse(data.toString())
        for(var user in allusersdict){
          if(user !== userName){
            for(var errorDict of allusersdict[user]){
              for(var errorcheck of allusersdict[userName]){
                if(errorDict['errorName'] == errorcheck['errorName'] && errorDict['date'] == errorcheck['date']){
                  if(!megaDict['pairs'].includes(user)){
                    if(megaDict['pairs'].length < 5){
                      megaDict['pairs'].push(user)
                    }
                  }
                }
              }
            }
          }
        }
        return res.json(megaDict)
      })
    })
  })
})

app.listen(8000,()=>{
  console.log(`Server is listning port ${8000}`)
})
