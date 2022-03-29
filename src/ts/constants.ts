import ReadingProgressBarOptions from "./interfaces/ReadingProgressBarOptions.interface";

export const DEFAULT_OPTIONS: ReadingProgressBarOptions = {
    contentContainerClassName: 'blogPost',
    cssClass: 'readingProgressBar'
} as const;

export const CLASS_NAMES = {
    progressBarElement: 'readingProgressBar',
    trackElement: 'readingProgressBar__track'
} as const;