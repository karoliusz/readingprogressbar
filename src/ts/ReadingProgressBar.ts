import ReadingProgressBarOptions from "./interfaces/ReadingProgressBarOptions.interface";

import { Viewport } from "./Viewport";
import { DEFAULT_OPTIONS } from "./constants";

/**
 * - Kontener jest uznawany za aktywny, gdy jego górna krawędź jest nad dolną krawędzią okna, 
 *   a zarazem jego dolna krawędź jest pod dolną krawędzią okna
 * 
 */
class ReadingProgressBar {
    private viewport = new Viewport();
    // private progressBar = new ProgressBar();

    constructor(
        private element: HTMLElement,
        private options: Partial<ReadingProgressBarOptions> = {}
    ) {
        console.log('ReadingProgressBar instantiated!');
        this.reset();
    }

    public reset() {
        this.redetectContentContainers();
    }

    private redetectContentContainers() {
        const containers = document.getElementsByClassName(DEFAULT_OPTIONS.contentContainerClassName);
        
        console.log(Array.from(containers).map(container => container.getBoundingClientRect()));
    }
}

export default ReadingProgressBar;