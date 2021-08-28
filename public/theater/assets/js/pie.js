var totalMovies =document.getElementById('totalMovie').value
var totalBooking = document.getElementById('todayBooking').value 
var totalUsers = document.getElementById('totalUsers').value 

// randomScalingFactor(),
// randomScalingFactor(),
// randomScalingFactor(),
// randomScalingFactor(),
// randomScalingFactor(),
// window.chartColors.danger,
// window.chartColors.grey,
// 'danger',
// 'grey'
var config = {
    type: 'pie',
    data: {
        datasets: [{
            data: [
                totalMovies,
                totalBooking,
                totalUsers
            ],
            backgroundColor: [
                window.chartColors.navy,
                window.chartColors.blue,
                window.chartColors.purple,
               
            ],
            label: 'Dataset 1'
        }],
        labels: [
            'Total Movies',
            'Today Bookings',
            'Total Users',
            
        ]
    },
    options: {
        responsive: true
    }
};

window.onload = function () {
    var ctx4 = document.getElementById('piechart').getContext('2d');
    window.myPie = new Chart(ctx4, config);
};