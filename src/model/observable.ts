export default class Observable {
    protected listeners: ((target: this) => void)[] = [];
    protected bulkNotify: boolean;
    protected needsToNotify: boolean = false;

    /**
     *
     * @param bulkNotify If set to true, won't auto notofiy when called, but only when releaseBulk is called
     */
    constructor(bulkNotify: boolean = false) {
        this.bulkNotify = bulkNotify;
    }

    addListener(listener: () => void): void {
        this.listeners.push(listener);
    }
    removeListener(listener: () => void): void {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) this.listeners.splice(index);
    }

    private sendNotify(): void {
        this.listeners.forEach(listener => listener(this));
    }
    notify(): void {
        if (this.bulkNotify) this.needsToNotify = true;
        else this.sendNotify();
    }
    releaseBulk(): void {
        if (this.needsToNotify) {
            this.needsToNotify = false;
            this.sendNotify();
        }
    }
}
