import ContainerPosition from "./ContainerPosition.interface";
import { Container } from "./Container.interface";

export interface TrackedContainer extends Container {
    position: ContainerPosition;
}
