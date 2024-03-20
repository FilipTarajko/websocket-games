import { User } from "@prisma/client";

export class TicTacToeGame {
    board: string[];
    turn: number;
    players: User[];
    winner: string | null;
    gameName: string

    constructor() {
        this.board = ["", "", "", "", "", "", "", "", ""];
        this.turn = 1;
        this.players = [];
        this.winner = "";
        this.gameName = "TicTacToe";
    }
}

function place(position: number) {
    if (position < 0 || position > 8) {
        return;
    }
    else {
        console.log("Placing at position: " + position);
    }
}

export function interpretTicTacToeControls(control: any, socket: any, ticTacToeGame: TicTacToeGame) {
    const controlParts = control[0].split('/');
    if (controlParts[1] == "place") {
        place(control[1])
    } else {
        console.log("Unknown tictactoe control")
    }
}