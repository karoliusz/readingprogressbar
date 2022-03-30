import { ReadingProgressBar } from "../../src";
import ReadingProgressBarOptions from "../../src/ts/interfaces/ReadingProgressBarOptions.interface";

const progressBarElement = document.getElementById('readingProgressBar');
const progressBarOptions: Partial<ReadingProgressBarOptions> = {
    throttleTimeMs: 100
};
const progressBar = new ReadingProgressBar(progressBarElement, progressBarOptions);

console.log(progressBar);