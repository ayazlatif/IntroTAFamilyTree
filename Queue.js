export class Queue {
    constructor() {
        this.elementData = [];
    }

    add(element) {
        this.elementData.push(element);
    }

    remove() {
        return this.elementData.shift();
    }

    isEmpty() {
        return this.elementData.length == 0
    }
}