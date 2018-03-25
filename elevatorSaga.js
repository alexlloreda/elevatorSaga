{
  init: function(elevators, floors) {
    function ascentComparator(a,b) { return a < b; }
    function descentComparator(a,b) { return a > b;}

    function findPosition(floorNum, queue, isBefore, startIndex) {
      var i = startIndex;
      while (i < queue.length && isBefore(queue[i], floorNum)) {
        i++;
      }
      return i;
    }

    function addFloorDuringAscent(floorNum, elevator) {
      console.log("Adding floor ", floorNum, " during ascent with queue", elevator.destinationQueue);
      var insertionIndex = findPosition(floorNum, elevator.destinationQueue, ascentComparator);
      elevator.destinationQueue.splice(insertionIndex, 0, floorNum);
      elevator.checkDestinationQueue();
      console.log("Added floor ", elevator.destinationQueue);
    }

    function addFloorAfterAscent(floorNum, elevator) {
      console.log("Adding floor ", floorNum, " after ascent with queue", elevator.destinationQueue);
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
      console.log("Added floor ", elevator.destinationQueue);
    }

    function addFloorDuringDescent(floorNum, elevator) {
      console.log("Adding floor ", floorNum, " during descent with queue", elevator.destinationQueue);
      var insertionIndex = findPosition(floorNum, elevator.destinationQueue, descentComparator);
      elevator.destinationQueue.splice(insertionIndex, 0, floorNum);
      elevator.checkDestinationQueue();
      console.log("Added floor ", elevator.destinationQueue);
    }

    function addFloorAfterDescent(floorNum, elevator) {
      console.log("Adding floor ", floorNum, " after descent with queue", elevator.destinationQueue);
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
      console.log("Added floor ", elevator.destinationQueue);
    }

    elevators.forEach(function(elevator) {
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
          if (floorNum > elevator.currentFloor()) {
            addFloorDuringAscent(floorNum, elevator);
          } else {
            addFloorDuringDescent(floorNum, elevator);
          }
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
    });

    function floorUpButtonPressed(floorNum) {
      return function() {
        console.log("up_button_pressed on floor ", floorNum);
        // Find nearest elevator with capacity and going up or idle
        var elevator = elevators[0]; // Stub

        var elevatorFloor = elevator.currentFloor();
        if (elevatorFloor < floorNum && elevator.loadFactor() < 0.95) {
          if (elevator.destinationDirection() == "up") {
            addFloorDuringAscent(floorNum, elevator);
          } else {
            addFloorAfterDescent(floorNum, elevator);
          }
        } else if (elevatorFloor > floorNum && elevator.loadFactor() < 0.95) {
          if (elevator.destinationDirection() == "down") {
            addFloorAfterDescent(floorNum, elevator);
          } else {
            addFloorAfterAscent(floorNum, elevator);
          }
        } else {
          // This else case is simplified for now.
          elevator.goToFloor(floorNum);
        }
        console.log("updated destinationQueue ", elevator.destinationQueue);
      };
    }

    function floorDownButtonPressed(floorNum) {
      return function() {
        console.log("down_button_pressed on floor ", floorNum);
        // Find nearest elevator with capacity and going down or idle
        elevator = elevators[0]; // Stub

        var elevatorFloor = elevator.currentFloor();
        if (elevator.loadFactor() < 0.95) {
          if (elevatorFloor < floorNum) {
            if (elevator.destinationDirection() == "up") {
              addFloorAfterAscent(floorNum, elevator);
            } else {
              addFloorAfterDescent(floorNum, elevator);
            }
          } else if (elevatorFloor > floorNum) {
            if (elevator.destinationDirection() == "down") {
              addFloorDuringDescent(floorNum, elevator);
            } else {
              addFloorAfterAscent(floorNum, elevator);
            }
          } else {
            // Same floor
            if (elevator.destinationDirection() == "up") {
              addFloorAfterAscent(floorNum, elevator);
            } else {
              elevator.goToFloor(floorNum, true);
              elevator.goingDownIndicator(true);
            }
          }
        } else {
          if (elevator.destinationDirection() == "up") {
            addFloorAfterAscent(floorNum, elevator);
          } else {
            elevator.goToFloor(floorNum);
          }
        }
        console.log("updated destinationQueue ", elevator.destinationQueue);
      };
    }

    for (var i = 0; i < floors.length; i++) {
      var floor = floors[i];
      floor.on("up_button_pressed", floorUpButtonPressed(i));
      floor.on("down_button_pressed", floorDownButtonPressed(i));
    }
  },
  update: function(dt, elevators, floors) {
    // Normally nothing needs to be done here
  }
}
