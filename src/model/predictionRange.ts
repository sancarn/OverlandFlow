import Observable from "./observable";

export class PredictionRange extends Observable {
    protected minScore: number = Infinity;
    protected maxScore: number = 0;
    constructor() {
        super(true);
    }
    setMaxScore(score: number) {
        this.maxScore = score;
        this.notify();
    }
    getMaxScore() {
        return this.maxScore;
    }
    setMinScore(score: number) {
        this.minScore = score;
        this.notify();
    }
    getMinScore() {
        return this.minScore;
    }
}
