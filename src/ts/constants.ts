import ReadingProgressBarOptions from "./interfaces/ReadingProgressBarOptions.interface";

export const DEFAULT_OPTIONS: ReadingProgressBarOptions = {
    contentContainerClassName: 'blogPost',
    cssClass: 'readingProgressBar',
    throttleTimeMs: 0
} as const;

export const CLASS_NAMES = {
    progressBarElement: 'readingProgressBar',
    trackElement: 'readingProgressBar__track'
} as const;