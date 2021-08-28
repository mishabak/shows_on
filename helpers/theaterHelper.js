var bcrypt = require("bcrypt");
var db = require("../config/connection");
var objectId = require("mongodb").ObjectID;
var collections = require("../config/collection");
const {
  VariableInstance,
} = require("twilio/lib/rest/serverless/v1/service/environment/variable");

module.exports = {
  checkDetails: (data) => {
    return new Promise(async (resolve, reject) => {
      var Owner_name = await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .findOne({ Owner_name: data.Owner_name });
      var Theater_name = await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .findOne({ Theater_name: data.Theater_name });
      var Email = await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .findOne({ Email: data.Email });
      var Phone = await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .findOne({ Phone: data.Phone });
      var checkTheaterData = {};
      if (Owner_name) {
        checkTheaterData.theaterOwner = true;
      } else {
        checkTheaterData.theaterOwner = null;
      }
      if (Theater_name) {
        checkTheaterData.theaterName = true;
      } else {
        checkTheaterData.theaterName = null;
      }
      if (Email) {
        checkTheaterData.email = true;
      } else {
        checkTheaterData.email = null;
      }
      if (Phone) {
        checkTheaterData.phone = true;
      } else {
        checkTheaterData.phone = null;
      }
      if (Owner_name || Theater_name || Email || Phone) {
        reject(checkTheaterData);
      } else {
        resolve();
      }
    });
  },
  addTheaterDetails: (details) => {
    return new Promise(async (resolve, reject) => {
      var response = {};
      details.Password = await bcrypt.hash(details.Password, 10);
      var data = await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .insertOne(details);
      console.log(data);
      if (data) {
        response.datas = data.ops[0];
        response.Status = true;
        resolve(response);
      } else {
        reject();
      }
    });
  },
  theaterEmailLogin: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .findOne({ Email: data.Email });
      if (details) {
        await bcrypt.compare(data.Password, details.Password).then((status) => {
          if (status === true) {
            if (details.Block === "block") {
              var confirmation = "confirm";
              reject(confirmation);
            } else if (details.Block === true) {
              var block = "block";
              reject(block);
            } else {
              details.Status = status;
              resolve(details);
            }
          } else {
            reject(status);
          }
        });
      } else {
        var status = false;
        reject(status);
      }
    });
  },
  checktheaterPhoneNumber: (data) => {
    return new Promise(async (resolve, reject) => {
      var response = await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .findOne({ Phone: data.Phone });
      if (response) {
        resolve();
      } else {
        reject();
      }
    });
  },
  theaterOtpLogin: (data) => {
    return new Promise(async (resolve, reject) => {
      var response = await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .findOne({ Phone: data });
      if (response) {
        response.Status = true;
        resolve(response);
      } else {
        var status = false;
        reject(status);
      }
    });
  },
  addtheaterProfile: (data) => {
    return new Promise(async (resolve, reject) => {
      console.log("errrr", data);
      await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .updateOne(
          { _id: objectId(data.theaterId) },
          { $set: { Profile: data.Profile } }
        );
      resolve();
    });
  },
  findUserProfileDetails: (theaterId) => {
    return new Promise(async (resolve, reject) => {
      var data = await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .findOne({ _id: objectId(theaterId) });
      resolve(data);
    });
  },
  DeleteUserProfile: (theaterId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .updateOne({ _id: objectId(theaterId) }, { $unset: { Profile: true } });
      var data = await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .findOne({ _id: objectId(theaterId) });
      resolve(data);
    });
  },

  // add movies --------------->
  addMovies: (data) => {
    return new Promise(async (resolve, reject) => {
      details = await db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .insertOne(data);
      resolve(details.ops[0]);
    });
  },

  editTheaterDetails: (data) => {
    return new Promise(async (resolve, reject) => {
      var phoneData = "+91" + data.Phone;
      await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .updateOne(
          { _id: objectId(data.theaterId) },
          {
            $set: {
              Owner_name: data.Owner_name,
              Theater_name: data.Theater_name,
              Email: data.Email,
              Phone: phoneData,
            },
          }
        );
      var details = await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .findOne({ _id: objectId(data.theaterId) });
      resolve(details);
    });
  },
  // addNewShows:(data)=>{
  //     return new Promise(async(resolve,reject)=>{
  //       await  db.get().collection(collections.SHOW_COLLECTION).insertOne({
  //           theaterId:objectId(data.theaterId),
  //           Shows:data.Shows
  //       })
  //         resolve()
  //     })
  // },
  // findTheaterShow:(data)=>{
  //     return new Promise(async(resolve,reject)=>{
  //        details =await db.get().collection(collections.SHOW_COLLECTION).find({theaterId:objectId(data)}).toArray()
  //        resolve(details)
  //     })
  // },
  // deleteshows:(data)=>{
  //     return new Promise(async(resolve,reject)=>{
  //        await db.get().collection(collections.SHOW_COLLECTION).removeOne({_id:objectId(data)})
  //         resolve()
  //     })
  // },
  findAllMovies: () => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .find()
        .toArray();
      resolve(details);
    });
  },
  findEditMovies: (movieId) => {
    return new Promise(async (resolve, reject) => {
      var movieDetails = await db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .findOne({ _id: objectId(movieId) });
      resolve(movieDetails);
    });
  },
  editMovieDetails: (data) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .updateOne(
          { _id: objectId(data.Movie_id) },
          {
            $set: {
              Movie: data.Movie,
              Hours: data.Hours,
              Teaser: data.Teaser,
              Language: data.Language,
              Type: data.Type,
              Movie_state: data.Movie_state,
              Description: data.Description,
              Cast_1_name: data.Cast_1_name,
              Cast_2_name: data.Cast_2_name,
              Cast_3_name: data.Cast_3_name,
              Cast_4_name: data.Cast_4_name,
              Cast_5_name: data.Cast_5_name,
              Cast_6_name: data.Cast_6_name,
            },
          }
        );
      resolve();
    });
  },
  addNewScreen: (data) => {
    return new Promise(async (resolve, reject) => {
      data.theaterId = objectId(data.theaterId);
      await db.get().collection(collections.SCREEN_COLLECTION).insertOne(data);
      resolve();
    });
  },
  findAllScreen: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SCREEN_COLLECTION)
        .find({ theaterId: objectId(data) })
        .toArray();
      resolve(details);
    });
  },
  deleteScreen: (data) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collections.SCREEN_COLLECTION)
        .removeOne({ _id: objectId(data) });
      await db
        .get()
        .collection(collections.SHOW_COLLECTION)
        .removeMany({ screenId: objectId(data) }); //remove data from show collection by screen id
      resolve();
    });
  },
  addShows: (data) => {
    return new Promise(async (resolve, reject) => {
      data.screenId = objectId(data.screenId);
      var details = await db
        .get()
        .collection(collections.SHOW_COLLECTION)
        .insertOne(data);
      resolve(details.ops[0]);
    });
  },
  findShowsByScreen: (data) => {
    return new Promise(async (resolve, reject) => {
      var show = await db
        .get()
        .collection(collections.SHOW_COLLECTION)
        .find({ screenId: objectId(data) })
        .toArray();
      resolve(show);
    });
  },
  deleteShow: (showId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collections.SHOW_COLLECTION)
        .removeOne({ _id: objectId(showId) });
      resolve();
    });
  },

  findAvailableScreen: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SCREEN_COLLECTION)
        .find({ theaterId: objectId(data) })
        .toArray();
      resolve(details);
    });
  },
  addTheaterStructure: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SEAT_ARRANGEMENT_COLLECTION)
        .findOne({ screenId: objectId(data.screenId) });
      if (details) {
        await db
          .get()
          .collection(collections.SEAT_ARRANGEMENT_COLLECTION)
          .updateOne(
            { screenId: objectId(data.screenId) },
            { $set: { seatStructure: data.seatStructure } }
          );
      } else {
        data.screenId = objectId(data.screenId);
        await db
          .get()
          .collection(collections.SEAT_ARRANGEMENT_COLLECTION)
          .insertOne(data);
      }
      var response = await db
        .get()
        .collection(collections.SEAT_ARRANGEMENT_COLLECTION)
        .findOne({ screenId: objectId(data.screenId) });
      resolve(response);
    });
  },
  findSeatLayout: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SEAT_ARRANGEMENT_COLLECTION)
        .findOne({ screenId: objectId(data) });

      resolve(details);
    });
  },
  findCurrentScreen: (screenId) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SCREEN_COLLECTION)
        .findOne({ _id: objectId(screenId) });
      resolve(details);
    });
  },
  findSeatStructure: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SEAT_ARRANGEMENT_COLLECTION)
        .findOne({ _id: objectId(data) });
      resolve(details);
    });
  },
  addSeatNumbers: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SEAT_NUMBER_COLLECTION)
        .findOne({ seatStructureId: objectId(data.seatStructureId) });
      if (details) {
        db.get()
          .collection(collections.SEAT_NUMBER_COLLECTION)
          .updateOne(
            { seatStructureId: objectId(data.seatStructureId) },
            { $set: { seatNumber: data.seatNumber } }
          );
      } else {
        data.seatStructureId = objectId(data.seatStructureId);
        db.get().collection(collections.SEAT_NUMBER_COLLECTION).insertOne(data);
      }
      resolve();
    });
  },
  findSeatNumbers: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SEAT_NUMBER_COLLECTION)
        .findOne({ seatStructureId: objectId(data) });
      resolve(details);
    });
  },
  addMovieToScreen: (data) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collections.SCREEN_COLLECTION)
        .updateOne(
          { _id: objectId(data.screenId) },
          {
            $set: {
              movieId: objectId(data.movieId),
              expDate: data.expDate,
            },
          }
        );
      resolve();
    });
  },
  deleteMovieToScreen: (data) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collections.SCREEN_COLLECTION)
        .updateOne(
          { _id: objectId(data.screenId) },
          {
            $unset: {
              movieId: objectId(data.movieId),
              expDate: data.expDate,
            },
          }
        );
      resolve();
    });
  },
  findAllReleasedMovie: () => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .find({ Movie_state: "Realesed" })
        .toArray();
      resolve(details);
    });
  },
  editScreenDate: (data) => {
    return new Promise(async (resolve, reject) => {
      var date = await db
        .get()
        .collection(collections.SCREEN_COLLECTION)
        .findOne({ _id: objectId(data.screenId) });
      if (date.expDate < data.editDate) {
        db.get()
          .collection(collections.SCREEN_COLLECTION)
          .updateOne(
            { _id: objectId(data.screenId) },
            { $set: { expDate: data.editDate } }
          );
      }
      resolve();
    });
  },
  updateScreenPrice: (data) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collections.SCREEN_COLLECTION)
        .updateOne(
          { _id: objectId(data.screenId) },
          { $set: { Price: data.screenPrice } }
        );
      resolve();
    });
  },
  findAvailableShows: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SHOW_COLLECTION)
        .find({ screenId: objectId(data) })
        .toArray();
      resolve(details);
    });
  },
  offlineBooking: (showId) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SHOW_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: objectId(showId),
            },
          },
          {
            $lookup: {
              from: collections.SEAT_ARRANGEMENT_COLLECTION,
              localField: "screenId",
              foreignField: "screenId",
              as: "seatArrangement",
            },
          },
          {
            $unwind: "$seatArrangement",
          },
          {
            $lookup: {
              from: collections.SEAT_NUMBER_COLLECTION,
              localField: "seatArrangement._id",
              foreignField: "seatStructureId",
              as: "seatNumber",
            },
          },
          {
            $unwind: "$seatNumber",
          },
          {
            $project: {
              Show: 1,
              seatArrangement: { seatStructure: 1 },
              seatNumber: { seatNumber: 1 },
            },
          },
        ])
        .toArray();
      resolve(details);
    });
  },
  BookedSeats: (showId) => {
    var dtToday = new Date();
    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10) month = "0" + month.toString();
    if (day < 10) day = "0" + day.toString();
    var minDate = year + "-" + month + "-" + day;
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SEAT_BOOKING_COLLECTION)
        .findOne({ showId: objectId(showId), choosedDate: minDate });
      resolve(details);
    });
  },
  addBookingSeat: (data) => {
    return new Promise(async (resolve, reject) => {
      var dtToday = new Date();
      var month = dtToday.getMonth() + 1;
      var day = dtToday.getDate();
      var year = dtToday.getFullYear();
      if (month < 10) month = "0" + month.toString();
      if (day < 10) day = "0" + day.toString();
      var minDate = year + "-" + month + "-" + day;
      var details = await db
        .get()
        .collection(collections.SEAT_BOOKING_COLLECTION)
        .findOne({ showId: objectId(data.showId), choosedDate: minDate });
      if (details) {
        var flag = 0;
        for (var i = 0; i < details.bookedSeats.length; i++) {
          if (details.bookedSeats[i] === data.selectedNumber) {
            flag = 1;
            break;
          }
        }
        if (flag === 0) {
          details.bookedSeats.push(data.selectedNumber);
          details.bookedSeats.sort();
          db.get()
            .collection(collections.SEAT_BOOKING_COLLECTION)
            .updateOne(
              { showId: objectId(data.showId), choosedDate: minDate },
              {
                $set: {
                  bookedSeats: details.bookedSeats,
                },
              }
            );
          var update = "updated";
          resolve(update);
        } else {
          var booked = "alreadyBooked";
          reject(booked);
        }
      } else {
        var insertDetails = {};
        selectedSeatArray = Array();
        selectedSeatArray.push(data.selectedNumber);
        insertDetails.bookedSeats = selectedSeatArray;
        insertDetails.showId = objectId(data.showId);
        insertDetails.choosedDate = minDate;
        await db
          .get()
          .collection(collections.SEAT_BOOKING_COLLECTION)
          .insertOne(insertDetails);
        var status = "newBooking";
        resolve(status);
      }
    });
  },
  removeBookingSeat: (data) => {
    return new Promise(async (resolve, reject) => {
      var dtToday = new Date();
      var month = dtToday.getMonth() + 1;
      var day = dtToday.getDate();
      var year = dtToday.getFullYear();
      if (month < 10) month = "0" + month.toString();
      if (day < 10) day = "0" + day.toString();
      var minDate = year + "-" + month + "-" + day;
      var details = await db
        .get()
        .collection(collections.SEAT_BOOKING_COLLECTION)
        .findOne({ showId: objectId(data.showId), choosedDate: minDate });
      for (var i = 0; i < details.bookedSeats.length; i++) {
        if (details.bookedSeats[i] === data.selectedNumber) {
          details.bookedSeats.splice(i, 1);
        }
      }
      db.get()
        .collection(collections.SEAT_BOOKING_COLLECTION)
        .updateOne(
          { showId: objectId(data.showId), choosedDate: minDate },
          { $set: { bookedSeats: details.bookedSeats } }
        );
      resolve();
    });
  },
  findTotalMovies: () => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .find()
        .toArray();
      resolve(details);
    });
  },
  findTodayBooking: (data) => {
    return new Promise(async (resolve, reject) => {
        var dtToday = new Date();
        var month = dtToday.getMonth() + 1;
        var day = dtToday.getDate();
        var year = dtToday.getFullYear();
        if (month < 10) month = "0" + month.toString();
        if (day < 10) day = "0" + day.toString();
        var minDate = year + "-" + month + "-" + day;
      var details = await db
        .get()
        .collection(collections.SCREEN_COLLECTION)
        .aggregate([
          {
            $match: {
              theaterId: objectId(data),
            },
          },
          {
            $lookup: {
              from: collections.SHOW_COLLECTION,
              localField: "_id",
              foreignField: "screenId",
              as: "shows",
            },
          },
          { $unwind: "$shows" },
          {$project:{
             _id:0, shows:1
          }},
          {
              $lookup:{
                  from:collections.SEAT_BOOKING_COLLECTION,
                  localField:'shows._id',
                  foreignField:'showId',
                  as:'bookedSeats'
              }
          },
          {$unwind:'$bookedSeats'},
          {$project:{
              bookedSeats:{bookedSeats:1,choosedDate:1}
          }}
        ])
        .toArray();
        var response = null
        for(var i = 0;i<details.length;i++){
            if(details[i].bookedSeats.choosedDate===minDate){
               response = response +details[i].bookedSeats.bookedSeats.length
            }
        }
        resolve(response)
    });
  },
  findAllUsers:()=>{
      return new Promise(async(resolve,reject)=>{
         var details = await db.get().collection(collections.USER_COLLECTION).find().toArray()
         resolve(details.length)
      })
  },
  findBookingHistory:(theaterId)=>{
    return new Promise(async(resolve,reject)=>{
      var details = await  db.get().collection(collections.BOOKING_HISTORY_COLLECTION).find({theaterId:objectId(theaterId)}).toArray()
      resolve(details)
    })
  },
  lastTenDayBooking:(theaterId)=>{
    return new Promise(async(resolve,reject)=>{
     var details = await db.get().collection(collections.SCREEN_COLLECTION)
      .aggregate([
        {
          $match:{theaterId:objectId(theaterId)}
        },
        {
          $lookup:{
            from:collections.SHOW_COLLECTION,
            localField:'_id',
            foreignField:'screenId',
            as:'shows'
          }
        },
        {
          $unwind:'$shows'
        },
        {
          $project:{
            _id:0,shows:{_id:1}
          }
        },
        {
          $lookup:{
            from:collections.SEAT_BOOKING_COLLECTION,
            localField:'shows._id',
            foreignField:'showId',
            as:'bookingSeat'
          }
        },
        {
          $unwind:'$bookingSeat'
        },{
          $project:{
            bookingSeat:1
          }
        }
      ]).toArray()
      var beforeDays = Array()  //  find today and before nine  days booking seat for dashBoard
      for(var i = 0 ; i<10;i++){
        var date = new Date();
        var yesterday = new Date();
        yesterday.setDate(date.getDate() -i);
       var month = yesterday.getMonth() + 1;
       var day = yesterday.getDate();
       var year = yesterday.getFullYear();
       if (month < 10) month = "0" + month.toString();
       if (day < 10) day = "0" + day.toString();
        // var beforeDate = { date:10}
       var date = year + "-" + month + "-" + day;
       beforeDays[i] =date
      }
      resolve(details)
    })
  }
};
