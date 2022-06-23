interface ReadingProgressBarOptions {
    contentContainerClassName: string;
    cssClass: string;
    throttleTimeMs: number;
}

declare class ReadingProgressBar {
    private viewport;
    private progressBar;
    private options;
    constructor(element: Element, options?: Partial<ReadingProgressBarOptions>);
    reset(): void;
    private redetectContentContainers;
    private getTrackedContainers;
}

export { ReadingProgressBar as default };
