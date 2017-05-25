/* Set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to body */
function openNav() {
    document.getElementById("sideNav").style.width = "250px";
    document.getElementById("main").style.marginRight = "250px";
    document.getElementById("slider").style.visibility = "hidden";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
    document.getElementById("sideNav").style.width = "0";
    document.getElementById("main").style.marginRight = "0";
    document.getElementById("slider").style.visibility = "visible";
    document.body.style.backgroundColor = "white";
}

   // logout button
    $('#logout').click(()=>{
        $.post('/logout');
        setTimeout(()=>{
            location.reload();
        }, 400);
    });

    var clickedTruck;
    var markers = [];


    // TESTING ONLY, POPULATES DB WITH TEST DATA
    var testPopulate = () => {
      $.get('/init', (err) =>{
        if(err) {console.log(err)}
      });
    }

    testPopulate();

    // add user to db if new

    var addUser = () => {
      $.get('/adduser', (err) =>{
        if(err) {console.log(err)}
        console.log('user added');
      });
    }

    addUser();

    var map, activeTrucks;
    var truckIcon = 'images/truck.gif';
    var hungryIcon = 'images/hungryguy.gif';

    var initMap = ()  => {
        
        var startPos;
        var geoSuccess = (position) => {
            startPos = position;
            var lat = startPos.coords.latitude;
            var long = startPos.coords.longitude;
            
            map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: lat, lng: long},
                zoom: 10
            });
            placeUserMarker(lat, long);
            setActiveTrucks();
        }
        navigator.geolocation.getCurrentPosition(geoSuccess);
    }

    var placeUserMarker = (lat, long) => {
        let marker = new google.maps.Marker({
            position: {lat: lat, lng: long},
            title: 'USER LOCATION',
            icon: hungryIcon,
            animation: google.maps.Animation.DROP,
            draggable: true,
            map: map
        });

        // To add the marker to the map, call setMap();
        marker.setMap(map);
    }
    
    var placeMarker = (lat, long, truckName, website, message, icon) => {
      // console.log('placemarker run');
      // console.log(lat, long, truckName, icon);

      var truckInfo = "<div class='truckInfo'><h3>" + truckName + "</h3><p>" + message + "</p><a href='"+ website + "''target='_blank'><p>" + website + "</p></a></div>" 
      // no info window for user
        let infowindow = new google.maps.InfoWindow({
          content: truckInfo

        });

        let marker = new google.maps.Marker({
            position: {lat: lat, lng: long},
            title: truckName,
            icon: icon,
            // no bouncing for now
            // animation: google.maps.Animation.BOUNCE,
            map: map
        });

        markers.push(marker);

        marker.addListener('click', function() {
          clickedTruck =  marker.title;
          // console.log(clickedTruck);

          infowindow.open(map, marker);
        });

        // To add the marker to the map, call setMap();
        marker.setMap(map);
    }



    var setActiveTrucks = () => {
      //ajax call to get active trucks, then send all data to placeMarker to create Markers
      $.get("/api", function(data, status){

        // console.log("Data: " + JSON.stringify(data) + " Status: " + JSON.stringify(status));
        activeTrucks = data;
      }).then(() => {
        for (var i = 0; i <activeTrucks.length; i++) {
          var t = activeTrucks[i];

          placeMarker(parseFloat(t.lat), parseFloat(t.long), t.truckName, t.website, t.message, truckIcon);


        }
      });
    }

    // clears all activeTrucks markers
    var clearMarkers = () => {
        for (var i=0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    // clear matching markers
    var clearNonFavorites = (arr) => {
        console.log(arr);
        for (var i = 0; i < arr.length; i++) {
            var f = arr[i];
            for (var j = 0; j < markers.length; j++) {

                // console.log(markers[j].title + '  ' + arr[i]);
                // console.log(markers[j].title === arr[i]);

                if (markers[j].title === arr[i]) {
                    markers[j].setMap(map);
                }
            }
        }
    } 


    var faveMarkers = [];

    // place favorites

    var placeFavorites = () => {

        // clear all
        clearMarkers();

        $.get("/favorites", function(data, status){ 
            faveMarkers = data;
            console.log(faveMarkers);
        }).then(() => {
            //need to compare trucknames with all markers (marker.title) and remove markers where truck name doesnt match
            clearNonFavorites(faveMarkers.favoriteTrucks);
        });
    }
    
    
    
    $(document).ready(function() {

        (function() {
            var video = document.getElementById("my-video");
            video.addEventListener("canplay", function() {
                video.play();
            });
        })();
        
        var on = false;

        $('.addBtn').click(()=> {
            $.get('/addfavorites/' + clickedTruck, function(data){
                console.log('addtruck clicked')
                console.log(data);
            }).done(function() {
                location.reload();
            })
            .fail(function() {
                console.log( "error" );
            })
        });

        $('.removeBtn').click(()=> {

            // console.log(clickedTruck);
            $.get('/delfavorites/' + clickedTruck, function(data){
                console.log(data);
            }).done(function() {
                location.reload();
            })
            .fail(function() {
                console.log( "error" );
            })
        })

        $('#slider').click(()=>{
            if(!on) {
                
                $('#slider').removeClass('sliderDivOff');
                $('#slider').addClass('sliderDivOn');
                $('.sliderHeart').removeClass('off');
                $('.sliderHeart').addClass('on');
                $('.sliderHeart').addClass('flip');
                $(".sliderHeart").animate({left: '140px'});
                setTimeout(()=>{
                    $('.sliderHeart').removeClass('flip');
                }, 400);
                // $(".sliderHeart").animate({fontSize: '8vh'}, "slow");
                // $(".sliderHeart").animate({fontSize: '5vh'}, "slow");
                on = true;
                placeFavorites();
                
            } else{
                
                $('#slider').removeClass('sliderDivOn');
                $('#slider').addClass('sliderDivOff');
                $('.sliderHeart').addClass('off');
                $('.sliderHeart').removeClass('on');
                $('.sliderHeart').addClass('flip');
                $(".sliderHeart").animate({left: '9px'});
                setTimeout(()=>{
                    $('.sliderHeart').removeClass('flip');
                }, 400);
                // $(".sliderHeart").animate({fontSize: '8vh'}, "slow");
                // $(".sliderHeart").animate({fontSize: '5vh'}, "slow");
                on = false;
                setActiveTrucks();
            }
        })
    });