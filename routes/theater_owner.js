var express = require("express");
var router = express.Router();
var theaterHelpers = require("../helpers/theaterHelper");
var otpHelpers = require("../helpers/otpHelpers");
var passport = require("passport");
const { Db } = require("mongodb");
const theaterHelper = require("../helpers/theaterHelper");
const { json } = require("express");
const { parse } = require("dotenv");
const theaterLoginHelper = (req, res, next) => {
  if (req.session.theaterStatus === true) {
    next();
  } else {
    res.redirect("/theater-management/email-login");
  }
};

/* GET theater_owner home page. */
router.get("/", theaterLoginHelper, async function (req, res, next) {
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );
  var TotalMovies = await theaterHelpers.findTotalMovies();
  var todayBooking = await theaterHelpers.findTodayBooking(
    req.session.theaterDetails._id
  );
  var totalUsers = await theaterHelpers.findAllUsers();
  var availableTotalMovies = TotalMovies.length;
  lastTenDayBooking = await theaterHelpers.lastTenDayBooking(
    req.session.theaterDetails._id
  );
  res.render("theater/dashboard", {
    theater_owner: true,
    theaterDetails: req.session.theaterDetails,
    availableScreen,
    availableTotalMovies,
    todayBooking,
    totalUsers,
    lastTenDayBooking,
  });
});

router.get("/sign-up", (req, res) => {
  res.render("theater/signup", {
    theaterOwnerName: req.session.theaterOwnerName,
    theaterName: req.session.theaterName,
    theaterEmail: req.session.theaterEmail,
    theaterPhone: req.session.theaterPhone,
    invalidOtp: req.session.theaterInvalidOtp,
    invalidCountryCode: req.session.theaterCountryCodeNumber,
    hidePartial: true,
    theater_owner: true,
  });
  req.session.theaterOwnerName = null;
  req.session.theaterName = null;
  req.session.theaterEmail = null;
  req.session.theaterPhone = null;
  req.session.theaterInvalidOtp = false;
  req.session.theaterCountryCodeNumber = false;
});
router.post("/sign-up", (req, res) => {
  req.session.theatersignupDetails = req.body;
  req.session.theaterPhoneNumber = req.body.Phone;
  theaterHelpers
    .checkDetails(req.body)
    .then(() => {
      otpHelpers
        .sendMessage(req.body.Phone)
        .then(() => {
          res.render("theater/otp", { hidePartial: true, theater_owner: true });
        })
        .catch(() => {
          // invalid country code or phone number
          req.session.theaterCountryCodeNumber = true;
          res.redirect("/theater-management/sign-up");
        });
    })
    .catch((alreadyExist) => {
      req.session.theaterOwnerName = alreadyExist.theaterOwner;
      req.session.theaterName = alreadyExist.theaterName;
      req.session.theaterEmail = alreadyExist.email;
      req.session.theaterPhone = alreadyExist.phone;
      res.redirect("/theater-management/sign-up");
    });
});

router.post("/otp", (req, res) => {
  var data = {};
  data.Phone = req.session.theaterPhoneNumber;
  data.Otp = req.body.Otp_verify;
  otpHelpers
    .compareOtp(data)
    .then(() => {
      theaterHelpers
        .addTheaterDetails(req.session.theatersignupDetails)
        .then((response) => {
          req.session.theaterStatus = response.Status;
          req.session.theaterDetails = response.datas;
          setTimeout(()=>{
           
            res.redirect('/theater-management/logout')
          },1000*10)
          res.redirect("/theater-management/");
        });
    })
    .catch(() => {
      req.session.theaterInvalidOtp = true;
      res.redirect("/theater-management/sign-up");
    });
});

router.get("/email-login", (req, res) => {
  res.render("theater/email-login", {
    theater_owner: true,
    hidePartial: true,
    theaterLoginError: req.session.theaterLoginError,
    theaterBlock: req.session.theaterBlock,
    theaterConfirm: req.session.theaterConfirm,
  });
  req.session.theaterLoginError = false;
  req.session.theaterBlock = false;
  req.session.theaterConfirm = false;
});

router.post("/email-login", (req, res) => {
  theaterHelpers
    .theaterEmailLogin(req.body)
    .then((response) => {
      req.session.theaterStatus = response.Status;
      req.session.theaterDetails = response;
      res.redirect("/theater-management");
    })
    .catch((response) => {
      if (response === "block") {
        req.session.theaterBlock = true;
        res.redirect("/theater-management");
      } else if (response === "confirm") {
        req.session.theaterConfirm = true;
        res.redirect("/theater-management");
      } else {
        req.session.theaterStatus = response;
        req.session.theaterLoginError = true;
        res.redirect("/theater-management");
      }
    });
});

router.get("/otp-login", (req, res) => {
  res.render("theater/otp-login", {
    theater_owner: true,
    hidePartial: true,
    theaterOwnerInvalidPhone: req.session.theaterOwnerInvalidPhone,
    theaterOwnerinvalidOtp: req.session.theaterOwnerinvalidOtp,
  });
  req.session.theaterOwnerInvalidPhone = false;
  req.session.theaterOwnerinvalidOtp = false;
});

router.post("/otp-login", (req, res) => {
  theaterHelpers
    .checktheaterPhoneNumber(req.body)
    .then(() => {
      otpHelpers.sendMesssageTheaterLogin(req.body.Phone).then(() => {
        res.render("theater/otp-login-verify", {
          hidePartial: true,
          theater_owner: true,
          theaterVerifyPhone: req.body.Phone,
        });
      });
    })
    .catch(() => {
      req.session.theaterOwnerInvalidPhone = true;
      res.redirect("/theater-management/otp-login");
    });
});

router.post("/otp-login-verify", (req, res) => {
  otpHelpers
    .compareOtpTheaterLogin(req.body)
    .then(() => {
      theaterHelpers
        .theaterOtpLogin(req.body.Phone)
        .then((response) => {
          req.session.theaterStatus = response.Status;
          req.session.theaterDetails = response;
          res.redirect("/theater-management/");
        })
        .catch((response) => {
          req.session.theaterStatus = response;
          res.redirect("/theater-management/");
        });
    })
    .catch(() => {
      req.session.theaterOwnerinvalidOtp = true;
      redirect("/theater-management/otp-login");
    });
});

router.get("/logout", (req, res) => {
  req.session.theaterStatus = false;
  res.redirect("/theater-management");
});
// profile
router.get("/profile",theaterLoginHelper, async (req, res) => {
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );
  res.render("theater/profile", {
    theater_owner: true,
    theaterDetails: req.session.theaterDetails,
    availableScreen,
  });
});

router.post("/add-profile-image", async (req, res) => {
  var theaterProfileImage = req.files.Theater_profile;
  theaterProfileImage.mv(
    "./public/profileImages/" + req.body.Theater_id + ".jpg"
  );
  var data = {};
  data.Profile = true;
  data.theaterId = req.body.Theater_id;
  await theaterHelpers.addtheaterProfile(data);
  var allDetails = await theaterHelpers.findUserProfileDetails(data.theaterId);
  req.session.theaterDetails = allDetails;
  res.redirect("/theater-management/profile");
});

router.get("/delete-theater-owner-profile",theaterLoginHelper, (req, res) => {
  theaterHelpers
    .DeleteUserProfile(req.session.theaterDetails._id)
    .then((response) => {
      req.session.theaterDetails = response;
      res.json({ delete: true });
    });
});

router.get("/show-management",theaterLoginHelper, async (req, res) => {
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );

  res.render("theater/show-management", {
    theater_owner: true,
    theaterDetails: req.session.theaterDetails,
    availableScreen,
  });
});

// add movie
router.get("/add-movies",theaterLoginHelper, async (req, res) => {
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );
  res.render("theater/add-movie", {
    theater_owner: true,
    theaterDetails: req.session.theaterDetails,
    availableScreen,
  });
});

router.post("/add-movies", (req, res) => {
  theaterHelpers.addMovies(req.body).then((response) => {
    req.files.Cover_photo.mv(
      "./public/movieImages/" + response._id + "Cover_photo.jpg"
    );
    req.files.Poster_photo.mv(
      "./public/movieImages/" + response._id + "Poster_photo.jpg"
    );
    req.files.Cast_1.mv("./public/movieImages/" + response._id + "Cast1.jpg");
    req.files.Cast_2.mv("./public/movieImages/" + response._id + "Cast2.jpg");
    req.files.Cast_3.mv("./public/movieImages/" + response._id + "Cast3.jpg");
    req.files.Cast_4.mv("./public/movieImages/" + response._id + "Cast4.jpg");
    req.files.Cast_5.mv("./public/movieImages/" + response._id + "Cast5.jpg");
    req.files.Cast_6.mv("./public/movieImages/" + response._id + "Cast6.jpg");
    res.redirect("/theater-management/add-movies");
  });
});

router.get("/all-movies",theaterLoginHelper, async (req, res) => {
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );

  var allMovies = await theaterHelpers.findAllMovies();
  res.render("theater/all-movies", {
    theater_owner: true,
    allMovies,
    availableScreen,
    theaterDetails: req.session.theaterDetails,
  });
});

router.get("/edit-movies/:Id",theaterLoginHelper, async (req, res) => {
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );

  var editMovieDetails = await theaterHelpers.findEditMovies(req.params.Id);
  res.render("theater/edit-movies", {
    theater_owner: true,
    editMovieDetails,
    availableScreen,
    theaterDetails: req.session.theaterDetails,
  });
});

router.post("/edit-movies", async (req, res) => {
  await theaterHelpers.editMovieDetails(req.body);
  if (req.files != null) {
    if (req.files.Cover_photo != undefined) {
      req.files.Cover_photo.mv(
        "./public/movieImages/" + req.body.Movie_id + "Cover_photo.jpg"
      );
    }
    if (req.files.Poster_photo != undefined) {
      req.files.Poster_photo.mv(
        "./public/movieImages/" + req.body.Movie_id + "Poster_photo.jpg"
      );
    }
    if (req.files.Cast_1 != undefined) {
      req.files.Cast_1.mv(
        "./public/movieImages/" + req.body.Movie_id + "Cast1.jpg"
      );
    }
    if (req.files.Cast_2 != undefined) {
      req.files.Cast_2.mv(
        "./public/movieImages/" + req.body.Movie_id + "Cast2.jpg"
      );
    }
    if (req.files.Cast_3 != undefined) {
      req.files.Cast_3.mv(
        "./public/movieImages/" + req.body.Movie_id + "Cast3.jpg"
      );
    }
    if (req.files.Cast_4 != undefined) {
      req.files.Cast_4.mv(
        "./public/movieImages/" + req.body.Movie_id + "Cast4.jpg"
      );
    }
    if (req.files.Cast_5 != undefined) {
      req.files.Cast_5.mv(
        "./public/movieImages/" + req.body.Movie_id + "Cast5.jpg"
      );
    }
    if (req.files.Cast_6 != undefined) {
      req.files.Cast_6.mv(
        "./public/movieImages/" + req.body.Movie_id + "Cast6.jpg"
      );
    }
  }
  res.redirect("/theater-management/all-movies");
});

router.post("/edit-theater-details", (req, res) => {
  theaterHelpers.editTheaterDetails(req.body).then((data) => {
    req.session.theaterDetails = data;
    res.redirect("/theater-management/profile");
  });
});

// router.get('/add-shows', async (req, res) => {
//   var allShows = await theaterHelpers.findTheaterShow(req.session.theaterDetails._id)
//   res.render('theater/add-show', { theater_owner: true, 'theaterDetails': req.session.theaterDetails, allShows })
// })

// router.post('/add-shows', (req, res) => {
//   theaterHelpers.addNewShows(req.body).then(() => {
//     res.redirect('/theater-management/add-shows')
//   })
// })

// router.post('/delete-shows', async (req, res) => {
//   await theaterHelpers.deleteshows(req.body.showId)
//   res.json({ response: true })
// })

router.get("/add-screen",theaterLoginHelper, async (req, res) => {
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );

  var screen = await theaterHelpers.findAllScreen(
    req.session.theaterDetails._id
  );
  res.render("theater/add-screen", {
    theater_owner: true,
    screen,
    theaterDetails: req.session.theaterDetails,
    availableScreen,
  });
});

router.post("/add-screen", async (req, res) => {
  await theaterHelpers.addNewScreen(req.body);
  res.redirect("/theater-management/add-screen");
});

router.post("/delete-screen", async (req, res) => {
  var details = await theaterHelpers.deleteScreen(req.body.screenId);
  res.json({ response: true });
});

router.get("/add-shows/:screenId",theaterLoginHelper, async (req, res) => {
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );

  var availableShows = await theaterHelpers.findShowsByScreen(
    req.params.screenId
  ); //find shows by screen id
  res.render("theater/add-show", {
    theaterDetails: req.session.theaterDetails,
    screenId: req.params.screenId,
    theater_owner: true,
    availableShows,
    availableScreen,
  });
});

router.post("/add-shows", async (req, res) => {
  var details = await theaterHelpers.addShows(req.body);
  res.redirect("/theater-management/add-shows/" + details.screenId);
});

router.post("/delete-show", async (req, res) => {
  await theaterHelpers.deleteShow(req.body.showId);
  res.json({ response: true });
});

router.get("/seat-arrangement/:screenId",theaterLoginHelper, async (req, res) => {
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );
  var seatLayout = await theaterHelpers.findSeatLayout(req.params.screenId);
  var screen = await theaterHelpers.findCurrentScreen(req.params.screenId);

  res.render("theater/seat-arrangements", {
    theater_owner: true,
    availableScreen,
    theaterDetails: req.session.theaterDetails,
    screen,
    seatLayout,
  });
});

router.post("/save-seat-structure/", async (req, res) => {
  req.body.seatStructure = JSON.parse(req.body.seatStructure);

  var seatStructure = await theaterHelpers.addTheaterStructure(req.body);
  res.json(seatStructure);
});

router.get("/add-seat-number/:seat_structure_id",theaterLoginHelper, async (req, res) => {
  var seatArrangement = await theaterHelpers.findSeatStructure(
    req.params.seat_structure_id
  );
  var seatNumber = await theaterHelpers.findSeatNumbers(
    req.params.seat_structure_id
  );
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );
  res.render("theater/add-seat-number", {
    theater_owner: true,
    theaterDetails: req.session.theaterDetails,
    seatArrangement,
    seatNumber,
    availableScreen,
  });
});
router.post("/add-seat-number/", async (req, res) => {
  req.body.seatNumber = JSON.parse(req.body.seatNumber);
  var details = await theaterHelpers.addSeatNumbers(req.body);
  res.json({ response: true });
});

router.get("/add-movie-to-screen",theaterLoginHelper, async (req, res) => {
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );
  var allMovies = await theaterHelpers.findAllReleasedMovie();
  res.render("theater/add-movie-to-screen", {
    theater_owner: true,
    theaterDetails: req.session.theaterDetails,
    availableScreen,
    allMovies,
  });
});
router.post("/add-movie-to-screen", async (req, res) => {
  await theaterHelpers.addMovieToScreen(req.body);
  res.json({ status: true });
});
router.post("/delete-movie-to-screen", async (req, res) => {
  await theaterHelpers.deleteMovieToScreen(req.body);
  res.json({ status: true });
});
router.post("/editScreenDate", async (req, res) => {
  await theaterHelpers.editScreenDate(req.body);
  res.json({ status: true });
});
router.get("/seat-category",theaterLoginHelper, async (req, res) => {
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );
  res.render("theater/seat-category", {
    theater_owner: true,
    theaterDetails: req.session.theaterDetails,
    availableScreen,
  });
});

router.post("/seat-category", async (req, res) => {
  var details = await theaterHelpers.updateScreenPrice(req.body);
  res.json({ status: true });
});

router.get("/offline-management/:screenId",theaterLoginHelper, async (req, res) => {
  var availableShows = await theaterHelpers.findAvailableShows(
    req.params.screenId
  );
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );
  res.render("theater/offline-management", {
    theater_owner: true,
    theaterDetails: req.session.theaterDetails,
    availableShows,
    availableScreen,
  });
});

router.get("/offline-booking/:showId",theaterLoginHelper, async (req, res) => {
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );
  var seatstructure = await theaterHelpers.offlineBooking(req.params.showId);
  seatstructure = seatstructure[0];
  var bookedSeats = await theaterHelpers.BookedSeats(req.params.showId);
  res.render("theater/offline-booking", {
    theater_owner: true,
    theaterDetails: req.session.theaterDetails,
    seatstructure,
    bookedSeats,
    availableScreen,
  });
});

router.post("/add-booking-seat", (req, res) => {
  theaterHelpers
    .addBookingSeat(req.body)
    .then((response) => {
      res.json({ status: true });
    })
    .catch((status) => {
      res.json(status);
    });
});

router.post("/remove-booking-seat", (req, res) => {
  theaterHelpers.removeBookingSeat(req.body);
  res.json({ status: true });
});

router.get("/booking-history",theaterLoginHelper, async (req, res) => {
  var availableScreen = await theaterHelpers.findAvailableScreen(
    req.session.theaterDetails._id
  );
  var bookingHistory = await theaterHelpers.findBookingHistory(
    req.session.theaterDetails._id
  );
  res.render("theater/booking-history", {
    theater_owner: true,
    availableScreen,
    theaterDetails: req.session.theaterDetails,
    bookingHistory,
  });
});

module.exports = router;
