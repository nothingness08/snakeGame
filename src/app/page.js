/*
  notes: cordinate system starts top left
*/
"use client"; 
// import { init } from "next/dist/compiled/webpack/webpack";
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

function wordToEnding(word){
  return word.slice(-3);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * (max +1)); 
}

function wordImages(words, index, correct) {
  return '/images/' + words[index[0]][correct] + '.png';
}


function randomObjPos(snakePos, otherObj){
  let initialObjPos = [];
  let openTile = true;
  do{
    openTile = true;
    initialObjPos = [getRandomInt(14) + 1, getRandomInt(12) + 1];
    for(let i = 0; i < snakePos.length; i++){
      if(arraysEqual(initialObjPos, snakePos[i])){
        openTile = false;
        break;
      }
    }
    if(arraysEqual(initialObjPos, otherObj)){
      openTile = false;
    }
  }while(!openTile)
  return initialObjPos
}

function StartButton({onStartClick, gameState}){
  if(gameState === 1){
    return(<div></div>);
  }
  else if(gameState === 0){
    return(
      <button onClick={onStartClick}>start</button>
    );
  }
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
  const [obj1Pos, setObj1Pos] = useState([1,1]); //apple starts at (1,1), but is randomly moved at the start
  const [obj2Pos, setObj2Pos] = useState([2,1]); 
  const [score, setScore] = useState(0); //score starts at zero
  const [message, setMessage] = useState("");
  const words = [["ring", "drink"], ["fang","king"], ["strong", "swing"],["stung", "stink"], ["bank", "junk"],["pink", "wing"]];
  const [wordsIndex, setWordsIndex] = useState([0,0]);
  const [gameState, setGameState] = useState(0); //0 is off, 1 is on
  

  useEffect(() =>{ 
    if(gameState === 1){
      setObj1Pos(randomObjPos(snakePos, obj2Pos)); 
      setObj2Pos(randomObjPos(snakePos, obj1Pos));
      setWordsIndex([getRandomInt(words.length - 1), getRandomInt(1)]);
      setSnakePos([[3,7], [2,7], [1,7]]);
      setSnakeDirection("Right");
      setScore(0);
    }
  },[gameState]);

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
    if(gameState === 1){
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

        const snakeHitItself = newSnakePos.some(segment => arraysEqual(segment, newHead))
        if (borderCheck(newHead) || snakeHitItself) { 
          clearInterval(intervalID);
          if(snakeHitItself){
            setGameState(0);
          }
          return prevSnakePos;
        }
        if (arraysEqual(newHead, obj1Pos) || arraysEqual(newHead, obj2Pos)) { 
          if((arraysEqual(newHead, obj1Pos) && wordsIndex[1] == 0) || (arraysEqual(newHead, obj2Pos) && wordsIndex[1] == 1)){
            setObj1Pos(randomObjPos(snakePos, obj2Pos));
            setObj2Pos(randomObjPos(snakePos, obj1Pos));
            setScore(score + 1);
            newSnakePos.unshift(newHead); 
            setWordsIndex([getRandomInt(words.length - 1), getRandomInt(1)]);
            setMessage("Good Job");//temp
          }
          else{
            clearInterval(intervalID);
            setMessage("Oops wrong image");//temp
            return prevSnakePos;
          }
        } else {
          newSnakePos.pop(); 
          newSnakePos.unshift(newHead);
        }
        return newSnakePos;
      });
    }, 200);
    return () => clearInterval(intervalID);
  }
  }, [snakeDirection, gameState]); //dependency, function re-runs when this changes

  
  
  //print all of the squares onto the screen with for loops and some screwed up cordinates
  const rows = [];
  for(let i = 0; i < 15; i++){
    const tiles = [];
    for(let k = 0; k < 17; k++){
      const index = k + 17*i;
      const tilePos = [k,i];
      const isSnake = snakePos.some((segment) => arraysEqual(segment, tilePos));
      if(isSnake){ //if the tile is a snake, style "snake"
        if(arraysEqual(tilePos, snakePos[0])){ //snake head
          tiles.push( //temp
            <div className="snake" key={`tile-${index}`} >{wordToEnding(words[wordsIndex[0]][wordsIndex[1]])}</div> //put current word on snake front tile
          )
        }
        else{
          tiles.push(
            <div className="snake" key={`tile-${index}`} ></div>
          )
        }
      }
      else if(borderCheck(tilePos)){ //if the tile is border, "style border"
        tiles.push(
          <div key={`tile-${index}`} className='border' ></div>
        );
      }
      else if((arraysEqual(obj1Pos, tilePos) || arraysEqual(obj2Pos, tilePos)) && gameState == 1){
        let num;
        if(arraysEqual(obj1Pos, tilePos)) num = 0;
        if(arraysEqual(obj2Pos, tilePos)) num = 1;
        const className = index % 2 === 0 ? 'tile1' : 'tile2';
        tiles.push(
          <div key={`tile-${index}`} className={className} style={{ backgroundImage: `url(${wordImages(words, wordsIndex, num)})`, backgroundSize: 'cover' }}></div>
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
  function handleClick(){
    setGameState(1);
  }
  return( //code restart button, so hitting wrong image or wall stops game until reset
    <>
      <div>
        {rows}
      </div>
      <StartButton onStartClick={() => handleClick()} gameState={gameState}/>
      <t1>Score: {score}</t1>
      <div>
        <t1>{message}</t1>
      </div>
      <div className="top-buttons">
        <button 
          className="arrow" 
          onClick={() => handleDirectionChange({key: "ArrowUp"})}
          style={{ backgroundImage: `url(/arrowUp.png)`, backgroundSize: 'cover' }}
        ></button>
      </div>
      <div className="bottom-buttons">
        <button 
          className="arrow" 
          onClick={() => handleDirectionChange({key: "ArrowLeft"})}
          style={{ backgroundImage: `url(/arrowLeft.png)`, backgroundSize: 'cover' }}
        ></button>
        <button 
          className="arrow" 
          onClick={() => handleDirectionChange({key: "ArrowDown"})}
          style={{ backgroundImage: `url(/arrowDown.png)`, backgroundSize: 'cover' }}
        ></button>
        <button 
          className="arrow" 
          onClick={() => handleDirectionChange({key: "ArrowRight"})}
          style={{ backgroundImage: `url(/arrowRight.png)`, backgroundSize: 'cover' }}
        ></button>
      </div>
    </>
  );
}