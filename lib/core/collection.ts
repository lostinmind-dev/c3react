export class Collection<T> {
    private readonly collection = new Set<T>();

    clear() {
        this.collection.clear();
    }

    delete(item: T) {
        this.collection.delete(item);
    }

    add(item: T) {
        this.collection.add(item);
    }

    toArray() {
        return Array.from(this.collection);
    }
}