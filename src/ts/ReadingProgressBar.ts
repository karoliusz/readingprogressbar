import ReadingProgressBarOptions from "./interfaces/ReadingProgressBarOptions.interface";

import { DEFAULT_OPTIONS } from "./constants";
import { Viewport } from "./Viewport";
import { Container } from "./interfaces/Container.interface";
import { ProgressBar } from "./ProgressBar";

class ReadingProgressBar {
    private viewport: Viewport;
    private progressBar: ProgressBar;
    private options: ReadingProgressBarOptions;

    constructor(
        element: Element,
        options: Partial<ReadingProgressBarOptions> = {}
    ) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.progressBar = new ProgressBar(element, this.options);
        this.viewport = new Viewport(
            this.options.throttleTimeMs,
            this.getTrackedContainers(this.options.contentContainerClassName)
        );
        this.reset();

        this.viewport.viewportChange$.subscribe(({ scrollPercentage }) => {
            this.progressBar.setStatePercentage(scrollPercentage);
        });
    }

    public reset() {
        this.redetectContentContainers();
    }

    private redetectContentContainers() {
        const { contentContainerClassName } = this.options;

        this.viewport.addTrackedContainers(
            this.getTrackedContainers(contentContainerClassName)
        );
    }

    private getTrackedContainers(contentContainerClassName: string) {
        const containers = document.getElementsByClassName(contentContainerClassName);
        const containersToTrack: Container[] = Array.from(containers)
            .map((element, index) => ({
                id: index,
                element
            }));
        
        return containersToTrack;
    }
}

export { ReadingProgressBar };