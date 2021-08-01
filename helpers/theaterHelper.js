var bcrypt = require('bcrypt')
var db = require('../config/connection')
var collections = require('../config/collection')
const { VariableInstance } = require('twilio/lib/rest/serverless/v1/service/environment/variable')

module.exports = {
    checkDetails:(data)=>{
        return new Promise(async(resolve,reject)=>{
           var Owner_name = await db.get().collection(collections.THEATER_COLLECTION).findOne({Owner_name:data.Owner_name})
           var Theater_name = await db.get().collection(collections.THEATER_COLLECTION).findOne({Theater_name:data.Theater_name})
           var Email = await db.get().collection(collections.THEATER_COLLECTION).findOne({Email:data.Email})
           var Phone = await db.get().collection(collections.THEATER_COLLECTION).findOne({Phone:data.Phone})
           var checkTheaterData ={}
           if(Owner_name){
            checkTheaterData.theaterOwner = true
           }else {
            checkTheaterData.theaterOwner = null
           }
           if(Theater_name){
            checkTheaterData.theaterName = true
           }else {
            checkTheaterData.theaterName = null
           }
           if(Email){
            checkTheaterData.email = true
           }else {
            checkTheaterData.email = null
           }
           if(Phone){
            checkTheaterData.phone = true
           }else{
            checkTheaterData.phone = null
           }
           if(Owner_name||Theater_name||Email||Phone){
               reject(checkTheaterData)
           }else{
              resolve()
           }
        })
    },
    addTheaterDetails:(details)=>{
        return new Promise(async(resolve,reject)=>{
            details.Password =await bcrypt.hash(details.Password,10)
          var response =  await db.get().collection(collections.THEATER_COLLECTION).insertOne(details) 
          if(response){
              response.Status = true
            resolve(response)
          }else{
              reject()
          }
        })
    },
    theaterEmailLogin:(data)=>{
        return new Promise(async(resolve,reject)=>{
        var details =  await  db.get().collection(collections.THEATER_COLLECTION).findOne({Email:data.Email})
        if(details){
            await bcrypt.compare(data.Password,details.Password).then((status)=>{
                
                if(status===true){
                    details.Status = status
                    resolve(details)
                }else{
                    reject(status)
                }    
            })
        }else{ 
            var status = false
            reject(status)
        }
        })
    },
    checktheaterPhoneNumber:(data)=>{
        return new Promise(async(resolve,reject)=>{
           var response = await db.get().collection(collections.THEATER_COLLECTION).findOne({Phone:data.Phone})
           if(response){
               resolve()
           }else{
               reject()
           }
        })
    },
    theaterOtpLogin:(data)=>{
        return new Promise(async(resolve,reject)=>{ 
            var response = await db.get().collection(collections.THEATER_COLLECTION).findOne(data) 
            if(response){
                response.Status = true
                resolve(response)
            }else{
                var status =false
                reject(status)

            }
        })
    }
}