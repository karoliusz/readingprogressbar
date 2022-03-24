import { ReadingProgressBar } from "../../src";

const progressBarElement = document.getElementById('readingProgressBar');
const progressBarOptions = {};
const progressBar = new ReadingProgressBar(progressBarElement, progressBarOptions);

console.log(progressBar);