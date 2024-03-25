export class DrawingGame {
    board: string[];
    gameName: string

    constructor() {
        this.board = Array.from({ length: 1200 }, () => "#ffffff");
        this.gameName = "Drawing";
    }

    place(data: any, _user: any) {
        if (data.index < 0 || data.index > this.board.length) {
            return false;
        }
        if (this.board[data.index] === data.color) {
            return false;
        }
        else {
            this.board[data.index] = data.color;
            return true;
        }
    }
}
