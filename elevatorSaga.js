{
    init: function(elevators, floors) {
        var foreach = function(collection, fun) {
            for (i = 0; i < collection.length; i++) fun(collection[i], i);
        }
        var findAndApply = function(collection, predicate, effect) {
            for (i = 0; i < collection.length; i++) {
                if (predicate(collection[i])) {
                    effect(collection[i]);
                    return true;
                }
            }
            return false;
        }
        var addToDestination = function(destinations, floorNum, isAfter) {
            console.log("add "+floorNum+" to "+destinations);
            for (i = 0; i < destinations.length; i++) {
                var destination = destinations[i];
                if (destination == floorNum) {
                    console.log("Floor already a destination");
                    return;
                }
                if (isAfter(destination,floorNum)) {
                    destinations.splice(i, 0, floorNum);
                    return;
                }
            }
            destinations.push(floorNum);
        }
        var goingUpComparator = function (a, b) {return a > b;}
        var goingDownComparator = function(a, b) {return a < b;}

        foreach(elevators, function(elevator, i) {
            elevator.on("idle", function() {
                elevator.goToFloor(i%floors.length);
                    // Set the ligth off
            });
            
            elevator.on("floor_button_pressed", function(floorNum) {
                console.log("Button pressed "+floorNum+"inside the elevator");
                if (elevator.destinationDirection() == "stopped") {
                    console.log("Sending elevator straight to "+floorNum+" from stopped");
                    elevator.goToFloor(floorNum);  
                } else {
                    var compFun = goingDownComparator;
                    if (elevator.destinationDirection() == "up") {
                        compFun = goingUpComparator;
                    } 
                    addToDestination(elevator.destinationQueue, floorNum, compFun);
                    elevator.checkDestinationQueue();
                }
            });
            
            elevator.goToFloor(0);
        });
                   
        var findElevator = function(floor, direction, comparator) {
            if (!findAndApply(elevators, function(elevator) {
                return elevator.loadFactor() < 0.8 &&
                    (floor.floorNum() - elevator.currentFloor() >= 0) &&
                    elevator.destinationDirection() == direction;
            }, function(elevator) {
                addToDestination(elevator.destinationQueue, 
                                floor.floorNum(),
                                comparator);
                elevator.checkDestinationQueue();
            })) {
                // No elevator was given the task. Give it to the last elevator
                elevators[elevators.length-1].goToFloor(floor.floorNum());
            }
        }

        foreach(floors, function(floor, i) {
            floor.on("up_button_pressed", function() {
                findElevator(floor, "up", goingUpComparator);
            });
            
            floor.on("down_button_pressed", function() {
               findElevator(floor, "down", goingDownComparator); 
            });
            
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}