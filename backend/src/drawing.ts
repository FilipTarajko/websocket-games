import { User } from "@prisma/client";

type PlayerSpot = {
    name: string,
    player: User | null
}

export class DrawingGame {
    board: string[];
    gameName: string

    constructor() {
        this.board = Array.from({ length: 900 }, () => "#ffffff");
        this.gameName = "Drawing";
    }

    place(data: any) {
        if (data.position < 0 || data.position > this.board.length) {
            return;
        }
        else {
            this.board[data.position] = data.color;
        }
    }
}
