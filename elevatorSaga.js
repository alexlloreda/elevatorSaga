{
  init: function(elevators, floors) {
    function addFloorDuringAscent(floorNum, elevator) {
      var localQueue = [];
      var searching = true;
      for (i = 0; i < localQueue.length; i++) {
        var floor = elevator.destinationQueue[i];

        if (searching) {
          if (floor < floorNum) {
            localQueue.push(floor);
          } else if (floor == floorNum) {
            localQueue.push(floor);
            searching = false;
          } else if (floor > floorNum) {
            localQueue.push(floorNum);
            localQueue.push(floor);
            searching = false;
          }
        } else {
          localQueue.push(floor);
        }
      }
      elevator.destinationQueue = localQueue;
      elevator.checkDestinationQueue();
    }

    function addFloorAfterAscent(floorNum, elevator) {
      var prevFloor = elevator.currentFloor() - 1;
      var i = 0;
      var newQueue = [];
      var queue = elevator.destinationQueue;
      while (i < queue.length && prevFloor < queue[i]) {
        newQueue.push(queue[i]);
        prevFloor = queue[i];
        i++;
      }
      // Up travel complete, now search for the insertion point
      while (i < queue.length && queue[i] > floorNum) {
        newQueue.push(queue[i]);
        i++;
      }
      // Insert only if the floorNum is not already in the list
      if (i >= queue.length || queue[i] < floorNum) {
        newQueue.push(floorNum);
      }
      // Copy the rest of the elements
      while (i < queue.length) {
        newQueue.push(queue[i]);
        i++;
      }
      elevator.destinationQueue = newQueue;
      elevator.checkDestinationQueue();
    }

    function addFloorDuringDescent(floorNum, elevator) {
      var localQueue = [];
      var searching = true;
      for (i = 0; i < localQueue.length; i++) {
        var floor = elevator.destinationQueue[i];

        if (searching) {
          if (floor > floorNum) {
            localQueue.push(floor);
          } else if (floor == floorNum) {
            localQueue.push(floor);
            searching = false;
          } else if (floor < floorNum) {
            localQueue.push(floorNum);
            localQueue.push(floor);
            searching = false;
          }
        } else {
          localQueue.push(floor);
        }
      }
      elevator.destinationQueue = localQueue;
      elevator.checkDestinationQueue();
    }

    function addFloorAfterDescent(floorNum, elevator) {
      var prevFloor = elevator.currentFloor() + 1;
      var i = 0;
      var newQueue = [];
      var queue = elevator.destinationQueue;
      while (i < queue.length && prevFloor > queue[i]) {
        newQueue.push(queue[i]);
        prevFloor = queue[i];
        i++;
      }
      // Down travel complete, now search for the insertion point
      while (i < queue.length && queue[i] < floorNum) {
        newQueue.push(queue[i]);
        i++;
      }
      // Insert only if the floorNum is not already in the list
      if (i >= queue.length || queue[i] > floorNum) {
        newQueue.push(floorNum);
      }
      // Copy the rest of the elements
      while (i < queue.length) {
        newQueue.push(queue[i]);
        i++;
      }
      elevator.destinationQueue = newQueue;
      elevator.checkDestinationQueue();
    }

    var elevator = elevators[0];
    elevator.stop();
    elevator.on("idle", function() {
      // Do nothing for now
      console.log("elevator idle");
      console.log("Destination queue", elevator.destinationQueue);
      elevator.goToFloor(0);
    });
    elevator.on("floor_button_pressed", function(floorNum) {
      // Find out current state (idle | goingUp | goingDown)
      console.log("Elevator Floor button ", floorNum, " pressed");
      if ("stopped" == elevator.destinationDirection()) {
        console.log("Elevator is stopped");
        elevator.goingUpIndicator(floorNum >= elevator.currentFloor());
        elevator.goingDownIndicator(floorNum <= elevator.currentFloor());
        elevator.goToFloor(floorNum);

      } else if ("up" == elevator.destinationDirection()) {
        console.log("Elevator is going up");
        if (floorNum > elevator.currentFloor()) {
          // Add the floor to the planned stops, in order
          addFloorDuringAscent(floorNum, elevator);
        } else {
          // Add the floor to the list of descending floors
          addFloorAfterAscent(floorNum, elevator);
        }
      } else /* "down" */ {
        console.log("Elevator is going down");
        if (floorNum < elevator.currentFloor()) {
          // Add the floor to the planned stops, in order
          addFloorDuringDescent(floorNum, elevator);
        } else {
          // Add the floor to the list of ascending floors
          addFloorAfterDescent(floorNum, elevator);
        }
      }
      console.log("Elevator Finished processing the floor button press ", elevator.destinationQueue);
    });

    elevator.on("stopped_at_floor", function(floorNum) {
      console.log("Elevator stopped at floor ", floorNum);
      nextFloor = floorNum;
      i = 0;
      while (nextFloor == floorNum && elevator.destinationQueue.length > i) {
        nextFloor = elevator.destinationQueue[i];
        i++;
      }
      console.log("Next floor ", nextFloor);
      console.log("Next destination ", elevator.destinationQueue);
      elevator.goingUpIndicator(nextFloor >= floorNum);
      elevator.goingDownIndicator(nextFloor <= floorNum);
    });

    function floorUpButtonPressed(floorNum) {
      return function() {
        console.log("up_button_pressed on floor ", floorNum);
        // Find nearest elevator with capacity and going up or idle
        var elevator = elevators[0]; // Stub
        /*
        var elevatorFloor = elevator.currentFloor();
        if (elevatorFloor < floor.floorNum() &&
          elevator.loadFactor() < 0.95 &&
          elevator.destinationDirection() == "up") {
          addFloorDuringAscent(floor.floorNum(), elevator);
        } else if (elevatorFloor == floor.floorNum() &&
          elevator.loadFactor() < 0.95 &&
          (elevator.destinationDirection() == "up" || elevator.destinationDirection() == "stopped")
        ) {
          // Add the destination to the list
          // Would this happen?
          elevator.goToFloor(floor.floorNum(), true);
        } else {
          addFloorAfterDescent(floor.floorNum(), elevator);
        }
        */
        elevator.goToFloor(floorNum);
        console.log("end up_button_pressed sending elevator to ", floorNum);
      };
    }

    function floorDownButtonPressed(floorNum) {
      return function() {
        console.log("down_button_pressed on floor ", floorNum);
        // Find nearest elevator with capacity and going down or idle
        elevator = elevators[0]; // Stub
        /*
        elevatorFloor = elevator.currentFloor();
        if (elevatorFloor > floor.floorNum() &&
          elevator.loadFactor() < 0.95 &&
          elevator.destinationDirection() == "down") {
          addFloorDuringDescent(floor.floorNum(), elevator);
        } else if (elevatorFloor == floor.floorNum() &&
          elevator.loadFactor() < 0.95 &&
          (elevator.destinationDirection() == "down" || elevator.destinationDirection() == "stopped")
        ) {
          // Add the destination to the list
          // Would this happen?
          elevator.goToFloor(floor.floorNum(), true);
        } else {
          addFloorAfterAscent(floor.floorNum(), elevator);
        }
        */
        elevator.goToFloor(floorNum);
        console.log("end down_button_pressed");
      };
    }

    for (var i = 0; i < floors.length; i++) {
      floor.on("up_button_pressed", floorUpButtonPressed(i));
      floor.on("down_button_pressed", floorDownButtonPressed(i));
    }
  },
  update: function(dt, elevators, floors) {
    // Normally nothing needs to be done here
  }
}
