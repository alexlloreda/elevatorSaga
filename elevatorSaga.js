{
    init: function(elevators, floors) {
        // Put one to go up and same one to go down, when number chnages direction or
        // repeates we now we are supposed to change direction. Presses inside the 
        // elevator follow the same rule people will not get in wanting to go on the 
        // oposite direction once lights are controlled
        // When adding destinations, from the outside, to go down, when elevator is
        // going up, the current behaviour add them in ascending order, but the light is
        // saying up so passenger don't get in and it results in floors being abandoned
        // keeping an external queue where the direction is maintained might be a better
        // solution

        // Control the light.
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
        var prepend = function(destinations, floor, isAfter) {
            console.log("add "+floor+" to "+destinations);
            var prev = destinations[0];
            for (i=0; i<destinations.length; i++) {
                var d = destinations[i];
                if (d == floor) {
                    console.log("Already going to "+d+". Skip");
                    return;
                }
                if (isAfter(d,floor)) {
                    destinations.splice(i, 0, floor);
                    console.log("Destinations after splice: " + destinations);
                    return;
                }
                if (isAfter(prev,d)) {
                    // Reach the end of the descending sequence. Insert in ascending order
                    console.log("!!!Direction sequence finished at index "+i+". Nothing inserted: " + destinations);
                    return;
                }
                prev = d;
            }
            console.log("!!!Couldn't insert floor ");
        }
        // Insert after first desc sequence
        // Insert after first asc sequence
        
        var goingUpComparator = function (a, b) {return a > b;}
        var goingDownComparator = function(a, b) {return a < b;}

        elevators.foreach(function(elevator, i, arr) {
            elevator.on("idle", function() {
                elevator.goToFloor(i%floors.length);
            });
            
            elevator.on("floor_button_pressed", function(floorNum) {
                console.log("Button pressed "+floorNum+" inside the elevator");
                if (elevator.destinationQueue.length <= 0) {
                    console.log("Sending elevator straight to "+floorNum+" from stopped");
                    elevator.goToFloor(floorNum);
                } else {
                    var dir = elevator.destinationQueue[0] - elevator.currentFloor();
                    if (dir < 0) {
                        prepend(elevator.destinationQueue, floorNum, goingDownComparator);
                    } else {
                        prepend(elevator.destinationQueue, floorNum, goingUpComparator);
                    }
                    elevator.checkDestinationQueue();
                }
            });

            elevator.on("stopped_at_floor", function(floor) {
                if (elevator.currentFloor() - elevator.destinationQueue[0] > 0) {
                    elevator.goingDownIndicator(true);
                    elevator.goingUpIndicator(false);
                } else {
                    elevator.goingDownIndicator(false);
                    elevator.goingUpIndicator(true);
                }
            });
            
            elevator.goToFloor(0);
        });
        var isElevatorFree = function(elevator, floorNum, direction) {
            if (elevator.loadFactor() < 0.8) {
                var diff = floorNum - elevator.currentFloor();
                if (diff == 0 || elevator.destinationDirection() != direction) {
                    // elevator is in the floor, what to do?
                    return false;
                } else if (diff < 0) {
                    // the elevator is below
                    return direction == "up";
                } else {
                    // the elevator is above
                    return direction == "down";
                }
            } else return false;
        } 

        var findElevator = function(floor, direction, comparator) {
            var floorNum = floor.floorNum();
            console.log("Search elevator to go to "+floorNum+" "+direction);
            for (i = 0; i < elevators.length; i++) {
                var elevator = elevators[i];
                if (isElevatorFree(elevator, floorNum, comparator)) {
                    prepend(elevator.destinationQueue, floorNum, comparator);
                    //addToDestination(elevator.destinationQueue, floorNum, comparator);
                    elevator.checkDestinationQueue();
                    return;
                }
            }
            console.log("No elevator was free, adding to the last one");
            // No elevator was given the task. Give it to the last elevator
            elevators[elevators.length-1].goToFloor(floorNum);
        }

        floots.foreach(function(floor, i, arr) {
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