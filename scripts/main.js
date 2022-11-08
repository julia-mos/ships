const playerId = "player";
const playerPrefix = "p";

const computerId = "computer";
const computerPrefix = "c";

const shipPrefix = "ship";

const shipsContainerId = "ships";

const mainGame = () => {
  let ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

  let computerShips = [];
  let playerShips = [];
  let currentMove = playerId;
  let gameStarted = false;

  let selectedShip;

  const setShipWhite = (e) => {
    e.currentTarget.style.backgroundColor = "white";
  };

  const saveToLocalStorage = () => {
    localStorage.setItem("gameStarted", gameStarted);
    localStorage.setItem("shipsToPlace", JSON.stringify(ships));
    localStorage.setItem("playerShips", JSON.stringify(playerShips));
    localStorage.setItem("computerShips", JSON.stringify(computerShips));
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("currentMove");
    localStorage.removeItem("gameStarted");
    localStorage.removeItem("shipsToPlace");
    localStorage.removeItem("playerShips");
    localStorage.removeItem("computerShips");
  };

  const readFromLocalStorage = () => {
    const isGameSaved =
      localStorage.getItem("shipsToPlace") &&
      localStorage.getItem("playerShips") &&
      localStorage.getItem("computerShips");

    if (isGameSaved) {
      gameStarted = !!localStorage.getItem("gameStarted");
      ships = JSON.parse(localStorage.getItem("shipsToPlace"));
      playerShips = JSON.parse(localStorage.getItem("playerShips"));
      computerShips = JSON.parse(localStorage.getItem("computerShips"));
      currentMove = localStorage.getItem("currentMove");
    }

    return isGameSaved;
  };

  const resetPlayerBoard = () => {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const oldElement = document.getElementById(`${playerPrefix}${i} ${j}`);
        const newElement = oldElement.cloneNode(true);
        oldElement.parentNode.replaceChild(newElement, oldElement);
      }
    }
  };

  const resetPlayerContainer = () => {
    const old_el = document.getElementById(playerId);
    const new_el = old_el.cloneNode(true);
    old_el.parentNode.replaceChild(new_el, old_el);

    document
      .getElementById(playerId)
      .addEventListener("contextmenu", rotateShip);
  };

  const resetComputerBoard = () => {
    const old_el = document.getElementById(computerId);
    const new_el = old_el.cloneNode(true);
    old_el.parentNode.replaceChild(new_el, old_el);

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        document
          .getElementById(computerPrefix + (i + " " + j))
          .addEventListener("click", shootShip);
      }
    }
  };

  const endGame = () => {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        var old_el = document.getElementById(computerId);
        var new_el = old_el.cloneNode(true);
        old_el.parentNode.replaceChild(new_el, old_el);
      }
    }
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (computerShips[i][j] > 0 && computerShips[i][j] < 5)
          document
            .getElementById(computerPrefix + (i + " " + j))
            .classList.add("red");
        var old_el = document.getElementById(computerPrefix + (i + " " + j));
        var new_el = old_el.cloneNode(true);
        old_el.parentNode.replaceChild(new_el, old_el);
      }
    }
  };

  const setColors = () => {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (playerShips[i][j] != 0)
          document.getElementById(
            playerPrefix + (i + " " + j)
          ).style.backgroundColor = "pink";
        else
          document.getElementById(
            playerPrefix + (i + " " + j)
          ).style.backgroundColor = "white";
      }
    }
  };

  const setFieldsState = (tab, prefix) => {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (isNaN(tab[i][j])) {
          document
            .getElementById(`${prefix}${i} ${j}`)
            .classList.add(tab[i][j] == "*" ? "circle" : "crossed");
        }
      }
    }
  };

  const addShipToBoard = function (event) {
    const coords = event.currentTarget.id.replace(playerPrefix, "").split(" ");
    resetPlayerBoard();

    if (selectedShip.direction == -1) {
      for (
        let i = Math.min(Number(coords[1]), 10 - selectedShip.shipLength);
        i < Math.min(Number(coords[1]) + selectedShip.shipLength, 10);
        i++
      ) {
        playerShips[coords[0]][i] = selectedShip.shipLength;
      }
    } else {
      for (
        let i = Math.min(Number(coords[0]), 10 - selectedShip.shipLength);
        i < Math.min(Number(coords[0]) + selectedShip.shipLength, 10);
        i++
      ) {
        playerShips[i][coords[1]] = selectedShip.shipLength;
      }
    }

    setColors();
    selectedShip.remove();
    resetPlayerBoard();
    resetPlayerContainer();
    saveToLocalStorage();

    ships.splice(
      ships.findIndex((item) => item === selectedShip.shipLength),
      1
    );
    saveToLocalStorage();

    if (document.getElementById(shipsContainerId).childNodes.length == 0) {
      gameReady();
    }
  };

  const shipOverField = function (event) {
    setColors();

    const coords = event.currentTarget.id.replace(playerPrefix, "").split(" ");

    y = parseInt(coords[0]);
    x = parseInt(coords[1]);

    const sum = getValueSumOfNearbyShips(
      playerShips,
      selectedShip.shipLength,
      x,
      y,
      selectedShip.direction
    );

    if (selectedShip.direction == -1) {
      for (
        let i = Math.min(Number(coords[1]), 10 - selectedShip.shipLength);
        i < Math.min(Number(coords[1]) + selectedShip.shipLength, 10);
        i++
      ) {
        document.getElementById(
          `${playerPrefix}${coords[0]} ${i}`
        ).style.backgroundColor = sum == 0 ? "green" : "red";
      }
    } else {
      for (
        let i = Math.min(Number(coords[0]), 10 - selectedShip.shipLength);
        i < Math.min(Number(coords[0]) + selectedShip.shipLength, 10);
        i++
      ) {
        document.getElementById(
          `${playerPrefix}${i} ${coords[1]}`
        ).style.backgroundColor = sum == 0 ? "green" : "red";
      }
    }

    if (sum == 0) event.currentTarget.addEventListener("click", addShipToBoard);
  };

  const addPlayerBoardEvents = () => {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        document
          .getElementById(`${playerPrefix}${i} ${j}`)
          .addEventListener("mouseover", shipOverField);
      }
    }
  };

  const rotateShip = () => {
    if (!selectedShip) return;

    selectedShip.direction *= -1;

    resetPlayerBoard();
    setColors();

    addPlayerBoardEvents();
  };

  const useMarkShipOnBoard = () => {
    selectedShip.direction = -1;

    resetPlayerBoard();
    addPlayerBoardEvents();
  };

  const gameReady = () => {
    const btn = document.createElement("button");
    btn.innerHTML = "Rozpocznij grę";
    document.getElementById("main").appendChild(btn);
    btn.addEventListener("click", (e) => {
      gameStarted = true;
      startGame();
      saveToLocalStorage();
      e.currentTarget.remove();
    });
  };

  const shootShip = (event) => {
    if (currentMove == playerId) {
      const [y, x] = event.currentTarget.id
        .replace(playerPrefix, "")
        .replace(computerPrefix, "")
        .split(" ");

      if (Number.isInteger(computerShips[y][x])) {
        computerShips[y][x] = computerShips[y][x] == 0 ? "*" : "x";

        event.currentTarget.classList.add(
          computerShips[y][x] == "*" ? "circle" : "crossed"
        );

        if (computerShips.flat().filter((item) => item == "x").length == 20) {
          alert("Wygrałeś! Kliknij OK, będzie rewanż ;)");
          clearLocalStorage();
          location.reload();
          return;
        }

        currentMove = computerId;
        shootShip(event);

        saveToLocalStorage();
        localStorage.setItem("currentMove", currentMove);

        document.getElementById("playerLabel").classList.remove("currentMove");
        document.getElementById("computerLabel").classList.add("currentMove");
      }
    } else {
      document
        .getElementById(computerId)
        .addEventListener("mousedown", function () {
          alert("Ruch komputera");
          resetComputerBoard();
        });

      setTimeout(function () {
        let x = drawPosition();
        let y = drawPosition();

        while (!Number.isInteger(playerShips[y][x])) {
          x = drawPosition();
          y = drawPosition();
        }

        playerShips[y][x] = playerShips[y][x] == 0 ? "*" : "x";
        document
          .getElementById(playerPrefix + (y + " " + x))
          .classList.add(playerShips[y][x] == "*" ? "circle" : "crossed");

        resetComputerBoard();
        if (playerShips.flat().filter((item) => item == "x").length == 20) {
          alert("Wygrał komputer");
          clearLocalStorage();
          endGame();
          return;
        }
        currentMove = playerId;

        saveToLocalStorage();
        localStorage.setItem("currentMove", currentMove);

        document.getElementById("playerLabel").classList.add("currentMove");
        document
          .getElementById("computerLabel")
          .classList.remove("currentMove");
      }, 10);
    }
  };

  const startGame = () => {
    document.getElementById(`${currentMove}Label`).classList.add("currentMove");

    document.getElementById(playerId).addEventListener("click", function () {
      alert("To Twoja plansza");
    });

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++)
        document
          .getElementById(`${computerPrefix}${i} ${j}`)
          .addEventListener("click", shootShip);
    }
  };

  const drawPosition = () => {
    return Math.floor(Math.random() * 10);
  };

  const getValueSumOfNearbyShips = (array, n, x, y, direction) => {
    const vertical = direction == 1 ? n : 1;
    const horizontal = direction == -1 ? n : 1;

    return array
      .filter((_, index) => index <= vertical + y && index >= y - 1)
      .map((innerTab) =>
        innerTab.filter((_, index) => index <= horizontal + x && index >= x - 1)
      )
      .flat()
      .reduce((prev, current) => prev + current, 0);
  };

  const drawShip = (n) => {
    let x, y;

    const drawXY = () => {
      x = drawPosition();
      y = drawPosition();
    };

    drawXY();

    const direction = Math.random() < 0.5 ? -1 : 1; // -1 - horizontal, 1 - vertical
    let shipDrawed = false;

    while (!shipDrawed) {
      while ((direction == -1 ? x : y) + n > 10) {
        drawXY();
      }

      const delimiter = direction == -1 ? x : y;

      if (getValueSumOfNearbyShips(computerShips, n, x, y, direction) == 0) {
        for (let i = delimiter; i < delimiter + n; i++) {
          direction == -1
            ? (computerShips[y][i] = n)
            : (computerShips[i][x] = n);
        }
        shipDrawed = true;
      }

      drawXY();
    }

    saveToLocalStorage();
  };

  const renderComputerShips = () => {
    ships.forEach(drawShip);
  };

  const renderBoard = (containerId, prefix, showShips) => {
    document.getElementById(containerId).innerHTML = "";
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const div = document.createElement("div");
        div.className = "field";
        div.setAttribute("id", `${prefix}${i} ${j}`);

        if (showShips && computerShips[i][j]) div.classList.add("crossed");

        document.getElementById(containerId).appendChild(div);
      }
    }
  };

  const initializeEmptyTab = (tab) => {
    for (let i = 0; i < 10; i++) {
      tab[i] = [];
      for (let j = 0; j < 10; j++) tab[i][j] = 0;
    }
  };

  const addShipEvents = (element) => {
    element.addEventListener("mouseover", useShipHover);
    element.addEventListener("mouseleave", setShipWhite);
  };

  const removeShipEvents = (element) => {
    element.removeEventListener("mouseover", useShipHover);
    element.removeEventListener("mouseleave", setShipWhite);
  };

  const useShipClick = (e) => {
    if (selectedShip) {
      addShipEvents(selectedShip);
      selectedShip.removeEventListener("mouseout", useMarkShipOnBoard);
      selectedShip.style.backgroundColor = "white";
    }

    selectedShip = e.currentTarget;
    e.currentTarget.style.backgroundColor = "green";

    removeShipEvents(e.currentTarget);

    e.currentTarget.addEventListener("mouseout", useMarkShipOnBoard);
  };

  const useShipHover = (e) => {
    e.currentTarget.style.backgroundColor = "blue";

    e.currentTarget.addEventListener("click", useShipClick);
  };

  const renderDraggableShips = () => {
    ships.forEach((item, i) => {
      const shipContainer = document.createElement("div");
      shipContainer.id = `${shipPrefix}${i}`;
      shipContainer.classList.add("ship");
      shipContainer.shipLength = item;

      for (let j = 0; j < item; j++) {
        const shipBlock = document.createElement("span");
        shipBlock.className = "shipBlock";
        shipContainer.appendChild(shipBlock);
      }

      document.getElementById(shipsContainerId).appendChild(shipContainer);

      addShipEvents(shipContainer);
    });
  };

  initializeEmptyTab(computerShips);
  initializeEmptyTab(playerShips);

  renderBoard(playerId, playerPrefix);
  renderBoard(computerId, computerPrefix);

  if (!readFromLocalStorage()) {
    renderComputerShips();
  } else if (!ships.length) {
    gameStarted ? startGame() : gameReady();
    setFieldsState(playerShips, playerPrefix);
    setFieldsState(computerShips, computerPrefix);
  }

  renderDraggableShips();
  setColors();

  document.getElementById(playerId).addEventListener("contextmenu", rotateShip);
};

const init = () => {
  document.body.addEventListener("contextmenu", (e) => e.preventDefault());

  const shipsContainer = document.createElement("div");
  shipsContainer.id = shipsContainerId;

  document.getElementById("main").prepend(shipsContainer);

  mainGame();
};

window.addEventListener("load", init);
