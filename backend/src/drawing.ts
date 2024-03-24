export class DrawingGame {
    board: string[];
    gameName: string

    constructor() {
        this.board = Array.from({ length: 900 }, () => "#ffffff");
        this.gameName = "Drawing";
    }

    place(data: any, _user: any) {
        if (data.position < 0 || data.position > this.board.length) {
            return false;
        }
        else {
            this.board[data.index] = data.color;
            return true;
        }
    }
}
