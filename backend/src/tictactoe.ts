import { User } from "@prisma/client";

type PlayerSpot = {
    name: string,
    player: User | null
}

export class TicTacToeGame {
    board: string[];
    turn: number;
    playerSpots: PlayerSpot[];
    winner: string | null;
    gameName: string

    constructor() {
        this.board = ["", "", "", "", "", "", "", "", ""];
        this.turn = 1;
        this.playerSpots = [
            { name: "X", player: null },
            { name: "O", player: null },
        ]
        this.winner = "";
        this.gameName = "TicTacToe";
    }

    takeSpot(index: number, user: User) {
        for (let i = 0; i < this.playerSpots.length; i++) {
            if (this.playerSpots[i].player?.id == user?.id) {
                this.playerSpots[i].player = null;
            }
        }
        if (!this.playerSpots[index].player) {
            this.playerSpots[index].player = user;
        }
    }

    checkIfWon() {
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]
        for (let i = 0; i < winningCombinations.length; i++) {
            const [a, b, c] = winningCombinations[i];
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winner = this.board[a];
                console.log(this.board[a])
                return;
            }
        }
    }

    place(position: number) {
        if (position < 0 || position > 8 || this.board[position] || this.winner) {
            return;
        }
        else {
            this.board[position] = this.playerSpots[(this.turn + 1) % 2].name;
            this.turn++;
            this.checkIfWon();
        }
    }
}
