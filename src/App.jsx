import { useState, useEffect, useCallback, useRef } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";


function App() {

  //se asigan el size de las filas y las columnas
  const row = 50;
  const col = 30;

  // funcion para crear el tablero del juego
  const generateBoard = () => {
    const board = [];
    for (let i = 0; i < row; i++) {
      board[i] = new Array();
      for (let j = 0; j < col; j++) {
        board[i][j] = false;
      }
    }
    return board;
  };
  //Despues se el state del tablero
  const [board, setBoard] = useState(generateBoard());

  const [play, setPlay] = useState(false);
  const playRef = useRef(play);
  playRef.current = play;

  //Se asigan las posiciones las cuales seran los vecinos de las celulas
  const positions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  const checkNeighbors = () => {
    //
    if (!playRef.current) {
      return;
    }
    //metodo para crear una copia del array del state sin modificar el original
    let newBoard = JSON.parse(JSON.stringify(board));

    //Se recorre el array del state
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        //se iniciliza la variable de la cantidad de vecinos
        let count = 0;
        //se recorre el array con las posiciones de los vecinos
        positions.forEach((position) => {
          //se asigan la posicion de los vecinos
          const rowAct = i + position[0];
          const colAct = j + position[1];

          //se verifica que la posicion de la fila o de la columna no sea menor o mayor que 0 o mayor que el tamaño del array
          if (rowAct >= 0 && rowAct < row && colAct >= 0 && colAct < col) {
            //si el vecino es verdadero se suma 1 a la cantidad de vecinos
            if (board[rowAct][colAct] === true) {
              count++;
            }
          }
        });
        //si es menor a 2 o mayor 3  la cantidad de vecinos pasa a falso ya que pierda la vida
        if (count < 2 || count > 3) {
          newBoard[i][j] = false;
        }
        // si es la celula no estaba viva y tiene exactamente 3 vecinos nace
        if (board[i][j] === false && count === 3) {
          newBoard[i][j] = true;
        }

        //si es la celula esta viva y tiene exactamente 2 o 3 vecinos vive, no hace falta verificarlo
      }
    }
    // la copia se asigna al state del tablero original
    setBoard(newBoard);
  };

  //funcion la cual va a controlar el click de una celula y cambiar su estado de vida
  const handleClick = (row, col) => {
    //cada vez que se haga click cambiara el estado de la celula
    let newBoard = board.slice();
    newBoard[row][col] = !newBoard[row][col];
    setBoard(newBoard);
  };

  //useEffect el cual va a controlar el intervalo de tiempo para que se ejecute la funcion de verificar los vecinos
  useEffect(() => {
    //tome la decision de usar un useEffect porque tenia un bug, el cual lo pude solucionar usando la funcion limpiadora
    const interval = setInterval(() => {
      checkNeighbors();
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [board]);

  return (
    <div>
      <button onClick={() => setPlay(true)}>Play</button>
      <button onClick={() => setPlay(false)}>Stop</button>
      {board.map((row, rowIndex) => {
        return (
          <div key={rowIndex} className="cellRow">
            {row.map((cell, colIndex) => {
              return (
                <div
                  key={colIndex}
                  className={board[rowIndex][colIndex] ? "cellAlive" : "cell"}
                  onClick={() => handleClick(rowIndex, colIndex)}
                >
                  {cell}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default App;
