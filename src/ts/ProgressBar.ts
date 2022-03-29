import { CLASS_NAMES } from "./constants";
import ReadingProgressBarOptions from "./interfaces/ReadingProgressBarOptions.interface";

export class ProgressBar {
    private progressBarTrack: HTMLDivElement;
    private value = 0;

    constructor(
        private element: Element,
        private options: ReadingProgressBarOptions
    ) {
        this.initialize();
    }

    public setStatePercentage(value: number) {
        let newValue = value;

        if (value > 100) {
            newValue = 100;
        } else if (newValue < 0) {
            newValue = 0;
        }

        this.applyState(newValue);
    }

    public dispose() {
        this.progressBarTrack.remove();
        this.progressBarTrack = null;
        this.element.classList.remove(CLASS_NAMES.progressBarElement);

        if (this.options.cssClass) {
            this.element.classList.remove(this.options.cssClass);
        }

        this.element = null;
    }

    private applyState(value: number) {
        this.value = value;

        requestAnimationFrame(() => {
            this.progressBarTrack.style.width = `${value}%`;
        });
    }

    private initialize() {
        const progressBarTrack = document.createElement('div');

        progressBarTrack.classList.add(CLASS_NAMES.trackElement);
        this.element.classList.add(this.options.cssClass);
        this.element.classList.add(CLASS_NAMES.progressBarElement);
        this.element.appendChild(progressBarTrack);
        this.progressBarTrack = progressBarTrack;
    }
}
