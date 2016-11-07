/**
 * New node file
 */
var userHome = angular.module('userHome', ['ui.router']);
userHome.config(function($stateProvider, $urlRouterProvider){
	$stateProvider.state('userHome', {
		url : '/home',
		views : {
			'navBar' : {
				templateUrl : 'templates/navBar.html'
			},
			'homeContent' : {
				templateUrl : 'templates/homeContent.html'
			}
		}
	})
	$urlRouterProvider.otherwise('/home');
});

userHome.controller('homeContentCtrl', function($scope, $http, $state){
	$http({
		method : "POST",
		url : "/getDetails"
	}).success(function(data){					//Sat Oct 15 2016 23:12:26 GM,-0700 (Pacific Daylight
		if(data.statusCode == 200){
			document.getElementById("hiUsername").innerHTML = "Hi " + data.firstname + "!";
			document.getElementById("dateOfBirth").innerHTML = data.dateOfBirth;
			document.getElementById("phoneNumber").innerHTML = data.phoneNumber;
			console.log(data.rows.last_logged_in);
			var dateTime = data.rows.last_logged_in.split("G", 1);
			document.getElementById("lastLoginTime").innerHTML = dateTime;
			$scope.adsOfItemsToBuy = data.rows;		
		}
		else 
			console.log(data.error);
	});
});

userHome.controller('adsCtrl', function($scope, $http){
	$http({
		method : "POST",
		url : "/getAds"
	}).success(function(data){
		if(data.statusCode == 200){
			$scope.adsOfItemsToBuy = data.rows;		
		}
		else 
			console.log(data.error);
	});

	$scope.addToCart = function(firstname, email_id, _id, item_name, item_quantity, item_description, item_price, userItemQuantity, type_of_price_tag){
		console.log("_id = " + _id);
		$http({
			method : "POST",
			url : "/addToCart",
			data : {
				"sellerFirstname" : firstname,
				"sellerEmailId" : email_id,
				"productId" : _id,
				"itemName" : item_name,
				"userItemQuantity" : userItemQuantity,
				"totalAvailableQuantity" : item_quantity,
				"itemDescription" : item_description,
				"itemPrice" : item_price,
				"typeOfPriceTag" : type_of_price_tag
			}
		}).success(function(data){
			if(data.statusCode == 200){
				window.location = "/shoppingCart";
			}
			else 
				console.log("Message from the Server = " + data.error);
		})
	}
	$scope.biddingSuccessDiv = false;
	$scope.biddingFailureDiv = false;

	$scope.placeBid = function(firstname, email_id, _id, item_name, item_quantity, item_description, item_price, userItemQuantity, type_of_price_tag, biddingPrice){
		console.log("Bidding price = " + biddingPrice);
		$http({
			method : "POST",
			url : "/placeBid",
			data : {
				"sellerFirstname" : firstname,
				"sellerEmailId" : email_id,
				"productId" : _id,
				"itemName" : item_name,
				"userItemQuantity" : userItemQuantity,
				"totalAvailableQuantity" : item_quantity,
				"itemDescription" : item_description,
				"itemPrice" : item_price,
				"typeOfPriceTag" : type_of_price_tag,
				"biddingPrice" : biddingPrice
			}
		}).success(function(data){
			if(data.statusCode == 200){
				console.log("reached here");
				if($scope.biddingFailureDiv == true){
					$scope.biddingFailureDiv = false;
				}
				$scope.biddingSuccessDiv = !$scope.biddingSuccessDiv;
				$scope.biddingSuccess = "Bid Has been Successfully Placed!";
			}
			else if(data.statusCode >= 401 &&  data.statusCode <= 403){
				if($scope.biddingSuccessDiv == true){
					$scope.biddingSuccessDiv = false;
				}
				$scope.biddingFailureDiv = !$scope.biddingFailureDiv;
				$scope.biddingFailure = data.error;
			}
		})
	}

	$scope.getBidders = function(type_of_price_tag, item_name){
		$http({
			method : "POST",
			url : "/getBidders",
			data : {
				"typeOfPriceTag" : type_of_price_tag,
				"itemName" : item_name
			}
		}).success(function(data){
			if(data.statusCode == 200){
				console.log("Bidders = " + JSON.stringify(data.bidders));
				var bidders = "";
				for(var i = 0; i < data.bidders.length ; i++){
					console.log(data.bidders[i].buyer_email);
					bidders += data.bidders[i].buyer_email + ": &nbsp$" + data.bidders[i].total_priceOfThisItem + "<br />";
				}
				console.log(bidders);
				document.getElementById("biddersList").innerHTML = bidders;
				var modal = document.getElementById('myModal');
				modal.style.display = "block";
				var span = document.getElementsByClassName("close")[0];
				span.onclick = function() {
				    modal.style.display = "none";
				}

				// When the user clicks anywhere outside of the modal, close it
				window.onclick = function(event) {
				    if (event.target == modal) {
				        modal.style.display = "none";
				    }
				}
			}
			else{
				console.log("Message from the Server = " + data.error);
				alert(data.error);
			}
		})
	}
})