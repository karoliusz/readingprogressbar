import { BehaviorSubject, combineLatest, fromEvent, merge, Observable } from 'rxjs';
import { tap, throttleTime, debounceTime, map, filter, distinctUntilKeyChanged } from 'rxjs/operators';

import { Container } from './interfaces/Container.interface';
import { TrackedContainer } from './interfaces/TrackedContainer.interface';
import ContainerPosition from './interfaces/ContainerPosition.interface';

interface ViewportChange { 
    activeContainerId: number | string | Symbol; 
    scrollPercentage: number;
}

export class Viewport {
    public viewportChange$: BehaviorSubject<ViewportChange>;
    
    private scroll$: Observable<Event> = null;
    private resize$: Observable<Event> = null;
    private activeContainer$: Observable<TrackedContainer> = null;
    private lastActiveContainer$: Observable<TrackedContainer> = null;

    private viewportHeight: number = null;
    private trackedContainers = new Set<TrackedContainer>();

    constructor(throttleTimeMs: number, trackedContainers: Container[] = []) {
        let activeContainer: TrackedContainer = null;

        this.updateViewportHeight();

        if (trackedContainers) {
            this.addTrackedContainers(trackedContainers);
            activeContainer = this.getActiveContainer();
        }
        
        this.viewportChange$ = new BehaviorSubject({
            activeContainerId: activeContainer ? activeContainer.id : null,
            scrollPercentage: activeContainer ? this.calculateScrollPercentage(activeContainer) : 0
        });

        this.scroll$ = fromEvent(window, 'scroll');
        this.resize$ = fromEvent(window, 'resize').pipe(
            debounceTime(300),
            tap(() => this.updateViewportHeight())
        );

        this.activeContainer$ = merge(this.scroll$, this.resize$).pipe(
            throttleTime(throttleTimeMs, null, {
                trailing: true,
                leading: false
            }),
            map(() => this.getActiveContainer())
        );

        this.lastActiveContainer$ = this.activeContainer$.pipe(
            filter(container => !!container),
            distinctUntilKeyChanged('id')
        );

        // TODO: Add dispose() method that will clean up all the subscriptions
        combineLatest([this.activeContainer$, this.lastActiveContainer$])
            .pipe(map(data => this.getViewportState(...data)))
            .subscribe(data => this.viewportChange$.next(data));
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

        return trackedContainers.find(container => this.isActive(container));
    }

    private getViewportState(activeContainer: TrackedContainer, lastActiveContainer: TrackedContainer): ViewportChange {
        let scrollPercentage = activeContainer ? this.calculateScrollPercentage(activeContainer) : 0;

        if (lastActiveContainer && !activeContainer) {
            scrollPercentage = this.scrolledPast(lastActiveContainer) ? 100 : 0;
        }

        return {
            activeContainerId: activeContainer ? activeContainer.id : null,
            scrollPercentage
        };
    }

    private calculateScrollPercentage(container: TrackedContainer): number {
        const viewportTopPos = this.getScrollY();
        const viewportBottomPos = viewportTopPos + this.viewportHeight;
        const isActive = this.isActive(container);
        const isInInitialView = container.position.top < this.viewportHeight;

        if (isActive && isInInitialView) {
            const totalScrollDistance = container.position.bottom - this.viewportHeight;
            const scrolledDistance = totalScrollDistance - (container.position.bottom - viewportBottomPos);

            return Math.round((scrolledDistance / totalScrollDistance) * 1000) / 10;
        } else if (isActive) {
            const containerHeight = container.position.bottom - container.position.top;
            const remainingDistance = container.position.bottom - viewportBottomPos;
            const scrolledDistance = containerHeight - remainingDistance;
            
            return Math.round((scrolledDistance / containerHeight) * 1000) / 10;
        }

        return null;
    }

    private isActive({ position }: TrackedContainer) {
        const viewportTopPos = this.getScrollY();
        const viewportBottomPos = viewportTopPos + this.viewportHeight;
        const containerTopEdgeBelowViewport = position.top > viewportBottomPos;
        const containerBottomEdgeBelowViewport = position.bottom > viewportBottomPos;

        return !containerTopEdgeBelowViewport && containerBottomEdgeBelowViewport;
    }

    private scrolledPast(container: TrackedContainer): boolean {
        const viewportTopPos = this.getScrollY();
        const viewportBottomPos = viewportTopPos + this.viewportHeight;
        const containerBottomAboveViewportBottom = container.position.bottom < viewportBottomPos;

        return containerBottomAboveViewportBottom;
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
