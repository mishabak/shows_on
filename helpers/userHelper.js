var db = require("../config/connection");
var collections = require("../config/collection");
const { ObjectId } = require("mongodb");
var bcrypt = require("bcrypt");
const collection = require("../config/collection");
const {
  AssetVersionList,
} = require("twilio/lib/rest/serverless/v1/service/asset/assetVersion");
const { SCREEN_COLLECTION } = require("../config/collection");
const Razorpay = require('razorpay')
  var instance = new Razorpay({
    key_id:process.env.razorpay_Key_id,
    key_secret:process.env.razorpay_Key_secret,
  });

module.exports = {
  compareUserDetails: (data) => {
    return new Promise(async (resolve, reject) => {
      var userName = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ Name: data.Name });
      var userEmail = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ Email: data.Email });
      var userPhone = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ Phone: data.Phone });
      var checked = {};
      if (userName) {
        checked.name = true;
      } else {
        checked.name = false;
      }
      if (userEmail) {
        checked.email = true;
      } else {
        checked.email = false;
      }
      if (userPhone) {
        checked.phone = true;
      } else {
        checked.phone = false;
      }
      if (checked.name || checked.email || checked.phone) {
        reject(checked);
      } else {
        resolve();
      }
    });
  },
  userSignup: (userDetails) => {
    return new Promise(async (resolve, reject) => {
      let data = {};
      data.Status = false;
      userDetails.Password = await bcrypt.hash(userDetails.Password, 10);
      Details = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .insertOne(userDetails);
      if (Details) {
        data.Details = Details.ops[0];
        data.Status = true;
        resolve(data);
      } else {
        reject(data.Status);
      }
    });
  },
  userEmailLogin: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = {};
      details.Status = false;
      var user = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ Email: data.Email });
      if (user) {
        bcrypt.compare(data.Password, user.Password).then((status) => {
          if (status) {
            if (!user.Block) {
              details.Details = user;
              details.Status = status;
              resolve(details);
            } else {
              var Block = "Block";
              reject(Block);
            }
          } else {
            reject(details.Status);
          }
        });
      } else {
        reject(details.Status);
      }
    });
  },
  userOtpLogin: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ phone: data });
      if (details) {
        resolve(details);
      } else {
        reject();
      }
    });
  },

  findRandomMovies: () => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .aggregate([{ $sample: { size: 6 } }])
        .toArray();
      resolve(details);
    });
  },

  findReleasedMovies: () => {
    return new Promise((resolve, reject) => {
      var randomMovies = (await = db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .aggregate([
          { $match: { Movie_state: "Realesed" } },
          { $sample: { size: 10 } },
        ])
        .toArray());
      resolve(randomMovies);
    });
  },
  findUpComingMovies: () => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .aggregate([
          { $match: { Movie_state: "Up_coming" } },
          { $sample: { size: 9 } },
        ])
        .toArray();
      resolve(details);
    });
  },
  findMovieDetails: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .findOne({ _id: ObjectId(data) });
      resolve(details);
    });
  },
  viewAllMovies: () => {
    return new Promise(async (resolve, reject) => {
      var data = {};
      data.releasedMovie = await db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .find({ Movie_state: "Realesed" })
        .toArray();
      data.upcomingMovie = await db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .find({ Movie_state: "Up_coming" })
        .toArray();
      resolve(data);
    });
  },
  userDetailsEdit: (data) => {
    var phone = "+91" + data.Phone;
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collections.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(data.userId) },
          {
            $set: {
              Name: data.Name,
              Email: data.Email,
              Phone: phone,
              phone:data.Phone
            },
          }
        );
      var details = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ _id: ObjectId(data.userId) });
      resolve(details);
    });
  },
  addUserProfileImage: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collections.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              userProfile: true,
            },
          }
        );
      var details = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) });
      resolve(details);
    });
  },
  deleteUserPhoto: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collections.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $unset: {
              userProfile: true,
            },
          }
        );
      var details = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) });
      resolve(details);
    });
  },
  findMovieAvailableTheater: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SCREEN_COLLECTION)
        .aggregate([
          {
            $match: {
              movieId: ObjectId(data),
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

          {
            $project: {
              Screen: 1,
              expDate: 1,
              theaterId: 1,
              shows: { Show: 1, _id: 1 },
            },
          },
          {
            $lookup: {
              from: collections.THEATER_COLLECTION,
              localField: "theaterId",
              foreignField: "_id",
              as: "theater",
            },
          },
          { $unwind: "$theater" },
          {
            $project: {
              _id: 1,
              shows: 1,
              Screen: 1,
              expDate: 1,
              theater: { Theater_name: 1 },
            },
          },
        ])
        .toArray();
      resolve(details);
    });
  },
  screenSeatArrangements: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SHOW_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: ObjectId(data),
            },
          },
          {
            $lookup: {
              from: collections.SEAT_ARRANGEMENT_COLLECTION,
              localField: "screenId",
              foreignField: "screenId",
              as: "seat_arrangement",
            },
          },
          { $unwind: "$seat_arrangement" },
          {
            $project: {
              Show: 1,
              screenId: 1,
              seat_arrangement: { _id: 1, seatStructure: 1 },
            },
          },
          {
            $lookup: {
              from: collections.SEAT_NUMBER_COLLECTION,
              localField: "seat_arrangement._id",
              foreignField: "seatStructureId",
              as: "seatNumber",
            },
          },
          {
            $unwind: "$seatNumber",
          },
          {
            $project: {
              _id: 1,
              Show: 1,
              screenId: 1,
              seat_arrangement: {
                _id: 1,
                seatStructure: 1,
              },
              seatNumber: {
                _id: 1,
                seatNumber: 1,
              },
            },
          },
          {
            $lookup: {
              from: collections.SEAT_BOOKING_COLLECTION,
              localField: "_id",
              foreignField: "showId",
              as: "bookedSeats",
            },
          },
          {
            $project: {
              _id: 1,
              Show: 1,
              screenId: 1,
              seatNumber: 1,
              bookedSeats: 1,
              seat_arrangement: 1,
            },
          },
        ])
        .toArray();
      resolve(details);
    });
  },
  bookedSeatsByshow: (show, date) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SEAT_BOOKING_COLLECTION)
        .findOne({ showId: ObjectId(show), choosedDate: date });
      resolve(details);
    });
  },
  addBookedSeats: (parameter) => {
    var data = {};
    data.bookedSeats = parameter.bookedSeats;
    data.showId = parameter.showId;
    data.choosedDate = parameter.choosedDate;
    return new Promise(async (resolve, reject) => {
      var checkExist = await db
        .get()
        .collection(collections.SEAT_BOOKING_COLLECTION)
        .findOne({
          showId: ObjectId(data.showId),
          choosedDate: data.choosedDate,
        });

      if (checkExist) {
        var updataData = await db
          .get()
          .collection(collections.SEAT_BOOKING_COLLECTION)
          .updateOne(
            { showId: ObjectId(data.showId), choosedDate: data.choosedDate },
            {
              $set: {
                bookedSeats: data.bookedSeats,
              },
            }
          );
      } else {
        data.showId = ObjectId(data.showId);
        var insertData = await db
          .get()
          .collection(collections.SEAT_BOOKING_COLLECTION)
          .insertOne(data);
      }
      resolve();
    });
  },

  findDeatailsForPayment: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.SHOW_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: ObjectId(data.showId),
            },
          },
          {
            $project: {
              _id: 1,
              Show: 1,
              screenId: 1,
            },
          },
          {
            $lookup: {
              from: collections.SCREEN_COLLECTION,
              localField: "screenId",
              foreignField: "_id",
              as: "screen",
            },
          },
          {
            $unwind: "$screen",
          },
          {
            $project: {
              _id: 1,
              Show: 1,
              screenId: 1,
              screen: {
                Screen: 1,
                theaterId: 1,
                movieId: 1,
                Price: 1,
              },
            },
          },
          {
            $lookup: {
              from: collections.THEATER_COLLECTION,
              localField: "screen.theaterId",
              foreignField: "_id",
              as: "theater",
            },
          },
          {
            $unwind: "$theater",
          },
          {
            $project: {
              theater: {
                Theater_name: 1,
              },
              _id: 1,
              Show: 1,
              screenId: 1,
              screen: {
                Screen: 1,
                theaterId: 1,
                movieId: 1,
                Price: 1,
              },
            },
          },
        ])
        .toArray();
      resolve(details[0]);
    });
  },
  addBookingHistory: (data) => {
    return new Promise(async (resolve, reject) => {
      var movie = await db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .findOne({ _id: ObjectId(data.movie) });
      data.movie = movie.Movie;
      data.userId = ObjectId(data.userId);
      data.showId = ObjectId(data.showId);
      data.theaterId = ObjectId(data.theaterId)
      await db
        .get()
        .collection(collections.BOOKING_HISTORY_COLLECTION)
        .insertOne(data);
      resolve();
    });
  },
  findBookingHistory: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.BOOKING_HISTORY_COLLECTION)
        .find({ userId: ObjectId(data) })
        .toArray();
      resolve(details);
    });
  },
  cancelBooking: (bookingId) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.BOOKING_HISTORY_COLLECTION)
        .findOne({ _id: ObjectId(bookingId) });
      var bookingSeats = await db
        .get()
        .collection(collections.SEAT_BOOKING_COLLECTION)
        .findOne({
          showId: ObjectId(details.showId),
          choosedDate: details.date,
        });
      for (var i = 0; i < details.seat.length; i++) {
        for (var j = 0; j < bookingSeats.bookedSeats.length; j++) {
          if (details.seat[i] === bookingSeats.bookedSeats[j]) {
            bookingSeats.bookedSeats.splice(j, 1);
          }
        }
      }
      await db
        .get()
        .collection(collections.SEAT_BOOKING_COLLECTION)
        .updateOne(
          { showId: ObjectId(details.showId), choosedDate: details.date },
          {
            $set: {
              bookedSeats: bookingSeats.bookedSeats,
            },
          }
        );
      await db
        .get()
        .collection(collections.BOOKING_HISTORY_COLLECTION)
        .updateOne(
          { _id: ObjectId(bookingId) },
          {
            $set: {
              bookingCancelled: true,
            },
          }
        );
      resolve();
    });
  },
  findTheaters: () => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.THEATER_COLLECTION)
        .aggregate([{ $sample: { size: 6 } }])
        .toArray();
      resolve(details);
    });
  },
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
  findMovieByType: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .find({ Type: data })
        .toArray();
      resolve(details);
    });
  },
  findAmovie: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(collections.MOVIE_COLLECTION)
        .findOne({ _id: ObjectId(data) });
      resolve(details);
    });
  },
  findTheaterMovies: (data) => {
    return new Promise(async (resolve, reject) => {
      var details = await db
        .get()
        .collection(SCREEN_COLLECTION)
        .aggregate([
          {
            $match: {
              theaterId: ObjectId(data),
            },
          },
          {
            $lookup: {
              from: collections.MOVIE_COLLECTION,
              localField: "movieId",
              foreignField: "_id",
              as: "movies",
            },
          },
          { $unwind: "$movies" },
          {
            $project: {
              movies: 1,
              _id: 0,
            },
          },
        ])
        .toArray();
      resolve(details);
    });
  },
  findDataByKeyWord: (data) => {
    return new Promise(async (resolve, reject) => {
      await db
      .get()
      .collection(collections.MOVIE_COLLECTION)
      .createIndex({
        Movie: "text",
        Language: "text",
        Type: "text",

      });
     var details = await db.get().collection(collections.MOVIE_COLLECTION).find({$text:{$search:data}}).toArray()
     resolve(details)
    });
  },
};
