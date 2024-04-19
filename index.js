const crypto = require('crypto');
const readline = require('readline');

class Rules {
    constructor(moves) {
        this.moves = moves;
        this.numMoves = moves.length;
    }

    determineWinner(move1, move2) {
        const half = Math.floor(this.numMoves / 2);
        const idx1 = this.moves.indexOf(move1);
        const idx2 = this.moves.indexOf(move2);
        
        if ((idx1 + half) % this.numMoves === idx2) {
            return "Win";
        } else if ((idx2 + half) % this.numMoves === idx1) {
            return "Lose";
        } else {
            return "Draw";
        }
    }
}

class HMACGenerator {
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    static generateHMAC(key, message) {
        const hmac = crypto.createHmac('sha256', key);
        hmac.update(message);
        return hmac.digest('hex');
    }
}

class Game {
    constructor(moves) {
        this.moves = moves;
        this.rules = new Rules(moves);
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    play() {
        const key = HMACGenerator.generateKey();
        const computerMove = this.moves[Math.floor(Math.random() * this.moves.length)];
        const hmac = HMACGenerator.generateHMAC(key, computerMove);

        console.log(`HMAC: ${hmac}`);
        console.log("Available moves:");
        this.moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
        console.log("0 - exit");
        console.log("? - help");

        this.rl.question("Enter your move:", (userInput) => {
            if (userInput === '?') {
                this.displayHelp();
                this.rl.close();
                return;
            }

            const playerMoveIndex = parseInt(userInput);

            if (isNaN(playerMoveIndex) || playerMoveIndex < 0 || playerMoveIndex > this.moves.length) {
                console.log("Invalid input. Please enter a valid move index.");
                this.rl.close();
                return;
            }

            if (playerMoveIndex === 0) {
                console.log("Exiting game.");
                this.rl.close();
                return;
            }

            const playerMove = this.moves[playerMoveIndex - 1];
            console.log(`Your move: ${playerMove}`);
            console.log(`Computer move: ${computerMove}`);
            console.log(`Result: ${this.rules.determineWinner(playerMove, computerMove)}`);
            console.log(`HMAC key: ${key}`);
            this.rl.close();
        });
    }

    displayHelp() {
        console.log("Rock-Paper-Scissors Help:");
        console.log("Each cell represents the outcome when the row move is played against the column move.");
        console.log("Win: The row move wins against the column move.");
        console.log("Lose: The row move loses against the column move.");
        console.log("Draw: Both moves result in a tie.");
        console.log(this.generateTable());
    }

    generateTable() {
        const table = [];
        const maxMoveLength = this.moves.reduce((max, move) => Math.max(max, move.length), 0);
        const headerRow = ['PC-Usr'].concat(this.moves.map(move => move.charAt(0).toUpperCase() + move.slice(1).padEnd(maxMoveLength)));
        table.push(headerRow.map(header => header.padEnd(maxMoveLength + 2)));
        for (let i = 0; i < this.moves.length; i++) {
            const row = [this.moves[i].charAt(0).toUpperCase() + this.moves[i].slice(1).padEnd(maxMoveLength)];
            
            for (let j = 0; j < this.moves.length; j++) {
                row.push(this.rules.determineWinner(this.moves[i], this.moves[j]).padEnd(maxMoveLength));
            }
            table.push(row);
        }
        return table.map(row =>'------------------------------------------\n' +'|' + row.join('|') ).join('\n');
    }
}


const moves = process.argv.slice(2);
if (moves.length < 3 || moves.length % 2 === 0 || new Set(moves).size < moves.length) {
    console.log("Error: Incorrect number of moves or non-unique moves provided.");
    console.log("Usage: node index.js <move1> <move2> ...");
    console.log("Example: node index.js rock paper scissors");
} else {
    const game = new Game(moves);
    game.play();
    
}
