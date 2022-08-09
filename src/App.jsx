import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [turn, setTurn] = useState(0);
  const [play, setPlay] = useState(false);

  const timesRender = useRef(0);
  const playRef = useRef(play);
  playRef.current = play;

  const [boardSize, setBoardSize] = useState(0);
  const sizes = [
    [50, 30],
    [10, 5],
    [30, 20],
    [70, 40],
  ];

  //se asigan el size de las filas y las columnas
  let row = sizes[boardSize][0];
  let col = sizes[boardSize][1];

  useEffect(() => {
    // esto lo implemente porque tenia un problema con el localStorage, ya que apenas se renderiza pagina no se caragaba el localStorage
    // no se cargaba porque al cambiar el size, con el localStorage, el useEffect entraba a esta funcion y reseteaba el tablero
    // tuve que ver cuantas veces se renderizaba apenas cargaba la pagina, y asi pude detectar que era 3 veces, entonces solo entra despues de las 3 veces del render, que van a ser cuando se presione el boton de reset
    if (timesRender.current >= 3) {
      resetGame();
    }
    // setTimesRender((prev) => prev + 1);
    timesRender.current += 1;
  }, [boardSize]);

  // funcion para crear el tablero del juego
  const generateBoard = (row, col) => {
    const board = [];
    for (let i = 0; i < row; i++) {
      board[i] = new Array();
      for (let j = 0; j < col; j++) {
        board[i][j] = false;
      }
    }
    return board;
  };

  const [board, setBoard] = useState([]);

  // useEffect para cargar los datos del localStorage
  useEffect(() => {
    const saveBoard = JSON.parse(localStorage.getItem("board"));
    const saveSizeBoard = JSON.parse(localStorage.getItem("sizeBoard"));

    setBoard(saveBoard || generateBoard(row, col));
    setBoardSize(saveSizeBoard || 0);
  }, []);

  //Despues se inicializa el state del tablero, si no hay nada en el local storage, se genera el tablero con la funcion generateBoard

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
    //si el el juego no esta en pausa, retorna antes de seguir con la verificacion
    if (!playRef.current) {
      return;
    }
    //metodo para crear una copia del array del state sin modificar el original
    let newBoard = JSON.parse(JSON.stringify(board));

    setTurn((prevTurn) => prevTurn + 1);
    //Se recorre el array del state
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        //se iniciliza la variable de la cantidad de vecinos
        let count = 0;
        //se recorre el array con las posiciones de los vecinos
        positions.forEach((position) => {
          //se asigan la posicion de los vecinos
          let rowAct = i + position[0];
          let colAct = j + position[1];

          // se hacen las verificaciones para que no se salga del array , ya que el tablero es de forma esferica
          if (rowAct >= row) {
            rowAct = 0;
          }
          if (colAct >= col) {
            colAct = 0;
          }
          if (rowAct < 0) {
            rowAct = row - 1;
          }
          if (colAct < 0) {
            colAct = col - 1;
          }

          //si el vecino es verdadero, se incrementa el contador
          if (board[rowAct][colAct] === true) {
            count++;
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

  //funcion para resetear el tablero
  const resetGame = () => {
    //tuve que agregarle un timeout para que no buguee el tablero, ya que al resetear el tablero seguido despues de pausarlo no se ejecutaba la funcio generateBoard y quedaba undifined el tablero
    setTimeout(() => {
      setPlay(false);
      setBoard(generateBoard(sizes[boardSize][0], sizes[boardSize][1]));
      setTurn(0);
    }, 100);
  };

  //useEffect el cual va a controlar el intervalo de tiempo para que se ejecute la funcion de verificar los vecinos
  useEffect(() => {
    //tome la decision de usar un useEffect porque tenia un bug, el cual lo pude solucionar usando la funcion limpiadora
    //se guarda en el local storage el tablero cada vez que cambia, pero solo se guarda si no es el el por defecto con todo false
    if (board?.find((row) => row.find((cel) => cel === true))) {
      localStorage.setItem("sizeBoard", JSON.stringify(boardSize));
      localStorage.setItem("board", JSON.stringify(board));
    }

    //se actualiza el tamano de las filas y las columnas para no tener problemas con el tablero
    row = sizes[boardSize][0];
    col = sizes[boardSize][1];

    const interval = setInterval(() => {
      checkNeighbors();
    }, 300);
    return () => {
      clearInterval(interval);
    };
  }, [board]);

  return (
    <div className="gameContainer">
      <header className="gameHeader">
        <button onClick={() => setPlay(true)}>Play</button>
        <button onClick={() => setPlay(false)}>Stop</button>
        <button onClick={() => setBoard(resetGame)}>Reset</button>
        <select
          name="boardSize"
          id="boardSize"
          onChange={(e) =>
            setBoardSize((prevBoardSize) =>
              e.target.value != prevBoardSize && e.target.value != -1
                ? e.target.value
                : prevBoardSize
            )
          }
          defaultValue={-1}
        >
          <option value="-1">Select a board size</option>
          <option value="0">50x30</option>
          <option value="1">10x5</option>
          <option value="2">30x20</option>
          <option value="3">70x40</option>
        </select>
        <p>Generation # {turn}</p>
      </header>
      <div className="board">
        {board?.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="cellRow">
              {row.map((cell, colIndex) => {
                return (
                  <div
                    key={colIndex}
                    className={board[rowIndex][colIndex] ? "cellAlive" : "cell"}
                    onClick={() => handleClick(rowIndex, colIndex)}
                  ></div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
