{
    foreach: function(collection, fun) {
        for (i=0; i<collection.length; i++) fun(collection[i], i);
    }


    init: function(elevators, floors) {
        foreach(elevators, function(elevator, i) {
            elevator.on("idle", function() {
                elevator.goToFloor(i%floors.length);
            });

            elevator.on("floor_button_pressed", function(floorNum) {
                elevator.goToFloor(floorNum);
            });

            elevator.goToFloor(0);
        });

        foreach(floors, function(floor, i) {
            floor.on("up_button_pressed", function() {
                // get an elevator that is not full and going in that direction
                for (i=0; i<elevators.length; i++) {
                    var elevator = elevators[i];
                    if (elevator.loadFactor < 0.8) {
                        if ((floor.floorNum() - elevator.currentFloor() >= 0) && elevator.destinationDirection() == "up") {
                            addToDestination(elevator, floor.floorNum)
                            elevator.goToFloor(floor.floorNum())
                        }
                    }
                }
            });
            floor.on("down_button_pressed", function() {
                // get an elevator that is not full and going in that direction
            });
        });

    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}