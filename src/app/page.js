"use client"; 
import "./globals.css"; //get css styles like tile1, tile2, and border
import { useCallback, useEffect, useState } from 'react'; //import functions from react library

function arraysEqual(arr1, arr2) { //takes in two arrays
  if (arr1.length !== arr2.length) return false; //if they are not same length, return false
  return arr1.every((value, index) => value === arr2[index]); //return true if all of the vales are the same at each index, else false
}

function borderCheck(snakeHead){ //take in snake array, x and y cordinates
  const [x, y] = snakeHead; //set x and y to individual components of array
  const isOnBorder = x === 0 || x === 16 || y === 0 || y === 14; //if the head is on the border, isOnBorder is true
  return isOnBorder //return true or false
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max); //Math.random is a random decimal from 0 to 1, so multiplying it by 5 can yield 0 through 5
}

export default function Game() { //main function
  return ( //only returns the board, but you could add more UI elements to make it cleaner
    <div>
      <Board /> 
    </div>
  );
}

function Board(){ //board item
  const [snakePos, setSnakePos] = useState([[3,7], [2,7], [1,7]]); //set snake positions to starting position with head at index 0
  const [snakeDirection, setSnakeDirection] = useState("Right"); //the snake starts moving to the right
  const [applePos, setApplePos] = useState([1,1]); //apple starts at (1,1), but is randomly moved at the start
  const [score, setScore] = useState(0); //score starts at zero

  useEffect(() =>{ //only called once at the beginning
    const initialApplePos = [getRandomInt(14) + 1, getRandomInt(12) + 1]; //sets variable to random cordinates on grid
    setApplePos(initialApplePos); //set the apple position to cordinates
  },[]);

  const handleDirectionChange = useCallback((event) => { //event handler thing, trigger on key press
    const newDirection = event.key.replace("Arrow", ""); //event.key returns the key that was pressed like "ArrowLeft", replace takes off the "Arrow" part
    const directionMap = { //map the opposite directions to be accessed later
      "Right": "Left",
      "Left": "Right",
      "Up": "Down",
      "Down": "Up"
    };
    //if the key press is an arrow and it isn't in the opposite direction of current motion, set it to the new direction
    if (["Up", "Down", "Left", "Right"].includes(newDirection) && directionMap[snakeDirection] !== newDirection) { 
      setSnakeDirection(newDirection);
    }
  }, [snakeDirection]);

  useEffect(() => { //call when handleDirectionChange is called, i think?
    window.addEventListener("keydown", handleDirectionChange); //sets listener for key presses

    return () => {
      window.removeEventListener("keydown", handleDirectionChange); //removes listener because of something?
    };

  },[handleDirectionChange]);
  

  useEffect(() => { //changes when ever snakeDirection changes, it is at the bottom of the function
    const intervalID = setInterval(() => { //makes function run on time interval
      setSnakePos((prevSnakePos) => { //prevSnakePos = current value of snakePos, and the function part returns the new snakePos that setSnakePos takes in
        const newSnakePos = [...prevSnakePos]; //newSnakePos becomes a copy of currentSnakePos
        const [headX, headY] = newSnakePos[0]; //gets the current position of the head from first index, x y cords
        let newHead;

        switch (snakeDirection) { //take in direction of snake
          case "Right": 
            newHead = [headX + 1, headY]; //x + 1 if right
            break;
          case "Left":
            newHead = [headX - 1, headY]; //x -1 if left
            break;
          case "Up":
            newHead = [headX, headY - 1]; //y - 1 if up because i messed up the cordinate system a little bit
            break;
          case "Down":
            newHead = [headX, headY + 1]; //y + 1 if up because i messed up the cordinate system a little bit
            break;
          default:
            newHead = [headX, headY];
            break;
        }

        if (borderCheck(newHead)) { //if new head is on the border stop the loop and set the snake back, so it doesn't go into the border
          clearInterval(intervalID);
          // alert("Game Over!");
          return prevSnakePos;
        }
        if (newSnakePos.some(segment => arraysEqual(segment, newHead))) { //if snake head = one of its body, stop loop
          clearInterval(intervalID);
        }
        let [a,b] = newHead; //split up new head
        const newHeadBR = [a,14-b]; //fix the cordinate system because I messed up
        if (arraysEqual(newHeadBR, applePos)) { //if the new head is going to hit an apple
          newSnakePos.unshift(newHead); //unshift adds the newHead array at the beginiing of newSnakePos
          setScore(score + 1); //increase score by 1
          let newApplePos = [getRandomInt(14) + 1, getRandomInt(12) + 1]; //random apple location
          setApplePos(newApplePos); //move the apple
        } else { //if didn't hit an apple, snake stays same length
          newSnakePos.pop(); //get rid of last snakePos
          newSnakePos.unshift(newHead); //add new head
        }

        return newSnakePos;//setSnakePos to newSnakePos
      });
    }, 200);

    return () => clearInterval(intervalID);
  }, [snakeDirection]); //dependency, function re-runs when this changes

  //print all of the squares onto the screen with for loops and some screwed up cordinates
  const rows = [];
  for(let i = 0; i < 15; i++){
    const tiles = [];
    for(let k = 0; k < 17; k++){
      const index = k + 17*i;
      const tilePos = [k,i];
      const tilePosBR = [k,14 - i];
      const isSnake = snakePos.some((segment) => arraysEqual(segment, tilePos));
      if(isSnake){ //if the tile is a snake, style "snake"
        tiles.push(
          <div className="snake" key={`tile-${index}`} ></div>
        )
      }
      else if(borderCheck(tilePos)){ //if the tile is border, "style border"
        tiles.push(
          <div key={`tile-${index}`} className='border' ></div>
        );
      }
      else if(arraysEqual(applePos, tilePosBR)){//if the tile is apple, print apple picture with green background
        const className = index % 2 === 0 ? 'tile1' : 'tile2'; //alternate styles
        tiles.push(
          <div key={`tile-${index}`} className={className} style={{ backgroundImage: `url(${`/apple.png`})`, backgroundSize: 'cover' }}></div>
        );
      }
      else{ //print tile with green background
        const className = index % 2 === 0 ? 'tile1' : 'tile2'; //alernate styles
        tiles.push(
          <div key={`tile-${index}`} className={className}></div>
        );
      }
    }
    rows.push(
      <div key={`row-${i}`} className="board-row">
        {tiles}
      </div>
    )
  }
  
  return( //display the row with the tiles and the score
    <>
      <div>
        {rows}
      </div>
      <t1>Score: {score}</t1>
    </>
  );
}


