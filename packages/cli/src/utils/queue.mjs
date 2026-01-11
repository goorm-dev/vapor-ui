export class Queue {
    constructor(items = []) {
        this.data = {};
        this.head = 0;
        this.tail = 0;

        if (items.length > 0) {
            for (const item of items) {
                this.push(item);
            }
        }
    }

    push(item) {
        this.data[this.tail] = item;
        this.tail++;
    }

    shift() {
        if (this.head === this.tail) return undefined;

        const item = this.data[this.head];
        delete this.data[this.head];
        this.head++;

        if (this.head === this.tail) {
            this.head = 0;
            this.tail = 0;
        }

        return item;
    }

    get length() {
        return this.tail - this.head;
    }
}
