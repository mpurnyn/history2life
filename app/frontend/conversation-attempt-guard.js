export class ConversationAttemptGuard {
    constructor() {
        this.generation = 0;
    }

    begin() {
        this.generation += 1;
        return this.generation;
    }

    cancel() {
        this.generation += 1;
    }

    isCurrent(attempt) {
        return attempt === this.generation;
    }
}
