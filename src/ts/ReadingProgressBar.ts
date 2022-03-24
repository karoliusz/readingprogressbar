import ReadingProgressBarOptions from "./interfaces/ReadingProgressBarOptions.interface";

import { Viewport } from "./Viewport";
import { DEFAULT_OPTIONS } from "./constants";
import { Container } from "./interfaces/Container.interface";

class ReadingProgressBar {
    private viewport = new Viewport();
    // private progressBar = new ProgressBar();

    constructor(
        private element: HTMLElement,
        private options: Partial<ReadingProgressBarOptions> = {}
    ) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.reset();

        console.log('ReadingProgressBar instantiated!', this.options);
    }

    public reset() {
        this.redetectContentContainers();
    }

    private redetectContentContainers() {
        const { contentContainerClassName } = this.options;
        const containers = document.getElementsByClassName(contentContainerClassName);
        const containersToTrack: Container[] = Array.from(containers)
            .map((element, index) => ({
                id: index,
                element
            }));

        this.viewport.addTrackedContainers(containersToTrack);
    }
}

export default ReadingProgressBar;