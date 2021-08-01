var bcrypt = require('bcrypt')
var collection = require('../config/collection')
var db = require('../config/connection')


module.exports = {
    adminLogin:(data)=>{
        
        return new Promise(async(resolve,reject)=>{
          var response = await  db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:data.Email})
          if(response){
              bcrypt.compare(data.Password,response.Password).then((status)=>{
                  if(status){    
                      resolve(response)
                  }else{
                     
                      reject()
                  }
              })
          }
        })
    }




}