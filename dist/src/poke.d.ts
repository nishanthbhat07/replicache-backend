export declare function getPokeBackend(): PokeBackend;
export declare class PokeBackend {
    private _listeners;
    constructor();
    addListener(spaceID: string, listener: () => void): () => void;
    poke(spaceID: string): void;
    private _removeListener;
}
