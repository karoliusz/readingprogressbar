import { fromEvent, merge, Observable } from 'rxjs';
import { tap, throttleTime, debounceTime } from 'rxjs/operators';
import { Container } from './interfaces/Container.interface';
import ContainerPosition from './interfaces/ContainerPosition.interface';

export class Viewport {
    public viewportChange$: Observable<Event> = null;
    
    private scroll$: Observable<Event> = null;
    private resize$: Observable<Event> = null;

    private viewportHeight: number = null;
    private trackedContainers = new Set<Container>();

    constructor() {
        this.updateViewportHeight();
        this.scroll$ = fromEvent(window, 'scroll');
        this.resize$ = fromEvent(window, 'resize')
            .pipe(
                debounceTime(300),
                tap(() => this.updateViewportHeight())
            );

        this.viewportChange$ = merge(this.scroll$, this.resize$).pipe(throttleTime(100));

        this.viewportChange$.subscribe(
            event => {
                console.log('viewport change', event)
            }
        )
    }

    public addTrackedContainers(containers: Container[]) {
        // TODO: Validate uniqueness of IDs

        containers.forEach(container => {
            this.trackedContainers.add(container);
        });

        return Array.from(this.trackedContainers);
    }

    public removeTrackedContainer(containerId): boolean {
        const trackedContainers = this.trackedContainers;
        const containerToRemove = Array.from(trackedContainers).find(({ id }) => id === containerId);

        if (containerToRemove) {
            return this.trackedContainers.delete(containerToRemove);
        }

        return false;
    }

    public clearTrackedContainers(): void {
        this.trackedContainers.clear();
    }

    public isInViewport(element: HTMLElement): boolean {
        return false;
    }

    private getContainerPosition(element: HTMLElement): ContainerPosition {
        const rect = element.getBoundingClientRect();
        const scrollY = window.scrollY;

        return {
            top: rect.top + scrollY,
            bottom: rect.bottom + scrollY
        }
    }

    private updateViewportHeight() {
        const documentElement = document.documentElement;

        this.viewportHeight = documentElement.clientHeight;
    }
}
