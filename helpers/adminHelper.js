var bcrypt = require('bcrypt')
var collection = require('../config/collection')
var db = require('../config/connection')
var ObjectId = require('mongodb').ObjectID


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
    },
    findAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
          var details = await  db.get().collection(collection.USER_COLLECTION).find().toArray()
          resolve(details)
        })
    },
    blockUser:(userId)=>{
        
        return new Promise(async(resolve,reject)=>{
          await  db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$set:{
                Block:true
            }})
            resolve()
        })
    },
    unBlockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$unset:{
                Block:true
            }})
            resolve()
        })
    },
    allTheaterOwners:()=>{
        return new Promise(async(resolve,reject)=>{
          var details = await  db.get().collection(collection.THEATER_COLLECTION).find().toArray()
            resolve(details)
        })
    },
    blockTheater:(theaterId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.THEATER_COLLECTION).updateOne({_id:ObjectId(theaterId)},{$set:{
                Block:true
            }})
            resolve()
        })
    },
    unBlockTheater:(theaterId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.THEATER_COLLECTION).updateOne({_id:ObjectId(theaterId)},{$unset:{
                Block:true
            }})
            resolve()
        })
    },
    findAllBookingHistory:()=>{
        return new Promise(async(resolve,reject)=>{
          var details = await  db.get().collection(collection.BOOKING_HISTORY_COLLECTION).find().toArray()
          resolve(details)
        })
    },
    filterOrdersByDate:(data)=>{
        return new Promise(async(resolve,reject)=>{
         orders = await  db.get().collection(collection.BOOKING_HISTORY_COLLECTION).find({date:{$gte:data.fromDate,$lte:data.toDate}}).toArray()
         resolve(orders)
        })
    
    },
    totalMovies:()=>{
        return new Promise(async(resolve,reject)=>{
            var details = await db.get().collection(collection.MOVIE_COLLECTION).find().toArray()
            resolve(details)
        })
    },
     totalTheaters:()=>{
      return new Promise(async(resolve,reject)=>{
         var details = await db.get().collection(collection.THEATER_COLLECTION).find().toArray()
         resolve(details)
     })
    },
       totalUsers:()=>{
      return new Promise(async(resolve,reject)=>{
          var details = await db.get().collection(collection.USER_COLLECTION).find().toArray()
         resolve(details)
     })
    },
    totalBooking:()=>{
        return new Promise(async(resolve,reject)=>{
           var details = await db.get().collection(collection.BOOKING_HISTORY_COLLECTION).find().toArray()
            resolve(details)
        })
    }

}