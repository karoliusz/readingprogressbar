import ContainerPosition from "./ContainerPosition.interface";

export interface Container {
    id: number | string | Symbol;
    element: HTMLElement;
    position: ContainerPosition;
}