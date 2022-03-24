import { fromEvent, merge, Observable } from 'rxjs';
import { tap, throttleTime, debounceTime } from 'rxjs/operators';
import { Container } from './interfaces/Container.interface';
import { TrackedContainer } from './interfaces/TrackedContainer.interface';
import ContainerPosition from './interfaces/ContainerPosition.interface';

export class Viewport {
    public viewportChange$: Observable<Event> = null;
    
    private scroll$: Observable<Event> = null;
    private resize$: Observable<Event> = null;

    private viewportHeight: number = null;
    private trackedContainers = new Set<TrackedContainer>();

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
                console.log(this.getActiveContainer(), event);
            }
        )
    }

    public addTrackedContainer(container: Container): TrackedContainer[] {
        // TODO: Validate uniqueness of IDs

        const trackedContainer: TrackedContainer = {
            ...container,
            position: this.getContainerPosition(container.element)
        };

        this.trackedContainers.add(trackedContainer);

        return Array.from(this.trackedContainers);
    }

    public addTrackedContainers(containers: Container[]) {
        containers.forEach(container => this.addTrackedContainer(container));

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

    /**
     * A container is considered "active", when its upper edge is not below viewport,
     * and its bottom edge is below the viewport
     */
    public getActiveContainer(): TrackedContainer {
        const trackedContainers = Array.from(this.trackedContainers);
        const viewportTopPos = this.getScrollY();
        const viewportBottomPos = viewportTopPos + this.viewportHeight;

        return trackedContainers.find(container => {
            const containerTopEdgeBelowViewport = container.position.top > viewportBottomPos;
            const containerBottomEdgeBelowViewport = container.position.bottom > viewportBottomPos;
            const isActive = !containerTopEdgeBelowViewport && containerBottomEdgeBelowViewport;

            return isActive;
        });
    }

    private getContainerPosition(element: Element): ContainerPosition {
        const rect = element.getBoundingClientRect();
        const scrollY = this.getScrollY();

        return {
            top: rect.top + scrollY,
            bottom: rect.bottom + scrollY
        }
    }

    private updateViewportHeight() {
        const documentElement = document.documentElement;

        this.viewportHeight = documentElement.clientHeight;
    }

    private getScrollY(): number {
        return window.scrollY;
    }
}
