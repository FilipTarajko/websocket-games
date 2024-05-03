import { UserIdAndUsername, PlayerSpot } from "../types";

export class RockPaperScissorsGame {
    playerSpots: PlayerSpot[];
    winner: string | null;
    gameName: string;

    constructor() {
        this.playerSpots = [
            { name: "player 1", player: null, strategic_data: null },
            { name: "player 2", player: null, strategic_data: null },
        ]
        this.winner = "";
        this.gameName = "RockPaperScissors";
    }

    takeSpot(index: number, user: UserIdAndUsername) {
        for (let i = 0; i < this.playerSpots.length; i++) {
            if (this.playerSpots[i].player?.id == user?.id) {
                this.playerSpots[i].player = null;
            }
        }
        if (!this.playerSpots[index].player) {
            this.playerSpots[index].player = user;
        }
    }

    leaveSpot(user: UserIdAndUsername) {
        for (let i = 0; i < this.playerSpots.length; i++) {
            if (this.playerSpots[i].player?.id == user?.id) {
                this.playerSpots[i].player = null;
            }
        }
    }

    checkIfWon() {
        if (this.playerSpots[0].strategic_data && this.playerSpots[1].strategic_data) {
            let choice1 = this.playerSpots[0].strategic_data;
            let choice2 = this.playerSpots[1].strategic_data;
            let name1 = this.playerSpots[0]?.player?.username ?? "player 1";
            let name2 = this.playerSpots[1]?.player?.username ?? "player 2";

            if (choice1 === choice2) {
                this.winner = "draw";
                return;
            } else if ((choice1 === "rock" && choice2 === "paper") || (choice1 === "paper" && choice2 === "scissors") || (choice1 === "scissors" && choice2 === "rock")) {
                this.winner = name2;
                return;
            } else {
                this.winner = name1;
                return;
            }
        }
    }

    place(position: string, user: UserIdAndUsername) {
        let usersSpot = this.playerSpots.find((spot) => spot.player?.id == user.id);
        if (!usersSpot) {
            return false;
        }
        if (usersSpot.strategic_data) {
            return false;
        }
        if (["rock", "paper", "scissors"].includes(position)) {
            usersSpot.strategic_data = position;
            this.checkIfWon();
            return true;
        } else {
            return false
        }
    }
}
