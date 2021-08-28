
$(document).ready(()=>{
    $('#super-admin-login').validate({
        rules:{
            Email:{
                required:true,
                email:true
            },
            Password:{
                required:true,
                minlength:8
            }
        },
        messages:{
            Email:{
                required:'Please enter your email'
            },
            Password:{
                required:'Please enter your password'
            }
        }
    })


    $('#theater-owner-signup').validate({
        rules:{
            Owner_name:{
                required:true,
                minlength:4,
            },
            Theater_name:{
                required:true,  
            },
            Email:{
                required:true,
                email:true
            },
            phone:{
                required:true,
                minlength:10,
                maxlength:10
            },
            Password:{
                required:true,
                minlength:8
            },
            Terms_of_service:{
                required:true,        
            }
        }
    })

    $('#Theater-owner-emailLogin').validate({
        rules:{
            Email:{
                required:true,
                email:true
            },
            Password:{
                required:true,
                minlength:8,
            }
        }
    })

    $('#theater-owner-otpLogin').validate({
        rules:{
            phone:{
                required:true,
                minlength:10,
                maxlength:10
            }
        }
    })
    $('#add-theater-owner-profile').validate({
        rules:{
            Theater_profile:{
                require:true    
            }
          
        }
    })
    $('#add-user-sign-up').validate({
        rules:{
            Name:{
                required:true,
                minlength:4
            },
            Email:{
                required:true,
                email:true
            },
            phone:{
                required:true,
                minlength:10,
                maxlength:10     
            },
            Password:{
                required:true,
                minlength:8
            }
        }
    })
    $('#userOtpValidateSignup').validate({
        rules:{
            Otp:{
                required:true,
                minlength:6,
                maxlength:6
            }
        }
    })
    $('#userOtpValidateLogin').validate({
        rules:{
            phone:{
                required:true,
                minlength:10,
                maxlength:10
            }
        }
    })
    $('#userOtpValidateUser').validate({
        rules:{
            Otp:{
                required:true,
                minlength:6,
                maxlength:6
            }
        }
    })
    $('#add-movie').validate({
        rules:{
            Movie:{
                required:true,
            },
            Hours:{
                required:true,
                number:true
            },
            Teaser:{
                required:true,
            },
            Movie_state:{
                required:true
            },
            Description:{
                required:true,
                minlength:15
            },
            Cover_photo:{
                required:true
            },
            Poster_photo:{
                required:true
            },
            Cast_1:{
                required:true
            },
            Cast_2:{
                required:true
            },
            Cast_3:{
                required:true
            },
            Cast_4:{
                required:true
            },
            Cast_5:{
                required:true
            },
            Cast_6:{
                required:true
            },
            Cast_1_name:{
                required:true,
                minlength:3,
                maxlength:13
            },
            Cast_2_name:{
                required:true,
                minlength:3,
                maxlength:13
            },
            Cast_3_name:{
                required:true,
                minlength:3,
                maxlength:13
            },
            Cast_4_name:{
                required:true,
                minlength:3,
                maxlength:13
            },
            Cast_5_name:{
                required:true,
                minlength:3,
                maxlength:13
            },
            Cast_6_name:{
                required:true,
                minlength:3,
                maxlength:13
            }

            
        }
    })
    $('#edit-movie').validate({
        rules:{
            Movie:{
                required:true,
            },
            Hours:{
                required:true,
                number:true
            },
            Teaser:{
                required:true,
            },
            Movie_state:{
                required:true
            },
            Description:{
                required:true,
                minlength:15
            },
            Cast_1_name:{
                required:true,
                minlength:3,
                maxlength:13
            },
            Cast_2_name:{
                required:true,
                minlength:3,
                maxlength:13
            },
            Cast_3_name:{
                required:true,
                minlength:3,
                maxlength:13
            },
            Cast_4_name:{
                required:true,
                minlength:3,
                maxlength:13
            },
            Cast_5_name:{
                required:true,
                minlength:3,
                maxlength:13
            },
            Cast_6_name:{
                required:true,
                minlength:3,
                maxlength:13
            }

            
        }
    })
    $('#edit-details').validate({
        rules:{
            Owner_name:{
                required:true,
                minlength:3
            },
            Theater_name:{
                required:true,
                minlength: 2
            },
            Email:{
                required:true,
                email:true  
            },
            Phone:{
                required:true,
                number:true,
                minlength:10,
                maxlength:10
            }
        }
    })

    $('#edit-user-details').validate({
        rules:{
            Name:{
                required:true,
                minlength:3
            },
            Email:{
                required:true,
                email:true
            },
            Phone:{
                required:true,
                minlength:10,
                maxlength:10
            }
        }
    })
    $('#user-payment').validate({
        rules:{
            payment_method:{
                required:true
            }
        },
        submitHandler:()=>{
            paymentMethod()
        }
    })

    
})