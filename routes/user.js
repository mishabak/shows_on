var express = require("express");
const otpHelpers = require("../helpers/otpHelpers");
const userHelper = require("../helpers/userHelper");
var router = express.Router();
const userHelpers = require("../helpers/userHelper");
var passport = require("passport");
const {
  TrustProductsEntityAssignmentsInstance,
} = require("twilio/lib/rest/trusthub/v1/trustProducts/trustProductsEntityAssignments");
var db = require("../config/connection");
var collections = require("../config/collection");
const { ObjectId } = require("mongodb");
const cors = require("cors");
const corsOptions = {
  origin: "https://localhost:3000",
};
var userLoginHelper = (req, res, next) => {
  if (req.session.userStatus) {
    next();
  } else {
    res.redirect("/login");
  }
};
var paymentPage = (req, res, next) => {
  req.session.paymentPage = true;
  next();
};
// verify login
var userLoginHelper2 = (req, res, next) => {
  if (req.session.userStatus) {
    res.redirect("/");
  } else {
    next();
  }
};

var timeoutDetails;
let timeoutExpired = 0;
// set a validity for does not pay ------->>>
var bookingPendingHelper = (data, c) => {
  if (!c == 1) {
    timeoutDetails = setTimeout(async function () {
      for (var i = 0; i < data.selectedSeat.length; i++) {
        for (var j = 0; j < data.bookedSeats.length; j++) {
          if (data.selectedSeat[i] === data.bookedSeats[j]) {
            data.bookedSeats.splice(j, 1);
          }
        }
      }
      await db
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
      console.log("error not fount");
      timeoutExpired = 1;
    }, 1000 * 60 * 10);
    timeoutExpired = 0;
  } else {
    clearTimeout(timeoutDetails);
  }
};

/* GET user home page. */
router.get("/", async function (req, res, next) {
  var randomMovie = await userHelper.findRandomMovies();
  var randomReleasedMovies = await userHelper.findReleasedMovies();
  var randomUpComingMovies = await userHelper.findUpComingMovies();
  var allTheater = await userHelpers.findTheaters();
  var allMovies = await userHelpers.findAllMovies();
  req.session.availableTheaterRandom = allTheater;
  req.session.availableMovies = allMovies;
  res.render("user/home-page", {
    releasedMovie: randomReleasedMovies,
    upcomingMovie: randomUpComingMovies,
    randomDetails: randomMovie,
    userDetails: req.session.userDetails,
    allTheater: req.session.availableTheaterRandom,
    allMovies: req.session.availableMovies,
    bookingTimeExpire: req.session.bookingTimeExpire,
    user: true,
  });
  req.session.bookingTimeExpire = false;
});
// user sign up
router.get("/sign-up", (req, res) => {
  res.render("user/sign-up", {
    userDetailsAlreadyExist: req.session.userAlreadyExist,
    signupPhoneError: req.session.userSignupPhoneError,
    userSignupOtpError: req.session.userSignupOtpVerifyError,
    user: true,
  });
  req.session.userAlreadyExist = null;
  req.session.userSignupPhoneError = false;
  req.session.userSignupOtpVerifyError = false;
});
router.post("/sign-up", (req, res) => {
  userHelper
    .compareUserDetails(req.body)
    .then(() => {
      otpHelpers
        .sendMesssageUserSignup(req.body.Phone)
        .then(() => {
          req.session.userSignupDetails = req.body;
          res.render("user/sign-up-otp", { user: true });
        })
        .catch(() => {
          req.session.userSignupPhoneError = true;
          res.redirect("/sign-up");
        });
    })
    .catch((existData) => {
      req.session.userAlreadyExist = existData;
      res.redirect("/sign-up");
    });
});
router.post("/user-signup-otp-verify", (req, res) => {
  var sendVerifyOtp = {};
  sendVerifyOtp.Phone = req.session.userSignupDetails.Phone;
  sendVerifyOtp.Otp = req.body.Otp;
  otpHelpers
    .compareOtpUserSignUp(sendVerifyOtp)
    .then(() => {
      userHelper
        .userSignup(req.session.userSignupDetails)
        .then((data) => {
          req.session.userDetails = data.Details;
          req.session.userStatus = data.Status;
          res.redirect("/");
        })
        .catch((Status) => {
          req.session.userStatus = Status;
        });
    })
    .catch(() => {
      req.session.userSignupOtpVerifyError = true;
      res.redirect("/sign-up");
    });
});

router.get("/login", userLoginHelper2, (req, res) => {
  res.render("user/login", {
    user: true,
    userLoginError: req.session.userLoginError,
    allTheater: req.session.availableTheaterRandom,
    allMovies: req.session.availableMovies,
    blockUser: req.session.userBlock,
  });
  req.session.userLoginError = false;
  req.session.userBlock = false;
});
router.post("/login", (req, res) => {
  userHelpers
    .userEmailLogin(req.body)
    .then((response) => {
      req.session.userDetails = response.Details;
      req.session.userStatus = response.Status;
      if (req.session.paymentPage === true) {
        res.redirect("/payment");
      } else {
        res.redirect("/");
      }
    })
    .catch((response) => {
      if (response === "Block") {
        req.session.userStatus = false;
        req.session.userBlock = true;
        res.redirect("/login");
      } else {
        req.session.userStatus = response.Status;
        req.session.userLoginError = true;
        res.redirect("/login");
      }
    });
});

router.get("/user-otp-login", (req, res) => {
  res.render("user/otp-login", {
    userInvalidPhoneNumberOtplogin: req.session.UserInvalidPhoneNumberOtplogin,
    userLoginOtpError: req.session.userLoginOtpVerifyError,
    user: true,
  });
  req.session.UserInvalidPhoneNumberOtplogin = false;
  req.session.userLoginOtpVerifyError = false;
});

router.post("/user-otp-login", (req, res) => {
  userHelpers
    .userOtpLogin(req.body.phone)
    .then((data) => {
      req.session.userLoginVerifyOtp = data;
      otpHelpers
        .sendMesssageUserlogin(data.Phone)
        .then(() => {
          res.render("user/otp-verify-login", { user: true });
        })
        .catch(() => {});
    })
    .catch(() => {
      req.session.UserInvalidPhoneNumberOtplogin = true;
      res.redirect("/user-otp-login");
    });
});

router.post("/user-login-otp-verify", (req, res) => {
  var confirmData = {};
  confirmData.Phone = req.session.userLoginVerifyOtp.Phone;
  confirmData.Otp = req.body.Otp;
  otpHelpers
    .compareOtpUserLogin(confirmData)
    .then(() => {
      req.session.userDetails = req.session.userLoginVerifyOtp;
      req.session.userStatus = true;
      if (req.session.paymentPage === true) {
        res.redirect("/payment");
      } else {
        res.redirect("/");
      }
    })
    .catch(() => {
      req.session.userLoginOtpVerifyError = true;
      res.redirect("/user-otp-login");
    });
});

router.get("/single-view/:id", async (req, res) => {
  var singleMovieDetails = await userHelper.findMovieDetails(req.params.id);
  var SingleViewReleasedMovie = false;
  if (singleMovieDetails.Movie_state === "Realesed") {
    SingleViewReleasedMovie = true;
  }
  res.render("user/single-view", {
    user: true,
    userDetails: req.session.userDetails,
    singleMovieDetails,
    allTheater: req.session.availableTheaterRandom,
    allMovies: req.session.availableMovies,
    SingleViewReleasedMovie,
  });
});

router.get("/movies", async (req, res) => {
  var details = await userHelper.viewAllMovies();
  res.render("user/movie", {
    user: true,
    allTheater: req.session.availableTheaterRandom,
    allMovies: req.session.availableMovies,
    userDetails: req.session.userDetails,
    upcoming_movie: details.upcomingMovie,
    released_movie: details.releasedMovie,
  });
});

router.get("/logout", (req, res) => {
  req.session.userDetails = null;
  req.session.userStatus = null;
  req.session.destroy();
  res.redirect("/");
});

router.get("/profile", (req, res) => {
  if (req.session.userDetails) {
    var Phone = req.session.userDetails.Phone;
    req.session.userDetails.Phone = Phone.replace(/\D/g, "").slice(-10);
  }
  res.render("user/profile", {
    user: true,
    userDetails: req.session.userDetails,
    allMovies: req.session.availableMovies,
    allTheater: req.session.availableTheaterRandom,
  });
});

router.post("/profile", async (req, res) => {
  var editUserDetails = await userHelpers.userDetailsEdit(req.body);
  req.session.userDetails = editUserDetails;
  res.redirect("/profile");
});

router.post("/add-user-profile-photo", async (req, res) => {
  await req.files.User_profile.mv(
    "./public/userProfileImage/" + req.session.userDetails._id + ".jpg"
  );
  var details = await userHelpers.addUserProfileImage(
    req.session.userDetails._id
  );
  req.session.userDetails = details;
  res.redirect("/profile");
});

router.post("/delete-user-profile-photo", async (req, res) => {
  var UserDetails = await userHelpers.deleteUserPhoto(
    req.session.userDetails._id
  );
  req.session.userDetails = UserDetails;
  res.json({ response: true });
});
// router.get('/auth/github',

//   passport.authenticate('github'));

// router.get('/auth/github/callback',
//   passport.authenticate('github', { failureRedirect: '/login' }),
//   function (req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });

router.get("/events", (req, res) => {
  res.render("user/events", {
    user: true,
    userDetails: req.session.userDetails,
  });
});

router.get("/booking-movie/:movieId", async (req, res) => {
  var availableShows = await userHelpers.findMovieAvailableTheater(
    req.params.movieId
  );
  res.render("user/booking-movie", {
    user: true,
    availableShows,
    userDetails: req.session.userDetails,
    allMovies: req.session.availableMovies,
    allTheater: req.session.availableTheaterRandom,
  });
});
router.get("/seat-arrangement/:showId/:choosedDate/", async (req, res) => {
  var seatStructure = await userHelpers.screenSeatArrangements(
    req.params.showId
  );
  var bookedSeats = await userHelpers.bookedSeatsByshow(
    req.params.showId,
    req.params.choosedDate
  );
  res.render("user/seat-arrangement", {
    user: true,
    seatStructure,
    choosedDate: req.params.choosedDate,
    allMovies: req.session.availableMovies,
    allTheater: req.session.availableTheaterRandom,
    userDetails: req.session.userDetails,
    showId: req.params.showId,
    bookedSeats,
  });
});

// post method only use after payment------->
router.post("/seat-arrangement", async (req, res) => {
  var data = {};
  data.bookedSeats = JSON.parse(req.body.bookedSeats);
  data.selectedSeat = JSON.parse(req.body.selectedSeat);
  data.showId = req.body.showId;
  data.choosedDate = req.body.choosedDate;
  req.session.choosedSeats = data;
  await userHelpers.addBookedSeats(data);
  bookingPendingHelper(req.session.choosedSeats);
  res.json({ status: true });
});

router.get("/payment", paymentPage, userLoginHelper, async (req, res) => {
  var paymentDetails = await userHelpers.findDeatailsForPayment(
    req.session.choosedSeats
  );
  paymentDetails.totalAmount =
    req.session.choosedSeats.selectedSeat.length * paymentDetails.screen.Price;
  paymentDetails.perSeat = paymentDetails.screen.Price;
  req.session.paymentDetails = paymentDetails;
  if (paymentDetails && req.session.choosedSeats && timeoutExpired === 0) {
    if (paymentDetails.screen.Price) {
      res.render("user/payment", {
        user: true,
        choosedSeats: req.session.choosedSeats,
        userDetails: req.session.userDetails,
        paymentDetails: req.session.paymentDetails,
      });
    } else {
      res.redirect("/");
      req.session.bookingTimeExpire = true;
    }
  } else {
    paymentDetails = null;
    req.session.bookingTimeExpire = true;
    res.redirect("/");
  }
  req.session.paymentPage = false; //login validation
});

router.post("/payment", (req, res) => {
  var response = null;
  if (timeoutExpired === 0) {
    if (req.body.payment_method === "Paypal") {
      response = "Paypal";
      res.json(response);
    } else if (req.body.payment_method === "Razorpay") {
      response = "Razorpay";
      res.json(response);
    }
  } else {
    response = req.session.paymentDetails.screen.movieId;
    res.json(response);
    req.session.paymentDetails = null;
    req.session.choosedSeats = null;
  }
});

// ajax get method for payment
router.get("/payment-success/:detailsId", (req, res) => {
  req.session.paymentDetailsId = req.params.detailsId;
  bookingPendingHelper(undefined, 1);
  res.json({ status: true });
});
// ajax response
router.get("/success-payment/:detailsId", (req, res) => {
  console.log(req.session.choosedSeats, req.session.paymentDetails);
  if (req.session.paymentDetailsId === req.params.detailsId) {
    var bookingDetails = {};
    bookingDetails.time = req.session.paymentDetails.Show;
    bookingDetails.theater = req.session.paymentDetails.theater.Theater_name;
    bookingDetails.screen = req.session.paymentDetails.screen.Screen;
    bookingDetails.theaterId = req.session.paymentDetails.screen.theaterId;
    bookingDetails.date = req.session.choosedSeats.choosedDate;
    bookingDetails.seat = req.session.choosedSeats.selectedSeat;
    bookingDetails.price = req.session.paymentDetails.totalAmount;
    bookingDetails.movie = req.session.paymentDetails.screen.movieId;
    bookingDetails.userId = req.session.userDetails._id;
    bookingDetails.showId = req.session.choosedSeats.showId;
    userHelpers.addBookingHistory(bookingDetails);
    res.render("user/success", {
      user: true,
      allMovies: req.session.availableMovies,
      allTheater: req.session.availableTheaterRandom,
      userDetails: req.session.userDetails,
    });
  } else {
    res.send("sorry you cannot access this page ");
  }
});

router.get("/booking-history", userLoginHelper, async (req, res) => {
  var bookingHistory = await userHelpers.findBookingHistory(
    req.session.userDetails._id
  );
  res.render("user/booking-history", {
    user: true,
    userDetails: req.session.userDetails,
    bookingHistory,
    allMovies: req.session.availableMovies,
    allTheater: req.session.availableTheaterRandom,
  });
});

router.post("/cancel-booking", async (req, res) => {
  await userHelpers.cancelBooking(req.body.bookingId);
  res.json({ status: true });
});

router.get("/search/:type/:filterData", async (req, res) => {
  if (
    req.params.filterData === "Action" ||
    req.params.filterData === "Family" ||
    req.params.filterData === "Horror" ||
    req.params.filterData === "Drama" ||
    req.params.filterData === "Thriller" ||
    req.params.filterData === "Romantic" ||
    req.params.filterData === "Comedy"
  ) {
    var genre = await userHelpers.findMovieByType(req.params.filterData);
  } else if (req.params.type === "movie") {
    var movies = await userHelpers.findAmovie(req.params.filterData);
  } else if (req.params.type === "theater") {
    var theaters = await userHelpers.findTheaterMovies(req.params.filterData);
  }

  res.render("user/search", {
    userDetails: req.session.userDetails,
    allMovies: req.session.availableMovies,
    allTheater: req.session.availableTheaterRandom,
    movies,
    user: true,
    theaters,
    keyWord: req.session.keyWordSearch,
    genre,
  });
  req.session.keyWordSearch = false;
});

router.get("/search/:data", async (req, res) => {
  var keyWord = await userHelpers.findDataByKeyWord(req.params.data);
  req.session.keyWordSearch = keyWord;
  console.log(keyWord);
  res.json({ status: true });
});

router.get("/help", (req, res) => {
  res.render("user/help", {
    user: true,
  });
});

module.exports = router;
